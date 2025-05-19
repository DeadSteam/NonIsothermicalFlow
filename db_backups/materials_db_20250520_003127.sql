--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: empirical_coefficients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empirical_coefficients (
    id_coefficient uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    coefficient_name character varying(50) NOT NULL,
    unit_of_measurement character varying(10) NOT NULL
);


--
-- Name: material_coefficient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_coefficient (
    id_material uuid NOT NULL,
    id_coefficient uuid NOT NULL,
    coefficient_value double precision NOT NULL
);


--
-- Name: material_properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_properties (
    id_property uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_name character varying(50) NOT NULL,
    unit_of_measurement character varying(10) NOT NULL
);


--
-- Name: material_property; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_property (
    id_material uuid NOT NULL,
    id_property uuid NOT NULL,
    property_value double precision NOT NULL
);


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materials (
    id_material uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    material_type character varying(50) NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: empirical_coefficients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) FROM stdin;
10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	Коэффициент консистенции 	Па·сn
20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	Первая константа ВЛФ 	-
30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16	Вторая константа уравнения ВЛФ 	°С
40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	Температура приведения	°С
50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18	Индекс течения	-
60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19	Коэффициент теплоотдачи 	Вт/(м2·°С)
\.


--
-- Data for Name: material_coefficient; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.material_coefficient (id_material, id_coefficient, coefficient_value) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	8390
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	10eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	7500
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	17.4
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	20eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	28.2
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16	51.6
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	30eebc99-9c0b-4ef8-bb6d-6bb9bd380a16	24.7
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	280
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	40eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	267
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18	0.64
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	50eebc99-9c0b-4ef8-bb6d-6bb9bd380a18	0.5
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19	350
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	60eebc99-9c0b-4ef8-bb6d-6bb9bd380a19	200
\.


--
-- Data for Name: material_properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.material_properties (id_property, property_name, unit_of_measurement) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	Плотность	кг/м³
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	Удельная теплоемкость	Дж/(кг·°С)
c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16	Температура стеклования	°С
d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	Температура плавления	°С
\.


--
-- Data for Name: material_property; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.material_property (id_material, id_property, property_value) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	1200
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	900
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	1400
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	1080
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16	150
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16	100
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	230
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	180
7dc29a0f-bfe4-40a6-864d-10ae6d8aa8d9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14	1
7dc29a0f-bfe4-40a6-864d-10ae6d8aa8d9	b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15	1
7dc29a0f-bfe4-40a6-864d-10ae6d8aa8d9	d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17	1
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.materials (id_material, name, material_type) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Поликарбонат	23ERT78
b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12	Полипропилен	HFRT56
7dc29a0f-bfe4-40a6-864d-10ae6d8aa8d9	888	888
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, role_id, created_at) FROM stdin;
\.


--
-- Name: empirical_coefficients empirical_coefficients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empirical_coefficients
    ADD CONSTRAINT empirical_coefficients_pkey PRIMARY KEY (id_coefficient);


--
-- Name: material_coefficient material_coefficient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT material_coefficient_pkey PRIMARY KEY (id_material, id_coefficient);


--
-- Name: material_properties material_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_properties
    ADD CONSTRAINT material_properties_pkey PRIMARY KEY (id_property);


--
-- Name: material_property material_property_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT material_property_pkey PRIMARY KEY (id_material, id_property);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id_material);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_coefficient_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coefficient_name ON public.empirical_coefficients USING btree (coefficient_name);


--
-- Name: idx_material_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_material_name ON public.materials USING btree (name);


--
-- Name: idx_material_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_material_type ON public.materials USING btree (material_type);


--
-- Name: idx_property_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_name ON public.material_properties USING btree (property_name);


--
-- Name: material_coefficient material_coefficient_id_coefficient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT material_coefficient_id_coefficient_fkey FOREIGN KEY (id_coefficient) REFERENCES public.empirical_coefficients(id_coefficient) ON DELETE CASCADE;


--
-- Name: material_coefficient material_coefficient_id_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT material_coefficient_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.materials(id_material) ON DELETE CASCADE;


--
-- Name: material_property material_property_id_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT material_property_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.materials(id_material) ON DELETE CASCADE;


--
-- Name: material_property material_property_id_property_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT material_property_id_property_fkey FOREIGN KEY (id_property) REFERENCES public.material_properties(id_property) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

