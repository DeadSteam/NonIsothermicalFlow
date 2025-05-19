BEGIN;

-- Структура таблицы empirical_coefficients
CREATE TABLE IF NOT EXISTS empirical_coefficients (
  id_coefficient uuid NOT NULL DEFAULT uuid_generate_v4(),
  coefficient_name varchar(50) NOT NULL,
  unit_of_measurement varchar(10) NOT NULL,
  PRIMARY KEY (id_coefficient)
);

-- Данные таблицы empirical_coefficients
INSERT INTO empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) VALUES (10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14, 'Коэффициент консистенции ', 'Па·сn');
INSERT INTO empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) VALUES (20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15, 'Первая константа ВЛФ ', '-');
INSERT INTO empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) VALUES (30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16, 'Вторая константа уравнения ВЛФ ', '°С');
INSERT INTO empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) VALUES (40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17, 'Температура приведения', '°С');
INSERT INTO empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) VALUES (50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18, 'Индекс течения', '-');
INSERT INTO empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) VALUES (60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19, 'Коэффициент теплоотдачи ', 'Вт/(м2·°С)');

-- Структура таблицы material_coefficient
CREATE TABLE IF NOT EXISTS material_coefficient (
  id_material uuid NOT NULL,
  id_coefficient uuid NOT NULL,
  coefficient_value float8 NOT NULL,
  PRIMARY KEY (id_material, id_coefficient)
);

-- Данные таблицы material_coefficient
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14, 8390.0);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14, 7500.0);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15, 17.4);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15, 28.2);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16, 51.6);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16, 24.7);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17, 280.0);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17, 267.0);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18, 0.64);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18, 0.5);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19, 350.0);
INSERT INTO material_coefficient (id_material, id_coefficient, coefficient_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19, 200.0);

-- Структура таблицы material_properties
CREATE TABLE IF NOT EXISTS material_properties (
  id_property uuid NOT NULL DEFAULT uuid_generate_v4(),
  property_name varchar(50) NOT NULL,
  unit_of_measurement varchar(10) NOT NULL,
  PRIMARY KEY (id_property)
);

-- Данные таблицы material_properties
INSERT INTO material_properties (id_property, property_name, unit_of_measurement) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14, 'Плотность', 'кг/м³');
INSERT INTO material_properties (id_property, property_name, unit_of_measurement) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15, 'Удельная теплоемкость', 'Дж/(кг·°С)');
INSERT INTO material_properties (id_property, property_name, unit_of_measurement) VALUES (c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16, 'Температура стеклования', '°С');
INSERT INTO material_properties (id_property, property_name, unit_of_measurement) VALUES (d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17, 'Температура плавления', '°С');

-- Структура таблицы material_property
CREATE TABLE IF NOT EXISTS material_property (
  id_material uuid NOT NULL,
  id_property uuid NOT NULL,
  property_value float8 NOT NULL,
  PRIMARY KEY (id_material, id_property)
);

-- Данные таблицы material_property
INSERT INTO material_property (id_material, id_property, property_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14, 1200.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14, 900.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15, 1400.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15, 1080.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16, 150.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16, 100.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17, 230.0);
INSERT INTO material_property (id_material, id_property, property_value) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17, 180.0);

-- Структура таблицы materials
CREATE TABLE IF NOT EXISTS materials (
  id_material uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(50) NOT NULL,
  material_type varchar(50) NOT NULL,
  PRIMARY KEY (id_material)
);

-- Данные таблицы materials
INSERT INTO materials (id_material, name, material_type) VALUES (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11, 'Поликарбонат', '23ERT78');
INSERT INTO materials (id_material, name, material_type) VALUES (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12, 'Полипропилен', 'HFRT56');
INSERT INTO materials (id_material, name, material_type) VALUES (2ea79ce2-a577-4094-92ed-7d46ce57668d, '12', '12');

ALTER TABLE material_coefficient ADD CONSTRAINT material_coefficient_id_coefficient_fkey FOREIGN KEY (id_coefficient) REFERENCES empirical_coefficients(id_coefficient);
ALTER TABLE material_coefficient ADD CONSTRAINT material_coefficient_id_material_fkey FOREIGN KEY (id_material) REFERENCES materials(id_material);
ALTER TABLE material_property ADD CONSTRAINT material_property_id_property_fkey FOREIGN KEY (id_property) REFERENCES material_properties(id_property);
ALTER TABLE material_property ADD CONSTRAINT material_property_id_material_fkey FOREIGN KEY (id_material) REFERENCES materials(id_material);

COMMIT;
