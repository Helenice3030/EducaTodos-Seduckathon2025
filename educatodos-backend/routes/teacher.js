const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const authenticateToken = require('../middleware/auth');
const { authorizeTeacher } = require('../middleware/authorize');
const handleValidationErrors = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

// Importar controladores
const teacherDisciplinaController = require('../controllers/teacherDisciplinaController');
const conteudoController = require('../controllers/conteudoController');
const materialController = require('../controllers/materialController');
const questaoController = require('../controllers/questaoController');

// Todas as rotas de professores requerem autenticação e autorização
router.use(authenticateToken);
router.use(authorizeTeacher);

// ===== ROTAS DE DISCIPLINAS DO PROFESSOR =====

router.get("/disciplinas", teacherDisciplinaController.listMyDisciplinas);
router.get("/disciplinas/stats", teacherDisciplinaController.getMyDisciplinasStats);
router.get("/disciplinas/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, teacherDisciplinaController.getMyDisciplina);

// ===== ROTAS DE CONTEÚDOS =====

// Validações para conteúdos
const conteudoValidation = [
  body("disciplina_id").isInt().withMessage("ID da disciplina deve ser um número"),
  body("title").notEmpty().withMessage("Título é obrigatório").isLength({ max: 200 }).withMessage("Título deve ter no máximo 200 caracteres"),
  body("description").notEmpty().withMessage("Descrição é obrigatória"),
  body("start_date").isDate().withMessage("Data de início deve ser uma data válida"),
  body("end_date").isDate().withMessage("Data de fim deve ser uma data válida"),
  body("summary_text").optional().isLength({ max: 10000 }).withMessage("Resumo deve ter no máximo 10000 caracteres"),
];

const conteudoUpdateValidation = [
  body("title").optional().isLength({ max: 200 }).withMessage("Título deve ter no máximo 200 caracteres"),
  body("description").optional().notEmpty().withMessage("Descrição não pode estar vazia"),
  body("start_date").optional().isDate().withMessage("Data de início deve ser uma data válida"),
  body("end_date").optional().isDate().withMessage("Data de fim deve ser uma data válida"),
  body("summary_text").optional().isLength({ max: 10000 }).withMessage("Resumo deve ter no máximo 10000 caracteres"),
  body("is_active").optional().isBoolean().withMessage("is_active deve ser boolean"),
];

router.get("/disciplinas/:disciplina_id/conteudos", param("disciplina_id").isInt().withMessage("ID da disciplina deve ser um número"), handleValidationErrors, conteudoController.listConteudos);
router.get("/conteudos/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, conteudoController.getConteudo);
router.post("/conteudos", uploadSingle("summary_file"), conteudoValidation, handleValidationErrors, conteudoController.createConteudo);
router.put("/conteudos/:id", param("id").isInt().withMessage("ID deve ser um número"), uploadSingle("summary_file"), conteudoUpdateValidation, handleValidationErrors, conteudoController.updateConteudo);
router.delete("/conteudos/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, conteudoController.deleteConteudo);

// ===== ROTAS DE MATERIAIS =====

// Validações para materiais
const materialValidation = [
  body("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"),
  body("title").notEmpty().withMessage("Título é obrigatório").isLength({ max: 200 }).withMessage("Título deve ter no máximo 200 caracteres"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Descrição deve ter no máximo 1000 caracteres"),
  body("type").isIn(["link", "file", "youtube"]).withMessage("Tipo deve ser: link, file ou youtube"),
  body("content").optional().notEmpty().withMessage("Conteúdo não pode estar vazio"),
  body("disability_type").optional().isIn(["visual", "auditory", "motor", "intellectual", "all"]).withMessage("Tipo de deficiência inválido"),
];

const materialUpdateValidation = [
  body("title").optional().isLength({ max: 200 }).withMessage("Título deve ter no máximo 200 caracteres"),
  body("description").optional().isLength({ max: 1000 }).withMessage("Descrição deve ter no máximo 1000 caracteres"),
  body("type").optional().isIn(["link", "file", "youtube"]).withMessage("Tipo deve ser: link, file ou youtube"),
  body("content").optional().notEmpty().withMessage("Conteúdo não pode estar vazio"),
  body("disability_type").optional().isIn(["visual", "auditory", "motor", "intellectual", "all"]).withMessage("Tipo de deficiência inválido"),
  body("is_active").optional().isBoolean().withMessage("is_active deve ser boolean"),
];

router.get("/conteudos/:conteudo_id/materials", param("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"), handleValidationErrors, materialController.listMaterials);
router.get("/materials/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, materialController.getMaterial);
router.post("/materials", uploadSingle("file"), materialValidation, handleValidationErrors, materialController.createMaterial);
router.put("/materials/:id", param("id").isInt().withMessage("ID deve ser um número"), uploadSingle("file"), materialUpdateValidation, handleValidationErrors, materialController.updateMaterial);
router.delete("/materials/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, materialController.deleteMaterial);

// ===== ROTAS DE QUESTÕES =====

// Validações para questões
const questaoValidation = [
  body("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"),
  body("question_text").notEmpty().withMessage("Texto da questão é obrigatório"),
  body("option_a").notEmpty().withMessage("Opção A é obrigatória"),
  body("option_b").notEmpty().withMessage("Opção B é obrigatória"),
  body("option_c").optional().isLength({ max: 1000 }).withMessage("Opção C deve ter no máximo 1000 caracteres"),
  body("option_d").optional().isLength({ max: 1000 }).withMessage("Opção D deve ter no máximo 1000 caracteres"),
  body("option_e").optional().isLength({ max: 1000 }).withMessage("Opção E deve ter no máximo 1000 caracteres"),
  body("correct_answer").isIn(["A", "B", "C", "D", "E"]).withMessage("Resposta correta deve ser A, B, C, D ou E"),
  body("points").optional().isFloat({ min: 0 }).withMessage("Pontos deve ser um número positivo"),
  body("order_index").optional().isInt({ min: 1 }).withMessage("Índice de ordem deve ser um número positivo"),
];

const questaoUpdateValidation = [
  body("question_text").optional().notEmpty().withMessage("Texto da questão não pode estar vazio"),
  body("option_a").optional().notEmpty().withMessage("Opção A não pode estar vazia"),
  body("option_b").optional().notEmpty().withMessage("Opção B não pode estar vazia"),
  body("option_c").optional().isLength({ max: 1000 }).withMessage("Opção C deve ter no máximo 1000 caracteres"),
  body("option_d").optional().isLength({ max: 1000 }).withMessage("Opção D deve ter no máximo 1000 caracteres"),
  body("option_e").optional().isLength({ max: 1000 }).withMessage("Opção E deve ter no máximo 1000 caracteres"),
  body("correct_answer").optional().isIn(["A", "B", "C", "D", "E"]).withMessage("Resposta correta deve ser A, B, C, D ou E"),
  body("points").optional().isFloat({ min: 0 }).withMessage("Pontos deve ser um número positivo"),
  body("order_index").optional().isInt({ min: 1 }).withMessage("Índice de ordem deve ser um número positivo"),
  body("is_active").optional().isBoolean().withMessage("is_active deve ser boolean"),
];

const questaoFromFileValidation = [
  body("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"),
];

router.get("/conteudos/:conteudo_id/questoes", param("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"), handleValidationErrors, questaoController.listQuestoes);
router.get("/questoes/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, questaoController.getQuestao);
router.post("/questoes", questaoValidation, handleValidationErrors, questaoController.createQuestao);
router.post("/questoes/from-file", uploadSingle("file"), questaoFromFileValidation, handleValidationErrors, questaoController.createQuestoesFromFile);
router.put("/questoes/:id", param("id").isInt().withMessage("ID deve ser um número"), questaoUpdateValidation, handleValidationErrors, questaoController.updateQuestao);
router.delete("/questoes/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, questaoController.deleteQuestao);

// ===== ROTAS DE RESPOSTAS (VISUALIZAÇÃO) =====

router.get("/questoes/:questao_id/respostas", param("questao_id").isInt().withMessage("ID da questão deve ser um número"), handleValidationErrors, questaoController.listRespostas);

// Rota de teste
router.get('/', (req, res) => {
  res.json({
    message: 'Rotas de professores - Implementadas com sucesso',
    user: req.user.name,
    available_routes: {
      disciplinas: 'GET /disciplinas, GET /disciplinas/stats, GET /disciplinas/:id',
      conteudos: 'GET /disciplinas/:disciplina_id/conteudos, GET /conteudos/:id, POST /conteudos, PUT /conteudos/:id, DELETE /conteudos/:id',
      materials: 'GET /conteudos/:conteudo_id/materials, GET /materials/:id, POST /materials, PUT /materials/:id, DELETE /materials/:id',
      questoes: 'GET /conteudos/:conteudo_id/questoes, GET /questoes/:id, POST /questoes, POST /questoes/from-file, PUT /questoes/:id, DELETE /questoes/:id',
      respostas: 'GET /questoes/:questao_id/respostas',
    },
  });
});

module.exports = router;

