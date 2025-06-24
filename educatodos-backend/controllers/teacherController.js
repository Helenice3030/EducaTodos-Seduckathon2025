const { successResponse, errorResponse, hashPassword, birthDateToPassword } = require('../utils/helpers');
const { User, Teacher, Disciplina, Turma } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar todos os professores
 */
const listTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    const userWhere = {};
    
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
      userWhere.is_active = is_active === 'true';
    }

    const { count, rows: teachers } = await Teacher.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhere,
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
        {
          model: Disciplina,
          as: 'disciplinas',
          attributes: ['id', 'name'],
          include: [
            {
              model: Turma,
              as: 'turma',
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
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      user_id: teacher.user.id,
      name: teacher.user.name,
      email: teacher.user.email,
      phone: teacher.user.phone,
      birth_date: teacher.user.birth_date,
      specialization: teacher.specialization,
      hire_date: teacher.hire_date,
      is_active: teacher.is_active,
      disciplinas_count: teacher.disciplinas.length,
      created_at: teacher.created_at,
      updated_at: teacher.updated_at,
    }));

    res.json(successResponse({
      teachers: formattedTeachers,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Professores listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um professor específico
 */
const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
        {
          model: Disciplina,
          as: 'disciplinas',
          include: [
            {
              model: Turma,
              as: 'turma',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    res.json(successResponse(teacher, 'Professor obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter professor:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Cadastrar novo professor
 */
const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, birth_date, specialization, hire_date } = req.body;

    // Verificar se email já existe
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json(errorResponse('Email já está em uso'));
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      phone,
      birth_date,
    });

    // Criar professor
    const teacher = await Teacher.create({
      user_id: user.id,
      specialization,
      hire_date: hire_date || new Date(),
    });

    // Buscar professor criado com dados do usuário
    const createdTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
      ],
    });

    res.status(201).json(successResponse(createdTeacher, 'Professor cadastrado com sucesso'));

  } catch (error) {
    console.error('Erro ao cadastrar professor:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar professor
 */
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, birth_date, specialization, hire_date, is_active } = req.body;

    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== teacher.user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: teacher.user.id },
        },
      });
      if (existingUser) {
        return res.status(400).json(errorResponse('Email já está em uso'));
      }
    }

    // Atualizar dados do usuário
    await teacher.user.update({
      name: name || teacher.user.name,
      email: email !== undefined ? email : teacher.user.email,
      phone: phone !== undefined ? phone : teacher.user.phone,
      birth_date: birth_date || teacher.user.birth_date,
      is_active: is_active !== undefined ? is_active : teacher.user.is_active,
    });

    // Atualizar dados do professor
    await teacher.update({
      specialization: specialization !== undefined ? specialization : teacher.specialization,
      hire_date: hire_date || teacher.hire_date,
      is_active: is_active !== undefined ? is_active : teacher.is_active,
    });

    // Buscar professor atualizado
    const updatedTeacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
      ],
    });

    res.json(successResponse(updatedTeacher, 'Professor atualizado com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar professor
 */
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: Disciplina,
          as: 'disciplinas',
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    // Verificar se há disciplinas vinculadas
    if (teacher.disciplinas.length > 0) {
      return res.status(400).json(errorResponse('Não é possível deletar professor que possui disciplinas vinculadas'));
    }

    // Deletar professor (cascade deletará o usuário)
    await teacher.destroy();

    res.json(successResponse(null, 'Professor deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar professor:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};

