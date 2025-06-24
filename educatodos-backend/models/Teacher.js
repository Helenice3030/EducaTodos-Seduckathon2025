const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Teacher = sequelize.define('Teacher', {
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
  specialization: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'teachers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id'],
    },
  ],
});

module.exports = Teacher;

