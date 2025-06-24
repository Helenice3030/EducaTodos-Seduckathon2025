const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Aviso = sequelize.define('Aviso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
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
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'avisos',
  timestamps: true,
});

module.exports = Aviso;

