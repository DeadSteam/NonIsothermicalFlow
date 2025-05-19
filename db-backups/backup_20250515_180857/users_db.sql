BEGIN;

-- Структура таблицы roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(20) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Данные таблицы roles
INSERT INTO roles (id, name, created_at) VALUES (1b3c2a4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d, 'ADMIN', '2025-05-15 13:14:09.829829');
INSERT INTO roles (id, name, created_at) VALUES (2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f, 'USER', '2025-05-15 13:14:09.829829');

-- Структура таблицы users
CREATE TABLE IF NOT EXISTS users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username varchar(20) NOT NULL,
  password_hash varchar(255) NOT NULL,
  role_id uuid NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Данные таблицы users
INSERT INTO users (id, username, password_hash, role_id, created_at) VALUES (6740dacc-35ee-4510-9e56-0de785251a5c, 'admin', '$2a$10$DhtsZnQIBmOqJ/rHweH48e2bm99tnvC3wUgASs1WoHa/cONi1Bwm.', 1b3c2a4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d, '2025-05-15 16:15:55.241028');
INSERT INTO users (id, username, password_hash, role_id, created_at) VALUES (05b9d1de-77dc-4ed9-85a5-9ce403e66c6f, 'nikita', '$2a$10$hyAJCDWTy0v7p0/S0nzDhu6/HVHv1yCxv9RcFRoIx5KHymUtcW51W', 2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f, '2025-05-15 16:54:36.97928');

ALTER TABLE users ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);

COMMIT;
