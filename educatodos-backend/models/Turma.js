const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Turma = sequelize.define('Turma', {
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
      len: [1, 100],
    },
  },
  school_year: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: true,
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
  tableName: 'turmas',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['school_year', 'section'],
    },
  ],
});

module.exports = Turma;

