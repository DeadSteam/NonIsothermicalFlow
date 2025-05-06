-- Инициализация базы данных материалов (materials-db)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица материалов
CREATE TABLE materials (
ID_material UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(50) NOT NULL,
material_type VARCHAR(50) NOT NULL
);

-- Таблица свойств материалов
CREATE TABLE material_properties (
ID_property UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
property_name VARCHAR(50) NOT NULL,
unit_of_measurement VARCHAR(10) NOT NULL
);

-- Таблица эмпирических коэффициентов
CREATE TABLE empirical_coefficients (
ID_coefficient UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
coefficient_name VARCHAR(50) NOT NULL,
unit_of_measurement VARCHAR(10) NOT NULL
);

-- Таблица значений свойств материалов (связь многие-ко-многим)
CREATE TABLE material_property (
ID_material UUID NOT NULL,
ID_property UUID NOT NULL,
property_value DOUBLE PRECISION NOT NULL,
PRIMARY KEY (ID_material, ID_property),
FOREIGN KEY (ID_material) REFERENCES materials (ID_material) ON DELETE CASCADE,
FOREIGN KEY (ID_property) REFERENCES material_properties (ID_property) ON DELETE CASCADE
);

-- Таблица значений коэффициентов материалов (связь многие-ко-многим)
CREATE TABLE material_coefficient (
ID_material UUID NOT NULL,
ID_coefficient UUID NOT NULL,
coefficient_value DOUBLE PRECISION NOT NULL,
PRIMARY KEY (ID_material, ID_coefficient),
FOREIGN KEY (ID_material) REFERENCES materials (ID_material) ON DELETE CASCADE,
FOREIGN KEY (ID_coefficient) REFERENCES empirical_coefficients (ID_coefficient) ON DELETE CASCADE
);

CREATE INDEX idx_material_name ON materials (name);
CREATE INDEX idx_material_type ON materials (material_type);
CREATE INDEX idx_property_name ON material_properties (property_name);
CREATE INDEX idx_coefficient_name ON empirical_coefficients (coefficient_name);


INSERT INTO materials (ID_material, name, material_type) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Поликарбонат', '23ERT78'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Полипропилен', 'HFRT56');

INSERT INTO material_properties (ID_property, property_name, unit_of_measurement) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Плотность', 'кг/м³'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Удельная теплоемкость', 'Дж/(кг·°С)'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Температура стеклования', '°С'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Температура плавления', '°С');

INSERT INTO empirical_coefficients (ID_coefficient, coefficient_name, unit_of_measurement) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Коэффициент консистенции ', 'Па·сn'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Первая константа ВЛФ ', '-'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Вторая константа уравнения ВЛФ ', '°С'),
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Температура приведения', '°С'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Индекс течения', '-'),
('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Коэффициент теплоотдачи ', 'Вт/(м2·°С)');

INSERT INTO material_property (ID_material, ID_property, property_value) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1200.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 900.0),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1400.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1080.0),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 150.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 100.0),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 230.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 180.0);

INSERT INTO material_coefficient (ID_material, ID_coefficient, coefficient_value) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 8390.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 7500.0),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 17.4),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 28.2),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 51.6),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 24.7),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 280.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 267.0),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 0.64),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 0.5),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 350.0),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 200.0);
