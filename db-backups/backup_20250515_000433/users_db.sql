BEGIN;

-- Структура таблицы roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(20) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Данные таблицы roles
INSERT INTO roles (id, name, created_at) VALUES (f6170b8c-0d15-43cd-bc03-0fb4fe6d7be0, 'ADMIN', '2025-05-14 23:58:43.336489');
INSERT INTO roles (id, name, created_at) VALUES (ab6cc950-82f6-4d30-aa02-e96b8d669bc6, 'USER', '2025-05-14 23:58:59.191017');

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
INSERT INTO users (id, username, password_hash, role_id, created_at) VALUES (0c953231-65ef-4396-832f-ee5e761835d3, 'admin', '$2a$10$2feWgkwvTPGWnxKTrYRVZOFPNsvQviLm5hyiPaun3C55aidKKRx2G', f6170b8c-0d15-43cd-bc03-0fb4fe6d7be0, '2025-05-14 23:58:43.34149');
INSERT INTO users (id, username, password_hash, role_id, created_at) VALUES (7cc50884-a16e-41f8-8bf2-d67132057566, 'maksim', '$2a$10$jd8Z7EWS7gX.zB8TgdU25uYBMfBChrCGOY2UPZUwa5o0DNXQeM3Ny', ab6cc950-82f6-4d30-aa02-e96b8d669bc6, '2025-05-14 23:58:59.194018');

ALTER TABLE users ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);

COMMIT;
