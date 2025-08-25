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
- `/api/login`: Autenticação JWT.
- `/api/departamentos`: Listar, criar, atualizar, deletar departamentos.
- `/api/produtos`: Listar, criar, atualizar, deletar produtos.
- `/api/usuarios`: Listar, criar, atualizar, deletar usuários.
- `/api/mensagens/rabbitmq`: Leitura de mensagens RabbitMQ.

Para utilização da API, deverá gerar o JWT através do endpoint /api/login

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
