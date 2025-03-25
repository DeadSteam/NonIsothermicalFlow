# NonIsothermicalFlow

Проект для расчета нестационарного теплового потока.

## Требования

- Docker
- Docker Compose
- Git

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <ваш-репозиторий>
cd <директория-проекта>
```

2. Создайте необходимые директории:
```bash
mkdir -p docker/data/postgres-data
mkdir -p docker/data/redis-data
mkdir -p docker/data/dumps
```

3. Сделайте скрипты исполняемыми:
```bash
chmod +x docker/backup.sh
chmod +x docker/restore.sh
```

4. Запустите контейнеры:
```bash
docker-compose up -d
```

5. Восстановите базу данных из последнего дампа:
```bash
cd docker
./restore.sh materials_db_YYYYMMDD_HHMMSS.sql  # замените на имя последнего дампа
```

## Работа с базой данных

### Создание резервной копии
```bash
cd docker
./backup.sh
```

### Восстановление из резервной копии
```bash
cd docker
./restore.sh <имя-файла-дампа>
```

## Структура проекта

- `docker/data/dumps/` - директория с дампами базы данных
- `docker/data/postgres-data/` - данные PostgreSQL
- `docker/data/redis-data/` - данные Redis
- `src/` - исходный код приложения 