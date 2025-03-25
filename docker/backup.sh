#!/bin/bash

# Создаем директорию для дампов, если она не существует
mkdir -p data/dumps

# Получаем текущую дату для имени файла
DATE=$(date +%Y%m%d_%H%M%S)

# Создаем дамп базы данных материалов
docker exec postgres-materials-container pg_dump -U postgres materials_db > data/dumps/materials_db_$DATE.sql

# Создаем дамп базы данных пользователей
docker exec postgres-users-container pg_dump -U postgres users_db > data/dumps/users_db_$DATE.sql

echo "Backups created:"
echo "- materials_db_$DATE.sql"
echo "- users_db_$DATE.sql" 