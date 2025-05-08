-- Инициализация базы данных пользователей (users-db)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица ролей
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- Индексы
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_role_id ON users (role_id);

-- Вставка базовых ролей
-- Создание ролей
-- Создание ролей
INSERT INTO roles (id, name) VALUES
                                 ('1b3c2a4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', 'ADMIN'),
                                 ('2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', 'USER')
ON CONFLICT (id) DO NOTHING;

-- Создание администратора (пароль: admin123)
INSERT INTO users (id, username, password_hash, role_id, created_at)
VALUES (
           '3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a',
           'admin',
           '$2a$10$rYTJWZNXhwqKxE0KxMKOyeB9g3h1qRxB.LqO1yoQGUwAHQGp.ZKdG',
           '1b3c2a4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d',
           CURRENT_TIMESTAMP
       )
ON CONFLICT (username) DO NOTHING;