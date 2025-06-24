const { successResponse, errorResponse } = require('../utils/helpers');
const { Teacher, Disciplina, Turma, Conteudo, Material, Questao, Resposta, Student, User } = require('../models');
const { processResumoComIA, processQuestoesComIA, extractTextFromFile, validateTextContent } = require('../utils/aiService');
const { getFileInfo, deleteFile } = require('../middleware/upload');
const { Op } = require('sequelize');
const path = require('path');

/**
 * Listar conteúdos de uma disciplina do professor
 */
const listConteudos = async (req, res) => {
  try {
    const { disciplina_id } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Verificar se o professor tem acesso à disciplina
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const disciplina = await Disciplina.findOne({
      where: { 
        id: disciplina_id,
        teacher_id: teacher.id,
      },
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou você não tem permissão para acessá-la'));
    }

    // Construir filtros
    const where = { disciplina_id };
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filtrar por status (ativo/finalizado)
    if (status === 'ativo') {
      where.is_active = true;
      where.end_date = { [Op.gte]: new Date() };
    } else if (status === 'finalizado') {
      where.is_active = true;
      where.end_date = { [Op.lt]: new Date() };
    }

    const { count, rows: conteudos } = await Conteudo.findAndCountAll({
      where,
      include: [
        {
          model: Questao,
          as: 'questoes',
          attributes: ['id'],
        },
        {
          model: Material,
          as: 'materials',
          attributes: ['id', 'type', 'disability_type'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Formatar resposta com contagem de respostas
    const formattedConteudos = await Promise.all(
      conteudos.map(async (conteudo) => {
        const totalRespostas = await Resposta.count({
          include: [
            {
              model: Questao,
              as: 'questao',
              where: { conteudo_id: conteudo.id },
              attributes: [],
            },
          ],
        });

        const isActive = conteudo.is_active && new Date(conteudo.end_date) >= new Date();
        const isFinalized = conteudo.is_active && new Date(conteudo.end_date) < new Date();

        return {
          id: conteudo.id,
          title: conteudo.title,
          description: conteudo.description,
          start_date: conteudo.start_date,
          end_date: conteudo.end_date,
          is_active: conteudo.is_active,
          status: isActive ? 'ativo' : (isFinalized ? 'finalizado' : 'inativo'),
          total_questoes: conteudo.questoes.length,
          total_materials: conteudo.materials.length,
          total_respostas: totalRespostas,
          // has_summary: !!(conteudo.summary_text || conteudo.summary_file_path),
          created_at: conteudo.created_at,
          updated_at: conteudo.updated_at,
        };
      })
    );

    res.json(successResponse({
      conteudos: formattedConteudos,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Conteúdos listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar conteúdos:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um conteúdo específico
 */
const getConteudo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
          include: [
            {
              model: Turma,
              as: 'turma',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Material,
          as: 'materials',
        },
        {
          model: Questao,
          as: 'questoes',
          order: [['order_index', 'ASC']],
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem permissão para acessá-lo'));
    }

    res.json(successResponse(conteudo, 'Conteúdo obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter conteúdo:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar novo conteúdo
 */
const createConteudo = async (req, res) => {
  try {
    const { disciplina_id, title, description, start_date, end_date, summary_text } = req.body;
    const userId = req.user.id;

    // Verificar se o professor tem acesso à disciplina
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const disciplina = await Disciplina.findOne({
      where: { 
        id: disciplina_id,
        teacher_id: teacher.id,
      },
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou você não tem permissão para acessá-la'));
    }

    // Processar arquivo de resumo se enviado
    let summaryFilePath = null;
    let summaryFileType = null;
    let extractedText = summary_text;

    if (req.file) {
      const fileInfo = getFileInfo(req.file);
      summaryFilePath = fileInfo.path;
      
      // Determinar tipo do arquivo
      const extension = fileInfo.extension.toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
        summaryFileType = 'image';
      } else if (extension === '.pdf') {
        summaryFileType = 'pdf';
      } else if (['.docx', '.doc'].includes(extension)) {
        summaryFileType = 'docx';
      } else {
        summaryFileType = 'text';
      }

      // Extrair texto do arquivo
      try {
        extractedText = await extractTextFromFile(summaryFilePath, summaryFileType);
      } catch (error) {
        console.error('Erro ao extrair texto do arquivo:', error);
        extractedText = summary_text || 'Conteúdo do arquivo não pôde ser processado';
      }
    }

    // Processar resumo com IA se há texto disponível
    let aiSummaries = {};
    if (extractedText && validateTextContent(extractedText)) {
      try {
        aiSummaries = await processResumoComIA(extractedText);
      } catch (error) {
        console.error('Erro ao processar resumo com IA:', error);
        // Continuar sem os resumos da IA
      }
    }

    // Criar conteúdo
    const conteudo = await Conteudo.create({
      disciplina_id,
      title,
      description,
      start_date,
      end_date,
      summary_text: extractedText,
      summary_file_path: summaryFilePath,
      // summary_file_type: summaryFileType,
      summary_visual: aiSummaries.visual,
      summary_auditory: aiSummaries.auditory,
      summary_motor: aiSummaries.motor,
      summary_intellectual: aiSummaries.intellectual,
      created_by: userId,
    });

    // Buscar conteúdo criado com dados relacionados
    const createdConteudo = await Conteudo.findByPk(conteudo.id, {
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          include: [
            {
              model: Turma,
              as: 'turma',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    res.status(201).json(successResponse(createdConteudo, 'Conteúdo criado com sucesso'));

  } catch (error) {
    console.error('Erro ao criar conteúdo:', error);
    
    // Deletar arquivo se houve erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar conteúdo
 */
const updateConteudo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, summary_text, is_active } = req.body;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem permissão para acessá-lo'));
    }

    // Processar novo arquivo de resumo se enviado
    let summaryFilePath = conteudo.summary_file_path;
    let summaryFileType = conteudo.summary_file_type;
    let extractedText = summary_text || conteudo.summary_text;

    if (req.file) {
      // Deletar arquivo anterior se existir
      if (conteudo.summary_file_path) {
        deleteFile(conteudo.summary_file_path);
      }

      const fileInfo = getFileInfo(req.file);
      summaryFilePath = fileInfo.path;
      
      // Determinar tipo do arquivo
      const extension = fileInfo.extension.toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
        summaryFileType = 'image';
      } else if (extension === '.pdf') {
        summaryFileType = 'pdf';
      } else if (['.docx', '.doc'].includes(extension)) {
        summaryFileType = 'docx';
      } else {
        summaryFileType = 'text';
      }

      // Extrair texto do arquivo
      try {
        extractedText = await extractTextFromFile(summaryFilePath, summaryFileType);
      } catch (error) {
        console.error('Erro ao extrair texto do arquivo:', error);
        extractedText = summary_text || conteudo.summary_text;
      }
    }

    // Reprocessar resumo com IA se o texto foi alterado
    let aiSummaries = {
      visual: conteudo.summary_visual,
      auditory: conteudo.summary_auditory,
      motor: conteudo.summary_motor,
      intellectual: conteudo.summary_intellectual,
    };

    if (extractedText && extractedText !== conteudo.summary_text && validateTextContent(extractedText)) {
      try {
        aiSummaries = await processResumoComIA(extractedText);
      } catch (error) {
        console.error('Erro ao processar resumo com IA:', error);
        // Manter resumos anteriores
      }
    }

    // Atualizar conteúdo
    await conteudo.update({
      title: title || conteudo.title,
      description: description || conteudo.description,
      start_date: start_date || conteudo.start_date,
      end_date: end_date || conteudo.end_date,
      summary_text: extractedText,
      summary_file_path: summaryFilePath,
      summary_file_type: summaryFileType,
      summary_visual: aiSummaries.visual,
      summary_auditory: aiSummaries.auditory,
      summary_motor: aiSummaries.motor,
      summary_intellectual: aiSummaries.intellectual,
      is_active: is_active !== undefined ? is_active : conteudo.is_active,
    });

    // Buscar conteúdo atualizado
    const updatedConteudo = await Conteudo.findByPk(id, {
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          include: [
            {
              model: Turma,
              as: 'turma',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Material,
          as: 'materials',
        },
        {
          model: Questao,
          as: 'questoes',
        },
      ],
    });

    res.json(successResponse(updatedConteudo, 'Conteúdo atualizado com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    
    // Deletar arquivo se houve erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar conteúdo
 */
const deleteConteudo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem permissão para acessá-lo'));
    }

    // Deletar arquivo de resumo se existir
    if (conteudo.summary_file_path) {
      deleteFile(conteudo.summary_file_path);
    }

    // Deletar conteúdo (cascade deletará materiais, questões e respostas)
    await conteudo.destroy();

    res.json(successResponse(null, 'Conteúdo deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listConteudos,
  getConteudo,
  createConteudo,
  updateConteudo,
  deleteConteudo,
};

