const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Questao = sequelize.define('Questao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conteudo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conteudos',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  option_a: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_b: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_c: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  option_d: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  option_e: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  correct_answer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
    allowNull: false,
  },
  points: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'questoes',
  timestamps: true,
  indexes: [
    {
      fields: ['conteudo_id', 'order_index'],
    },
  ],
});

module.exports = Questao;

