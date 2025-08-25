#!/bin/bash
# Script para rebuildar e reiniciar os containers no Docker
cd "$(dirname "$0")"

docker-compose up -d --build

echo "Containers atualizados e reiniciados!"
