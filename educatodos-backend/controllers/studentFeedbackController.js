const { successResponse, errorResponse } = require('../utils/helpers');
const { Student, Feedback, User } = require('../models');

/**
 * Criar novo feedback ou denúncia
 */
const createFeedback = async (req, res) => {
  try {
    const { type, description, is_anonymous } = req.body;
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
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

    // Validar tipo
    if (!['feedback', 'denuncia'].includes(type)) {
      return res.status(400).json(errorResponse('Tipo deve ser "feedback" ou "denuncia"'));
    }

    // Criar feedback
    const feedbackData = {
      type,
      description,
      is_anonymous: is_anonymous || false,
    };

    // Se não é anônimo, associar ao aluno
    if (!is_anonymous) {
      feedbackData.student_id = student.id;
      feedbackData.student_name = student.user.name;
    } else {
      // Se é anônimo, usar nome genérico
      feedbackData.student_name = 'Anônimo';
    }

    const feedback = await Feedback.create(feedbackData);

    // Formatar resposta (sem expor dados sensíveis)
    const feedbackFormatado = {
      id: feedback.id,
      type: feedback.type,
      description: feedback.description,
      is_anonymous: feedback.is_anonymous,
      created_at: feedback.created_at,
    };

    res.status(201).json(successResponse(feedbackFormatado, 
      type === 'feedback' ? 'Feedback enviado com sucesso' : 'Denúncia enviada com sucesso'
    ));

  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Listar feedbacks do aluno (apenas os não anônimos)
 */
const listMyFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Construir filtros
    const where = { 
      student_id: student.id,
      is_anonymous: false, // Apenas feedbacks não anônimos
    };
    
    if (type) {
      where.type = type;
    }

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where,
      attributes: ['id', 'type', 'description', 'is_viewed', 'viewed_at', 'created_at'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json(successResponse({
      feedbacks,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Feedbacks listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar feedbacks do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um feedback específico do aluno
 */
const getMyFeedback = async (req, res) => {
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

    const feedback = await Feedback.findOne({
      where: { 
        id,
        student_id: student.id,
        is_anonymous: false, // Apenas feedbacks não anônimos
      },
      attributes: ['id', 'type', 'description', 'is_viewed', 'viewed_at', 'created_at'],
    });

    if (!feedback) {
      return res.status(404).json(errorResponse('Feedback não encontrado'));
    }

    res.json(successResponse(feedback, 'Feedback obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter feedback do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar um feedback do aluno (apenas se não foi visualizado)
 */
const deleteMyFeedback = async (req, res) => {
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

    const feedback = await Feedback.findOne({
      where: { 
        id,
        student_id: student.id,
        is_anonymous: false, // Apenas feedbacks não anônimos
      },
    });

    if (!feedback) {
      return res.status(404).json(errorResponse('Feedback não encontrado'));
    }

    // Verificar se o feedback já foi visualizado
    if (feedback.is_viewed) {
      return res.status(400).json(errorResponse('Não é possível deletar um feedback que já foi visualizado pela gestão'));
    }

    await feedback.destroy();

    res.json(successResponse(null, 'Feedback deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar feedback do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter estatísticas dos feedbacks do aluno
 */
const getMyFeedbackStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const totalFeedbacks = await Feedback.count({
      where: { student_id: student.id },
    });

    const feedbacksPositivos = await Feedback.count({
      where: { 
        student_id: student.id,
        type: 'feedback',
      },
    });

    const denuncias = await Feedback.count({
      where: { 
        student_id: student.id,
        type: 'denuncia',
      },
    });

    const feedbacksVistos = await Feedback.count({
      where: { 
        student_id: student.id,
        is_viewed: true,
      },
    });

    const feedbacksAnonimos = await Feedback.count({
      where: { 
        student_id: student.id,
        is_anonymous: true,
      },
    });

    const stats = {
      total_feedbacks: totalFeedbacks,
      feedbacks_positivos: feedbacksPositivos,
      denuncias: denuncias,
      feedbacks_vistos: feedbacksVistos,
      feedbacks_anonimos: feedbacksAnonimos,
      feedbacks_nao_vistos: totalFeedbacks - feedbacksVistos,
    };

    res.json(successResponse(stats, 'Estatísticas de feedbacks obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter estatísticas de feedbacks do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  createFeedback,
  listMyFeedbacks,
  getMyFeedback,
  deleteMyFeedback,
  getMyFeedbackStats,
};

