const { successResponse, errorResponse, hashPassword, birthDateToPassword } = require('../utils/helpers');
const { User, Student, Parent, Turma } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar todos os alunos
 */
const listStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, turma_id, disability_type, is_active } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    const userWhere = {};
    
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
      where[Op.or] = [
        { ra: { [Op.like]: `%${search}%` } },
      ];
    }

    if (turma_id) {
      where.turma_id = turma_id;
    }

    if (disability_type) {
      where.disability_type = disability_type;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
      userWhere.is_active = is_active === 'true';
    }

    const { count, rows: students } = await Student.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhere,
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
        {
          model: Parent,
          as: 'parents',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email', 'phone'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Formatar resposta
    const formattedStudents = students.map(student => {
      const primaryParent = student.parents.find(parent => parent.is_primary) || student.parents[0];
      
      return {
        id: student.id,
        user_id: student.user.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        birth_date: student.user.birth_date,
        ra: student.ra,
        turma: student.turma,
        disability_type: student.disability_type,
        enrollment_date: student.enrollment_date,
        is_active: student.is_active,
        primary_parent: primaryParent ? {
          name: primaryParent.user.name,
          email: primaryParent.user.email,
          phone: primaryParent.user.phone,
          relationship: primaryParent.relationship,
        } : null,
        created_at: student.created_at,
        updated_at: student.updated_at,
      };
    });

    res.json(successResponse({
      students: formattedStudents,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Alunos listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um aluno específico
 */
const getStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Parent,
          as: 'parents',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
            },
          ],
        },
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    res.json(successResponse(student, 'Aluno obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Cadastrar novo aluno com responsável
 */
const createStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      ra, 
      turma_id, 
      birth_date, 
      disability_type,
      parent_name,
      parent_email,
      parent_phone,
      parent_relationship,
      parent_birth_date 
    } = req.body;

    // Validar que pelo menos email ou RA foi fornecido
    if (!email && !ra) {
      return res.status(400).json(errorResponse('Email ou RA deve ser fornecido'));
    }

    // Verificar se email já existe (se fornecido)
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json(errorResponse('Email já está em uso'));
      }
    }

    // Verificar se RA já existe (se fornecido)
    if (ra) {
      const existingStudent = await Student.findOne({ where: { ra } });
      if (existingStudent) {
        return res.status(400).json(errorResponse('RA já está em uso'));
      }
    }

    // Verificar se turma existe
    const turma = await Turma.findByPk(turma_id);
    if (!turma) {
      return res.status(400).json(errorResponse('Turma não encontrada'));
    }

    // Gerar senha baseada na data de nascimento
    const password = birthDateToPassword(birth_date);
    const hashedPassword = await hashPassword(password);

    // Criar usuário do aluno
    const studentUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      birth_date,
    });

    // Criar aluno
    const student = await Student.create({
      user_id: studentUser.id,
      turma_id,
      ra,
      disability_type: disability_type || 'none',
    });

    // Gerar senha para responsável baseada na data de nascimento
    const parentPassword = birthDateToPassword(parent_birth_date);
    const hashedParentPassword = await hashPassword(parentPassword);

    // Criar usuário do responsável
    const parentUser = await User.create({
      name: parent_name,
      email: parent_email,
      password: hashedParentPassword,
      role: 'parent',
      phone: parent_phone,
      birth_date: parent_birth_date,
    });

    // Criar responsável
    const parent = await Parent.create({
      user_id: parentUser.id,
      student_id: student.id,
      relationship: parent_relationship,
      is_primary: true,
    });

    // Buscar aluno criado com todos os dados
    const createdStudent = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Parent,
          as: 'parents',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
            },
          ],
        },
      ],
    });

    res.status(201).json(successResponse(createdStudent, 'Aluno e responsável cadastrados com sucesso'));

  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar aluno
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      ra, 
      turma_id, 
      birth_date, 
      disability_type,
      is_active,
      parent_name,
      parent_email,
      parent_phone,
      parent_relationship,
      parent_birth_date 
    } = req.body;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Parent,
          as: 'parents',
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== student.user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: student.user.id },
        },
      });
      if (existingUser) {
        return res.status(400).json(errorResponse('Email já está em uso'));
      }
    }

    // Verificar se RA já existe (se foi alterado)
    if (ra && ra !== student.ra) {
      const existingStudent = await Student.findOne({ 
        where: { 
          ra,
          id: { [Op.ne]: id },
        },
      });
      if (existingStudent) {
        return res.status(400).json(errorResponse('RA já está em uso'));
      }
    }

    // Atualizar dados do usuário do aluno
    await student.user.update({
      name: name || student.user.name,
      email: email !== undefined ? email : student.user.email,
      birth_date: birth_date || student.user.birth_date,
      is_active: is_active !== undefined ? is_active : student.user.is_active,
    });

    // Atualizar dados do aluno
    await student.update({
      ra: ra !== undefined ? ra : student.ra,
      turma_id: turma_id || student.turma_id,
      disability_type: disability_type || student.disability_type,
      is_active: is_active !== undefined ? is_active : student.is_active,
    });

    // Atualizar dados do responsável principal (se fornecidos)
    const primaryParent = student.parents.find(parent => parent.is_primary);
    if (primaryParent && (parent_name || parent_email || parent_phone || parent_relationship || parent_birth_date)) {
      await primaryParent.user.update({
        name: parent_name || primaryParent.user.name,
        email: parent_email !== undefined ? parent_email : primaryParent.user.email,
        phone: parent_phone !== undefined ? parent_phone : primaryParent.user.phone,
        birth_date: parent_birth_date || primaryParent.user.birth_date,
      });

      await primaryParent.update({
        relationship: parent_relationship || primaryParent.relationship,
      });
    }

    // Buscar aluno atualizado
    const updatedStudent = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
        },
        {
          model: Turma,
          as: 'turma',
        },
        {
          model: Parent,
          as: 'parents',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'birth_date'],
            },
          ],
        },
      ],
    });

    res.json(successResponse(updatedStudent, 'Aluno atualizado com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar aluno
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Deletar aluno (cascade deletará usuário e responsáveis)
    await student.destroy();

    res.json(successResponse(null, 'Aluno deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};

