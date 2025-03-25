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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: empirical_coefficients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empirical_coefficients (
    id_coefficient uuid NOT NULL,
    coefficient_name character varying(255) NOT NULL,
    unit_of_measurement character varying(50) NOT NULL
);


ALTER TABLE public.empirical_coefficients OWNER TO postgres;

--
-- Name: material_coefficient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_coefficient (
    coefficient_value double precision NOT NULL,
    id_coefficient uuid NOT NULL,
    id_material uuid NOT NULL
);


ALTER TABLE public.material_coefficient OWNER TO postgres;

--
-- Name: material_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_properties (
    id_property uuid NOT NULL,
    property_name character varying(255) NOT NULL,
    unit_of_measurement character varying(50) NOT NULL
);


ALTER TABLE public.material_properties OWNER TO postgres;

--
-- Name: material_property; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_property (
    property_value double precision NOT NULL,
    id_material uuid NOT NULL,
    id_property uuid NOT NULL
);


ALTER TABLE public.material_property OWNER TO postgres;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id_material uuid NOT NULL,
    material_type character varying(255) NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Data for Name: empirical_coefficients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empirical_coefficients (id_coefficient, coefficient_name, unit_of_measurement) FROM stdin;
2d5d1eec-0397-48cd-ae7c-a8a613c9d3b5	 second_constant_glasstransition	°С
\.


--
-- Data for Name: material_coefficient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_coefficient (coefficient_value, id_coefficient, id_material) FROM stdin;
\.


--
-- Data for Name: material_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_properties (id_property, property_name, unit_of_measurement) FROM stdin;
\.


--
-- Data for Name: material_property; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_property (property_value, id_material, id_property) FROM stdin;
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (id_material, material_type, name) FROM stdin;
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
    ADD CONSTRAINT material_coefficient_pkey PRIMARY KEY (id_coefficient, id_material);


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
-- Name: material_property fk48dmkja54cf12pywdjjmqtp9p; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT fk48dmkja54cf12pywdjjmqtp9p FOREIGN KEY (id_material) REFERENCES public.materials(id_material);


--
-- Name: material_coefficient fk512d6hrfk6xa38nmk1v7fp5v4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT fk512d6hrfk6xa38nmk1v7fp5v4 FOREIGN KEY (id_material) REFERENCES public.materials(id_material);


--
-- Name: material_coefficient fk7cbcl54a4ek3oq42j9g96emkm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_coefficient
    ADD CONSTRAINT fk7cbcl54a4ek3oq42j9g96emkm FOREIGN KEY (id_coefficient) REFERENCES public.empirical_coefficients(id_coefficient);


--
-- Name: material_property fkalry6ueqgnscvxyu40cae4vi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_property
    ADD CONSTRAINT fkalry6ueqgnscvxyu40cae4vi FOREIGN KEY (id_property) REFERENCES public.material_properties(id_property);


--
-- PostgreSQL database dump complete
--

