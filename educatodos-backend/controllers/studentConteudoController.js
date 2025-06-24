const { successResponse, errorResponse } = require('../utils/helpers');
const { Student, Disciplina, Conteudo, Material, Questao, Resposta, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar conteúdos de uma disciplina para o aluno
 */
const listConteudos = async (req, res) => {
  try {
    const { disciplina_id } = req.params;
    const { status, search } = req.query;
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Verificar se o aluno tem acesso à disciplina
    const disciplina = await Disciplina.findOne({
      where: { 
        id: disciplina_id,
        turma_id: student.turma_id,
      },
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou você não tem acesso a ela'));
    }

    // Construir filtros
    const where = { 
      disciplina_id,
      is_active: true,
    };
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filtrar por status (ativo/finalizado)
    if (status === 'ativo') {
      where.end_date = { [Op.gte]: new Date() };
    } else if (status === 'finalizado') {
      where.end_date = { [Op.lt]: new Date() };
    }

    const conteudos = await Conteudo.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name'],
        },
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
      order: [['start_date', 'ASC']],
    });

    // Formatar resposta com progresso do aluno
    const formattedConteudos = await Promise.all(
      conteudos.map(async (conteudo) => {
        const totalQuestoes = conteudo.questoes.length;
        
        const questoesRespondidas = await Resposta.count({
          where: { student_id: student.id },
          include: [
            {
              model: Questao,
              as: 'questao',
              where: { conteudo_id: conteudo.id },
              attributes: [],
            },
          ],
        });

        const respostasCorretas = await Resposta.count({
          where: { 
            student_id: student.id,
            is_correct: true,
          },
          include: [
            {
              model: Questao,
              as: 'questao',
              where: { conteudo_id: conteudo.id },
              attributes: [],
            },
          ],
        });

        const isActive = new Date(conteudo.end_date) >= new Date();
        const isFinalized = new Date(conteudo.end_date) < new Date();

        // Contar materiais por tipo de deficiência
        const materialsForStudent = conteudo.materials.filter(m => 
          m.disability_type === 'all' || m.disability_type === student.disability_type
        );

        return {
          id: conteudo.id,
          title: conteudo.title,
          description: conteudo.description,
          start_date: conteudo.start_date,
          end_date: conteudo.end_date,
          status: isActive ? 'ativo' : (isFinalized ? 'finalizado' : 'inativo'),
          created_by: conteudo.creator.name,
          total_questoes: totalQuestoes,
          questoes_respondidas: questoesRespondidas,
          respostas_corretas: respostasCorretas,
          total_materials: materialsForStudent.length,
          progresso: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
          taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
          has_summary: !!(conteudo.summary_text || conteudo.summary_file_path),
          disciplina,
          created_at: conteudo.created_at,
        };
      })
    );

    res.json(successResponse(formattedConteudos, 'Conteúdos listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar conteúdos para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um conteúdo específico com resumo adaptado
 */
const getConteudo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { 
        id,
        is_active: true,
      },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { turma_id: student.turma_id },
        },
        {
          model: User,
          as: 'creator',
          attributes: ['name'],
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem acesso a ele'));
    }

    // Selecionar resumo adaptado baseado no tipo de deficiência do aluno
    let adaptedSummary = conteudo.summary_text;

    const accessibilityType = (req.headers['accessibility-type'] || '').toLowerCase();

    const alias = {
      visual: 'visual',
      auditiva: 'auditory',
      motora: 'motor',
      intelectual: 'intellectual' 
    }
    
    switch (alias[accessibilityType]) {
      case 'visual':
        adaptedSummary = conteudo.summary_visual || conteudo.summary_text;
        break;
      case 'auditory':
        adaptedSummary = conteudo.summary_auditory || conteudo.summary_text;
        break;
      case 'motor':
        adaptedSummary = conteudo.summary_motor || conteudo.summary_text;
        break;
      case 'intellectual':
        adaptedSummary = conteudo.summary_intellectual || conteudo.summary_text;
        break;
      default:
        adaptedSummary = conteudo.summary_text;
    }

    // Calcular progresso do aluno neste conteúdo
    const totalQuestoes = await Questao.count({
      where: { conteudo_id: id },
    });

    const questoesRespondidas = await Resposta.count({
      where: { student_id: student.id },
      include: [
        {
          model: Questao,
          as: 'questao',
          where: { conteudo_id: id },
          attributes: [],
        },
      ],
    });

    const respostasCorretas = await Resposta.count({
      where: { 
        student_id: student.id,
        is_correct: true,
      },
      include: [
        {
          model: Questao,
          as: 'questao',
          where: { conteudo_id: id },
          attributes: [],
        },
      ],
    });

    const conteudoFormatted = {
      id: conteudo.id,
      title: conteudo.title,
      description: conteudo.description,
      start_date: conteudo.start_date,
      end_date: conteudo.end_date,
      summary: adaptedSummary,
      summary_type: student.disability_type || 'none',
      disciplina: {
        id: conteudo.disciplina.id,
        name: conteudo.disciplina.name,
      },
      created_by: conteudo.creator.name,
      stats: {
        total_questoes: totalQuestoes,
        questoes_respondidas: questoesRespondidas,
        respostas_corretas: respostasCorretas,
        progresso: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
        taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
      },
      created_at: conteudo.created_at,
    };

    res.json(successResponse(conteudoFormatted, 'Conteúdo obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter conteúdo para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Listar materiais de um conteúdo adaptados para o aluno
 */
const listMaterials = async (req, res) => {
  try {
    const { conteudo_id } = req.params;
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Verificar se o aluno tem acesso ao conteúdo
    const conteudo = await Conteudo.findOne({
      where: { 
        id: conteudo_id,
        is_active: true,
      },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { turma_id: student.turma_id },
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem acesso a ele'));
    }

    // Buscar materiais adaptados para o tipo de deficiência do aluno
    const materials = await Material.findAll({
      where: { 
        conteudo_id,
        is_active: true,
        [Op.or]: [
          { disability_type: 'all' },
          { disability_type: student.disability_type },
        ],
      },
      order: [['created_at', 'ASC']],
    });

    // Formatar materiais removendo informações sensíveis
    const formattedMaterials = materials.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      content: material.content,
      disability_type: material.disability_type,
      created_at: material.created_at,
    }));

    res.json(successResponse(formattedMaterials, 'Materiais listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar materiais para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Menu de conteúdo - visão geral dos conteúdos do aluno
 */
const getConteudoMenu = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Buscar conteúdos ativos agrupados por disciplina
    const disciplinas = await Disciplina.findAll({
      where: { 
        turma_id: student.turma_id,
        is_active: true,
      },
      include: [
        {
          model: Conteudo,
          as: 'conteudos',
          where: { 
            is_active: true,
            end_date: { [Op.gte]: new Date() },
          },
          required: false,
          attributes: ['id', 'title', 'start_date', 'end_date'],
          order: [['start_date', 'ASC']],
        },
      ],
      order: [['name', 'ASC']],
    });

    // Formatar menu com progresso
    const menuFormatted = await Promise.all(
      disciplinas.map(async (disciplina) => {
        const conteudosComProgresso = await Promise.all(
          disciplina.conteudos.map(async (conteudo) => {
            const totalQuestoes = await Questao.count({
              where: { conteudo_id: conteudo.id },
            });

            const questoesRespondidas = await Resposta.count({
              where: { student_id: student.id },
              include: [
                {
                  model: Questao,
                  as: 'questao',
                  where: { conteudo_id: conteudo.id },
                  attributes: [],
                },
              ],
            });

            return {
              id: conteudo.id,
              title: conteudo.title,
              start_date: conteudo.start_date,
              end_date: conteudo.end_date,
              progresso: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
              total_questoes: totalQuestoes,
              questoes_respondidas: questoesRespondidas,
            };
          })
        );

        return {
          disciplina_id: disciplina.id,
          disciplina_name: disciplina.name,
          total_conteudos: conteudosComProgresso.length,
          conteudos: conteudosComProgresso,
        };
      })
    );

    res.json(successResponse(menuFormatted, 'Menu de conteúdos obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter menu de conteúdos:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listConteudos,
  getConteudo,
  listMaterials,
  getConteudoMenu,
};

