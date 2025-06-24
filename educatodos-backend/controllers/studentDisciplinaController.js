const { successResponse, errorResponse } = require('../utils/helpers');
const { Student, Disciplina, Turma, Teacher, User, Conteudo, Questao, Resposta } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar disciplinas do aluno autenticado
 */
const listMyDisciplinas = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Turma,
          as: 'turma',
        },
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const { search, is_active } = req.query;

    // Construir filtros
    const where = { turma_id: student.turma_id };
    
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const disciplinas = await Disciplina.findAll({
      where,
      include: [
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
        {
          model: Conteudo,
          as: 'conteudos',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'end_date'],
        },
      ],
      order: [['name', 'ASC']],
    });

    // Formatar resposta com estatísticas do aluno
    const formattedDisciplinas = await Promise.all(
      disciplinas.map(async (disciplina) => {
        const totalConteudos = await Conteudo.count({
          where: { 
            disciplina_id: disciplina.id,
            is_active: true,
          },
        });

        const conteudosAtivos = await Conteudo.count({
          where: { 
            disciplina_id: disciplina.id,
            is_active: true,
            end_date: { [Op.gte]: new Date() },
          },
        });

        const totalQuestoes = await Questao.count({
          include: [
            {
              model: Conteudo,
              as: 'conteudo',
              where: { 
                disciplina_id: disciplina.id,
                is_active: true,
              },
              attributes: [],
            },
          ],
        });

        const questoesRespondidas = await Resposta.count({
          where: { student_id: student.id },
          include: [
            {
              model: Questao,
              as: 'questao',
              include: [
                {
                  model: Conteudo,
                  as: 'conteudo',
                  where: { 
                    disciplina_id: disciplina.id,
                    is_active: true,
                  },
                  attributes: [],
                },
              ],
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
              include: [
                {
                  model: Conteudo,
                  as: 'conteudo',
                  where: { 
                    disciplina_id: disciplina.id,
                    is_active: true,
                  },
                  attributes: [],
                },
              ],
              attributes: [],
            },
          ],
        });

        return {
          id: disciplina.id,
          name: disciplina.name,
          description: disciplina.description,
          is_active: disciplina.is_active,
          teacher_name: disciplina.teacher.user.name,
          turma: disciplina.turma,
          stats: {
            total_conteudos: totalConteudos,
            conteudos_ativos: conteudosAtivos,
            total_questoes: totalQuestoes,
            questoes_respondidas: questoesRespondidas,
            respostas_corretas: respostasCorretas,
            progresso_questoes: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
            taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
          },
        };
      })
    );

    res.json(successResponse(formattedDisciplinas, 'Disciplinas do aluno listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar disciplinas do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter uma disciplina específica do aluno
 */
const getMyDisciplina = async (req, res) => {
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

    const disciplina = await Disciplina.findOne({
      where: { 
        id,
        turma_id: student.turma_id,
      },
      include: [
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
        },
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Conteudo,
          as: 'conteudos',
          where: { is_active: true },
          required: false,
          order: [['start_date', 'ASC']],
        },
      ],
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou você não tem acesso a ela'));
    }

    // Calcular estatísticas detalhadas
    const totalConteudos = disciplina.conteudos.length;
    const conteudosAtivos = disciplina.conteudos.filter(c => new Date(c.end_date) >= new Date()).length;
    const conteudosFinalizados = disciplina.conteudos.filter(c => new Date(c.end_date) < new Date()).length;

    const totalQuestoes = await Questao.count({
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          where: { 
            disciplina_id: disciplina.id,
            is_active: true,
          },
          attributes: [],
        },
      ],
    });

    const questoesRespondidas = await Resposta.count({
      where: { student_id: student.id },
      include: [
        {
          model: Questao,
          as: 'questao',
          include: [
            {
              model: Conteudo,
              as: 'conteudo',
              where: { 
                disciplina_id: disciplina.id,
                is_active: true,
              },
              attributes: [],
            },
          ],
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
          include: [
            {
              model: Conteudo,
              as: 'conteudo',
              where: { 
                disciplina_id: disciplina.id,
                is_active: true,
              },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    });

    const disciplinaFormatted = {
      ...disciplina.toJSON(),
      stats: {
        total_conteudos: totalConteudos,
        conteudos_ativos: conteudosAtivos,
        conteudos_finalizados: conteudosFinalizados,
        total_questoes: totalQuestoes,
        questoes_respondidas: questoesRespondidas,
        respostas_corretas: respostasCorretas,
        progresso_questoes: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
        taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
      },
    };

    res.json(successResponse(disciplinaFormatted, 'Disciplina obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter disciplina do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter estatísticas gerais do aluno
 */
const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const totalDisciplinas = await Disciplina.count({
      where: { 
        turma_id: student.turma_id,
        is_active: true,
      },
    });

    const totalConteudos = await Conteudo.count({
      where: { is_active: true },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { turma_id: student.turma_id },
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
          where: { turma_id: student.turma_id },
          attributes: [],
        },
      ],
    });

    const totalQuestoes = await Questao.count({
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          where: { is_active: true },
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { turma_id: student.turma_id },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    });

    const questoesRespondidas = await Resposta.count({
      where: { student_id: student.id },
    });

    const respostasCorretas = await Resposta.count({
      where: { 
        student_id: student.id,
        is_correct: true,
      },
    });

    const stats = {
      total_disciplinas: totalDisciplinas,
      total_conteudos: totalConteudos,
      conteudos_ativos: conteudosAtivos,
      total_questoes: totalQuestoes,
      questoes_respondidas: questoesRespondidas,
      respostas_corretas: respostasCorretas,
      progresso_geral: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
      taxa_acerto_geral: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
    };

    res.json(successResponse(stats, 'Estatísticas do aluno obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter estatísticas do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listMyDisciplinas,
  getMyDisciplina,
  getMyStats,
};

