'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('turmas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      school_year: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      section: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Criar índice único para school_year + section
    await queryInterface.addIndex('turmas', ['school_year', 'section'], {
      unique: true,
      name: 'turmas_school_year_section_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('turmas');
  },
};

