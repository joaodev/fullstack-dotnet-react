#!/bin/bash
# Executa os testes do backend com o ambiente correto
export ASPNETCORE_ENVIRONMENT=Test
dotnet test backend.Tests
