const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();

const authenticateToken = require("../middleware/auth");
const { authorizeStudent } = require("../middleware/authorize");
const handleValidationErrors = require("../middleware/validation");

// Importar controladores
const studentDisciplinaController = require("../controllers/studentDisciplinaController");
const studentConteudoController = require("../controllers/studentConteudoController");
const studentQuestaoController = require("../controllers/studentQuestaoController");
const studentAvisoController = require("../controllers/studentAvisoController");
const studentFeedbackController = require("../controllers/studentFeedbackController");

// Todas as rotas de alunos requerem autenticação e autorização
router.use(authenticateToken);
router.use(authorizeStudent);

// ===== ROTAS DE DISCIPLINAS DO ALUNO =====
router.get("/disciplinas", studentDisciplinaController.listMyDisciplinas);
router.get("/disciplinas/stats", studentDisciplinaController.getMyStats);
router.get("/disciplinas/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, studentDisciplinaController.getMyDisciplina);

// ===== ROTAS DE CONTEÚDOS =====

router.get("/disciplinas/:disciplina_id/conteudos", param("disciplina_id").isInt().withMessage("ID da disciplina deve ser um número"), handleValidationErrors, studentConteudoController.listConteudos);
router.get("/conteudos/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, studentConteudoController.getConteudo);
router.get("/conteudos/:conteudo_id/materials", param("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"), handleValidationErrors, studentConteudoController.listMaterials);
router.get("/menu-conteudos", studentConteudoController.getConteudoMenu);

// ===== ROTAS DE QUESTÕES E RESPOSTAS =====

// Validações para respostas
const respostaValidation = [
  body("selected_answer").isIn(["A", "B", "C", "D", "E"]).withMessage("Resposta deve ser A, B, C, D ou E"),
];

router.get("/conteudos/:conteudo_id/questoes", param("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"), handleValidationErrors, studentQuestaoController.listQuestoes);
router.get("/questoes/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, studentQuestaoController.getQuestao);
router.post("/questoes/:questao_id/responder", param("questao_id").isInt().withMessage("ID da questão deve ser um número"), respostaValidation, handleValidationErrors, studentQuestaoController.answerQuestao);
router.get("/conteudos/:conteudo_id/respostas", param("conteudo_id").isInt().withMessage("ID do conteúdo deve ser um número"), handleValidationErrors, studentQuestaoController.listMyRespostas);
router.get("/disciplinas/:disciplina_id/resultado", param("disciplina_id").isInt().withMessage("ID da disciplina deve ser um número"), handleValidationErrors, studentQuestaoController.getResultadoDisciplina);

// ===== ROTAS DE AVISOS =====

router.get("/avisos", studentAvisoController.listAvisos);
router.get("/avisos/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, studentAvisoController.getAviso);

// ===== ROTAS DE GRADE DE HORÁRIOS =====

router.get("/grade-horarios", studentAvisoController.getGradeHorarios);
router.get("/horarios-dia", studentAvisoController.getHorariosDia);
router.get("/proxima-aula", studentAvisoController.getProximaAula);

// ===== ROTAS DE FEEDBACKS E DENÚNCIAS =====

// Validações para feedbacks
const feedbackValidation = [
  body("type").isIn(["feedback", "denuncia"]).withMessage("Tipo deve ser \"feedback\" ou \"denuncia\""),
  body("description").notEmpty().withMessage("Descrição é obrigatória").isLength({ max: 2000 }).withMessage("Descrição deve ter no máximo 2000 caracteres"),
  body("is_anonymous").optional().isBoolean().withMessage("is_anonymous deve ser boolean"),
];

router.post("/feedbacks", feedbackValidation, handleValidationErrors, studentFeedbackController.createFeedback);
router.get("/feedbacks", studentFeedbackController.listMyFeedbacks);
router.get("/feedbacks/stats", studentFeedbackController.getMyFeedbackStats);
router.get("/feedbacks/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, studentFeedbackController.getMyFeedback);
router.delete("/feedbacks/:id", param("id").isInt().withMessage("ID deve ser um número"), handleValidationErrors, studentFeedbackController.deleteMyFeedback);
// Rota de teste
router.get("/", (req, res) => {
  res.json({
    message: "Rotas de alunos - Implementadas com sucesso",
    user: req.user.name,
    available_routes: {
      disciplinas: "GET /disciplinas, GET /disciplinas/stats, GET /disciplinas/:id",
      conteudos: "GET /disciplinas/:disciplina_id/conteudos, GET /conteudos/:id, GET /conteudos/:conteudo_id/materials, GET /menu-conteudos",
      questoes: "GET /conteudos/:conteudo_id/questoes, GET /questoes/:id, POST /questoes/:questao_id/responder",
      respostas: "GET /conteudos/:conteudo_id/respostas, GET /disciplinas/:disciplina_id/resultado",
      avisos: "GET /avisos, GET /avisos/:id",
      horarios: "GET /grade-horarios, GET /horarios-dia, GET /proxima-aula",
      feedbacks: "POST /feedbacks, GET /feedbacks, GET /feedbacks/stats, GET /feedbacks/:id, DELETE /feedbacks/:id",
    },
  });
});

module.exports = router;


