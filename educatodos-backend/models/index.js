const sequelize = require('../config/sequelize');

// Importar todos os modelos
const User = require('./User');
const Turma = require('./Turma');
const Student = require('./Student');
const Parent = require('./Parent');
const Teacher = require('./Teacher');
const Manager = require('./Manager');
const Disciplina = require('./Disciplina');
const Aviso = require('./Aviso');
const GradeHorario = require('./GradeHorario');
const Feedback = require('./Feedback');
const Conteudo = require('./Conteudo');
const Material = require('./Material');
const Questao = require('./Questao');
const Resposta = require('./Resposta');

// Definir associações

// User -> Student (1:1)
User.hasOne(Student, {
  foreignKey: 'user_id',
  as: 'student',
  onDelete: 'CASCADE',
});
Student.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User -> Teacher (1:1)
User.hasOne(Teacher, {
  foreignKey: 'user_id',
  as: 'teacher',
  onDelete: 'CASCADE',
});
Teacher.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User -> Manager (1:1)
User.hasOne(Manager, {
  foreignKey: 'user_id',
  as: 'manager',
  onDelete: 'CASCADE',
});
Manager.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User -> Parent (1:1)
User.hasOne(Parent, {
  foreignKey: 'user_id',
  as: 'parent',
  onDelete: 'CASCADE',
});
Parent.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Turma -> Student (1:N)
Turma.hasMany(Student, {
  foreignKey: 'turma_id',
  as: 'students',
  onDelete: 'RESTRICT',
});
Student.belongsTo(Turma, {
  foreignKey: 'turma_id',
  as: 'turma',
});

// Student -> Parent (1:N)
Student.hasMany(Parent, {
  foreignKey: 'student_id',
  as: 'parents',
  onDelete: 'CASCADE',
});
Parent.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

// Turma -> Disciplina (1:N)
Turma.hasMany(Disciplina, {
  foreignKey: 'turma_id',
  as: 'disciplinas',
  onDelete: 'CASCADE',
});
Disciplina.belongsTo(Turma, {
  foreignKey: 'turma_id',
  as: 'turma',
});

// Teacher -> Disciplina (1:N)
Teacher.hasMany(Disciplina, {
  foreignKey: 'teacher_id',
  as: 'disciplinas',
  onDelete: 'RESTRICT',
});
Disciplina.belongsTo(Teacher, {
  foreignKey: 'teacher_id',
  as: 'teacher',
});

// Turma -> Aviso (1:N)
Turma.hasMany(Aviso, {
  foreignKey: 'turma_id',
  as: 'avisos',
  onDelete: 'CASCADE',
});
Aviso.belongsTo(Turma, {
  foreignKey: 'turma_id',
  as: 'turma',
});

// User -> Aviso (1:N) - created_by
User.hasMany(Aviso, {
  foreignKey: 'created_by',
  as: 'avisos_created',
  onDelete: 'RESTRICT',
});
Aviso.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Turma -> GradeHorario (1:N)
Turma.hasMany(GradeHorario, {
  foreignKey: 'turma_id',
  as: 'grade_horarios',
  onDelete: 'CASCADE',
});
GradeHorario.belongsTo(Turma, {
  foreignKey: 'turma_id',
  as: 'turma',
});

// Student -> Feedback (1:N)
Student.hasMany(Feedback, {
  foreignKey: 'student_id',
  as: 'feedbacks',
  onDelete: 'SET NULL',
});
Feedback.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

// User -> Feedback (1:N) - viewed_by
User.hasMany(Feedback, {
  foreignKey: 'viewed_by',
  as: 'feedbacks_viewed',
  onDelete: 'SET NULL',
});
Feedback.belongsTo(User, {
  foreignKey: 'viewed_by',
  as: 'viewer',
});

// Disciplina -> Conteudo (1:N)
Disciplina.hasMany(Conteudo, {
  foreignKey: 'disciplina_id',
  as: 'conteudos',
  onDelete: 'CASCADE',
});
Conteudo.belongsTo(Disciplina, {
  foreignKey: 'disciplina_id',
  as: 'disciplina',
});

// User -> Conteudo (1:N) - created_by
User.hasMany(Conteudo, {
  foreignKey: 'created_by',
  as: 'conteudos_created',
  onDelete: 'RESTRICT',
});
Conteudo.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Conteudo -> Material (1:N)
Conteudo.hasMany(Material, {
  foreignKey: 'conteudo_id',
  as: 'materials',
  onDelete: 'CASCADE',
});
Material.belongsTo(Conteudo, {
  foreignKey: 'conteudo_id',
  as: 'conteudo',
});

// Conteudo -> Questao (1:N)
Conteudo.hasMany(Questao, {
  foreignKey: 'conteudo_id',
  as: 'questoes',
  onDelete: 'CASCADE',
});
Questao.belongsTo(Conteudo, {
  foreignKey: 'conteudo_id',
  as: 'conteudo',
});

// Questao -> Resposta (1:N)
Questao.hasMany(Resposta, {
  foreignKey: 'questao_id',
  as: 'respostas',
  onDelete: 'CASCADE',
});
Resposta.belongsTo(Questao, {
  foreignKey: 'questao_id',
  as: 'questao',
});

// Student -> Resposta (1:N)
Student.hasMany(Resposta, {
  foreignKey: 'student_id',
  as: 'respostas',
  onDelete: 'CASCADE',
});
Resposta.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

module.exports = {
  sequelize,
  User,
  Turma,
  Student,
  Parent,
  Teacher,
  Manager,
  Disciplina,
  Aviso,
  GradeHorario,
  Feedback,
  Conteudo,
  Material,
  Questao,
  Resposta,
};

