const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Material = sequelize.define('Material', {
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
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('link', 'file', 'youtube'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'URL para links/youtube ou caminho do arquivo para uploads',
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Caminho do arquivo quando type = file',
  },
  disability_type: {
    type: DataTypes.ENUM('visual', 'auditory', 'motor', 'intellectual', 'all'),
    allowNull: false,
    defaultValue: 'all',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'materials',
  timestamps: true,
});

module.exports = Material;

