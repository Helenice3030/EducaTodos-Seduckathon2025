const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Conteudo = sequelize.define('Conteudo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  disciplina_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'disciplinas',
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Resumo original
  summary_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  summary_file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  // summary_file_type: {
  //   type: DataTypes.ENUM('text', 'image', 'pdf', 'docx'),
  //   allowNull: true,
  // },
  // Resumos adaptados por IA para cada tipo de deficiência
  summary_visual: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  summary_auditory: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  summary_motor: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  summary_intellectual: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
}, {
  tableName: 'conteudos',
  timestamps: true,
});

module.exports = Conteudo;

