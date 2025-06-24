const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

/**
 * Gera hash da senha
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compara senha com hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Gera token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

/**
 * Verifica token JWT
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Formata data para o padrão brasileiro
 */
const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY');
};

/**
 * Formata data e hora para o padrão brasileiro
 */
const formatDateTime = (date) => {
  return moment(date).format('DD/MM/YYYY HH:mm:ss');
};

/**
 * Converte data de nascimento para senha
 */
const birthDateToPassword = (birthDate) => {
  return moment(birthDate).format('DDMMYYYY');
};

/**
 * Valida email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gera resposta de sucesso padronizada
 */
const successResponse = (data, message = 'Operação realizada com sucesso') => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Gera resposta de erro padronizada
 */
const errorResponse = (message = 'Erro interno do servidor', errors = null) => {
  return {
    success: false,
    message,
    errors,
  };
};

/**
 * Calcula idade baseada na data de nascimento
 */
const calculateAge = (birthDate) => {
  return moment().diff(moment(birthDate), 'years');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  formatDate,
  formatDateTime,
  birthDateToPassword,
  isValidEmail,
  successResponse,
  errorResponse,
  calculateAge,
};

