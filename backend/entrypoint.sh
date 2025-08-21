#!/bin/bash
export PATH="$PATH:/root/.dotnet/tools"
set -e

# Função para log
log() {
    echo "[entrypoint] $1"
}

# Instala dotnet-ef se não estiver disponível
if ! command -v dotnet-ef &> /dev/null; then
        log "Instalando dotnet-ef..."
        dotnet tool install --global dotnet-ef
        export PATH="$PATH:/root/.dotnet/tools"
fi

# Aguarda o banco de dados estar disponível
log "Aguardando banco de dados..."
until nc -z -v -w30 "$DB_HOST" "$DB_PORT"; do
    log "Banco de dados não disponível em $DB_HOST:$DB_PORT. Aguardando..."
    sleep 2
done
log "Banco de dados disponível!"

# Executa as migrations
log "Executando migrations..."
/root/.dotnet/tools/dotnet-ef database update --project /app/Backend.csproj || dotnet ef database update --project /app/Backend.csproj

log "Migrations executadas. Iniciando aplicação com hot reload..."
exec dotnet watch run --urls http://*:5000
