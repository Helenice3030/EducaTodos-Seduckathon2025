# TODO - Sistema de Gestão Educacional

## Fase 1: Analisar e compreender os requisitos do projeto ✅
- [x] Ler e analisar requisitos detalhados
- [x] Identificar funcionalidades por role
- [x] Mapear estrutura do banco de dados

## Fase 2: Configurar ambiente e estrutura inicial do projeto ✅
- [x] Criar diretório do projeto
- [x] Inicializar package.json
- [x] Instalar dependências (Express, Sequelize, MySQL2, etc.)
- [x] Criar estrutura de diretórios
- [x] Configurar arquivo de banco de dados
- [x] Criar arquivo .env
- [x] Configurar servidor Express básico
- [x] Configurar Sequelize
- [x] Criar utilitários básicos
- [x] Criar README.md
- [x] Criar .gitignore

## Fase 3: Implementar autenticação e gestão de usuários/roles ✅
- [x] Criar modelos de usuários (User, Manager, Teacher, Student, Parent)
- [x] Criar middleware de autenticação JWT
- [x] Criar middleware de autorização por roles
- [x] Implementar rotas de autenticação (login, me)
- [x] Criar validações de entrada
- [x] Criar migrations para todas as tabelas
- [x] Criar seed para usuário gestor inicial

## Fase 4: Desenvolver endpoints para a role de Gestão ✅
- [x] Modelo e rotas para Turmas (CRUD)
- [x] Modelo e rotas para Professores (CRUD)
- [x] Modelo e rotas para Alunos e Responsáveis (CRUD)
- [x] Modelo e rotas para Disciplinas (CRUD)
- [x] Modelo e rotas para Avisos e Horários
- [x] Modelo e rotas para Grade de Horários
- [x] Modelo e rotas para Denúncias e Feedback
- [x] Criar migrations para todas as novas tabelas
- [x] Implementar validações completas para todos os endpoints

## Fase 5: Desenvolver endpoints para a role de Professor ✅
- [x] Rotas para listar disciplinas do professor
- [x] Modelo e rotas para Conteúdos da disciplina
- [x] Implementar upload de arquivos (resumos, materiais)
- [x] Integração com IA para processamento de resumos
- [x] Sistema de questões e respostas
- [x] Adaptação de conteúdo por tipo de deficiência

## Fase 6: Desenvolver endpoints para a role de Aluno ✅
- [x] Rotas para listar disciplinas da turma
- [x] Rotas para listar conteúdos de disciplina
- [x] Rotas para menu de conteúdo
- [x] Rotas para obter resumo e materiais
- [x] Rotas para questões e envio de respostas
- [x] Rotas para avisos e grade de horários
- [x] Rotas para envio de feedbacks e denúncias

## Fase 7: Desenvolver endpoints para a role de Responsável ✅
- [x] Rotas para informações do aluno
- [x] Rotas para disciplinas do aluno
- [x] Sistema de frequência
- [x] Sistema de pendências
- [x] Relatórios de atividades por disciplina

## Fase 8: Testar e depurar o backend
- [ ] Testar todas as rotas
- [ ] Verificar autenticação e autorização
- [ ] Testar upload de arquivos
- [ ] Testar integração com banco de dados
- [ ] Corrigir bugs encontrados

## Fase 9: Documentar a API e o projeto
- [ ] Documentar todos os endpoints
- [ ] Criar exemplos de uso
- [ ] Documentar estrutura do banco
- [ ] Criar guia de instalação detalhado

## Fase 10: Entregar o projeto e as instruções ao usuário
- [ ] Preparar arquivos finais
- [ ] Criar instruções de deploy
- [ ] Entregar projeto completo

