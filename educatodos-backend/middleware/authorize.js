const { errorResponse } = require('../utils/helpers');

/**
 * Middleware para verificar autorização por roles
 * @param {Array} allowedRoles - Array com os roles permitidos
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('Usuário não autenticado'));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json(errorResponse('Acesso negado. Permissões insuficientes'));
      }

      next();
    } catch (error) {
      console.error('Erro na autorização:', error);
      return res.status(500).json(errorResponse('Erro interno do servidor'));
    }
  };
};

/**
 * Middleware específico para gestores
 */
const authorizeManager = authorizeRoles(['manager']);

/**
 * Middleware específico para professores
 */
const authorizeTeacher = authorizeRoles(['teacher']);

/**
 * Middleware específico para alunos
 */
const authorizeStudent = authorizeRoles(['student']);

/**
 * Middleware específico para responsáveis
 */
const authorizeParent = authorizeRoles(['parent']);

/**
 * Middleware para gestores e professores
 */
const authorizeManagerOrTeacher = authorizeRoles(['manager', 'teacher']);

/**
 * Middleware para alunos e responsáveis
 */
const authorizeStudentOrParent = authorizeRoles(['student', 'parent']);

module.exports = {
  authorizeRoles,
  authorizeManager,
  authorizeTeacher,
  authorizeStudent,
  authorizeParent,
  authorizeManagerOrTeacher,
  authorizeStudentOrParent,
};

