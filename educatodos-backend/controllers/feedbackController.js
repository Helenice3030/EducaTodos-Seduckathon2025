const { successResponse, errorResponse } = require('../utils/helpers');
const { Feedback, Student, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar feedbacks e denúncias
 */
const listFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, is_viewed, is_anonymous, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { student_name: { [Op.like]: `%${search}%` } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (is_viewed !== undefined) {
      where.is_viewed = is_viewed === 'true';
    }

    if (is_anonymous !== undefined) {
      where.is_anonymous = is_anonymous === 'true';
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          required: false, // LEFT JOIN para incluir feedbacks anônimos
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
          ],
        },
        {
          model: User,
          as: 'viewer',
          attributes: ['name'],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Formatar resposta
    const formattedFeedbacks = feedbacks.map(feedback => ({
      id: feedback.id,
      type: feedback.type,
      description: feedback.description,
      student_name: feedback.is_anonymous ? 'Anônimo' : (feedback.student ? feedback.student.user.name : feedback.student_name),
      is_anonymous: feedback.is_anonymous,
      is_viewed: feedback.is_viewed,
      viewed_by: feedback.viewer ? feedback.viewer.name : null,
      viewed_at: feedback.viewed_at,
      is_active: feedback.is_active,
      created_at: feedback.created_at,
      updated_at: feedback.updated_at,
    }));

    res.json(successResponse({
      feedbacks: formattedFeedbacks,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Feedbacks e denúncias listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar feedbacks:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um feedback específico
 */
const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'viewer',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    });

    if (!feedback) {
      return res.status(404).json(errorResponse('Feedback não encontrado'));
    }

    res.json(successResponse(feedback, 'Feedback obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter feedback:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Marcar feedback como visto
 */
const markAsViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const viewed_by = req.user.id;

    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json(errorResponse('Feedback não encontrado'));
    }

    await feedback.update({
      is_viewed: true,
      viewed_by,
      viewed_at: new Date(),
    });

    // Buscar feedback atualizado
    const updatedFeedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'viewer',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    });

    res.json(successResponse(updatedFeedback, 'Feedback marcado como visto'));

  } catch (error) {
    console.error('Erro ao marcar feedback como visto:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar feedback
 */
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json(errorResponse('Feedback não encontrado'));
    }

    await feedback.destroy();

    res.json(successResponse(null, 'Feedback deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar feedback:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter estatísticas de feedbacks
 */
const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.count({ where: { is_active: true } });
    const totalDenuncias = await Feedback.count({ where: { type: 'denuncia', is_active: true } });
    const totalFeedbacksPositivos = await Feedback.count({ where: { type: 'feedback', is_active: true } });
    const totalNaoVistos = await Feedback.count({ where: { is_viewed: false, is_active: true } });
    const totalAnonimos = await Feedback.count({ where: { is_anonymous: true, is_active: true } });

    const stats = {
      total_feedbacks: totalFeedbacks,
      total_denuncias: totalDenuncias,
      total_feedbacks_positivos: totalFeedbacksPositivos,
      total_nao_vistos: totalNaoVistos,
      total_anonimos: totalAnonimos,
    };

    res.json(successResponse(stats, 'Estatísticas de feedbacks obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter estatísticas de feedbacks:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listFeedbacks,
  getFeedback,
  markAsViewed,
  deleteFeedback,
  getFeedbackStats,
};

