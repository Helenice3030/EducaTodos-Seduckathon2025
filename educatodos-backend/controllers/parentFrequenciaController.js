const { successResponse, errorResponse } = require('../utils/helpers');
const { Parent, Student, Disciplina, Conteudo, Questao, Resposta, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Obter frequência do aluno (baseada na participação em atividades)
 */
const getStudentFrequencia = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { disciplina_id, periodo } = req.query;
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
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Definir período de análise
    let dataInicio = new Date();
    let dataFim = new Date();
    
    switch (periodo) {
      case 'semana':
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case 'mes':
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        break;
      case 'bimestre':
        dataInicio.setMonth(dataInicio.getMonth() - 2);
        break;
      case 'semestre':
        dataInicio.setMonth(dataInicio.getMonth() - 6);
        break;
      default:
        // Ano letivo atual
        dataInicio = new Date(dataInicio.getFullYear(), 0, 1);
    }

    // Construir filtros para disciplina específica ou todas
    const disciplinaFilter = disciplina_id ? { id: disciplina_id } : { turma_id: student.turma_id };

    const disciplinas = await Disciplina.findAll({
      where: {
        ...disciplinaFilter,
        is_active: true,
      },
      attributes: ['id', 'name'],
    });

    // Calcular frequência por disciplina
    const frequenciaPorDisciplina = await Promise.all(
      disciplinas.map(async (disciplina) => {
        // Buscar conteúdos do período
        const conteudosPeriodo = await Conteudo.findAll({
          where: {
            disciplina_id: disciplina.id,
            is_active: true,
            start_date: { [Op.gte]: dataInicio },
            end_date: { [Op.lte]: dataFim },
          },
          attributes: ['id', 'title', 'start_date', 'end_date'],
        });

        // Calcular participação em cada conteúdo
        const participacaoConteudos = await Promise.all(
          conteudosPeriodo.map(async (conteudo) => {
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

            // Considerar "presente" se respondeu pelo menos 50% das questões
            const participacao = totalQuestoes > 0 ? (questoesRespondidas / totalQuestoes) : 0;
            const presente = participacao >= 0.5;

            return {
              conteudo_id: conteudo.id,
              conteudo_title: conteudo.title,
              data: conteudo.start_date,
              total_questoes: totalQuestoes,
              questoes_respondidas: questoesRespondidas,
              participacao_percentual: (participacao * 100).toFixed(2),
              presente,
            };
          })
        );

        const totalAulas = participacaoConteudos.length;
        const aulasPresentes = participacaoConteudos.filter(p => p.presente).length;
        const percentualFrequencia = totalAulas > 0 ? ((aulasPresentes / totalAulas) * 100).toFixed(2) : 0;

        return {
          disciplina_id: disciplina.id,
          disciplina_name: disciplina.name,
          total_aulas: totalAulas,
          aulas_presentes: aulasPresentes,
          aulas_ausentes: totalAulas - aulasPresentes,
          percentual_frequencia: percentualFrequencia,
          status_frequencia: percentualFrequencia >= 75 ? 'adequada' : (percentualFrequencia >= 50 ? 'atencao' : 'critica'),
          detalhes_participacao: participacaoConteudos,
        };
      })
    );

    // Calcular frequência geral
    const totalAulasGeral = frequenciaPorDisciplina.reduce((sum, d) => sum + d.total_aulas, 0);
    const aulasPresentes = frequenciaPorDisciplina.reduce((sum, d) => sum + d.aulas_presentes, 0);
    const percentualGeralFrequencia = totalAulasGeral > 0 ? ((aulasPresentes / totalAulasGeral) * 100).toFixed(2) : 0;

    const frequencia = {
      aluno: {
        id: student.id,
        name: student.user.name,
      },
      periodo: {
        tipo: periodo || 'ano_letivo',
        data_inicio: dataInicio.toISOString().split('T')[0],
        data_fim: dataFim.toISOString().split('T')[0],
      },
      resumo_geral: {
        total_aulas: totalAulasGeral,
        aulas_presentes: aulasPresentes,
        aulas_ausentes: totalAulasGeral - aulasPresentes,
        percentual_frequencia: percentualGeralFrequencia,
        status_frequencia: percentualGeralFrequencia >= 75 ? 'adequada' : (percentualGeralFrequencia >= 50 ? 'atencao' : 'critica'),
      },
      frequencia_por_disciplina: frequenciaPorDisciplina,
    };

    res.json(successResponse(frequencia, 'Frequência do aluno obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter frequência do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter pendências do aluno
 */
const getStudentPendencias = async (req, res) => {
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
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Buscar conteúdos ativos (não finalizados)
    const conteudosAtivos = await Conteudo.findAll({
      where: {
        is_active: true,
        end_date: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { turma_id: student.turma_id },
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'title', 'start_date', 'end_date'],
      order: [['end_date', 'ASC']],
    });

    // Verificar pendências em cada conteúdo
    const pendencias = await Promise.all(
      conteudosAtivos.map(async (conteudo) => {
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

        const questoesPendentes = totalQuestoes - questoesRespondidas;
        const temPendencia = questoesPendentes > 0;

        // Calcular urgência baseada na data de fim
        const agora = new Date();
        const dataFim = new Date(conteudo.end_date);
        const diasRestantes = Math.ceil((dataFim - agora) / (1000 * 60 * 60 * 24));
        
        let urgencia = 'baixa';
        if (diasRestantes <= 1) {
          urgencia = 'critica';
        } else if (diasRestantes <= 3) {
          urgencia = 'alta';
        } else if (diasRestantes <= 7) {
          urgencia = 'media';
        }

        return {
          conteudo_id: conteudo.id,
          conteudo_title: conteudo.title,
          disciplina: conteudo.disciplina,
          data_fim: conteudo.end_date,
          dias_restantes: diasRestantes,
          total_questoes: totalQuestoes,
          questoes_respondidas: questoesRespondidas,
          questoes_pendentes: questoesPendentes,
          tem_pendencia: temPendencia,
          urgencia,
          progresso_percentual: totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100).toFixed(2) : 0,
        };
      })
    );

    // Filtrar apenas conteúdos com pendências
    const conteudosComPendencia = pendencias.filter(p => p.tem_pendencia);

    // Agrupar por urgência
    const pendenciasPorUrgencia = {
      critica: conteudosComPendencia.filter(p => p.urgencia === 'critica'),
      alta: conteudosComPendencia.filter(p => p.urgencia === 'alta'),
      media: conteudosComPendencia.filter(p => p.urgencia === 'media'),
      baixa: conteudosComPendencia.filter(p => p.urgencia === 'baixa'),
    };

    // Buscar conteúdos finalizados com baixo aproveitamento (menos de 60%)
    const conteudosFinalizados = await Conteudo.findAll({
      where: {
        is_active: true,
        end_date: { [Op.lt]: new Date() },
      },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { turma_id: student.turma_id },
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'title', 'end_date'],
      order: [['end_date', 'DESC']],
      limit: 10, // Últimos 10 conteúdos finalizados
    });

    const conteudosBaixoAproveitamento = await Promise.all(
      conteudosFinalizados.map(async (conteudo) => {
        const totalQuestoes = await Questao.count({
          where: { conteudo_id: conteudo.id },
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

        const aproveitamento = questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100) : 0;
        const baixoAproveitamento = aproveitamento < 60;

        return {
          conteudo_id: conteudo.id,
          conteudo_title: conteudo.title,
          disciplina: conteudo.disciplina,
          data_fim: conteudo.end_date,
          total_questoes: totalQuestoes,
          questoes_respondidas: questoesRespondidas,
          respostas_corretas: respostasCorretas,
          aproveitamento: aproveitamento.toFixed(2),
          baixo_aproveitamento: baixoAproveitamento,
        };
      })
    );

    const conteudosParaRevisao = conteudosBaixoAproveitamento.filter(c => c.baixo_aproveitamento);

    const resumoPendencias = {
      aluno: {
        id: student.id,
        name: student.user.name,
      },
      pendencias_ativas: {
        total_conteudos_pendentes: conteudosComPendencia.length,
        total_questoes_pendentes: conteudosComPendencia.reduce((sum, p) => sum + p.questoes_pendentes, 0),
        por_urgencia: {
          critica: pendenciasPorUrgencia.critica.length,
          alta: pendenciasPorUrgencia.alta.length,
          media: pendenciasPorUrgencia.media.length,
          baixa: pendenciasPorUrgencia.baixa.length,
        },
        detalhes: pendenciasPorUrgencia,
      },
      conteudos_para_revisao: {
        total: conteudosParaRevisao.length,
        detalhes: conteudosParaRevisao,
      },
      resumo_geral: {
        tem_pendencias_criticas: pendenciasPorUrgencia.critica.length > 0,
        tem_pendencias_ativas: conteudosComPendencia.length > 0,
        precisa_revisao: conteudosParaRevisao.length > 0,
        status_geral: pendenciasPorUrgencia.critica.length > 0 ? 'critico' : 
                     (conteudosComPendencia.length > 0 ? 'atencao' : 'ok'),
      },
    };

    res.json(successResponse(resumoPendencias, 'Pendências do aluno obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter pendências do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter atividades por disciplina
 */
const getStudentAtividades = async (req, res) => {
  try {
    const { student_id, disciplina_id } = req.params;
    const { status, periodo } = req.query;
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

    // Verificar se a disciplina pertence à turma do aluno
    const disciplina = await Disciplina.findOne({
      where: { 
        id: disciplina_id,
        turma_id: student.turma_id,
        is_active: true,
      },
      attributes: ['id', 'name', 'description'],
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada ou aluno não tem acesso a ela'));
    }

    // Definir filtros de período
    let filtroData = {};
    if (periodo) {
      const agora = new Date();
      let dataInicio = new Date();
      
      switch (periodo) {
        case 'semana':
          dataInicio.setDate(agora.getDate() - 7);
          break;
        case 'mes':
          dataInicio.setMonth(agora.getMonth() - 1);
          break;
        case 'bimestre':
          dataInicio.setMonth(agora.getMonth() - 2);
          break;
      }
      
      filtroData = {
        start_date: { [Op.gte]: dataInicio },
      };
    }

    // Definir filtros de status
    let filtroStatus = {};
    if (status) {
      const agora = new Date();
      switch (status) {
        case 'ativo':
          filtroStatus = { end_date: { [Op.gte]: agora } };
          break;
        case 'finalizado':
          filtroStatus = { end_date: { [Op.lt]: agora } };
          break;
      }
    }

    // Buscar conteúdos (atividades) da disciplina
    const conteudos = await Conteudo.findAll({
      where: {
        disciplina_id,
        is_active: true,
        ...filtroData,
        ...filtroStatus,
      },
      attributes: ['id', 'title', 'description', 'start_date', 'end_date'],
      order: [['start_date', 'DESC']],
    });

    // Calcular estatísticas para cada atividade
    const atividadesComStats = await Promise.all(
      conteudos.map(async (conteudo) => {
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

        const agora = new Date();
        const dataFim = new Date(conteudo.end_date);
        const statusAtividade = dataFim >= agora ? 'ativo' : 'finalizado';
        
        const progresso = totalQuestoes > 0 ? ((questoesRespondidas / totalQuestoes) * 100) : 0;
        const aproveitamento = pontosMaximos > 0 ? ((pontosObtidos / pontosMaximos) * 100) : 0;

        return {
          id: conteudo.id,
          title: conteudo.title,
          description: conteudo.description,
          start_date: conteudo.start_date,
          end_date: conteudo.end_date,
          status: statusAtividade,
          stats: {
            total_questoes: totalQuestoes,
            questoes_respondidas: questoesRespondidas,
            respostas_corretas: respostasCorretas,
            pontos_obtidos: parseFloat(pontosObtidos).toFixed(2),
            pontos_maximos: parseFloat(pontosMaximos).toFixed(2),
            progresso: progresso.toFixed(2),
            taxa_acerto: questoesRespondidas > 0 ? ((respostasCorretas / questoesRespondidas) * 100).toFixed(2) : 0,
            aproveitamento: aproveitamento.toFixed(2),
          },
        };
      })
    );

    // Calcular estatísticas gerais
    const totalAtividades = atividadesComStats.length;
    const atividadesCompletas = atividadesComStats.filter(a => parseFloat(a.stats.progresso) === 100).length;
    const atividadesAtivas = atividadesComStats.filter(a => a.status === 'ativo').length;
    const mediaAproveitamento = totalAtividades > 0 ? 
      (atividadesComStats.reduce((sum, a) => sum + parseFloat(a.stats.aproveitamento), 0) / totalAtividades).toFixed(2) : 0;

    const atividades = {
      disciplina,
      resumo: {
        total_atividades: totalAtividades,
        atividades_completas: atividadesCompletas,
        atividades_ativas: atividadesAtivas,
        atividades_finalizadas: totalAtividades - atividadesAtivas,
        media_aproveitamento: mediaAproveitamento,
      },
      atividades: atividadesComStats,
    };

    res.json(successResponse(atividades, 'Atividades da disciplina obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter atividades da disciplina:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  getStudentFrequencia,
  getStudentPendencias,
  getStudentAtividades,
};

