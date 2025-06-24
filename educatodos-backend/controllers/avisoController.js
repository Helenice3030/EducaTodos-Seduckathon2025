const { successResponse, errorResponse } = require('../utils/helpers');
const { Aviso, Turma, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar avisos
 */
const listAvisos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, turma_id, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (turma_id) {
      where.turma_id = turma_id;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const { count, rows: avisos } = await Aviso.findAndCountAll({
      where,
      include: [
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['name'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json(successResponse({
      avisos,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Avisos listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar avisos:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um aviso específico
 */
const getAviso = async (req, res) => {
  try {
    const { id } = req.params;

    const aviso = await Aviso.findByPk(id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!aviso) {
      return res.status(404).json(errorResponse('Aviso não encontrado'));
    }

    res.json(successResponse(aviso, 'Aviso obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter aviso:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar novo aviso
 */
const createAviso = async (req, res) => {
  try {
    const { title, description, turma_id } = req.body;
    const created_by = req.user.id;

    // Verificar se turma existe
    const turma = await Turma.findByPk(turma_id);
    if (!turma) {
      return res.status(400).json(errorResponse('Turma não encontrada'));
    }

    const aviso = await Aviso.create({
      title,
      description,
      turma_id,
      created_by,
    });

    // Buscar aviso criado com dados relacionados
    const createdAviso = await Aviso.findByPk(aviso.id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(201).json(successResponse(createdAviso, 'Aviso criado com sucesso'));

  } catch (error) {
    console.error('Erro ao criar aviso:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar aviso
 */
const updateAviso = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, turma_id, is_active } = req.body;

    const aviso = await Aviso.findByPk(id);

    if (!aviso) {
      return res.status(404).json(errorResponse('Aviso não encontrado'));
    }

    // Verificar se turma existe (se foi alterada)
    if (turma_id && turma_id !== aviso.turma_id) {
      const turma = await Turma.findByPk(turma_id);
      if (!turma) {
        return res.status(400).json(errorResponse('Turma não encontrada'));
      }
    }

    await aviso.update({
      title: title || aviso.title,
      description: description || aviso.description,
      turma_id: turma_id || aviso.turma_id,
      is_active: is_active !== undefined ? is_active : aviso.is_active,
    });

    // Buscar aviso atualizado
    const updatedAviso = await Aviso.findByPk(id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json(successResponse(updatedAviso, 'Aviso atualizado com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar aviso:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar aviso
 */
const deleteAviso = async (req, res) => {
  try {
    const { id } = req.params;

    const aviso = await Aviso.findByPk(id);

    if (!aviso) {
      return res.status(404).json(errorResponse('Aviso não encontrado'));
    }

    await aviso.destroy();

    res.json(successResponse(null, 'Aviso deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar aviso:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listAvisos,
  getAviso,
  createAviso,
  updateAviso,
  deleteAviso,
};

