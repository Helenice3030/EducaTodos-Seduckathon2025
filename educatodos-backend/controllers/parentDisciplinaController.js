const { successResponse, errorResponse } = require('../utils/helpers');
const { Parent, Student, Disciplina, Turma, Teacher, User, Conteudo, Questao, Resposta } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar disciplinas do aluno
 */
const listStudentDisciplinas = async (req, res) => {
  try {
    const { student_id } = req.params;
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Verificar se o responsável tem acesso ao aluno
    if (parent.student_id !== parseInt(student_id)) {
      return res.status(403).json(errorResponse('Você não tem permissão para acessar informações deste aluno'));
    }

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const disciplinas = await Disciplina.findAll({
      where: { 
        turma_id: student.turma_id,
        is_active: true,
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
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    });

    // Calcular estatísticas para cada disciplina
    const disciplinasComStats = await Promise.all(
      disciplinas.map(async (disciplina) => {
        const totalConteudos = await Conteudo.count({
          where: { 
            disciplina_id: disciplina.id,
            is_active: true,
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

        const pontosObtidos = await Resposta.sum('points_earned', {
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
        }) || 0;

        const pontosMaximos = await Questao.sum('points', {
          where: { id: { [Op.in]: await Resposta.findAll({
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
                attributes: ['id'],
              },
            ],
            attributes: [],
          }).then(respostas => respostas.map(r => r.questao_id)) }},
        }) || 0;

        return {
          id: disciplina.id,
          name: disciplina.name,
          description: disciplina.description,
          teacher: {
            name: disciplina.teacher.user.name,
            email: disciplina.teacher.user.email,
          },
          stats: {
            total_conteudos: totalConteudos,
            total_questoes: totalQuestoes,
            questoes_respondidas: questoesRespondidas,
            respostas_corretas: respostasCorretas,
            pontos_obtidos: parseFloat(pontosObtidos).toFixed(2),
            pontos_maximos: parseFloat(pontosMaximos).toFixed(2),
            progresso: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
            taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
            aproveitamento: pontosMaximos > 0 ? ((pontosObtidos / pontosMaximos) * 100).toFixed(2) : 0,
          },
        };
      })
    );

    res.json(successResponse(disciplinasComStats, 'Disciplinas do aluno listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar disciplinas do aluno para responsável:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter detalhes de uma disciplina específica
 */
const getStudentDisciplina = async (req, res) => {
  try {
    const { student_id, disciplina_id } = req.params;
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Verificar se o responsável tem acesso ao aluno
    if (parent.student_id !== parseInt(student_id)) {
      return res.status(403).json(errorResponse('Você não tem permissão para acessar informações deste aluno'));
    }

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const disciplina = await Disciplina.findOne({
      where: { 
        id: disciplina_id,
        turma_id: student.turma_id,
        is_active: true,
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
          model: Conteudo,
          as: 'conteudos',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'title', 'start_date', 'end_date'],
          order: [['start_date', 'ASC']],
        },
      ],
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou aluno não tem acesso a ela'));
    }

    // Calcular estatísticas detalhadas por conteúdo
    const conteudosComStats = await Promise.all(
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

        const pontosObtidos = await Resposta.sum('points_earned', {
          where: { student_id: student.id },
          include: [
            {
              model: Questao,
              as: 'questao',
              where: { conteudo_id: conteudo.id },
              attributes: [],
            },
          ],
        }) || 0;

        const pontosMaximos = await Questao.sum('points', {
          where: { 
            conteudo_id: conteudo.id,
            id: { [Op.in]: await Resposta.findAll({
              where: { student_id: student.id },
              include: [
                {
                  model: Questao,
                  as: 'questao',
                  where: { conteudo_id: conteudo.id },
                  attributes: ['id'],
                },
              ],
              attributes: [],
            }).then(respostas => respostas.map(r => r.questao_id)) }
          },
        }) || 0;

        const status = new Date(conteudo.end_date) >= new Date() ? 'ativo' : 'finalizado';

        return {
          id: conteudo.id,
          title: conteudo.title,
          start_date: conteudo.start_date,
          end_date: conteudo.end_date,
          status,
          stats: {
            total_questoes: totalQuestoes,
            questoes_respondidas: questoesRespondidas,
            respostas_corretas: respostasCorretas,
            pontos_obtidos: parseFloat(pontosObtidos).toFixed(2),
            pontos_maximos: parseFloat(pontosMaximos).toFixed(2),
            progresso: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
            taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
            aproveitamento: pontosMaximos > 0 ? ((pontosObtidos / pontosMaximos) * 100).toFixed(2) : 0,
          },
        };
      })
    );

    // Calcular estatísticas gerais da disciplina
    const totalQuestoesDisciplina = await Questao.count({
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

    const questoesRespondidasDisciplina = await Resposta.count({
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

    const respostasCorretasDisciplina = await Resposta.count({
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

    const disciplinaDetalhada = {
      id: disciplina.id,
      name: disciplina.name,
      description: disciplina.description,
      teacher: {
        name: disciplina.teacher.user.name,
        email: disciplina.teacher.user.email,
      },
      stats_gerais: {
        total_conteudos: conteudosComStats.length,
        total_questoes: totalQuestoesDisciplina,
        questoes_respondidas: questoesRespondidasDisciplina,
        respostas_corretas: respostasCorretasDisciplina,
        progresso_geral: totalQuestoesDisciplina > 0 ? ((questoesRespondidasDisciplina / totalQuestoesDisciplina) * 100).toFixed(2) : 0,
        taxa_acerto_geral: questoesRespondidasDisciplina > 0 ? ((respostasCorretasDisciplina / questoesRespondidasDisciplina) * 100).toFixed(2) : 0,
      },
      conteudos: conteudosComStats,
    };

    res.json(successResponse(disciplinaDetalhada, 'Detalhes da disciplina obtidos com sucesso'));

  } catch (error) {
    console.error('Erro ao obter detalhes da disciplina para responsável:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter resumo de desempenho geral do aluno
 */
const getStudentPerformance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Verificar se o responsável tem acesso ao aluno
    if (parent.student_id !== parseInt(student_id)) {
      return res.status(403).json(errorResponse('Você não tem permissão para acessar informações deste aluno'));
    }

    const student = await Student.findOne({
      where: { id: student_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
        {
          model: Turma,
          as: 'turma',
          attributes: ['name'],
        },
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Calcular estatísticas gerais
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

    const pontosObtidos = await Resposta.sum('points_earned', {
      where: { student_id: student.id },
    }) || 0;

    const pontosMaximos = await Questao.sum('points', {
      where: { 
        id: { [Op.in]: await Resposta.findAll({
          where: { student_id: student.id },
          attributes: ['questao_id'],
        }).then(respostas => respostas.map(r => r.questao_id)) }
      },
    }) || 0;

    // Calcular desempenho por disciplina
    const disciplinas = await Disciplina.findAll({
      where: { 
        turma_id: student.turma_id,
        is_active: true,
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    const desempenhoPorDisciplina = await Promise.all(
      disciplinas.map(async (disciplina) => {
        const questoesDisciplina = await Questao.count({
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

        const respostasDisciplina = await Resposta.count({
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

        const acertosDisciplina = await Resposta.count({
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
          disciplina_id: disciplina.id,
          disciplina_name: disciplina.name,
          total_questoes: questoesDisciplina,
          questoes_respondidas: respostasDisciplina,
          respostas_corretas: acertosDisciplina,
          progresso: questoesDisciplina > 0 ? ((respostasDisciplina / questoesDisciplina) * 100).toFixed(2) : 0,
          taxa_acerto: respostasDisciplina > 0 ? ((acertosDisciplina / respostasDisciplina) * 100).toFixed(2) : 0,
        };
      })
    );

    const performance = {
      aluno: {
        id: student.id,
        name: student.user.name,
        turma: student.turma.name,
      },
      resumo_geral: {
        total_disciplinas: totalDisciplinas,
        total_conteudos: totalConteudos,
        total_questoes: totalQuestoes,
        questoes_respondidas: questoesRespondidas,
        respostas_corretas: respostasCorretas,
        pontos_obtidos: parseFloat(pontosObtidos).toFixed(2),
        pontos_maximos: parseFloat(pontosMaximos).toFixed(2),
        progresso_geral: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
        taxa_acerto_geral: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
        aproveitamento_geral: pontosMaximos > 0 ? ((pontosObtidos / pontosMaximos) * 100).toFixed(2) : 0,
      },
      desempenho_por_disciplina: desempenhoPorDisciplina,
    };

    res.json(successResponse(performance, 'Desempenho do aluno obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter desempenho do aluno para responsável:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listStudentDisciplinas,
  getStudentDisciplina,
  getStudentPerformance,
};

