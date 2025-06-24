const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const GradeHorario = sequelize.define('GradeHorario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  disciplina_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  day_of_week: {
    type: DataTypes.ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'grade_horarios',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['turma_id', 'day_of_week', 'start_time'],
    },
  ],
});

module.exports = GradeHorario;

