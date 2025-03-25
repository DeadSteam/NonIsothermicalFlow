#!/bin/bash

# Создаем директорию для дампов, если она не существует
mkdir -p data/dumps

# Получаем текущую дату для имени файла
DATE=$(date +%Y%m%d_%H%M%S)

# Создаем дамп базы данных материалов
echo "Creating backup for materials_db..."
docker exec postgres-materials-container pg_dump -U postgres materials_db > data/dumps/materials_db_$DATE.sql

# Создаем дамп базы данных пользователей
echo "Creating backup for users_db..."
docker exec postgres-users-container pg_dump -U postgres users_db > data/dumps/users_db_$DATE.sql

# Проверяем успешность создания дампов
if [ -f "data/dumps/materials_db_$DATE.sql" ] && [ -f "data/dumps/users_db_$DATE.sql" ]; then
    echo "Backups created successfully:"
    echo "- materials_db_$DATE.sql"
    echo "- users_db_$DATE.sql"
    echo "Backup location: $(pwd)/data/dumps/"
else
    echo "Error: Failed to create backups"
    exit 1
fi 