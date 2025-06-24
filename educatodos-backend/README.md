# Sistema de Gestão Educacional - Backend

API REST para sistema de gestão educacional com autenticação baseada em roles.

## Funcionalidades

- **Autenticação JWT** com 4 tipos de usuários:
  - Gestão (manager)
  - Professores (teacher)
  - Alunos (student)
  - Responsáveis (parent)

- **Gestão Completa** de:
  - Turmas
  - Professores
  - Alunos e Responsáveis
  - Disciplinas
  - Avisos e Horários
  - Denúncias e Feedback

- **Funcionalidades para Professores**:
  - Gerenciamento de disciplinas
  - Criação de conteúdos com IA
  - Sistema de questões e avaliações
  - Materiais complementares por tipo de deficiência

- **Funcionalidades para Alunos**:
  - Visualização de disciplinas e conteúdos
  - Resposta a questionários
  - Envio de feedback e denúncias
  - Acesso a materiais adaptados

- **Funcionalidades para Responsáveis**:
  - Acompanhamento do progresso do aluno
  - Visualização de frequência e pendências
  - Relatórios de atividades por disciplina

## Tecnologias

- **Node.js** + **Express.js**
- **Sequelize ORM** + **MySQL**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Multer** para upload de arquivos
- **Helmet** + **CORS** para segurança
- **Express Rate Limit** para proteção contra spam

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=escola_db
   DB_USERNAME=root
   DB_PASSWORD=
   JWT_SECRET=sua_chave_secreta_muito_segura
   PORT=3000
   ```

4. Crie o banco de dados:
   ```bash
   npm run db:create
   ```

5. Execute as migrations:
   ```bash
   npm run migrate
   ```

6. Execute as seeds (dados iniciais):
   ```bash
   npm run seed
   ```

7. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run migrate` - Executa as migrations
- `npm run seed` - Executa as seeds
- `npm run db:create` - Cria o banco de dados
- `npm run db:drop` - Remove o banco de dados

## Estrutura do Projeto

```
escola-backend/
├── config/          # Configurações do banco e Sequelize
├── controllers/     # Controladores das rotas
├── middleware/      # Middlewares de autenticação e validação
├── migrations/      # Migrations do banco de dados
├── models/          # Modelos do Sequelize
├── routes/          # Definição das rotas
├── seeders/         # Seeds para dados iniciais
├── uploads/         # Arquivos enviados pelos usuários
├── utils/           # Funções utilitárias
├── app.js           # Arquivo principal do servidor
├── .env             # Variáveis de ambiente
└── package.json     # Dependências e scripts
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuários
- `GET /api/auth/me` - Dados do usuário autenticado

### Gestão (Manager)
- `GET /api/manager/turmas` - Listar turmas
- `POST /api/manager/turmas` - Criar turma
- `PUT /api/manager/turmas/:id` - Editar turma
- `DELETE /api/manager/turmas/:id` - Deletar turma

### Professores (Teacher)
- `GET /api/teacher/disciplinas` - Listar disciplinas do professor
- `GET /api/teacher/conteudos/:disciplinaId` - Listar conteúdos da disciplina

### Alunos (Student)
- `GET /api/student/disciplinas` - Listar disciplinas da turma
- `GET /api/student/conteudos/:disciplinaId` - Listar conteúdos da disciplina

### Responsáveis (Parent)
- `GET /api/parent/aluno` - Dados do aluno
- `GET /api/parent/atividades` - Atividades do aluno

## Licença

ISC

