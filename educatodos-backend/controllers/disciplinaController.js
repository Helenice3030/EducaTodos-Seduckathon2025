const { successResponse, errorResponse } = require('../utils/helpers');
const { Disciplina, Turma, Teacher, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar todas as disciplinas
 */
const listDisciplinas = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, turma_id, teacher_id, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (turma_id) {
      where.turma_id = turma_id;
    }

    if (teacher_id) {
      where.teacher_id = teacher_id;
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
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Formatar resposta
    const formattedDisciplinas = disciplinas.map(disciplina => ({
      id: disciplina.id,
      name: disciplina.name,
      description: disciplina.description,
      is_active: disciplina.is_active,
      turma: disciplina.turma,
      teacher: {
        id: disciplina.teacher.id,
        name: disciplina.teacher.user.name,
        email: disciplina.teacher.user.email,
      },
      created_at: disciplina.created_at,
      updated_at: disciplina.updated_at,
    }));

    res.json(successResponse({
      disciplinas: formattedDisciplinas,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Disciplinas listadas com sucesso'));

  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter uma disciplina específica
 */
const getDisciplina = async (req, res) => {
  try {
    const { id } = req.params;

    const disciplina = await Disciplina.findByPk(id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada'));
    }

    res.json(successResponse(disciplina, 'Disciplina obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter disciplina:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar nova disciplina
 */
const createDisciplina = async (req, res) => {
  try {
    const { name, turma_id, teacher_id, description } = req.body;

    // Verificar se turma existe
    const turma = await Turma.findByPk(turma_id);
    if (!turma) {
      return res.status(400).json(errorResponse('Turma não encontrada'));
    }

    // Verificar se professor existe
    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(400).json(errorResponse('Professor não encontrado'));
    }

    // Verificar se já existe disciplina com mesmo nome na turma
    const existingDisciplina = await Disciplina.findOne({
      where: { name, turma_id },
    });

    if (existingDisciplina) {
      return res.status(400).json(errorResponse('Já existe uma disciplina com este nome nesta turma'));
    }

    const disciplina = await Disciplina.create({
      name,
      turma_id,
      teacher_id,
      description,
    });

    // Buscar disciplina criada com dados relacionados
    const createdDisciplina = await Disciplina.findByPk(disciplina.id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    res.status(201).json(successResponse(createdDisciplina, 'Disciplina criada com sucesso'));

  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar disciplina
 */
const updateDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, turma_id, teacher_id, description, is_active } = req.body;

    const disciplina = await Disciplina.findByPk(id);

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada'));
    }

    // Verificar se turma existe (se foi alterada)
    if (turma_id && turma_id !== disciplina.turma_id) {
      const turma = await Turma.findByPk(turma_id);
      if (!turma) {
        return res.status(400).json(errorResponse('Turma não encontrada'));
      }
    }

    // Verificar se professor existe (se foi alterado)
    if (teacher_id && teacher_id !== disciplina.teacher_id) {
      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(400).json(errorResponse('Professor não encontrado'));
      }
    }

    // Verificar se já existe outra disciplina com mesmo nome na turma
    if (name && turma_id) {
      const existingDisciplina = await Disciplina.findOne({
        where: { 
          name, 
          turma_id,
          id: { [Op.ne]: id },
        },
      });

      if (existingDisciplina) {
        return res.status(400).json(errorResponse('Já existe outra disciplina com este nome nesta turma'));
      }
    }

    await disciplina.update({
      name: name || disciplina.name,
      turma_id: turma_id || disciplina.turma_id,
      teacher_id: teacher_id || disciplina.teacher_id,
      description: description !== undefined ? description : disciplina.description,
      is_active: is_active !== undefined ? is_active : disciplina.is_active,
    });

    // Buscar disciplina atualizada
    const updatedDisciplina = await Disciplina.findByPk(id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    res.json(successResponse(updatedDisciplina, 'Disciplina atualizada com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar disciplina
 */
const deleteDisciplina = async (req, res) => {
  try {
    const { id } = req.params;

    const disciplina = await Disciplina.findByPk(id);

    if (!disciplina) {
      return res.status(404).json(errorResponse('Disciplina não encontrada'));
    }

    await disciplina.destroy();

    res.json(successResponse(null, 'Disciplina deletada com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar disciplina:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listDisciplinas,
  getDisciplina,
  createDisciplina,
  updateDisciplina,
  deleteDisciplina,
};

