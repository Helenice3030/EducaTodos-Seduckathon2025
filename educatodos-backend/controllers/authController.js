const { comparePassword, generateToken, successResponse, errorResponse } = require('../utils/helpers');
const { User, Student, Teacher, Manager, Parent, Turma } = require('../models');
const { Op } = require('sequelize');

/**
 * Login de usuário
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Buscar usuário por email
    let user = null;
    if(role == 'student'){
      user = await User.findOne({
        where: {
          role,
          is_active: true,
          [Op.or]: [
            { email }, // verifica o email na própria tabela de usuários
            { '$student.ra$': email } // verifica o RA na tabela student
          ],
        },
        include: [
          {
            model: Student,
            as: 'student', // nome do alias na relação
            attributes: ['id', 'ra'], // você pode incluir mais se quiser
          },
        ],
      });
    }else{
      user = await User.findOne({
        where: { email, role, is_active: true },
      });
    }

    if (!user) {
      return res.status(401).json(errorResponse('Email ou senha inválidos'));
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(errorResponse('Email ou senha inválidos'));
    }

    // Atualizar último login
    await user.update({ last_login: new Date() });

    // Gerar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remover senha da resposta
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      birth_date: user.birth_date,
      phone: user.phone,
      last_login: user.last_login,
    };

    res.json(successResponse({
      user: userResponse,
      token,
    }, 'Login realizado com sucesso'));

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter dados do usuário autenticado
 */
const me = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Buscar dados específicos baseado no role
    let userData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      birth_date: req.user.birth_date,
      phone: req.user.phone,
      last_login: req.user.last_login,
    };

    switch (userRole) {
      case 'student':
        const student = await Student.findOne({
          where: { user_id: userId },
          include: [
            {
              model: Turma,
              as: 'turma',
              attributes: ['id', 'name', 'school_year', 'section'],
            },
          ],
        });
        if (student) {
          userData.student_info = {
            id: student.id,
            ra: student.ra,
            disability_type: student.disability_type,
            enrollment_date: student.enrollment_date,
            turma: student.turma,
          };
        }
        break;

      case 'teacher':
        const teacher = await Teacher.findOne({
          where: { user_id: userId },
        });
        if (teacher) {
          userData.teacher_info = {
            id: teacher.id,
            specialization: teacher.specialization,
            hire_date: teacher.hire_date,
          };
        }
        break;

      case 'manager':
        const manager = await Manager.findOne({
          where: { user_id: userId },
        });
        if (manager) {
          userData.manager_info = {
            id: manager.id,
            department: manager.department,
            hire_date: manager.hire_date,
          };
        }
        break;

      case 'parent':
        const parent = await Parent.findOne({
          where: { user_id: userId },
          include: [
            {
              model: Student,
              as: 'student',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['name'],
                },
                {
                  model: Turma,
                  as: 'turma',
                  attributes: ['id', 'name', 'school_year', 'section'],
                },
              ],
            },
          ],
        });
        if (parent) {
          userData.parent_info = {
            id: parent.id,
            relationship: parent.relationship,
            is_primary: parent.is_primary,
            student: {
              id: parent.student.id,
              name: parent.student.user.name,
              ra: parent.student.ra,
              turma: parent.student.turma,
            },
          };
        }
        break;
    }

    res.json(successResponse(userData, 'Dados do usuário obtidos com sucesso'));

  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  login,
  me,
};

