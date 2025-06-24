const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Student = sequelize.define('Student', {
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
  turma_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'turmas',
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
  ra: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  disability_type: {
    type: DataTypes.ENUM('none', 'visual', 'auditory', 'motor', 'intellectual'),
    defaultValue: 'none',
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'students',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ra'],
      where: {
        ra: {
          [sequelize.Sequelize.Op.ne]: null,
        },
      },
    },
    {
      unique: true,
      fields: ['user_id'],
    },
  ],
});

module.exports = Student;

