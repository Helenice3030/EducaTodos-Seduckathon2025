const { successResponse, errorResponse } = require('../utils/helpers');
const { Student, Turma, Aviso, GradeHorario, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar avisos da turma do aluno
 */
const listAvisos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
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
      turma_id: student.turma_id,
      is_active: true,
    };
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: avisos } = await Aviso.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name'],
        },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    // Formatar avisos
    const avisosFormatados = avisos.map(aviso => ({
      id: aviso.id,
      title: aviso.title,
      description: aviso.description,
      created_by: aviso.creator.name,
      turma: aviso.turma,
      created_at: aviso.created_at,
    }));

    res.json(successResponse({
      avisos: avisosFormatados,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    }, 'Avisos listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar avisos para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um aviso específico
 */
const getAviso = async (req, res) => {
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

    const aviso = await Aviso.findOne({
      where: { 
        id,
        turma_id: student.turma_id,
        is_active: true,
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name'],
        },
        {
          model: Turma,
          as: 'turma',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!aviso) {
      return res.status(404).json(errorResponse('Aviso não encontrado ou você não tem acesso a ele'));
    }

    const avisoFormatado = {
      id: aviso.id,
      title: aviso.title,
      description: aviso.description,
      created_by: aviso.creator.name,
      turma: aviso.turma,
      created_at: aviso.created_at,
    };

    res.json(successResponse(avisoFormatado, 'Aviso obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter aviso para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter grade de horários da turma do aluno
 */
const getGradeHorarios = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
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

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const gradeHorarios = await GradeHorario.findAll({
      where: { 
        turma_id: student.turma_id,
        is_active: true,
      },
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
      gradeOrganizada[horario.day_of_week].push({
        id: horario.id,
        disciplina_name: horario.disciplina_name,
        start_time: horario.start_time,
        end_time: horario.end_time,
      });
    });

    res.json(successResponse({
      turma: student.turma,
      grade_horarios: gradeOrganizada,
    }, 'Grade de horários obtida com sucesso'));

  } catch (error) {
    console.error('Erro ao obter grade de horários para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter horários do dia atual
 */
const getHorariosDia = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    // Determinar dia da semana atual
    const hoje = new Date();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaAtual = diasSemana[hoje.getDay()];

    const horariosHoje = await GradeHorario.findAll({
      where: { 
        turma_id: student.turma_id,
        day_of_week: diaAtual,
        is_active: true,
      },
      order: [['start_time', 'ASC']],
    });

    // Formatar horários com status (passado, atual, futuro)
    const agora = new Date();
    const horaAtual = agora.getHours() * 60 + agora.getMinutes(); // minutos desde meia-noite

    const horariosFormatados = horariosHoje.map(horario => {
      const [startHour, startMin] = horario.start_time.split(':').map(Number);
      const [endHour, endMin] = horario.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      let status = 'futuro';
      if (horaAtual >= endMinutes) {
        status = 'passado';
      } else if (horaAtual >= startMinutes && horaAtual < endMinutes) {
        status = 'atual';
      }

      return {
        id: horario.id,
        disciplina_name: horario.disciplina_name,
        start_time: horario.start_time,
        end_time: horario.end_time,
        status,
      };
    });

    res.json(successResponse({
      dia: diaAtual,
      data: hoje.toISOString().split('T')[0],
      horarios: horariosFormatados,
      total_aulas: horariosFormatados.length,
    }, 'Horários do dia obtidos com sucesso'));

  } catch (error) {
    console.error('Erro ao obter horários do dia para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter próxima aula
 */
const getProximaAula = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar o aluno pelo user_id
    const student = await Student.findOne({
      where: { user_id: userId },
    });

    if (!student) {
      return res.status(404).json(errorResponse('Aluno não encontrado'));
    }

    const agora = new Date();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaAtual = diasSemana[agora.getDay()];
    const horaAtual = agora.getHours() * 60 + agora.getMinutes();

    // Buscar próxima aula hoje
    const proximaAulaHoje = await GradeHorario.findOne({
      where: { 
        turma_id: student.turma_id,
        day_of_week: diaAtual,
        is_active: true,
      },
      order: [['start_time', 'ASC']],
    });

    let proximaAula = null;

    if (proximaAulaHoje) {
      const [startHour, startMin] = proximaAulaHoje.start_time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;

      if (startMinutes > horaAtual) {
        proximaAula = {
          disciplina_name: proximaAulaHoje.disciplina_name,
          start_time: proximaAulaHoje.start_time,
          end_time: proximaAulaHoje.end_time,
          dia: diaAtual,
          eh_hoje: true,
        };
      }
    }

    // Se não há próxima aula hoje, buscar próxima aula da semana
    if (!proximaAula) {
      const proximosHorarios = await GradeHorario.findAll({
        where: { 
          turma_id: student.turma_id,
          is_active: true,
        },
        order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
      });

      // Encontrar próximo dia com aula
      const diasOrdem = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
      const indexAtual = diasOrdem.indexOf(diaAtual);

      for (let i = 1; i < 7; i++) {
        const proximoDiaIndex = (indexAtual + i) % 7;
        const proximoDia = diasOrdem[proximoDiaIndex];
        
        const aulaProximoDia = proximosHorarios.find(h => h.day_of_week === proximoDia);
        if (aulaProximoDia) {
          proximaAula = {
            disciplina_name: aulaProximoDia.disciplina_name,
            start_time: aulaProximoDia.start_time,
            end_time: aulaProximoDia.end_time,
            dia: proximoDia,
            eh_hoje: false,
          };
          break;
        }
      }
    }

    res.json(successResponse({
      proxima_aula: proximaAula,
      agora: {
        dia: diaAtual,
        hora: `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`,
      },
    }, proximaAula ? 'Próxima aula encontrada' : 'Nenhuma próxima aula encontrada'));

  } catch (error) {
    console.error('Erro ao obter próxima aula para aluno:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listAvisos,
  getAviso,
  getGradeHorarios,
  getHorariosDia,
  getProximaAula,
};

