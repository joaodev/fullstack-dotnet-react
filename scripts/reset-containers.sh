
#!/bin/bash
# Script para derrubar e rebuildar os containers no Docker
cd "$(dirname "$0")"

docker-compose down -v
docker-compose up -d --build

echo "Containers derrubados e recriados!"
