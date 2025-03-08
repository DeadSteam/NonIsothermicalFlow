CREATE TABLE materials (
                           id_material SERIAL PRIMARY KEY,
                           name VARCHAR(255) NOT NULL,
                           chemical_composition TEXT,
                           material_type VARCHAR(255)
);

CREATE TABLE properties (
                            id_property SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            unit VARCHAR(50),
                            value DOUBLE PRECISION
);

CREATE TABLE coefficients (
                              id_coefficient SERIAL PRIMARY KEY,
                              name VARCHAR(255) NOT NULL,
                              formula TEXT
);

CREATE TABLE material_properties (
                                     id_material_property SERIAL PRIMARY KEY,
                                     id_material BIGINT REFERENCES materials(id_material),
                                     id_property BIGINT REFERENCES properties(id_property),
                                     value DOUBLE PRECISION
);

CREATE TABLE property_coefficients (
                                       id_property_coefficient SERIAL PRIMARY KEY,
                                       id_property BIGINT REFERENCES properties(id_property),
                                       id_coefficient BIGINT REFERENCES coefficients(id_coefficient)
);