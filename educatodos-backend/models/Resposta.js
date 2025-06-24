const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Resposta = sequelize.define('Resposta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  questao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questoes',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  selected_answer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  points_earned: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  answered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'respostas',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['questao_id', 'student_id'],
    },
    {
      fields: ['student_id'],
    },
  ],
});

module.exports = Resposta;

