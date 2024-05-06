# API para controle de finanças 💰💳📈

### Visão Geral 
Este projeto consiste em uma API REST desenvolvida em Node.js com TypeScript, utilizando MySQL como banco de dados e o ORM Sequelize para a interação com a base de dados. A autenticação é feita através de JWT (JSON Web Tokens). O objetivo desta API é permitir que usuários controlem suas finanças pessoais, incluindo criação, atualização, exclusão e listagem de movimentações financeiras, bem como a exibição do saldo.

### Configuração do Projeto
1. Certifique-se de ter o Node.js e o MySQL instalados em seu ambiente.
2. Clone este repositório em sua máquina local.
3. Instale as dependências do projeto executando o comando `npm install`.
4. Configure as variáveis de ambiente no arquivo `.env`, incluindo a `JWT_SECRET_KEY` e as credenciais do banco de dados.
5. Execute o comando `npm run start` para iniciar o servidor.

### Endpoints
A seguir, são listadas as rotas disponíveis na API:

#### Autenticação

- Rota: POST /auth/register
  - Descrição: Registra um novo usuário na aplicação.
  - Requisição:
    - Parâmetros obrigatórios:
      - name: Nome do usuário.
      - email: E-mail do usuário.
      - password: Senha do usuário.
    - Exemplo de Payload:
      ```json
      {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "password": "senha123"
      }
      ```
  - Resposta:
    - Status 201 (Created) em caso de sucesso.
    - Status 400 (Bad Request) se algum campo obrigatório estiver faltando ou se o e-mail já estiver cadastrado.

- Rota: POST /auth/login
  - Descrição: Realiza login de um usuário existente na aplicação.
  - Requisição:
    - Parâmetros obrigatórios:
      - email: E-mail do usuário.
      - password: Senha do usuário.
    - Exemplo de Payload:
      ```json
      {
        "email": "johndoe@example.com",
        "password": "senha123"
      }
      ```
  - Resposta:
    - Status 200 (OK) em caso de sucesso, com o token JWT no corpo da resposta.
    - Status 400 (Bad Request) se algum campo obrigatório estiver faltando ou se o e-mail/senha estiverem incorretos.

#### Movimentações Financeiras

- Rota: POST /user/movement
  - Descrição: Cria uma nova movimentação financeira para o usuário autenticado.
  - Requisição:
    - Parâmetros obrigatórios:
      - movementType: Tipo de movimento - revenue(receita) ou expense(despesa).
      - value: Valor da movimentação.
      - description: Descrição da movimentação.
    - Requer autenticação JWT.
    - Exemplo de Payload:
      ```json
      {
        "movementType": "revenue",
        "value": "100.00",
        "description": "Salário"
      }
      ```
  - Resposta:
    - Status 201 (Created) em caso de sucesso.
    - Status 400 (Bad Request) se algum campo obrigatório estiver faltando.

- Rota: PUT /user/movement/:id
  - Descrição: Atualiza uma movimentação financeira existente do usuário autenticado.
  - Requisição:
    - Parâmetros obrigatórios:
      - movementType: Tipo de movimento (revenue ou expense).
      - value: Valor da movimentação.
      - description: Descrição da movimentação.
    - Parâmetros de rota: id (ID da movimentação).
    - Requer autenticação JWT.
    - Exemplo de Payload:
      ```json
      {
        "movementType": "expense",
        "value": "50.00",
        "description": "Compra de alimentos"
      }
      ```
  - Resposta:
    - Status 200 (OK) em caso de sucesso.
    - Status 400 (Bad Request) se algum campo obrigatório estiver faltando ou se a movimentação não for encontrada.

- Rota: DELETE /user/movement/:id
  - Descrição: Exclui uma movimentação financeira do usuário autenticado.
  - Requisição:
    - Parâmetros de rota: id (ID da movimentação).
    - Requer autenticação JWT.
  - Resposta:
    - Status 200 (OK) em caso de sucesso.
    - Status 400 (Bad Request) se o ID da movimentação não for fornecido ou se a movimentação não for encontrada.

- Rota: GET /user/movements
  - Descrição: Lista as movimentações financeiras do usuário autenticado.
  - Requisição:
    - Requer autenticação JWT.
    - Parâmetros de consulta opcionais: startDate (data inicial) e endDate (data final) para filtro por data, page e pageSize para paginação.
  - Resposta:
    - Status 200 (OK) em caso de sucesso, com a lista de movimentações no corpo da resposta.
    - Status 400 (Bad Request) se ocorrer algum erro durante a busca das movimentações.

- Rota: GET /user/balance
  - Descrição: Retorna o saldo atual do usuário autenticado.
  - Requisição:
    - Requer autenticação JWT.
  - Resposta:
    - Status 200 (OK) em caso de sucesso, com o saldo no corpo da resposta.
    - Status 400 (Bad Request) se ocorrer algum erro durante o cálculo do saldo.

### Relacionamento do Banco de Dados
O banco de dados utilizado nesta API é o MySQL, e o relacionamento entre as entidades é definido da seguinte maneira:

#### Tabelas:
1. **users**: Armazena informações dos usuários registrados na aplicação, como nome, e-mail, senha criptografada e saldo.
2. **movements**: Registra as movimentações financeiras dos usuários, incluindo tipo de movimento (receita ou despesa), valor, descrição e data de criação.

#### Relacionamento:
- Cada usuário pode ter várias movimentações financeiras.
- A tabela `users` possui um relacionamento de "um para muitos" com a tabela `movements`.
- O campo `user_id` na tabela `movements` é uma chave estrangeira que referencia o ID do usuário relacionado.

Este modelo de banco de dados permite que cada usuário tenha várias movimentações financeiras associadas a ele, facilitando o controle e a organização das finanças pessoais.

