#!/bin/bash
# Executa os testes do backend com o ambiente correto
export ASPNETCORE_ENVIRONMENT=Test

# Exporta a chave JWT usada nos testes
export JWT_SECRET=super_secret_jwt_key_1234567890_abcdefg

dotnet test backend.Tests
