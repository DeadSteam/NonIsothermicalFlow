#!/bin/bash

# Создаем директорию для дампов, если она не существует
mkdir -p data/dumps

# Получаем текущую дату для имени файла
DATE=$(date +%Y%m%d_%H%M%S)

# Создаем дамп базы данных
docker exec postgres-container pg_dump -U postgres materials_db > data/dumps/materials_db_$DATE.sql

echo "Backup created: materials_db_$DATE.sql" 