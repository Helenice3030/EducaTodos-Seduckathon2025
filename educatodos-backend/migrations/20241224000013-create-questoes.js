'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('questoes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      conteudo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conteudos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      option_a: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      option_b: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      option_c: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      option_d: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      option_e: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      correct_answer: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E'),
        allowNull: false
      },
      points: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Adicionar índices
    await queryInterface.addIndex('questoes', ['conteudo_id']);
    await queryInterface.addIndex('questoes', ['order_index']);
    await queryInterface.addIndex('questoes', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('questoes');
  }
};

