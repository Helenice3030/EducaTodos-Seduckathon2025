const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const authenticateToken = require('../middleware/auth');
const { authorizeManager } = require('../middleware/authorize');
const handleValidationErrors = require('../middleware/validation');

// Importar controladores
const turmaController = require('../controllers/turmaController');
const teacherController = require('../controllers/teacherController');
const studentController = require('../controllers/studentController');
const disciplinaController = require('../controllers/disciplinaController');
const avisoController = require('../controllers/avisoController');
const gradeHorarioController = require('../controllers/gradeHorarioController');
const feedbackController = require('../controllers/feedbackController');

// Todas as rotas de gestores requerem autenticação e autorização
router.use(authenticateToken);
router.use(authorizeManager);

// ===== ROTAS DE TURMAS =====

// Validações para turmas
const turmaValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  // body('school_year').notEmpty().withMessage('Ano escolar é obrigatório'),
  // body('section').notEmpty().withMessage('Seção é obrigatória'),
  // body('description').optional().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
];

const turmaUpdateValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  // body('school_year').optional().notEmpty().withMessage('Ano escolar não pode estar vazio'),
  // body('section').optional().notEmpty().withMessage('Seção não pode estar vazia'),
  // body('description').optional().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('is_active').optional().isBoolean().withMessage('is_active deve ser boolean'),
];

router.get('/turmas', turmaController.listTurmas);
router.get('/turmas/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, turmaController.getTurma);
router.post('/turmas', turmaValidation, handleValidationErrors, turmaController.createTurma);
router.put('/turmas/:id', param('id').isInt().withMessage('ID deve ser um número'), turmaUpdateValidation, handleValidationErrors, turmaController.updateTurma);
router.delete('/turmas/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, turmaController.deleteTurma);

// ===== ROTAS DE PROFESSORES =====

// Validações para professores
const teacherValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido').normalizeEmail(),
  body('password').notEmpty().withMessage('Senha é obrigatória').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  // body('phone').optional().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
  // body('birth_date').optional().isDate().withMessage('Data de nascimento deve ser uma data válida'),
  // body('specialization').optional().isLength({ max: 200 }).withMessage('Especialização deve ter no máximo 200 caracteres'),
  // body('hire_date').optional().isDate().withMessage('Data de contratação deve ser uma data válida'),
];

const teacherUpdateValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido').normalizeEmail(),
  // body('phone').optional().isLength({ max: 20 }).withMessage('Telefone deve ter no máximo 20 caracteres'),
  // body('birth_date').optional().isDate().withMessage('Data de nascimento deve ser uma data válida'),
  // body('specialization').optional().isLength({ max: 200 }).withMessage('Especialização deve ter no máximo 200 caracteres'),
  // body('hire_date').optional().isDate().withMessage('Data de contratação deve ser uma data válida'),
  // body('is_active').optional().isBoolean().withMessage('is_active deve ser boolean'),
];

router.get('/professores', teacherController.listTeachers);
router.get('/professores/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, teacherController.getTeacher);
router.post('/professores', teacherValidation, handleValidationErrors, teacherController.createTeacher);
router.put('/professores/:id', param('id').isInt().withMessage('ID deve ser um número'), teacherUpdateValidation, handleValidationErrors, teacherController.updateTeacher);
router.delete('/professores/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, teacherController.deleteTeacher);

// ===== ROTAS DE ALUNOS =====

// Validações para alunos
const studentValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido').normalizeEmail(),
  body('ra').optional().isLength({ max: 20 }).withMessage('RA deve ter no máximo 20 caracteres'),
  body('turma_id').isInt().withMessage('ID da turma deve ser um número'),
  body('birth_date').isDate().withMessage('Data de nascimento é obrigatória e deve ser uma data válida'),
  body('parent_name').notEmpty().withMessage('Nome do responsável é obrigatório'),
  body('parent_email').optional().isEmail().withMessage('Email do responsável deve ser válido').normalizeEmail(),
  body('parent_phone').optional().isLength({ max: 20 }).withMessage('Telefone do responsável deve ter no máximo 20 caracteres'),
  body('parent_relationship').isIn(['pai', 'mae', 'avo', 'ava', 'tio', 'tia', 'responsavel_legal', 'outro']).withMessage('Parentesco inválido'),
  body('parent_birth_date').isDate().withMessage('Data de nascimento do responsável é obrigatória'),
];

const studentUpdateValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido').normalizeEmail(),
  body('ra').optional().isLength({ max: 20 }).withMessage('RA deve ter no máximo 20 caracteres'),
  body('turma_id').optional().isInt().withMessage('ID da turma deve ser um número'),
  body('birth_date').optional().isDate().withMessage('Data de nascimento deve ser uma data válida'),
  body('is_active').optional().isBoolean().withMessage('is_active deve ser boolean'),
  body('parent_name').optional().notEmpty().withMessage('Nome do responsável não pode estar vazio'),
  body('parent_email').optional().isEmail().withMessage('Email do responsável deve ser válido').normalizeEmail(),
  body('parent_phone').optional().isLength({ max: 20 }).withMessage('Telefone do responsável deve ter no máximo 20 caracteres'),
  body('parent_relationship').optional().isIn(['pai', 'mae', 'avo', 'ava', 'tio', 'tia', 'responsavel_legal', 'outro']).withMessage('Parentesco inválido'),
  body('parent_birth_date').optional().isDate().withMessage('Data de nascimento do responsável deve ser uma data válida'),
];

router.get('/alunos', studentController.listStudents);
router.get('/alunos/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, studentController.getStudent);
router.post('/alunos', studentValidation, handleValidationErrors, studentController.createStudent);
router.put('/alunos/:id', param('id').isInt().withMessage('ID deve ser um número'), studentUpdateValidation, handleValidationErrors, studentController.updateStudent);
router.delete('/alunos/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, studentController.deleteStudent);

// ===== ROTAS DE DISCIPLINAS =====

// Validações para disciplinas
const disciplinaValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório').isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('turma_id').isInt().withMessage('ID da turma deve ser um número'),
  body('teacher_id').isInt().withMessage('ID do professor deve ser um número'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
];

const disciplinaUpdateValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('turma_id').optional().isInt().withMessage('ID da turma deve ser um número'),
  body('teacher_id').optional().isInt().withMessage('ID do professor deve ser um número'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('is_active').optional().isBoolean().withMessage('is_active deve ser boolean'),
];

router.get('/disciplinas', disciplinaController.listDisciplinas);
router.get('/disciplinas/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, disciplinaController.getDisciplina);
router.post('/disciplinas', disciplinaValidation, handleValidationErrors, disciplinaController.createDisciplina);
router.put('/disciplinas/:id', param('id').isInt().withMessage('ID deve ser um número'), disciplinaUpdateValidation, handleValidationErrors, disciplinaController.updateDisciplina);
router.delete('/disciplinas/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, disciplinaController.deleteDisciplina);

// ===== ROTAS DE AVISOS =====

// Validações para avisos
const avisoValidation = [
  body('title').notEmpty().withMessage('Título é obrigatório').isLength({ max: 200 }).withMessage('Título deve ter no máximo 200 caracteres'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('turma_id').isInt().withMessage('ID da turma deve ser um número'),
];

const avisoUpdateValidation = [
  body('title').optional().isLength({ max: 200 }).withMessage('Título deve ter no máximo 200 caracteres'),
  body('description').optional().notEmpty().withMessage('Descrição não pode estar vazia'),
  body('turma_id').optional().isInt().withMessage('ID da turma deve ser um número'),
  body('is_active').optional().isBoolean().withMessage('is_active deve ser boolean'),
];

router.get('/avisos', avisoController.listAvisos);
router.get('/avisos/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, avisoController.getAviso);
router.post('/avisos', avisoValidation, handleValidationErrors, avisoController.createAviso);
router.put('/avisos/:id', param('id').isInt().withMessage('ID deve ser um número'), avisoUpdateValidation, handleValidationErrors, avisoController.updateAviso);
router.delete('/avisos/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, avisoController.deleteAviso);

// ===== ROTAS DE GRADE DE HORÁRIOS =====

// Validações para grade de horários
const gradeHorarioValidation = [
  body('turma_id').isInt().withMessage('ID da turma deve ser um número'),
  body('disciplina_name').notEmpty().withMessage('Nome da disciplina é obrigatório').isLength({ max: 100 }).withMessage('Nome da disciplina deve ter no máximo 100 caracteres'),
  body('day_of_week').isIn(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']).withMessage('Dia da semana inválido'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início deve estar no formato HH:MM'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de fim deve estar no formato HH:MM'),
];

const gradeHorarioUpdateValidation = [
  body('turma_id').optional().isInt().withMessage('ID da turma deve ser um número'),
  body('disciplina_name').optional().isLength({ max: 100 }).withMessage('Nome da disciplina deve ter no máximo 100 caracteres'),
  body('day_of_week').optional().isIn(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']).withMessage('Dia da semana inválido'),
  body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início deve estar no formato HH:MM'),
  body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de fim deve estar no formato HH:MM'),
  body('is_active').optional().isBoolean().withMessage('is_active deve ser boolean'),
];

router.get('/grade-horarios', gradeHorarioController.listGradeHorarios);
router.get('/grade-horarios/turma/:turma_id', param('turma_id').isInt().withMessage('ID da turma deve ser um número'), handleValidationErrors, gradeHorarioController.getGradeByTurma);
router.post('/grade-horarios', gradeHorarioValidation, handleValidationErrors, gradeHorarioController.createGradeHorario);
router.put('/grade-horarios/:id', param('id').isInt().withMessage('ID deve ser um número'), gradeHorarioUpdateValidation, handleValidationErrors, gradeHorarioController.updateGradeHorario);
router.delete('/grade-horarios/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, gradeHorarioController.deleteGradeHorario);

// ===== ROTAS DE FEEDBACKS E DENÚNCIAS =====

router.get('/feedbacks', feedbackController.listFeedbacks);
router.get('/feedbacks/stats', feedbackController.getFeedbackStats);
router.get('/feedbacks/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, feedbackController.getFeedback);
router.put('/feedbacks/:id/marcar-visto', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, feedbackController.markAsViewed);
router.delete('/feedbacks/:id', param('id').isInt().withMessage('ID deve ser um número'), handleValidationErrors, feedbackController.deleteFeedback);

// Rota de teste
router.get('/', (req, res) => {
  res.json({
    message: 'Rotas de gestores - Implementadas com sucesso',
    user: req.user.name,
    available_routes: {
      turmas: 'GET, POST /turmas, GET, PUT, DELETE /turmas/:id',
      professores: 'GET, POST /professores, GET, PUT, DELETE /professores/:id',
      alunos: 'GET, POST /alunos, GET, PUT, DELETE /alunos/:id',
      disciplinas: 'GET, POST /disciplinas, GET, PUT, DELETE /disciplinas/:id',
      avisos: 'GET, POST /avisos, GET, PUT, DELETE /avisos/:id',
      grade_horarios: 'GET, POST /grade-horarios, GET /grade-horarios/turma/:turma_id, PUT, DELETE /grade-horarios/:id',
      feedbacks: 'GET /feedbacks, GET /feedbacks/stats, GET /feedbacks/:id, PUT /feedbacks/:id/marcar-visto, DELETE /feedbacks/:id',
    },
  });
});

module.exports = router;
