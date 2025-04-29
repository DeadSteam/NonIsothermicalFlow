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

-- Создание индексов
CREATE INDEX idx_material_name ON materials (name);
CREATE INDEX idx_material_type ON materials (material_type);
CREATE INDEX idx_property_name ON material_properties (property_name);
CREATE INDEX idx_coefficient_name ON empirical_coefficients (coefficient_name);
