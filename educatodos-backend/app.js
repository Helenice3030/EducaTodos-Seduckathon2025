require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();


// Configuração de Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de 100 requests por windowMs
  message: {
    error: 'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
  },
});

// Middlewares de segurança
app.use(helmet());
// app.use(limiter);

// Configuração CORS
app.use(cors({
  origin: '*', // Em produção, especificar domínios permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'accessibility-type'],
}));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API da Escola - Sistema de Gestão Educacional',
    version: '1.0.0',
    status: 'online',
  });
});

// Importar e usar rotas
const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/manager');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const parentRoutes = require('./routes/parent');

app.use('/api/auth', authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = app;

