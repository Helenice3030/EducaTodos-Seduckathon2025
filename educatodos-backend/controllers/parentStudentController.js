const { successResponse, errorResponse } = require('../utils/helpers');
const { Parent, Student, User, Turma, Disciplina, Teacher } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar alunos do responsável
 */
const listMyStudents = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Buscar todos os alunos do responsável
    const students = await Student.findAll({
      where: { id: parent.student_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name', 'school_year', 'section'],
        },
      ],
    });

    // Formatar resposta
    const studentsFormatted = students.map(student => ({
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      ra: student.ra,
      birth_date: student.birth_date,
      disability_type: student.disability_type,
      turma: student.turma,
      is_active: student.is_active,
    }));

    res.json(successResponse(studentsFormatted, 'Alunos do responsável listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar alunos do responsável:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter informações detalhadas de um aluno
 */
const getStudentInfo = async (req, res) => {
  try {
    const { student_id } = req.params;
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Verificar se o responsável tem acesso ao aluno
    if (parent.student_id !== parseInt(student_id)) {
      return res.status(403).json(errorResponse('Você não tem permissão para acessar informações deste aluno'));
    }

    const student = await Student.findOne({
      where: { id: student_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Turma,
          as: 'turma',
          include: [
            {
              model: Disciplina,
              as: 'disciplinas',
              where: { is_active: true },
              required: false,
              include: [
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
            },
          ],
        },
      ],
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Formatar informações do aluno
    const studentInfo = {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      ra: student.ra,
      birth_date: student.birth_date,
      disability_type: student.disability_type,
      is_active: student.is_active,
      turma: {
        id: student.turma.id,
        name: student.turma.name,
        school_year: student.turma.school_year,
        section: student.turma.section,
        total_disciplinas: student.turma.disciplinas.length,
      },
      disciplinas: student.turma.disciplinas.map(disciplina => ({
        id: disciplina.id,
        name: disciplina.name,
        description: disciplina.description,
        teacher: {
          name: disciplina.teacher.user.name,
          email: disciplina.teacher.user.email,
        },
      })),
    };

    res.json(successResponse(studentInfo, 'Informações do aluno obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter informações do aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter informações do responsável
 */
const getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Formatar informações do responsável
    const parentInfo = {
      id: parent.id,
      name: parent.user.name,
      email: parent.user.email,
      phone: parent.phone,
      birth_date: parent.birth_date,
      relationship: parent.relationship,
      student: {
        id: parent.student.id,
        name: parent.student.user.name,
      },
      is_active: parent.is_active,
    };

    res.json(successResponse(parentInfo, 'Informações do responsável obtidas com sucesso'));

  } catch (error) {
    console.error('Erro ao obter informações do responsável:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar informações do responsável
 */
const updateMyInfo = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const userId = req.user.id;

    // Buscar o responsável pelo user_id
    const parent = await Parent.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!parent) {
      return res.status(404).json(errorResponse('Responsável não encontrado'));
    }

    // Atualizar informações do responsável
    if (phone !== undefined) {
      await parent.update({ phone });
    }

    // Atualizar email no User se fornecido
    if (email !== undefined) {
      await parent.user.update({ email });
    }

    // Buscar responsável atualizado
    const updatedParent = await Parent.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    const parentInfo = {
      id: updatedParent.id,
      name: updatedParent.user.name,
      email: updatedParent.user.email,
      phone: updatedParent.phone,
      birth_date: updatedParent.birth_date,
      relationship: updatedParent.relationship,
      student: {
        id: updatedParent.student.id,
        name: updatedParent.student.user.name,
      },
      is_active: updatedParent.is_active,
    };

    res.json(successResponse(parentInfo, 'Informações atualizadas com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar informações do responsável:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listMyStudents,
  getStudentInfo,
  getMyInfo,
  updateMyInfo,
};

