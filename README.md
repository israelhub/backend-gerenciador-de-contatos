# 📱 Backend Gerenciador de Contatos

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

*Uma API REST para gerenciamento de contatos, construída com NestJS e TypeScript*

</div>

---

## 📋 Sumário

- [📱 Backend Gerenciador de Contatos](#-backend-gerenciador-de-contatos)
  - [📋 Sumário](#-sumário)
  - [🎯 Sobre o Projeto](#-sobre-o-projeto)
  - [✨ Funcionalidades](#-funcionalidades)
  - [🛠️ Tecnologias](#️-tecnologias)
  - [📊 Estrutura do Projeto](#-estrutura-do-projeto)
  - [📋 Documentação Técnica](#-documentação-técnica)
    - [📄 Documentos Disponíveis:](#-documentos-disponíveis)
    - [🎯 Para Desenvolvedores:](#-para-desenvolvedores)
  - [🚀 Como Executar](#-como-executar)
    - [💻 Executando Localmente](#-executando-localmente)
      - [Pré-requisitos](#pré-requisitos)
      - [Passos:](#passos)
  - [📚 Documentação da API](#-documentação-da-api)
  - [🧪 Testes](#-testes)

---

## 🎯 Sobre o Projeto

O **Backend Gerenciador de Contatos** é uma API REST desenvolvida com NestJS que oferece um sistema completo para gerenciamento de contatos pessoais. A aplicação conta com autenticação JWT, validação de dados, documentação automática com Swagger, e uma arquitetura modular e escalável.

## ✨ Funcionalidades

- 🔐 **Autenticação e Autorização** com JWT
- 👤 **Gerenciamento de Usuários** (registro, login, atualização de perfil)
- 📇 **CRUD Completo de Contatos** (criar, listar, atualizar, deletar)
- 🔍 **Filtros e Busca** avançada de contatos
- 🛡️ **Validação de Dados** com class-validator
- 📖 **Documentação Automática** com Swagger
- 🔒 **Senhas Criptografadas** com Argon2
- ⚡ **Rate Limiting** para proteção contra ataques
- 🏥 **Health Check** para monitoramento
- 🐳 **Docker** para containerização

## 🛠️ Tecnologias

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** TypeORM
- **Autenticação:** JWT (JSON Web Tokens)
- **Criptografia:** Argon2
- **Validação:** class-validator
- **Documentação:** Swagger/OpenAPI
- **Containerização:** Docker
- **Testes:** Jest

## 📊 Estrutura do Projeto

```
backend-gerenciador-de-contatos/
├── 📁 src/                          # Código fonte principal
│   ├── 📁 auth/                     # Módulo de autenticação
│   │   ├── 📁 dto/                  # Data Transfer Objects
│   │   ├── 📁 entities/             # Entidades do banco
│   │   ├── 📁 guards/               # Guards de autenticação
│   │   ├── 📁 strategies/           # Estratégias JWT
│   │   ├── auth.controller.ts       # Controller de autenticação
│   │   ├── auth.service.ts          # Serviços de autenticação
│   │   └── auth.module.ts           # Módulo de autenticação
│   │
│   ├── 📁 contacts/                 # Módulo de contatos
│   │   ├── 📁 dto/                  # DTOs para contatos
│   │   ├── 📁 entities/             # Entidade Contact
│   │   ├── 📁 interfaces/           # Interfaces TypeScript
│   │   ├── contacts.controller.ts   # Controller de contatos
│   │   ├── contacts.service.ts      # Serviços de contatos
│   │   └── contacts.module.ts       # Módulo de contatos
│   │
│   ├── 📁 users/                    # Módulo de usuários
│   │   ├── 📁 dto/                  # DTOs para usuários
│   │   ├── 📁 entities/             # Entidade User
│   │   ├── users.controller.ts      # Controller de usuários
│   │   ├── users.service.ts         # Serviços de usuários
│   │   └── users.module.ts          # Módulo de usuários
│   │
│   ├── 📁 config/                   # Configurações da aplicação
│   │   ├── app.config.ts            # Configurações gerais
│   │   ├── database.config.ts       # Configurações do banco
│   │   └── jwt.config.ts            # Configurações JWT
│   │
│   ├── 📁 common/                   # Recursos compartilhados
│   │   ├── 📁 filters/              # Filtros globais
│   │   ├── 📁 interceptors/         # Interceptadores
│   │   └── 📁 interfaces/           # Interfaces compartilhadas
│   │
│   ├── 📁 health/                   # Health Check
│   ├── 📁 database/                 # Configurações do banco
│   ├── app.module.ts                # Módulo principal
│   └── main.ts                      # Ponto de entrada
│
├── 📁 test/                         # Testes E2E
├── 📁 docs/                         # Documentação adicional
├── 📄 docker-compose.yml            # Configuração Docker
├── 📄 Dockerfile                    # Imagem Docker
├── 📄 package.json                  # Dependências Node.js
└── 📄 README.md                     # Este arquivo
```

## 📋 Documentação Técnica

Este projeto possui documentação técnica detalhada na pasta `docs/`:

### 📄 Documentos Disponíveis:

- **[🔗 API-FRONTEND-INTEGRATION.md](./docs/API-FRONTEND-INTEGRATION.md)**  
  *Guia completo para integração entre API e frontend, incluindo exemplos de requisições e respostas*

- **[⚙️ DECISOES_TECNICAS.md](./docs/DECISOES_TECNICAS.md)**  
  *Documentação das decisões arquiteturais e tecnológicas tomadas durante o desenvolvimento*

- **[📐 TYPESCRIPT-INTERFACES.md](./docs/TYPESCRIPT-INTERFACES.md)**  
  *Definições e contratos das interfaces TypeScript utilizadas no projeto*

- **[🗂️ ERD - Diagrama de Entidade-Relacionamento](./docs/ERD/ERD-GerenciadorDeContatos.jpg)**  
  *Modelo visual do banco de dados com relacionamentos entre entidades*

### 🎯 Para Desenvolvedores:
- Consulte `DECISOES_TECNICAS.md` para entender as escolhas arquiteturais
- Use `TYPESCRIPT-INTERFACES.md` como referência para tipagem
- Verifique `API-FRONTEND-INTEGRATION.md` para exemplos práticos de uso da API
- Analise o ERD para compreender a estrutura do banco de dados


## 🚀 Como Executar

### 💻 Executando Localmente

Para desenvolvimento local ou se preferir não usar Docker:

#### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) instalado e configurado
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

#### Passos:

1. **Clone e acesse o diretório:**
   ```bash
   git clone <url-do-repositorio>
   cd backend-gerenciador-de-contatos
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o banco de dados PostgreSQL:**
   - Crie um banco de dados
   - Configure as credenciais no arquivo `.env`

4. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite as variáveis no arquivo .env
   ```

5. **Execute as migrações (se houver):**
   ```bash
   npm run migration:run
   ```

6. **Inicie a aplicação:**

   **Modo desenvolvimento (com hot reload):**
   ```bash
   npm run start:dev
   ```

   **Modo debug:**
   ```bash
   npm run start:debug
   ```

   **Modo produção:**
   ```bash
   npm run build
   npm run start:prod
   ```

7. **Acesse a aplicação:**
   - API: http://localhost:8000
   - Documentação Swagger: http://localhost:8000/api/docs

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger UI:

- **Local:** http://localhost:8000/api/docs
- **Formato JSON:** http://localhost:8000/api/docs-json

A documentação interativa permite testar todos os endpoints diretamente no navegador e visualizar os schemas de dados.

## 🧪 Testes

Execute os testes para garantir que tudo está funcionando:

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes com debug
npm run test:debug
```

---

<div align="center">

**[⬆ Voltar ao topo](#-backend-gerenciador-de-contatos)**

</div>
