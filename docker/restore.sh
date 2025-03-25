#!/bin/bash

# Проверяем, указан ли файл дампа
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <dump_file>"
    echo "Example: ./restore.sh materials_db_20240325_123456.sql"
    exit 1
fi

# Проверяем существование файла
if [ ! -f "data/dumps/$1" ]; then
    echo "Dump file not found: data/dumps/$1"
    exit 1
fi

# Восстанавливаем базу данных
docker exec -i postgres-container psql -U postgres materials_db < data/dumps/$1

echo "Database restored from: $1" 