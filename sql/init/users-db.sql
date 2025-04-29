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
INSERT INTO roles (id, name, created_at) 
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ADMIN', CURRENT_TIMESTAMP),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'USER', CURRENT_TIMESTAMP);

-- Вставка тестового администратора (пароль: admin)
INSERT INTO users (id, username, password_hash, role_id, created_at)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
    'admin', 
    '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    CURRENT_TIMESTAMP
);