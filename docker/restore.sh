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
    echo "Error: Dump file not found: data/dumps/$1"
    echo "Available dumps:"
    ls -l data/dumps/
    exit 1
fi

# Определяем, какую базу данных восстанавливаем
if [[ $1 == materials_db_* ]]; then
    DB_NAME="materials_db"
    CONTAINER="postgres-materials-container"
    echo "Restoring materials database..."
elif [[ $1 == users_db_* ]]; then
    DB_NAME="users_db"
    CONTAINER="postgres-users-container"
    echo "Restoring users database..."
else
    echo "Error: Invalid dump file name. Must start with 'materials_db_' or 'users_db_'"
    exit 1
fi

# Проверяем, запущен ли контейнер
if ! docker ps | grep -q $CONTAINER; then
    echo "Error: Container $CONTAINER is not running"
    exit 1
fi

# Восстанавливаем базу данных
echo "Restoring database $DB_NAME from: $1"
docker exec -i $CONTAINER psql -U postgres $DB_NAME < data/dumps/$1

# Проверяем успешность восстановления
if [ $? -eq 0 ]; then
    echo "Database $DB_NAME restored successfully"
else
    echo "Error: Failed to restore database"
    exit 1
fi 