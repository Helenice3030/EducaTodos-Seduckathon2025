const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Disciplina = sequelize.define('Disciplina', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  turma_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'turmas',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'disciplinas',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'turma_id'],
    },
  ],
});

module.exports = Disciplina;

