# Desafio Fullstack .NET + React

Este repositório contém uma aplicação fullstack composta por backend em .NET e frontend em React, além de scripts e configurações para facilitar o desenvolvimento e deploy.

## Estrutura do Projeto

- **backend/**: API desenvolvida em .NET
- **backend.Tests/**: Testes automatizados do backend
- **frontend/**: Aplicação web em React + Vite
- **Dockerfile.backend / Dockerfile.frontend**: Imagens Docker para backend e frontend
- **docker-compose.yml**: Orquestração dos serviços
- **nginx-fix.conf / nginx.conf**: Configurações do Nginx
- **scripts (.sh)**: Scripts para automação de tarefas

## Requisitos
- Docker e Docker Compose
- Node.js >= 18 (para desenvolvimento do frontend)
- .NET 8 SDK (para desenvolvimento do backend)

## Como executar o projeto

### Usando Docker Compose
```bash
docker compose up -d --build
```
Após o build, é criado um usuário para testes:
Usuário: admin@local.com
Senha: Admin#20205

Acesse o frontend em http://localhost:8080/ 
Rotas para a api em http://localhost:8080/api/

### Executando manualmente
#### Backend
```bash
cd backend
dotnet run
```
#### Frontend
```bash
cd frontend
npm install
npm run dev
```
## Testes
### Backend
```bash
cd backend.Tests
dotnet test
```
## Scripts úteis
- `rebuild-containers.sh`: Reconstrói os containers Docker
- `reset-containers.sh`: Reseta o ambiente Docker
- `test-backend.sh`: Executa os testes do backend
- `wait-for-postgres.sh`: Aguarda o banco de dados iniciar

## Observações
- O frontend consome a API do backend.
- As configurações de ambiente podem ser ajustadas nos arquivos `.json` e `.env`.
- Consulte os READMEs das pastas `backend/` e `frontend/` para instruções detalhadas.

## Licença
Este projeto é apenas para fins de estudo/desafio.
