const { successResponse, errorResponse } = require('../utils/helpers');
const { Teacher, Disciplina, Conteudo, Questao, Resposta, Student, User } = require('../models');
const { processQuestoesComIA, extractTextFromFile } = require('../utils/aiService');
const { getFileInfo, deleteFile } = require('../middleware/upload');
const { Op } = require('sequelize');

/**
 * Listar questões de um conteúdo
 */
const listQuestoes = async (req, res) => {
  try {
    const { conteudo_id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id: conteudo_id },
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

    const questoes = await Questao.findAll({
      where: { conteudo_id },
      order: [['order_index', 'ASC']],
    });

    // Adicionar estatísticas de respostas para cada questão
    const questoesComStats = await Promise.all(
      questoes.map(async (questao) => {
        const totalRespostas = await Resposta.count({
          where: { questao_id: questao.id },
        });

        const respostasCorretas = await Resposta.count({
          where: { 
            questao_id: questao.id,
            is_correct: true,
          },
        });

        return {
          ...questao.toJSON(),
          stats: {
            total_respostas: totalRespostas,
            respostas_corretas: respostasCorretas,
            taxa_acerto: totalRespostas > 0 ? ((respostasCorretas / totalRespostas) * 100).toFixed(2) : 0,
          },
        };
      })
    );

    res.json(successResponse(questoesComStats, 'Questões listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar questões:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter uma questão específica
 */
const getQuestao = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso à questão
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const questao = await Questao.findOne({
      where: { id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!questao) {
      return res.status(404).json(errorResponse('Questão não encontrada ou você não tem permissão para acessá-la'));
    }

    res.json(successResponse(questao, 'Questão obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter questão:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar nova questão
 */
const createQuestao = async (req, res) => {
  try {
    const { 
      conteudo_id, 
      question_text, 
      option_a, 
      option_b, 
      option_c, 
      option_d, 
      option_e, 
      correct_answer, 
      points,
      order_index 
    } = req.body;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id: conteudo_id },
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

    // Determinar order_index se não fornecido
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const maxOrder = await Questao.max('order_index', {
        where: { conteudo_id },
      });
      finalOrderIndex = (maxOrder || 0) + 1;
    }

    // Criar questão
    const questao = await Questao.create({
      conteudo_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      correct_answer,
      points: points || 1.0,
      order_index: finalOrderIndex,
    });

    res.status(201).json(successResponse(questao, 'Questão criada com sucesso'));

  } catch (error) {
    console.error('Erro ao criar questão:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar questões a partir de arquivo (usando IA)
 */
const createQuestoesFromFile = async (req, res) => {
  try {
    const { conteudo_id } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json(errorResponse('Arquivo é obrigatório'));
    }

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id: conteudo_id },
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

    const fileInfo = getFileInfo(req.file);
    
    // Determinar tipo do arquivo
    const extension = fileInfo.extension.toLowerCase();
    let fileType = 'text';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
      fileType = 'image';
    } else if (extension === '.pdf') {
      fileType = 'pdf';
    } else if (['.docx', '.doc'].includes(extension)) {
      fileType = 'docx';
    }

    try {
      // Extrair texto do arquivo
      const extractedText = await extractTextFromFile(fileInfo.path, fileType);
      
      // Processar questões com IA
      const questoesIA = await processQuestoesComIA(extractedText, fileType);
      
      // Obter próximo order_index
      const maxOrder = await Questao.max('order_index', {
        where: { conteudo_id },
      });
      let currentOrderIndex = (maxOrder || 0) + 1;

      // Criar questões no banco
      const questoesCriadas = [];
      for (const questaoData of questoesIA) {
        const questao = await Questao.create({
          conteudo_id,
          question_text: questaoData.question_text,
          option_a: questaoData.option_a,
          option_b: questaoData.option_b,
          option_c: questaoData.option_c,
          option_d: questaoData.option_d,
          option_e: questaoData.option_e,
          correct_answer: questaoData.correct_answer,
          points: questaoData.points || 1.0,
          order_index: currentOrderIndex++,
        });
        questoesCriadas.push(questao);
      }

      // Deletar arquivo temporário
      deleteFile(fileInfo.path);

      res.status(201).json(successResponse({
        questoes: questoesCriadas,
        total_criadas: questoesCriadas.length,
      }, `${questoesCriadas.length} questões criadas com sucesso a partir do arquivo`));

    } catch (aiError) {
      console.error('Erro no processamento com IA:', aiError);
      deleteFile(fileInfo.path);
      return res.status(500).json(errorResponse('Erro ao processar arquivo com IA'));
    }

  } catch (error) {
    console.error('Erro ao criar questões do arquivo:', error);
    
    // Deletar arquivo se houve erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar questão
 */
const updateQuestao = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      question_text, 
      option_a, 
      option_b, 
      option_c, 
      option_d, 
      option_e, 
      correct_answer, 
      points,
      order_index,
      is_active 
    } = req.body;
    const userId = req.user.id;

    // Verificar se o professor tem acesso à questão
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const questao = await Questao.findOne({
      where: { id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!questao) {
      return res.status(404).json(errorResponse('Questão não encontrada ou você não tem permissão para acessá-la'));
    }

    // Atualizar questão
    await questao.update({
      question_text: question_text || questao.question_text,
      option_a: option_a || questao.option_a,
      option_b: option_b || questao.option_b,
      option_c: option_c !== undefined ? option_c : questao.option_c,
      option_d: option_d !== undefined ? option_d : questao.option_d,
      option_e: option_e !== undefined ? option_e : questao.option_e,
      correct_answer: correct_answer || questao.correct_answer,
      points: points !== undefined ? points : questao.points,
      order_index: order_index !== undefined ? order_index : questao.order_index,
      is_active: is_active !== undefined ? is_active : questao.is_active,
    });

    res.json(successResponse(questao, 'Questão atualizada com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar questão
 */
const deleteQuestao = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso à questão
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const questao = await Questao.findOne({
      where: { id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!questao) {
      return res.status(404).json(errorResponse('Questão não encontrada ou você não tem permissão para acessá-la'));
    }

    // Deletar questão (cascade deletará respostas)
    await questao.destroy();

    res.json(successResponse(null, 'Questão deletada com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar questão:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Listar respostas de uma questão
 */
const listRespostas = async (req, res) => {
  try {
    const { questao_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Verificar se o professor tem acesso à questão
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const questao = await Questao.findOne({
      where: { id: questao_id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!questao) {
      return res.status(404).json(errorResponse('Questão não encontrada ou você não tem permissão para acessá-la'));
    }

    const { count, rows: respostas } = await Resposta.findAndCountAll({
      where: { questao_id },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['answered_at', 'DESC']],
    });

    // Formatar resposta
    const respostasFormatadas = respostas.map(resposta => ({
      id: resposta.id,
      student_name: resposta.student.user.name,
      selected_answer: resposta.selected_answer,
      is_correct: resposta.is_correct,
      points_earned: resposta.points_earned,
      answered_at: resposta.answered_at,
    }));

    res.json(successResponse({
      questao: {
        id: questao.id,
        question_text: questao.question_text,
        correct_answer: questao.correct_answer,
        points: questao.points,
      },
      respostas: respostasFormatadas,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Respostas listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar respostas:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listQuestoes,
  getQuestao,
  createQuestao,
  createQuestoesFromFile,
  updateQuestao,
  deleteQuestao,
  listRespostas,
};

