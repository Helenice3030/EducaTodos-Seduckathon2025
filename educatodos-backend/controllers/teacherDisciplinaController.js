const { successResponse, errorResponse } = require('../utils/helpers');
const { Teacher, Disciplina, Turma, Conteudo, Questao, Resposta } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar disciplinas do professor autenticado
 */
const listMyDisciplinas = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o professor pelo user_id
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = { teacher_id: teacher.id };
    
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const { count, rows: disciplinas } = await Disciplina.findAndCountAll({
      where,
      include: [
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
        {
          model: Conteudo,
          as: 'conteudos',
          attributes: ['id', 'title', 'is_active', 'end_date'],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Formatar resposta com contagem de conteúdos
    const formattedDisciplinas = await Promise.all(
      disciplinas.map(async (disciplina) => {
        const totalConteudos = await Conteudo.count({
          where: { disciplina_id: disciplina.id },
        });

        const conteudosAtivos = await Conteudo.count({
          where: { 
            disciplina_id: disciplina.id,
            is_active: true,
            end_date: { [Op.gte]: new Date() },
          },
        });

        const conteudosFinalizados = await Conteudo.count({
          where: { 
            disciplina_id: disciplina.id,
            is_active: true,
            end_date: { [Op.lt]: new Date() },
          },
        });

        return {
          id: disciplina.id,
          name: disciplina.name,
          description: disciplina.description,
          is_active: disciplina.is_active,
          turma: disciplina.turma,
          total_conteudos: totalConteudos,
          conteudos_ativos: conteudosAtivos,
          conteudos_finalizados: conteudosFinalizados,
          created_at: disciplina.created_at,
          updated_at: disciplina.updated_at,
        };
      })
    );

    res.json(successResponse({
      disciplinas: formattedDisciplinas,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Disciplinas do professor listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar disciplinas do professor:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter uma disciplina específica do professor
 */
const getMyDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar o professor pelo user_id
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const disciplina = await Disciplina.findOne({
      where: { 
        id,
        teacher_id: teacher.id,
      },
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Conteudo,
          as: 'conteudos',
          include: [
            {
              model: Questao,
              as: 'questoes',
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou você não tem permissão para acessá-la'));
    }

    // Calcular estatísticas
    const totalConteudos = disciplina.conteudos.length;
    const conteudosAtivos = disciplina.conteudos.filter(c => c.is_active && new Date(c.end_date) >= new Date()).length;
    const conteudosFinalizados = disciplina.conteudos.filter(c => c.is_active && new Date(c.end_date) < new Date()).length;
    const totalQuestoes = disciplina.conteudos.reduce((total, conteudo) => total + conteudo.questoes.length, 0);

    const disciplinaFormatted = {
      ...disciplina.toJSON(),
      stats: {
        total_conteudos: totalConteudos,
        conteudos_ativos: conteudosAtivos,
        conteudos_finalizados: conteudosFinalizados,
        total_questoes: totalQuestoes,
      },
    };

    res.json(successResponse(disciplinaFormatted, 'Disciplina obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter disciplina do professor:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter estatísticas gerais das disciplinas do professor
 */
const getMyDisciplinasStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o professor pelo user_id
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const totalDisciplinas = await Disciplina.count({
      where: { teacher_id: teacher.id },
    });

    const disciplinasAtivas = await Disciplina.count({
      where: { 
        teacher_id: teacher.id,
        is_active: true,
      },
    });

    const totalConteudos = await Conteudo.count({
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
          attributes: [],
        },
      ],
    });

    const conteudosAtivos = await Conteudo.count({
      where: {
        is_active: true,
        end_date: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
          attributes: [],
        },
      ],
    });

    const totalQuestoes = await Questao.count({
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    });

    const totalRespostas = await Resposta.count({
      include: [
        {
          model: Questao,
          as: 'questao',
          include: [
            {
              model: Conteudo,
              as: 'conteudo',
              include: [
                {
                  model: Disciplina,
                  as: 'disciplina',
                  where: { teacher_id: teacher.id },
                  attributes: [],
                },
              ],
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    });

    const stats = {
      total_disciplinas: totalDisciplinas,
      disciplinas_ativas: disciplinasAtivas,
      total_conteudos: totalConteudos,
      conteudos_ativos: conteudosAtivos,
      total_questoes: totalQuestoes,
      total_respostas: totalRespostas,
    };

    res.json(successResponse(stats, 'Estatísticas das disciplinas obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter estatísticas das disciplinas:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listMyDisciplinas,
  getMyDisciplina,
  getMyDisciplinasStats,
};

