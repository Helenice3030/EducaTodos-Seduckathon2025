const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login, me } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

// Validações para login
const loginValidation = [
  body('role')
    .isIn(['manager', 'teacher', 'student', 'parent'])
    .withMessage('Função precisa ser válida'),
  body('email'),
    // .isEmail()
    // .withMessage('Email deve ser válido'),
    // .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1 })
    .withMessage('Senha não pode estar vazia'),
];

// Rotas públicas
router.post('/login', loginValidation, handleValidationErrors, login);

// Rotas protegidas
router.get('/me', authenticateToken, me);

module.exports = router;

