# Partner-API

**Partner-API** é uma API desenvolvida em Node.js para servir como backend de uma aplicação web de cadastro e gerenciamento de funcionários. Esta API permite o registro de usuários com o papel de **Manager** (funcionário de RH), possibilitando o gerenciamento completo de funcionários dentro da plataforma.

## ✨ Funcionalidades

- ✅ Registro de usuário como Manager (RH).
- ✅ Autenticação segura via JWT.
- ✅ Cadastro de novos funcionários.
- ✅ Edição de dados de funcionários.
- ✅ Remoção de funcionários.
- ✅ Integração com banco de dados MySQL para persistência dos dados.

## 🚧 Funcionalidades Futuras

- 🔜 Paginação de resultados.
- 🔜 Busca de funcionários por nome ou CPF.

## ⚙️ Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [JWT (JSON Web Token)](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) para hash de senhas.
- [dotenv](https://github.com/motdotla/dotenv) para variáveis de ambiente.
- [mysql2](https://github.com/sidorares/node-mysql2) para conexão com MySQL.

## 🗄️ Banco de Dados

A API utiliza **MySQL** como sistema de gerenciamento de banco de dados. A modelagem atual possui as seguintes entidades principais:

- **Manager**: responsável pelo gerenciamento dos funcionários.
- **Employee**: entidade que representa o funcionário cadastrado.

## 🛠️ Instalação e Configuração

### 1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/Partner-API.git
cd Partner-API
````
### 2. Instale as dependências:

```bash
npm install
```

### 3. COnfigure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto com a seguinte estrutura:
```bash
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
```
Preencha os valores conforme sua configuração local ou do ambiente de produção.

### 4. Configure o banco de dados:
- Crie o banco de dados MySQL.

- Crie as tabelas conforme o modelo definido no projeto.

- Você pode utilizar migrations ou scripts SQL disponibilizados na pasta database (caso exista).

### 5. Execute a aplicação:
```bash
npm start
```

## 🔑 Autenticação
A autenticação é realizada via JWT. Para acessar rotas protegidas, é necessário incluir o token no cabeçalho das requisições:
```bash
Authorization: Bearer <token>
```

## 📩 Rotas Principais
| Método | Rota            | Descrição                              |
| ------ | --------------- | -------------------------------------- |
| POST   | /auth/register  | Registro de um novo Manager            |
| POST   | /auth/login     | Login do Manager e geração de token    |
| POST   | /employees      | Cadastro de novo funcionário           |
| GET    | /employees      | Listagem de funcionários               |
| GET    | /employees/\:id | Detalhes de um funcionário             |
| PUT    | /employees/\:id | Atualização de dados de um funcionário |
| DELETE | /employees/\:id | Remoção de um funcionário              |
