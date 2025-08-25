# Backend - API Fullstack .NET/React

## Visão Geral
API RESTful para gestão de produtos, departamentos e usuários, com autenticação JWT e integração opcional com RabbitMQ. Desenvolvida em ASP.NET Core, arquitetura limpa e documentação OpenAPI/Swagger.

## Estrutura de Pastas
- **Data/**: Contexto do banco de dados (`AppDbContext`).
- **Factories/**: Fábricas para instanciar entidades e conexões (`DepartmentFactory`, `ProductFactory`, `UserFactory`, `RabbitMqConnectionFactory`).
- **Interfaces/**: Contratos para as fábricas (`IDepartmentFactory`, `IProductFactory`, `IUserFactory`).
- **Models/**: Modelos de dados (`Department`, `Product`, `User`).
- **Repositories/**: Repositórios para acesso a dados (`DepartmentRepository`, `ProductRepository`, `UserRepository`).
- **Router/**: Endpoints da API (`DepartmentsEndpoints`, `ProductsEndpoints`, `UsersEndpoints`, `LoginEndpoints`, `MensagensEndpoints`).
- **Services/**: Serviços de integração RabbitMQ (`RabbitMqConsumerService`, `RabbitMqTestConnection`).

## Principais Componentes
### Models
- `Department`: Entidade de departamento.
- `Product`: Entidade de produto.
- `User`: Entidade de usuário.

### Repositories
- `DepartmentRepository`, `ProductRepository`, `UserRepository`: CRUD e lógica de acesso aos dados.

### Factories
- Criam instâncias das entidades e conexões.

### Services
- `RabbitMqConsumerService`: Consome mensagens de fila RabbitMQ.
- `RabbitMqTestConnection`: Testa conexão com RabbitMQ.

### Endpoints REST
- `/departamentos`: Listar, criar, atualizar, deletar departamentos.
- `/produtos`: Listar, criar, atualizar, deletar produtos.
- `/usuarios`: Listar, criar, atualizar, deletar usuários.
- `/login`: Autenticação JWT.
- `/mensagens/rabbitmq`: Leitura de mensagens RabbitMQ.

## Documentação OpenAPI/Swagger
- Disponível em `/swagger` quando rodando em ambiente de desenvolvimento.
- Exemplos de payloads e respostas automáticos.

## Exemplos de Requisições

### Autenticação (Login)
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Listar Departamentos
```bash
curl -X GET http://localhost:5000/departamentos \
  -H "Authorization: Bearer <seu_jwt_token>"
```

### Criar Produto
```bash
curl -X POST http://localhost:5000/produtos \
  -H "Authorization: Bearer <seu_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Produto X", "price": 99.99, "departmentId": 1}'
```

### Ler Mensagens RabbitMQ
```bash
curl -X GET http://localhost:5000/mensagens/rabbitmq \
  -H "Authorization: Bearer <seu_jwt_token>"
```

## Variáveis de Ambiente

| Variável             | Descrição                                 | Exemplo                      |
|----------------------|-------------------------------------------|------------------------------|
| JWT_SECRET           | Segredo para geração/validação do JWT     | supersegredo123              |
| DB_CONNECTION_STRING | String de conexão com o banco de dados    | Host=localhost;...           |
| RABBITMQ_HOST        | Host do RabbitMQ                          | localhost                    |
| RABBITMQ_USER        | Usuário do RabbitMQ                       | guest                        |
| RABBITMQ_PASS        | Senha do RabbitMQ                         | guest                        |

## CI/CD

### Exemplo de Workflow (GitHub Actions)
```yaml
name: Backend CI
on:
  push:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: appdb
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: [5432:5432]
      rabbitmq:
        image: rabbitmq:3-management
        ports: [5672:5672, 15672:15672]
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - name: Restore
        run: dotnet restore backend/Backend.csproj
      - name: Build
        run: dotnet build backend/Backend.csproj --no-restore
      - name: Test
        run: dotnet test backend.Tests/backend.Tests.csproj --no-build
```

## Modos de Execução
### 1. Local
- Instale o .NET SDK 8.0.
- Configure variáveis de ambiente (`.env` ou export):
  - `JWT_SECRET`, `DB_CONNECTION_STRING`, `RABBITMQ_HOST`, etc.
- Execute:
  ```bash
  dotnet run --project backend/Backend.csproj
  ```
- Acesse a API em `http://localhost:5000`.

### 2. Docker
- Edite o arquivo `.env` conforme necessário.
- Execute:
  ```bash
  docker compose up -d --build
  ```
- Acesse a API conforme configuração do container.

### 3. Testes Automatizados
- Execute os testes:
  ```bash
  dotnet test backend.Tests/backend.Tests.csproj
  ```
- Os testes cobrem endpoints REST, autenticação JWT e cenários de negócio.

## Observações
- JWT é obrigatório para autenticação dos endpoints protegidos.
- RabbitMQ é opcional e pode ser desabilitado/removido dos testes.
- O backend segue boas práticas de arquitetura, separando modelos, repositórios, serviços e endpoints.
- Documentação dos métodos e classes disponível via comentários XML no código.

---
Documentação gerada automaticamente a partir do código-fonte e comentários.
