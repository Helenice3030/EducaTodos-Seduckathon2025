const { successResponse, errorResponse } = require('../utils/helpers');
const { Turma, Student, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar todas as turmas
 */
const listTurmas = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { school_year: { [Op.like]: `%${search}%` } },
        { section: { [Op.like]: `%${search}%` } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const { count, rows: turmas } = await Turma.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id'],
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
      order: [['created_at', 'DESC']],
    });

    // Formatar resposta
    const formattedTurmas = turmas.map(turma => ({
      id: turma.id,
      name: turma.name,
      school_year: turma.school_year,
      section: turma.section,
      description: turma.description,
      is_active: turma.is_active,
      students_count: turma.students.length,
      created_at: turma.created_at,
      updated_at: turma.updated_at,
    }));

    res.json(successResponse({
      turmas: formattedTurmas,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Turmas listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter uma turma específica
 */
const getTurma = async (req, res) => {
  try {
    const { id } = req.params;

    const turma = await Turma.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'students',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    if (!turma) {
      return res.status(404).json(errorResponse('Turma não encontrada'));
    }

    res.json(successResponse(turma, 'Turma obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter turma:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar nova turma
 */
const createTurma = async (req, res) => {
  try {
    const { name } = req.body;

    const turma = await Turma.create({
      name
    });

    res.status(201).json(successResponse(turma, 'Turma criada com sucesso'));

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar turma
 */
const updateTurma = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, school_year, section, description, is_active } = req.body;

    const turma = await Turma.findByPk(id);

    if (!turma) {
      return res.status(404).json(errorResponse('Turma não encontrada'));
    }

    // Verificar se já existe outra turma com mesmo ano e seção
    if (school_year && section) {
      const existingTurma = await Turma.findOne({
        where: { 
          school_year, 
          section,
          id: { [Op.ne]: id },
        },
      });

      if (existingTurma) {
        return res.status(400).json(errorResponse('Já existe outra turma com este ano escolar e seção'));
      }
    }

    await turma.update({
      name: name || turma.name,
      school_year: school_year || turma.school_year,
      section: section || turma.section,
      description: description !== undefined ? description : turma.description,
      is_active: is_active !== undefined ? is_active : turma.is_active,
    });

    res.json(successResponse(turma, 'Turma atualizada com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar turma
 */
const deleteTurma = async (req, res) => {
  try {
    const { id } = req.params;

    const turma = await Turma.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'students',
        },
      ],
    });

    if (!turma) {
      return res.status(404).json(errorResponse('Turma não encontrada'));
    }

    // Verificar se há alunos na turma
    if (turma.students.length > 0) {
      return res.status(400).json(errorResponse('Não é possível deletar turma que possui alunos matriculados'));
    }

    await turma.destroy();

    res.json(successResponse(null, 'Turma deletada com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar turma:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listTurmas,
  getTurma,
  createTurma,
  updateTurma,
  deleteTurma,
};

