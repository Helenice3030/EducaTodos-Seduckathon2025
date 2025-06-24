const { verifyToken, errorResponse } = require('../utils/helpers');
const { User } = require('../models');

/**
 * Middleware para verificar autenticação JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(errorResponse('Token de acesso requerido'));
    }

    const decoded = verifyToken(token);
    
    // Buscar usuário no banco de dados
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json(errorResponse('Usuário não encontrado ou inativo'));
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(errorResponse('Token inválido'));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Token expirado'));
    }
    
    console.error('Erro na autenticação:', error);
    return res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = authenticateToken;

