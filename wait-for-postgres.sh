#!/bin/bash

set -e

host="$1"
port="$2"
user="$3"
db="$4"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "$user" -p "$port" -d "$db" -c '\q' 2>/dev/null; do
  echo "Aguardando o PostgreSQL ($host:$port)..."
  sleep 2
done

echo "PostgreSQL está pronto!"
