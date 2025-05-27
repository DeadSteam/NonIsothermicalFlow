# Технический контекст проекта

## Стек технологий

### Бэкенд
- Java 23
- Spring Boot 3.2.3
- Spring Security с JWT аутентификацией
- Spring Data JPA
- PostgreSQL 15
- Docker для контейнеризации

### Фронтенд
- TypeScript
- React
- Material-UI
- Axios для HTTP-запросов
- React Router для маршрутизации

### Инфраструктура
- Docker и Docker Compose для оркестрации
- Nginx для обратного прокси
- PostgreSQL для баз данных
- Docker volumes для персистентности данных

## Конфигурация Docker

### Контейнеры
1. `postgres-materials-container`: База данных материалов
   - Порт: 5432
   - Volume: postgres-materials-data

2. `postgres-users-container`: База данных пользователей
   - Порт: 5432
   - Volume: postgres-users-data

3. `backend-container`: Spring Boot приложение
   - Порт: 8080
   - Volume: db-backups для резервных копий

4. `frontend-container`: React приложение
   - Порт: 80

### Сети
- `app-network`: Общая сеть для всех контейнеров

## Базы данных

### Materials DB
- Таблицы для материалов и их свойств
- Эмпирические коэффициенты
- Значения свойств материалов

### Users DB
- Пользователи и их роли
- Аутентификация
- Авторизация

## Резервное копирование
- Автоматическое создание резервных копий
- Хранение в директории `db_backups`
- Возможность восстановления данных
- Поддержка обеих баз данных 