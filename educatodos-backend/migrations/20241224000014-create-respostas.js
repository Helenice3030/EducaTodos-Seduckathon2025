'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('respostas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      questao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'questoes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      selected_answer: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E'),
        allowNull: false
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      points_earned: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.addIndex('respostas', ['questao_id']);
    await queryInterface.addIndex('respostas', ['student_id']);
    await queryInterface.addIndex('respostas', ['answered_at']);
    await queryInterface.addIndex('respostas', ['is_correct']);
    
    // Índice único para evitar múltiplas respostas do mesmo aluno para a mesma questão
    await queryInterface.addIndex('respostas', ['questao_id', 'student_id'], {
      unique: true,
      name: 'unique_student_questao'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('respostas');
  }
};

