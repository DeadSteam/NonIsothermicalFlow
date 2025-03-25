#!/bin/bash

# Проверяем, указан ли файл дампа
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <dump_file>"
    echo "Example: ./restore.sh materials_db_20240325_123456.sql"
    echo "         ./restore.sh users_db_20240325_123456.sql"
    exit 1
fi

# Проверяем существование файла
if [ ! -f "data/dumps/$1" ]; then
    echo "Dump file not found: data/dumps/$1"
    exit 1
fi

# Определяем, какую базу данных восстанавливаем
if [[ $1 == materials_db_* ]]; then
    DB_NAME="materials_db"
    CONTAINER="postgres-materials-container"
elif [[ $1 == users_db_* ]]; then
    DB_NAME="users_db"
    CONTAINER="postgres-users-container"
else
    echo "Invalid dump file name. Must start with 'materials_db_' or 'users_db_'"
    exit 1
fi

# Восстанавливаем базу данных
docker exec -i $CONTAINER psql -U postgres $DB_NAME < data/dumps/$1

echo "Database $DB_NAME restored from: $1" 