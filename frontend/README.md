# Frontend - Desafio Fullstack .NET + React

Este projeto é o frontend da aplicação do desafio Fullstack, desenvolvido com React e Vite.

## Estrutura
- **src/**: Código-fonte principal
  - **Components/**: Componentes reutilizáveis
  - **Pages/**: Páginas da aplicação
  - **Interfaces/**: Tipos e interfaces TypeScript
  - **services/**: Serviços para integração com backend
- **public/**: Arquivos estáticos
- **index.html**: Arquivo HTML principal

## Requisitos
- Node.js >= 18
- npm >= 9

## Instalação
```bash
cd frontend
npm install
```

## Executando em modo desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

## Build para produção
```bash
npm run build
```

## Lint e formatação
```bash
npm run lint
npm run format
```

## Configuração de ambiente
- Variáveis de ambiente podem ser definidas em `.env` na raiz do projeto.

## Docker
O projeto pode ser executado via Docker utilizando o `Dockerfile.frontend` na raiz do workspace.

## Observações
- O frontend consome a API do backend .NET.
- Para funcionamento completo, certifique-se que o backend está rodando.

## Scripts úteis
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera os arquivos para produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código
