'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash da senha padrão "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Inserir usuário gestor
    // const [userId] = await queryInterface.bulkInsert('users', [
    //   {
    //     name: 'Administrador do Sistema',
    //     email: 'admin@escola.com',
    //     password: hashedPassword,
    //     role: 'manager',
    //     birth_date: '1980-01-01',
    //     phone: '(11) 99999-9999',
    //     is_active: true,
    //     created_at: new Date(),
    //     updated_at: new Date(),
    //   },
    // ], { returning: ['id'] });

    // Inserir dados específicos do gestor
    await queryInterface.bulkInsert('managers', [
      {
        user_id: 1, // Fallback para MySQL que não retorna ID
        department: 'Administração Geral',
        hire_date: '2024-01-01',
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Inserir algumas turmas de exemplo
    // await queryInterface.bulkInsert('turmas', [
    //   {
    //     name: '1º Ano A',
    //     school_year: '1º Ano',
    //     section: 'A',
    //     description: 'Turma do primeiro ano - seção A',
    //     is_active: true,
    //     created_at: new Date(),
    //     updated_at: new Date(),
    //   },
    //   {
    //     name: '1º Ano B',
    //     school_year: '1º Ano',
    //     section: 'B',
    //     description: 'Turma do primeiro ano - seção B',
    //     is_active: true,
    //     created_at: new Date(),
    //     updated_at: new Date(),
    //   },
    //   {
    //     name: '2º Ano A',
    //     school_year: '2º Ano',
    //     section: 'A',
    //     description: 'Turma do segundo ano - seção A',
    //     is_active: true,
    //     created_at: new Date(),
    //     updated_at: new Date(),
    //   },
    // ]);
  },

  async down(queryInterface, Sequelize) {
    // Remover dados em ordem reversa devido às foreign keys
    await queryInterface.bulkDelete('managers', null, {});
    await queryInterface.bulkDelete('turmas', null, {});
    await queryInterface.bulkDelete('users', { email: 'admin@escola.com' }, {});
  },
};

