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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: empirical_coefficients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empirical_coefficients (
    id_coefficient uuid DEFAULT gen_random_uuid() NOT NULL,
    coefficient_name character varying(255) NOT NULL,
    unit_of_measurement character varying(50) NOT NULL
);


ALTER TABLE public.empirical_coefficients OWNER TO postgres;

--
-- Name: material_coefficient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_coefficient (
    id_material uuid NOT NULL,
    id_coefficient uuid NOT NULL,
    coefficient_value double precision NOT NULL
);


ALTER TABLE public.material_coefficient OWNER TO postgres;

--
-- Name: material_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_properties (
    id_property uuid DEFAULT gen_random_uuid() NOT NULL,
    property_name character varying(255) NOT NULL,
    unit_of_measurement character varying(50) NOT NULL
);


ALTER TABLE public.material_properties OWNER TO postgres;

--
-- Name: material_property; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_property (
    id_material uuid NOT NULL,
    id_property uuid NOT NULL,
    property_value double precision NOT NULL
);


ALTER TABLE public.material_property OWNER TO postgres;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id_material uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    material_type character varying(255) NOT NULL
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Data for Name: empirical_coefficients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) FROM stdin;
b0b74b4d-5b91-4834-986a-a8a16553c127	consistency_reduction_temperature	Pa*cn
54f2bd03-4fa4-4c5e-8485-ee51295b8c7f	casting_temperature	°С
40e70b5e-d119-460e-b518-fb1ac94fbc7e	material_flow_index	-
f1d5b256-9ff9-4f1d-be47-c3218d5dd09b	coefficient_of_heat_transfer	Вт/(м2·°С)
e2e7eff8-c923-45c6-b083-6097c531b8d5	 first_constant_glasstransition	-
7af39a30-3d15-4b59-8f0e-1ce7d17a2aae	 second_constant_glasstransition	°С
\.


--
-- Data for Name: material_coefficient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_coefficient (id_material, id_coefficient, coefficient_value) FROM stdin;
\.


--
-- Data for Name: material_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_properties (id_property, property_name, unit_of_measurement) FROM stdin;
\.


--
-- Data for Name: material_property; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_property (id_material, id_property, property_value) FROM stdin;
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id_material, name, material_type) FROM stdin;
\.


--
-- Name: empirical_coefficients empirical_coefficients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empirical_coefficients
    ADD CONSTRAINT empirical_coefficients_pkey PRIMARY KEY (id_coefficient);


--
-- Name: material_coefficient material_coefficient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT material_coefficient_pkey PRIMARY KEY (id_material, id_coefficient);


--
-- Name: material_properties material_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_properties
    ADD CONSTRAINT material_properties_pkey PRIMARY KEY (id_property);


--
-- Name: material_property material_property_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT material_property_pkey PRIMARY KEY (id_material, id_property);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id_material);


--
-- Name: material_coefficient material_coefficient_id_coefficient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT material_coefficient_id_coefficient_fkey FOREIGN KEY (id_coefficient) REFERENCES public.empirical_coefficients(id_coefficient) ON DELETE CASCADE;


--
-- Name: material_coefficient material_coefficient_id_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT material_coefficient_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.materials(id_material) ON DELETE CASCADE;


--
-- Name: material_property material_property_id_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT material_property_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.materials(id_material) ON DELETE CASCADE;


--
-- Name: material_property material_property_id_property_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT material_property_id_property_fkey FOREIGN KEY (id_property) REFERENCES public.material_properties(id_property) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

