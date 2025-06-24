const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Parent = sequelize.define('Parent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
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
  relationship: {
    type: DataTypes.ENUM('pai', 'mae', 'avo', 'ava', 'tio', 'tia', 'responsavel_legal', 'outro'),
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'parents',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id'],
    },
  ],
});

module.exports = Parent;

