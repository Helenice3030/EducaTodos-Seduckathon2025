const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('feedback', 'denuncia'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Pode ser null para denúncias anônimas
    references: {
      model: 'students',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  student_name: {
    type: DataTypes.STRING(100),
    allowNull: true, // Para casos anônimos
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_viewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  viewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'feedbacks',
  timestamps: true,
});

module.exports = Feedback;

