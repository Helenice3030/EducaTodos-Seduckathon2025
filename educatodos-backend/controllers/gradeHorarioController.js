const { successResponse, errorResponse } = require('../utils/helpers');
const { GradeHorario, Turma } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar grade de horários
 */
const listGradeHorarios = async (req, res) => {
  try {
    const { page = 1, limit = 50, turma_id, day_of_week, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (turma_id) {
      where.turma_id = turma_id;
    }

    if (day_of_week) {
      where.day_of_week = day_of_week;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const { count, rows: gradeHorarios } = await GradeHorario.findAndCountAll({
      where,
      include: [
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['turma_id', 'ASC'],
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC'],
      ],
    });

    res.json(successResponse({
      grade_horarios: gradeHorarios,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Grade de horários listada com sucesso'));

  } catch (error) {
    console.error('Erro ao listar grade de horários:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter grade completa de uma turma
 */
const getGradeByTurma = async (req, res) => {
  try {
    const { turma_id } = req.params;

    // Verificar se turma existe
    const turma = await Turma.findByPk(turma_id);
    if (!turma) {
      return res.status(404).json(errorResponse('Turma não encontrada'));
    }

    const gradeHorarios = await GradeHorario.findAll({
      where: { 
        turma_id,
        is_active: true,
      },
      include: [
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
      ],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC'],
      ],
    });

    // Organizar por dia da semana
    const gradeOrganizada = {
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
      domingo: [],
    };

    gradeHorarios.forEach(horario => {
      gradeOrganizada[horario.day_of_week].push(horario);
    });

    res.json(successResponse({
      turma,
      grade_horarios: gradeOrganizada,
    }, 'Grade de horários da turma obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter grade de horários da turma:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar novo horário na grade
 */
const createGradeHorario = async (req, res) => {
  try {
    const { turma_id, disciplina_name, day_of_week, start_time, end_time } = req.body;

    // Verificar se turma existe
    const turma = await Turma.findByPk(turma_id);
    if (!turma) {
      return res.status(400).json(errorResponse('Turma não encontrada'));
    }

    // Verificar se já existe horário no mesmo dia e horário para a turma
    const existingHorario = await GradeHorario.findOne({
      where: { 
        turma_id, 
        day_of_week, 
        start_time,
      },
    });

    if (existingHorario) {
      return res.status(400).json(errorResponse('Já existe um horário cadastrado para este dia e horário nesta turma'));
    }

    const gradeHorario = await GradeHorario.create({
      turma_id,
      disciplina_name,
      day_of_week,
      start_time,
      end_time,
    });

    // Buscar horário criado com dados relacionados
    const createdGradeHorario = await GradeHorario.findByPk(gradeHorario.id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
      ],
    });

    res.status(201).json(successResponse(createdGradeHorario, 'Horário criado com sucesso'));

  } catch (error) {
    console.error('Erro ao criar horário:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar horário na grade
 */
const updateGradeHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { turma_id, disciplina_name, day_of_week, start_time, end_time, is_active } = req.body;

    const gradeHorario = await GradeHorario.findByPk(id);

    if (!gradeHorario) {
      return res.status(404).json(errorResponse('Horário não encontrado'));
    }

    // Verificar se turma existe (se foi alterada)
    if (turma_id && turma_id !== gradeHorario.turma_id) {
      const turma = await Turma.findByPk(turma_id);
      if (!turma) {
        return res.status(400).json(errorResponse('Turma não encontrada'));
      }
    }

    // Verificar conflito de horário (se dia ou horário foram alterados)
    if ((day_of_week && day_of_week !== gradeHorario.day_of_week) || 
        (start_time && start_time !== gradeHorario.start_time) ||
        (turma_id && turma_id !== gradeHorario.turma_id)) {
      
      const existingHorario = await GradeHorario.findOne({
        where: { 
          turma_id: turma_id || gradeHorario.turma_id,
          day_of_week: day_of_week || gradeHorario.day_of_week,
          start_time: start_time || gradeHorario.start_time,
          id: { [Op.ne]: id },
        },
      });

      if (existingHorario) {
        return res.status(400).json(errorResponse('Já existe outro horário cadastrado para este dia e horário nesta turma'));
      }
    }

    await gradeHorario.update({
      turma_id: turma_id || gradeHorario.turma_id,
      disciplina_name: disciplina_name || gradeHorario.disciplina_name,
      day_of_week: day_of_week || gradeHorario.day_of_week,
      start_time: start_time || gradeHorario.start_time,
      end_time: end_time || gradeHorario.end_time,
      is_active: is_active !== undefined ? is_active : gradeHorario.is_active,
    });

    // Buscar horário atualizado
    const updatedGradeHorario = await GradeHorario.findByPk(id, {
      include: [
        {
          model: Turma,
          as: 'turma',
        },
      ],
    });

    res.json(successResponse(updatedGradeHorario, 'Horário atualizado com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar horário da grade
 */
const deleteGradeHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const gradeHorario = await GradeHorario.findByPk(id);

    if (!gradeHorario) {
      return res.status(404).json(errorResponse('Horário não encontrado'));
    }

    await gradeHorario.destroy();

    res.json(successResponse(null, 'Horário deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar horário:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listGradeHorarios,
  getGradeByTurma,
  createGradeHorario,
  updateGradeHorario,
  deleteGradeHorario,
};

