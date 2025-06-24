const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();

const authenticateToken = require("../middleware/auth");
const { authorizeParent } = require("../middleware/authorize");
const handleValidationErrors = require("../middleware/validation");

// Importar controladores
const parentStudentController = require("../controllers/parentStudentController");
const parentDisciplinaController = require("../controllers/parentDisciplinaController");
const parentFrequenciaController = require("../controllers/parentFrequenciaController");

// Todas as rotas de responsáveis requerem autenticação e autorização
router.use(authenticateToken);
router.use(authorizeParent);

// ===== ROTAS DE INFORMAÇÕES DO RESPONSÁVEL =====
router.get("/meus-dados", parentStudentController.getMyInfo);
router.put("/meus-dados", 
  body("phone").optional().isMobilePhone("pt-BR").withMessage("Telefone deve ser um número válido"),
  body("email").optional().isEmail().withMessage("Email deve ser válido"),
  handleValidationErrors, 
  parentStudentController.updateMyInfo
);

// ===== ROTAS DE ALUNOS DO RESPONSÁVEL =====

router.get("/alunos", parentStudentController.listMyStudents);
router.get("/alunos/:student_id", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"), 
  handleValidationErrors, 
  parentStudentController.getStudentInfo
);

// ===== ROTAS DE DISCIPLINAS DO ALUNO =====

router.get("/alunos/:student_id/disciplinas", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"), 
  handleValidationErrors, 
  parentDisciplinaController.listStudentDisciplinas
);

router.get("/alunos/:student_id/disciplinas/:disciplina_id", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"),
  param("disciplina_id").isInt().withMessage("ID da disciplina deve ser um número"), 
  handleValidationErrors, 
  parentDisciplinaController.getStudentDisciplina
);

router.get("/alunos/:student_id/desempenho", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"), 
  handleValidationErrors, 
  parentDisciplinaController.getStudentPerformance
);

// ===== ROTAS DE FREQUÊNCIA =====

router.get("/alunos/:student_id/frequencia", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"),
  query("disciplina_id").optional().isInt().withMessage("ID da disciplina deve ser um número"),
  query("periodo").optional().isIn(["semana", "mes", "bimestre", "semestre", "ano_letivo"]).withMessage("Período inválido"),
  handleValidationErrors, 
  parentFrequenciaController.getStudentFrequencia
);

// ===== ROTAS DE PENDÊNCIAS =====

router.get("/alunos/:student_id/pendencias", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"), 
  handleValidationErrors, 
  parentFrequenciaController.getStudentPendencias
);

// ===== ROTAS DE ATIVIDADES POR DISCIPLINA =====

router.get("/alunos/:student_id/disciplinas/:disciplina_id/atividades", 
  param("student_id").isInt().withMessage("ID do aluno deve ser um número"),
  param("disciplina_id").isInt().withMessage("ID da disciplina deve ser um número"),
  query("status").optional().isIn(["ativo", "finalizado"]).withMessage("Status deve ser \"ativo\" ou \"finalizado\""),
  query("periodo").optional().isIn(["semana", "mes", "bimestre"]).withMessage("Período inválido"),
  handleValidationErrors, 
  parentFrequenciaController.getStudentAtividades
);

// Rota de teste
router.get("/", (req, res) => {
  res.json({
    message: "Rotas de responsáveis - Implementadas com sucesso",
    user: req.user.name,
    available_routes: {
      responsavel: "GET /meus-dados, PUT /meus-dados",
      alunos: "GET /alunos, GET /alunos/:student_id",
      disciplinas: "GET /alunos/:student_id/disciplinas, GET /alunos/:student_id/disciplinas/:disciplina_id",
      desempenho: "GET /alunos/:student_id/desempenho",
      frequencia: "GET /alunos/:student_id/frequencia",
      pendencias: "GET /alunos/:student_id/pendencias",
      atividades: "GET /alunos/:student_id/disciplinas/:disciplina_id/atividades",
    },
  });
});

module.exports = router;


