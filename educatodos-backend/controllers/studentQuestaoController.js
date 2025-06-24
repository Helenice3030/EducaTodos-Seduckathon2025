const { successResponse, errorResponse } = require('../utils/helpers');
const { Student, Disciplina, Conteudo, Questao, Resposta } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar questões de um conteúdo para o aluno
 */
const listQuestoes = async (req, res) => {
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

    // Verificar se o conteúdo ainda está ativo
    if (new Date(conteudo.end_date) < new Date()) {
      return res.status(400).json(errorResponse('Este conteúdo já foi finalizado'));
    }

    const questoes = await Questao.findAll({
      where: { 
        conteudo_id,
        is_active: true,
      },
      attributes: ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'points', 'order_index'],
      order: [['order_index', 'ASC']],
    });

    // Buscar respostas já dadas pelo aluno
    const respostasAluno = await Resposta.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Questao,
          as: 'questao',
          where: { conteudo_id },
          attributes: [],
        },
      ],
    });

    // Mapear respostas por questão
    const respostasMap = {};
    respostasAluno.forEach(resposta => {
      respostasMap[resposta.questao_id] = {
        selected_answer: resposta.selected_answer,
        is_correct: resposta.is_correct,
        points_earned: resposta.points_earned,
        answered_at: resposta.answered_at,
      };
    });

    // Formatar questões com status de resposta
    const questoesFormatadas = questoes.map(questao => ({
      id: questao.id,
      question_text: questao.question_text,
      option_a: questao.option_a,
      option_b: questao.option_b,
      option_c: questao.option_c,
      option_d: questao.option_d,
      option_e: questao.option_e,
      points: questao.points,
      order_index: questao.order_index,
      answered: !!respostasMap[questao.id],
      student_answer: respostasMap[questao.id] || null,
    }));

    res.json(successResponse({
      conteudo: {
        id: conteudo.id,
        title: conteudo.title,
        end_date: conteudo.end_date,
      },
      questoes: questoesFormatadas,
      total_questoes: questoesFormatadas.length,
      questoes_respondidas: Object.keys(respostasMap).length,
    }, 'Questões listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar questões para aluno:', error);
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

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const questao = await Questao.findOne({
      where: { 
        id,
        is_active: true,
      },
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
            },
          ],
        },
      ],
      attributes: ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'points', 'order_index'],
    });

    if (!questao) {
      return res.status(404).json(errorResponse('Questão não encontrada ou você não tem acesso a ela'));
    }

    // Verificar se o conteúdo ainda está ativo
    if (new Date(questao.conteudo.end_date) < new Date()) {
      return res.status(400).json(errorResponse('Este conteúdo já foi finalizado'));
    }

    // Buscar resposta do aluno se existir
    const respostaAluno = await Resposta.findOne({
      where: { 
        questao_id: id,
        student_id: student.id,
      },
    });

    const questaoFormatada = {
      id: questao.id,
      question_text: questao.question_text,
      option_a: questao.option_a,
      option_b: questao.option_b,
      option_c: questao.option_c,
      option_d: questao.option_d,
      option_e: questao.option_e,
      points: questao.points,
      order_index: questao.order_index,
      conteudo: {
        id: questao.conteudo.id,
        title: questao.conteudo.title,
        end_date: questao.conteudo.end_date,
      },
      answered: !!respostaAluno,
      student_answer: respostaAluno ? {
        selected_answer: respostaAluno.selected_answer,
        is_correct: respostaAluno.is_correct,
        points_earned: respostaAluno.points_earned,
        answered_at: respostaAluno.answered_at,
      } : null,
    };

    res.json(successResponse(questaoFormatada, 'Questão obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter questão para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Responder uma questão
 */
const answerQuestao = async (req, res) => {
  try {
    const { questao_id } = req.params;
    const { selected_answer } = req.body;
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const questao = await Questao.findOne({
      where: { 
        id: questao_id,
        is_active: true,
      },
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
            },
          ],
        },
      ],
    });

    if (!questao) {
      return res.status(404).json(errorResponse('Questão não encontrada ou você não tem acesso a ela'));
    }

    // Verificar se o conteúdo ainda está ativo
    if (new Date(questao.conteudo.end_date) < new Date()) {
      return res.status(400).json(errorResponse('Este conteúdo já foi finalizado'));
    }

    // Verificar se o aluno já respondeu esta questão
    const respostaExistente = await Resposta.findOne({
      where: { 
        questao_id,
        student_id: student.id,
      },
    });

    if (respostaExistente) {
      return res.status(400).json(errorResponse('Você já respondeu esta questão'));
    }

    // Validar resposta selecionada
    const opcoesValidas = ['A', 'B', 'C', 'D', 'E'];
    if (!opcoesValidas.includes(selected_answer)) {
      return res.status(400).json(errorResponse('Resposta selecionada inválida'));
    }

    // Verificar se a opção selecionada existe na questão
    const opcaoExiste = questao[`option_${selected_answer.toLowerCase()}`];
    if (!opcaoExiste) {
      return res.status(400).json(errorResponse('Opção selecionada não existe nesta questão'));
    }

    // Verificar se a resposta está correta
    const isCorrect = selected_answer === questao.correct_answer;
    const pointsEarned = isCorrect ? questao.points : 0;

    // Criar resposta
    const resposta = await Resposta.create({
      questao_id,
      student_id: student.id,
      selected_answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      answered_at: new Date(),
    });

    res.status(201).json(successResponse({
      id: resposta.id,
      questao_id,
      selected_answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      correct_answer: questao.correct_answer,
      answered_at: resposta.answered_at,
    }, 'Resposta registrada com sucesso'));

  } catch (error) {
    console.error('Erro ao responder questão:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Listar respostas do aluno para um conteúdo
 */
const listMyRespostas = async (req, res) => {
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

    const respostas = await Resposta.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Questao,
          as: 'questao',
          where: { conteudo_id },
          attributes: ['id', 'question_text', 'correct_answer', 'points', 'order_index'],
        },
      ],
      order: [['questao', 'order_index', 'ASC']],
    });

    // Calcular estatísticas
    const totalRespostas = respostas.length;
    const respostasCorretas = respostas.filter(r => r.is_correct).length;
    const totalPontos = respostas.reduce((sum, r) => sum + parseFloat(r.points_earned), 0);
    const pontosMaximos = respostas.reduce((sum, r) => sum + parseFloat(r.questao.points), 0);

    const respostasFormatadas = respostas.map(resposta => ({
      id: resposta.id,
      questao: {
        id: resposta.questao.id,
        question_text: resposta.questao.question_text,
        order_index: resposta.questao.order_index,
        points: resposta.questao.points,
      },
      selected_answer: resposta.selected_answer,
      correct_answer: resposta.questao.correct_answer,
      is_correct: resposta.is_correct,
      points_earned: resposta.points_earned,
      answered_at: resposta.answered_at,
    }));

    res.json(successResponse({
      conteudo: {
        id: conteudo.id,
        title: conteudo.title,
      },
      respostas: respostasFormatadas,
      stats: {
        total_respostas: totalRespostas,
        respostas_corretas: respostasCorretas,
        taxa_acerto: totalRespostas > 0 ? ((respostasCorretas / totalRespostas) * 100).toFixed(2) : 0,
        pontos_obtidos: totalPontos,
        pontos_maximos: pontosMaximos,
        percentual_pontos: pontosMaximos > 0 ? ((totalPontos / pontosMaximos) * 100).toFixed(2) : 0,
      },
    }, 'Respostas listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar respostas do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter resultado geral do aluno em uma disciplina
 */
const getResultadoDisciplina = async (req, res) => {
  try {
    const { disciplina_id } = req.params;
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

    // Buscar todas as respostas do aluno nesta disciplina
    const respostas = await Resposta.findAll({
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
                disciplina_id,
                is_active: true,
              },
              attributes: ['id', 'title'],
            },
          ],
          attributes: ['id', 'points'],
        },
      ],
    });

    // Agrupar por conteúdo
    const resultadosPorConteudo = {};
    respostas.forEach(resposta => {
      const conteudoId = resposta.questao.conteudo.id;
      const conteudoTitle = resposta.questao.conteudo.title;
      
      if (!resultadosPorConteudo[conteudoId]) {
        resultadosPorConteudo[conteudoId] = {
          conteudo_id: conteudoId,
          conteudo_title: conteudoTitle,
          total_respostas: 0,
          respostas_corretas: 0,
          pontos_obtidos: 0,
          pontos_maximos: 0,
        };
      }
      
      resultadosPorConteudo[conteudoId].total_respostas++;
      resultadosPorConteudo[conteudoId].pontos_maximos += parseFloat(resposta.questao.points);
      
      if (resposta.is_correct) {
        resultadosPorConteudo[conteudoId].respostas_corretas++;
      }
      
      resultadosPorConteudo[conteudoId].pontos_obtidos += parseFloat(resposta.points_earned);
    });

    // Calcular estatísticas gerais
    const totalRespostas = respostas.length;
    const respostasCorretas = respostas.filter(r => r.is_correct).length;
    const totalPontos = respostas.reduce((sum, r) => sum + parseFloat(r.points_earned), 0);
    const pontosMaximos = respostas.reduce((sum, r) => sum + parseFloat(r.questao.points), 0);

    // Formatar resultados por conteúdo
    const conteudosFormatados = Object.values(resultadosPorConteudo).map(resultado => ({
      ...resultado,
      taxa_acerto: resultado.total_respostas > 0 ? ((resultado.respostas_corretas / resultado.total_respostas) * 100).toFixed(2) : 0,
      percentual_pontos: resultado.pontos_maximos > 0 ? ((resultado.pontos_obtidos / resultado.pontos_maximos) * 100).toFixed(2) : 0,
    }));

    res.json(successResponse({
      disciplina: {
        id: disciplina.id,
        name: disciplina.name,
      },
      resultado_geral: {
        total_respostas: totalRespostas,
        respostas_corretas: respostasCorretas,
        taxa_acerto: totalRespostas > 0 ? ((respostasCorretas / totalRespostas) * 100).toFixed(2) : 0,
        pontos_obtidos: totalPontos,
        pontos_maximos: pontosMaximos,
        percentual_pontos: pontosMaximos > 0 ? ((totalPontos / pontosMaximos) * 100).toFixed(2) : 0,
      },
      resultados_por_conteudo: conteudosFormatados,
    }, 'Resultado da disciplina obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter resultado da disciplina:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listQuestoes,
  getQuestao,
  answerQuestao,
  listMyRespostas,
  getResultadoDisciplina,
};

