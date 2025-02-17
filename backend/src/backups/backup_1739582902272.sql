--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: tesis_unimas_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO tesis_unimas_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: tesis_unimas_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: genero; Type: TYPE; Schema: public; Owner: tesis_unimas_user
--

CREATE TYPE public.genero AS ENUM (
    'masculino',
    'femenino',
    'femenina'
);


ALTER TYPE public.genero OWNER TO tesis_unimas_user;

--
-- Name: get_specialist_appointment_status(bigint, bigint); Type: FUNCTION; Schema: public; Owner: tesis_unimas_user
--

CREATE FUNCTION public.get_specialist_appointment_status(p_appointment_id bigint, p_specialist_id bigint) RETURNS TABLE(specialist_id bigint, status character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    as_link.specialist_id,
    c.classification_type 
  FROM classification c
  JOIN appointment a ON a.status_id = c.id
  JOIN appointment_specialists as_link ON as_link.appointment_id = a.id
  WHERE a.id = p_appointment_id 
    AND as_link.specialist_id = p_specialist_id
  ORDER BY a.created_at DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION public.get_specialist_appointment_status(p_appointment_id bigint, p_specialist_id bigint) OWNER TO tesis_unimas_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: tesis_unimas_user
--

CREATE TABLE public.appointment (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    services text NOT NULL,
    status_id bigint NOT NULL,
    status_order boolean NOT NULL,
    paid boolean NOT NULL,
    address text NOT NULL,
    payment_method integer NOT NULL,
    amount text NOT NULL,
    scheduled_date text NOT NULL,
    reference_payment character varying(30),
    point character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.appointment OWNER TO tesis_unimas_user;

--
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: tesis_unimas_user
--

ALTER TABLE public.appointment ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.appointment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: appointment_specialists; Type: TABLE; Schema: public; Owner: tesis_unimas_user
--

CREATE TABLE public.appointment_specialists (
    appointment_id bigint NOT NULL,
    specialist_id bigint NOT NULL,
    service_id bigint,
    sessions_assigned integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status_id integer,
    start_appointment timestamp without time zone,
    end_appointment timestamp without time zone,
    earnings numeric(10,2)
);


ALTER TABLE public.appointment_specialists OWNER TO tesis_unimas_user;

--
-- Name: classification; Type: TABLE; Schema: public; Owner: tesis_unimas_user
--

CREATE TABLE public.classification (
    id bigint NOT NULL,
    classification_type character varying(50) NOT NULL,
    parent_classification_id bigint,
    service_image text,
    description text,
    price numeric(10,2),
    service_category boolean,
    "time" character varying(100),
    is_active boolean DEFAULT true
);


ALTER TABLE public.classification OWNER TO tesis_unimas_user;

--
-- Name: classification_id_seq; Type: SEQUENCE; Schema: public; Owner: tesis_unimas_user
--

ALTER TABLE public.classification ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: tesis_unimas_user
--

CREATE TABLE public.ratings (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    appointment_id bigint NOT NULL,
    rating integer NOT NULL,
    rated_by character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ratings_rated_by_check CHECK (((rated_by)::text = ANY (ARRAY[('cliente'::character varying)::text, ('especialista'::character varying)::text]))),
    CONSTRAINT ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ratings OWNER TO tesis_unimas_user;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: tesis_unimas_user
--

ALTER TABLE public.ratings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ratings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: specialist_cancelled_appointments; Type: TABLE; Schema: public; Owner: tesis_unimas_user
--

CREATE TABLE public.specialist_cancelled_appointments (
    id bigint NOT NULL,
    specialist_id bigint NOT NULL,
    appointment_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.specialist_cancelled_appointments OWNER TO tesis_unimas_user;

--
-- Name: specialist_cancelled_appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: tesis_unimas_user
--

ALTER TABLE public.specialist_cancelled_appointments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.specialist_cancelled_appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: tesis_unimas_user
--

CREATE TABLE public."user" (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL,
    identification character varying(10) NOT NULL,
    email character varying(100) NOT NULL,
    telephone_number character varying(15) NOT NULL,
    password character varying(255) NOT NULL,
    role_id bigint NOT NULL,
    date_of_birth date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    picture_profile text,
    security_question character varying(100),
    answer character varying(100),
    score numeric(2,1) DEFAULT 0.0,
    specialization character varying(100),
    status boolean DEFAULT true,
    reset_code character varying(6),
    gender public.genero,
    secret_password character varying(120),
    CONSTRAINT chk_user_email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT chk_user_telephone CHECK (((telephone_number)::text ~ '^\+?[0-9]{10,15}$'::text)),
    CONSTRAINT user_score_check CHECK (((score >= 0.0) AND (score <= 5.0)))
);


ALTER TABLE public."user" OWNER TO tesis_unimas_user;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: tesis_unimas_user
--

ALTER TABLE public."user" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: tesis_unimas_user
--

COPY public.appointment (id, user_id, services, status_id, status_order, paid, address, payment_method, amount, scheduled_date, reference_payment, point, created_at) FROM stdin;
125	7	[{"id":"9","title":"Hidratación Intensiva","price":"15.00","duration":"1 hora","quantity":1,"note":"Sin nota","uniqueId":1738810582854}]	70	f	f	Barrio La Sosa, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, 1000, Venezuela	68	22.4 $	{"start":"jueves, 6 de febrero de 2025, 03:00 p. m.","end":"04:00 p. m.","duration":"1 hora"}	efectivo	{"lat":10.4169012,"lng":-67.0144502}	2025-02-06 02:56:33.224309
126	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"Sin nota","uniqueId":1738822503399}]	70	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"start":"sábado, 8 de enero de 2025, 02:30 p. m.","end":"04:00 p. m.","duration":"1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-06 06:15:13.408035
127	7	[{"id":"43","title":"Cejas","price":"10.00","duration":"15 minutos","quantity":1,"note":"Sin nota","uniqueId":1738894192025}]	70	f	f	Macarao, Sector Macarao, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	16.6 $	{"start":"viernes, 7 de enero de 2025, 10:00 a. m.","end":"10:15 a. m.","duration":"15 minutos"}	efectivo	{"lat":10.4256,"lng":-67.0356}	2025-02-07 02:10:05.870476
128	7	[{"id":"13","title":"Radiofrecuencia","price":"15.00","duration":"1 hora","quantity":1,"note":"Sin nota","uniqueId":1738900109301}]	70	f	f	Presencial en el Salón de Belleza	68	17.4 $	{"start":"viernes, 7 de enero de 2025, 03:30 p. m.","end":"04:30 p. m.","duration":"1 hora"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-07 03:48:39.181468
129	7	[{"id":"9","title":"Hidratación Intensiva","price":"15.00","duration":"1 hora","quantity":1,"note":"Sin nota","uniqueId":1738902869785}]	70	f	f	Presencial en el Salón de Belleza	68	17.4 $	{"start":"viernes, 7 de febrero de 2025, 03:30 p. m.","end":"04:30 p. m.","duration":"1 hora"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-07 04:34:54.388926
131	7	[{"id":"54","title":"Híbridas","price":"60.00","duration":"1 hora 15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739158857638}]	70	f	f	Macarao, Sector Macarao, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	74.6 $	{"start":"lunes, 10 de febrero de 2025, 09:30 a. m.","end":"10:45 a. m.","duration":"1 hora 15 minutos"}	efectivo	{"lat":10.4256,"lng":-67.0356}	2025-02-10 03:41:21.426988
133	7	[{"id":"55","title":"Mega volumen","price":"80.00","duration":"2 horas","quantity":1,"note":"Sin nota","uniqueId":1739162188915}]	70	f	f	Macarao, Sector Macarao, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	97.8 $	{"start":"lunes, 10 de febrero de 2025, 02:00 p. m.","end":"04:00 p. m.","duration":"2 horas"}	efectivo	{"lat":10.4256,"lng":-67.0356}	2025-02-10 04:36:43.28673
132	7	[{"id":"55","title":"Mega volumen","price":"80.00","duration":"2 horas","quantity":1,"note":"Sin nota","uniqueId":1739162188915}]	70	f	f	Macarao, Sector Macarao, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	97.8 $	{"start":"lunes, 10 de febrero de 2025, 02:00 p. m.","end":"04:00 p. m.","duration":"2 horas"}	efectivo	{"lat":10.4256,"lng":-67.0356}	2025-02-10 04:36:42.603183
135	7	[{"id":"20","title":"Manicura semipermanente","price":"25.00","duration":"1 hora 15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739162622585}]	70	f	f	Barrio La Sosa, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, 1000, Venezuela	68	34 $	{"start":"lunes, 10 de febrero de 2025, 11:00 a. m.","end":"12:15 p. m.","duration":"1 hora 15 minutos"}	efectivo	{"lat":10.4160505,"lng":-67.0129609}	2025-02-10 04:44:20.022499
136	7	[{"id":"45","title":"Mejillas","price":"12.00","duration":"15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739166590243}]	70	f	f	Barrio La Sosa, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, 1000, Venezuela	68	18.92 $	{"start":"lunes, 10 de febrero de 2025, 10:00 a. m.","end":"10:15 a. m.","duration":"15 minutos"}	efectivo	{"lat":10.4159274,"lng":-67.0129609}	2025-02-10 05:50:02.799119
134	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"Sin nota","uniqueId":1739162505203}]	70	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"start":"lunes, 10 de febrero de 2025, 03:30 p. m.","end":"05:00 p. m.","duration":"1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-10 04:41:53.263464
137	7	[{"id":"30","title":"Pedicura con gel","price":"20.00","duration":"1 hora","quantity":1,"note":"dwadaw","uniqueId":1739225213641}]	70	f	f	Macarao, Sector Macarao, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	28.2 $	{"start":"martes, 11 de febrero de 2025, 04:30 p. m.","end":"05:30 p. m.","duration":"1 hora"}	efectivo	{"lat":10.4256,"lng":-67.0356}	2025-02-10 22:07:06.209025
138	7	[{"id":"44","title":"Bozo","price":"8.00","duration":"10 minutos","quantity":1,"note":"dawdaw","uniqueId":1739228434051}]	70	f	f	Barrio Kennedy, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	14.28 $	{"start":"martes, 11 de febrero de 2025, 03:30 p. m.","end":"03:40 p. m.","duration":"10 minutos"}	efectivo	{"lat":10.4157008,"lng":-67.0159395}	2025-02-10 23:00:45.462988
139	7	[{"id":"44","title":"Bozo","price":"8.00","duration":"10 minutos","quantity":1,"note":"dwadaw","uniqueId":1739229855487}]	70	f	f	Barrio Kennedy, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, Venezuela	68	14.28 $	{"start":"martes, 11 de febrero de 2025, 11:30 a. m.","end":"11:40 a. m.","duration":"10 minutos"}	efectivo	{"lat":10.4157008,"lng":-67.0159395}	2025-02-10 23:24:32.620489
140	7	[{"id":"44","title":"Bozo","price":"8.00","duration":"10 minutos","quantity":1,"note":"Sin nota","uniqueId":1739229964243}]	70	f	f	Presencial en el Salón de Belleza	68	9.28 $	{"start":"martes, 11 de febrero de 2025, 11:00 a. m.","end":"11:10 a. m.","duration":"10 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-10 23:26:15.081104
141	7	[{"id":"20","title":"Manicura semipermanente","price":"25.00","duration":"1 hora 15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739316950487}]	70	f	t	Presencial en el Salón de Belleza	59	29 $	{"start":"miércoles, 12 de febrero de 2025, 10:00 a. m.","end":"11:15 a. m.","duration":"1 hora 15 minutos"}	pi_3QrT0OB9lCzeQPVG0I05Yif0	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-11 23:36:41.554728
130	9	[{"id":"19","title":"Manicura con gel","price":"20.00","duration":"1 hora","quantity":2,"note":"Sin nota","uniqueId":1739062661858}]	70	f	f	Presencial en el Salón de Belleza	68	46.4 $	{"start":"domingo, 9 de febrero de 2025, 12:00 p. m.","end":"01:00 p. m.","duration":"1 hora"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-09 00:58:32.982735
142	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"Sin nota","uniqueId":1739317611659}]	70	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"start":"miércoles, 12 de febrero de 2025, 11:30 a. m.","end":"01:00 p. m.","duration":"1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-11 23:46:57.040661
144	7	[{"id":"25","title":"Tratamiento para cutículas","price":"10.00","duration":"30 minutos","quantity":1,"note":"Sin nota","uniqueId":1739317670915}]	67	f	f	Presencial en el Salón de Belleza	68	11.6 $	{"start":"viernes, 14 de febrero de 2025, 05:30 p. m.","end":"06:00 p. m.","duration":"30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-11 23:47:59.448079
143	7	[{"id":"54","title":"Híbridas","price":"60.00","duration":"1 hora 15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739317653050}]	67	f	f	Presencial en el Salón de Belleza	68	69.6 $	{"start":"miércoles, 12 de febrero de 2025, 02:30 p. m.","end":"03:45 p. m.","duration":"1 hora 15 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-11 23:47:44.422579
146	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"dawdaw","uniqueId":1739331509203}]	70	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"end": "04:30 p. m.", "start": "Sábado, 15 de Febrero de 2025, 04:30 p. m.", "duration": "1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-12 03:38:46.106267
147	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"Sin nota","uniqueId":1739333368864}]	67	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"start":"jueves, 13 de febrero de 2025, 04:30 p. m.","end":"06:00 p. m.","duration":"1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-12 04:09:33.063312
150	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"Sin nota","uniqueId":1739410243316}]	70	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"start":"jueves, 13 de febrero de 2025, 03:00 p. m.","end":"04:30 p. m.","duration":"1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-13 01:31:21.815638
145	7	[{"id":"20","title":"Manicura semipermanente","price":"25.00","duration":"1 hora 15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739325491242}]	67	f	f	Presencial en el Salón de Belleza	68	29 $	{"end": "11:00 a. m.", "start": "Miércoles, 12 de Febrero de 2025, 11:00 a. m.", "duration": "1 hora 15 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-12 01:58:17.944683
151	9	[{"id":"54","title":"Híbridas","price":"60.00","duration":"1 hora 15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739456787929}]	67	f	f	Presencial en el Salón de Belleza	68	69.6 $	{"start":"sábado, 15 de febrero de 2025, 11:00 a. m.","end":"12:15 p. m.","duration":"1 hora 15 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-13 14:26:41.27663
148	7	[{"id":"21","title":"Uñas acrílicas","price":"30.00","duration":"1 hora 30 minutos","quantity":1,"note":"dwda","uniqueId":1739333904659}]	70	f	f	Presencial en el Salón de Belleza	68	34.8 $	{"end": "06:00 p. m.", "start": "Miércoles, 12 de Febrero de 2025, 04:30 p. m.", "duration": "1 hora 30 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-12 04:18:32.712461
149	7	[{"id":"44","title":"Bozo","price":"8.00","duration":"10 minutos","quantity":1,"note":"Sin nota","uniqueId":1739338335601},{"id":"45","title":"Mejillas","price":"12.00","duration":"15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739338336814}]	70	f	f	Presencial en el Salón de Belleza	68	23.2 $	{"end": "10:25 a. m.", "start": "Jueves, 13 de Febrero de 2025, 10:00 a. m.", "duration": "25 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-12 05:32:22.562839
152	50	[{"id":"10","title":"Peeling Químico","price":"15.00","duration":"1 hora","quantity":1,"note":"Sin nota","uniqueId":1739476981119},{"id":"42","title":"Tratamiento de pie de atleta","price":"25.00","duration":"1 hora","quantity":3,"note":"Sin nota","uniqueId":1739477017142},{"id":"12","title":"Masajes","price":"15.00","duration":"1 hora","quantity":4,"note":"Sin nota","uniqueId":1739477030542},{"id":"14","title":"Presoterapia","price":"15.00","duration":"1 hora","quantity":8,"note":"quiero que me saquen hasta la sangre del fundillo","uniqueId":1739477058158},{"id":"52","title":"Clásicas","price":"50.00","duration":"1 hora","quantity":1,"note":"ta cara la vaina","uniqueId":1739477100541},{"id":"48","title":"Piernas","price":"25.00","duration":"40 minutos","quantity":1,"note":"Sin nota","uniqueId":1739477157853},{"id":"47","title":"Bikini","price":"20.00","duration":"30 minutos","quantity":1,"note":"este es mas importante","uniqueId":1739477167685},{"id":"46","title":"Axilas","price":"15.00","duration":"20 minutos","quantity":1,"note":"que queden bien esos sobacos","uniqueId":1739477184621},{"id":"27","title":"Tratamiento para hongos","price":"25.00","duration":"1 hora","quantity":5,"note":"tengio burda de hongo, mario bros estaria feliz","uniqueId":1739477250940},{"id":"17","title":"Manicura clásica","price":"10.00","duration":"45 minutos","quantity":1,"note":"Sin nota","uniqueId":1739477254796}]	70	t	f	Calle 2, El Retiro, Altagracia, Caracas, Parroquia Altagracia, Municipio Libertador, Distrito Capital, 1010, Venezuela	68	602.4 $	{"start":"viernes, 14 de febrero de 2025, 10:30 a. m.","end":"06:45 p. m.","duration":"8 horas 15 minutos"}	efectivo	{"lat":10.520329302863304,"lng":-66.9143736363003}	2025-02-13 20:11:00.405637
153	7	[{"id":"29","title":"Remoción de esmalte","price":"5.00","duration":"15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739478793301}]	67	f	f	Presencial en el Salón de Belleza	68	5.8 $	{"start":"viernes, 14 de febrero de 2025, 03:30 p. m.","end":"03:45 p. m.","duration":"15 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-13 20:33:23.474409
154	7	[{"id":"55","title":"Mega volumen","price":"80.00","duration":"2 horas","quantity":1,"note":"Sin nota","uniqueId":1739494063214}]	67	t	f	Barrio La Sosa, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, 1000, Venezuela	68	97.8 $	{"start":"viernes, 14 de febrero de 2025, 03:30 p. m.","end":"05:30 p. m.","duration":"2 horas"}	efectivo	{"lat":10.4193892,"lng":-67.0107269}	2025-02-14 00:47:55.947816
155	7	[{"id":"30","title":"Pedicura con gel","price":"20.00","duration":"1 hora","quantity":1,"note":"Sin nota","uniqueId":1739494097950}]	67	t	f	Barrio La Sosa, Las Adjuntas, Caracas, Parroquia Macarao, Municipio Libertador, Distrito Capital, 1000, Venezuela	68	28.2 $	{"start":"viernes, 14 de febrero de 2025, 03:30 p. m.","end":"04:30 p. m.","duration":"1 hora"}	efectivo	{"lat":10.4193892,"lng":-67.0107269}	2025-02-14 00:48:31.792841
156	7	[{"id":"45","title":"Mejillas","price":"12.00","duration":"15 minutos","quantity":1,"note":"Sin nota","uniqueId":1739494126868}]	70	t	f	Presencial en el Salón de Belleza	68	13.92 $	{"end": "09:45 a. m.", "start": "Sábado, 15 de Febrero de 2025, 09:30 a. m.", "duration": "15 minutos"}	efectivo	{'latitud':10.493435, 'longitud': -66.878370}	2025-02-14 00:48:54.706961
\.


--
-- Data for Name: appointment_specialists; Type: TABLE DATA; Schema: public; Owner: tesis_unimas_user
--

COPY public.appointment_specialists (appointment_id, specialist_id, service_id, sessions_assigned, created_at, status_id, start_appointment, end_appointment, earnings) FROM stdin;
130	46	19	1	2025-02-10 01:02:02.051929	66	\N	\N	\N
140	30	44	1	2025-02-10 23:26:43.721515	66	\N	\N	\N
126	5	21	1	2025-02-06 16:50:40.331785	73	2025-02-07 01:56:27.281966	2025-02-07 01:56:31.974671	27.84
138	5	44	1	2025-02-10 23:01:02.179454	73	2025-02-10 23:01:22.549283	2025-02-10 23:01:26.600502	11.42
131	5	54	1	2025-02-10 03:41:57.309964	73	2025-02-10 04:34:57.369265	2025-02-10 04:35:03.497715	59.68
127	5	43	1	2025-02-07 02:10:21.704817	73	2025-02-07 02:10:38.564875	2025-02-07 02:10:44.279213	13.28
139	5	44	1	2025-02-10 23:24:39.343324	73	2025-02-10 23:25:02.041972	2025-02-10 23:25:09.64788	11.42
133	5	55	1	2025-02-10 04:37:08.480445	73	2025-02-10 04:37:24.067899	2025-02-10 04:37:30.353154	78.24
132	5	55	1	2025-02-10 04:37:38.699387	73	2025-02-10 04:37:49.835658	2025-02-10 04:37:54.159273	78.24
128	5	13	1	2025-02-07 03:49:00.702666	73	2025-02-07 04:33:22.218901	2025-02-07 04:33:27.132259	13.92
135	5	20	1	2025-02-10 04:45:17.355125	73	2025-02-10 05:05:18.713566	2025-02-10 05:05:24.922816	27.20
129	5	9	1	2025-02-07 04:35:16.404066	73	2025-02-10 03:39:07.812204	2025-02-10 03:39:11.998914	13.92
125	5	9	1	2025-02-06 02:56:54.326304	73	\N	2025-02-06 02:57:20.538998	17.92
136	5	45	1	2025-02-10 05:50:37.357821	73	2025-02-10 05:53:32.750602	2025-02-10 05:53:42.982125	15.14
134	5	21	1	2025-02-10 21:59:35.304571	73	2025-02-10 22:05:27.951702	2025-02-10 22:05:32.396917	27.84
137	5	30	1	2025-02-10 22:07:18.682631	73	2025-02-10 22:07:38.396274	2025-02-10 22:07:42.606031	22.56
141	5	20	1	2025-02-11 23:37:52.038082	71	\N	\N	23.20
142	5	21	1	2025-02-11 23:47:16.352195	66	\N	\N	\N
146	5	21	1	2025-02-12 03:39:01.530793	70	\N	\N	27.84
148	5	21	1	2025-02-12 04:58:39.752452	71	\N	\N	27.84
149	5	44	1	2025-02-12 23:21:23.267812	73	2025-02-12 23:26:40.437945	2025-02-12 23:27:09.580245	18.56
150	5	21	1	2025-02-13 01:31:57.297279	73	2025-02-13 01:32:19.488176	2025-02-13 01:32:24.00614	27.84
152	48	42	3	2025-02-13 20:16:12.756511	73	2025-02-13 20:17:58.886133	2025-02-13 20:36:49.168958	240.96
152	5	27	5	2025-02-13 20:35:05.552947	73	2025-02-13 20:36:46.990064	2025-02-13 20:36:49.168958	240.96
156	30	45	1	2025-02-14 18:08:18.311946	66	\N	\N	\N
\.


--
-- Data for Name: classification; Type: TABLE DATA; Schema: public; Owner: tesis_unimas_user
--

COPY public.classification (id, classification_type, parent_classification_id, service_image, description, price, service_category, "time", is_active) FROM stdin;
56	administrador	\N	\N	\N	\N	\N	\N	t
57	cliente	\N	\N	\N	\N	\N	\N	t
58	especialista	\N	\N	\N	\N	\N	\N	t
60	evaluación	\N	\N	\N	\N	\N	\N	t
61	acción	\N	\N	\N	\N	\N	\N	t
64	completado	\N	\N	\N	\N	\N	\N	t
65	cancelado	\N	\N	\N	\N	\N	\N	t
62	pendiente por pago	\N	\N	\N	\N	\N	\N	t
63	esperando aceptación del especialista	\N	\N	\N	\N	\N	\N	t
59	tarjeta	\N	\N	\N	\N	\N	\N	t
69	pago móvil	\N	\N	\N	\N	\N	\N	t
68	efectivo	\N	\N	\N	\N	\N	\N	t
67	Asignando especialista	\N	\N	\N	\N	\N	\N	t
19	Manicura con gel	3	../../../../public/imagenes/manicura/manicura-gel.jpg	Disfruta de uñas brillantes y resistentes con nuestro servicio de gel.	20.00	f	1 hora	t
20	Manicura semipermanente	3	../../../../public/imagenes/manicura/manicura-semipermanentes.jpg	Dura más que un esmalte tradicional y deja tus uñas impecables por semanas.	25.00	f	1 hora 15 minutos	t
28	Pedicura clásica	4	../../../../public/imagenes/pedicura/pedicure-clásico.jpg	Un cuidado completo para tus pies, incluye limpieza, corte y esmaltado.	15.00	f	1 hora	t
29	Remoción de esmalte	4	../../../../public/imagenes/pedicura/remocion-de-esmalte-pies.jpg	Eliminamos el esmalte antiguo de tus uñas de los pies sin dañarlas.	5.00	f	15 minutos	t
30	Pedicura con gel	4	../../../../public/imagenes/pedicura/pintura-con-gel-pedicura.jpg	Disfruta de uñas de los pies brillantes y resistentes con nuestro servicio de gel.	20.00	f	1 hora	t
31	Pedicura semipermanente	4	../../../../public/imagenes/pedicura/pedicura-permanente.jpg	Dura más que un esmalte tradicional y deja tus uñas de los pies impecables por semanas.	25.00	f	1 hora 15 minutos	t
32	Decoración de uñas de los pies	4	../../../../public/imagenes/pedicura/decoraciones-uñas-pies.jpg	Personaliza tus uñas de los pies con decoraciones únicas: piedras, glitter y más.	15.00	f	30 minutos	t
33	Esmaltado en gel con diseños personalizados	4	../../../../public/imagenes/pedicura/esmaltado-gel-personalizado-pies.jpg	Combina la durabilidad del gel con diseños únicos para tus uñas de los pies.	35.00	f	1 hora 30 minutos	t
34	Exfoliación de pies	4	../../../../public/imagenes/pedicura/Exfoliación-de-pies.jpg	Elimina las células muertas y suaviza la piel de tus pies con nuestro tratamiento de exfoliación.	15.00	f	30 minutos	t
109	dawdaw	\N	/uploads/categories/1738482532053.png	dawdaw	\N	f	\N	t
113	jhonangel briceño	\N	/uploads/categories/1738549538934.jpg	puto	\N	f	\N	t
117	masoterapia	\N	/uploads/categories/1738625534030.jpg	awadwdwa	\N	f	\N	t
72	Inicio del servicio	\N	\N	\N	\N	\N	\N	t
12	Masajes	2	../../../../public/imagenes/corporal/masajes.jpg	Disfruta de un masaje personalizado para aliviar tensiones, mejorar la circulación y reducir el estrés.	15.00	f	1 hora	t
73	Final del servicio	\N	\N	\N	\N	\N	\N	t
8	Limpieza Facial Profunda	1	../../../../public/imagenes/facial/limpieza-facial.jpg	Devuelve el brillo natural a tu piel con nuestra limpieza facial profunda. Eliminamos impurezas, puntos negros y células muertas, dejando tu piel suave y radiante. ¡Adaptamos el tratamiento a tu tipo de piel!	15.00	f	1 hora	t
13	Radiofrecuencia	2	../../../../public/imagenes/corporal/radiofrecuencia.jpg	Reafirma tu piel, reduce la flacidez y moldea tu figura con la radiofrecuencia, un tratamiento no invasivo y eficaz.	15.00	f	1 hora	t
41	Tratamiento de crack epidérmico	5	../../../../public/imagenes/quiropodia/Tratamiento-de-crack-epidérmico.jpeg	Repara y protege la piel de los pies afectada por grietas y sequedad extrema.	20.00	f	30 minutos	t
110	default picture profile	\N	/uploads/profile-pics/user.webp	\N	\N	\N	\N	t
114	camila	113	/uploads/services/1738549559220.jpeg	dawdaww	12.00	\N	1 hora 30 minutos	f
118	dawdaw	117	/uploads/services/1738625599870.jpg	wdawd	11.97	\N	1 hora 30 minutos	f
1	Facial	\N	../../../../public/imagenes/facial/tratamiento-facial.png	Desde una limpieza profunda que elimina impurezas hasta una hidratación intensiva que devuelve la suavidad, pasando por peelings químicos que renuevan la piel y mascarillas que nutren y revitalizan, cada tratamiento ofrece beneficios específicos. La limpieza facial es esencial para una piel sana, la hidratación combate la resequedad, el peeling mejora la textura y las mascarillas ofrecen un cuidado personalizado. ¡Elige el tratamiento ideal para tu tipo de piel y disfruta de una piel radiante y rejuvenecida!	\N	t	\N	t
9	Hidratación Intensiva	1	../../../../public/imagenes/facial/hidratacion-facial.jpg	Utilizamos productos ricos en ingredientes hidratantes y antioxidantes para revitalizar tu piel y protegerla de los factores externos.	15.00	f	1 hora	t
10	Peeling Químico	1	../../../../public/imagenes/facial/Peeling-quimico.jpg	Nuestro peeling químico elimina las células muertas de la superficie de la piel, revelando una piel más suave, radiante y rejuvenecida.	15.00	f	1 hora	t
3	Manicuras	\N	../../../../public/imagenes/categorias/manicura.png	¡Descubre el mundo de las manicuras! Desde lo básico hasta lo más sofisticado, tenemos el servicio perfecto para ti.	\N	t	\N	t
4	Pedicura	\N	../../../../public/imagenes/categorias/pedicura.jpeg	Disfruta de un momento de relajación con nuestra pedicura de lujo. Incluye remojo de pies, exfoliación, masaje y esmaltado de uñas con tu color favorito. ¡Tus pies quedarán suaves y renovados!	\N	t	\N	t
2	Corporales	\N	../../../../public/imagenes/categorias/tratamiento-corporal.png	Descubre el bienestar integral con nuestros tratamientos corporales. Relájate con un masaje terapéutico, tonifica tu piel con radiofrecuencia y mejora la circulación con presoterapia. ¡Personalizamos cada tratamiento para que te sientas renovada y llena de energía! Agenda tu cita y experimenta la diferencia.	\N	t	\N	t
5	Quiropodia	\N	../../../../public/imagenes/categorias/quiropedia.jpg	Eliminamos callosidades, durezas y uñas encarnadas. Tratamos verrugas plantares, hongos en las uñas y pie de atleta. Recupera la salud y belleza de tus pies.	\N	t	\N	t
66	aceptado	\N	\N	\N	\N	\N	\N	t
70	Especialista asignado	\N	\N	\N	\N	\N	\N	t
71	En camino	\N	\N	\N	\N	\N	\N	t
14	Presoterapia	2	../../../../public/imagenes/corporal/presoterapia.jpg	Combate la retención de líquidos, reduce la celulitis y mejora la circulación con nuestra innovadora técnica de presoterapia.	15.00	f	1 hora	t
21	Uñas acrílicas	3	../../../../public/imagenes/manicura/uñas-acrilicas.jpg	Consigue uñas más largas y personalizadas con nuestro servicio de uñas acrílicas.	30.00	f	1 hora 30 minutos	t
42	Tratamiento de pie de atleta	5	../../../../public/imagenes/quiropodia/pie-de-atleta.jpg	Alivia los síntomas y elimina el hongo que causa el pie de atleta.	25.00	f	1 hora	t
43	Cejas	6	../../../../public/imagenes/epilacion/Cejas.jpg	Dale forma a tus cejas con precisión y suavidad con nuestro servicio de epilación con cera.	10.00	f	15 minutos	t
44	Bozo	6	../../../../public/imagenes/epilacion/bozo.jpg	Elimina el vello del bozo para una apariencia limpia y suave.	8.00	f	10 minutos	t
45	Mejillas	6	../../../../public/imagenes/epilacion/Mejillas.png	Elimina el vello no deseado de tus mejillas para un acabado perfecto.	12.00	f	15 minutos	t
111	awdawda	\N	/uploads/categories/1738547577275.png	dawdaw	\N	f	\N	t
115	dwadaw	\N	/uploads/categories/1738552933248.jpg	dadwa	\N	f	\N	t
37	Eliminación de callosidades y durezas	5	../../../../public/imagenes/quiropodia/eliminacion.jpeg	Eliminamos las callosidades y durezas de los pies, dejándolos suaves y saludables.	20.00	f	45 minutos	t
116	jhonange12212103	115	/uploads/services/1738552953333.jpeg	dawdwa	12.00	\N	1 hora 30 minutos	f
39	Verrugas plantares	5	../../../../public/imagenes/quiropodia/Verrugas-plantares.jpg	Tratamiento especializado para eliminar verrugas plantares de manera efectiva.	30.00	f	45 minutos	t
40	Hongos en las uñas	5	../../../../public/imagenes/quiropodia/Hongos-en-las-uñas.jpg	Eliminamos los hongos en las uñas con tratamientos efectivos y seguros.	25.00	f	1 hora	t
46	Axilas	6	../../../../public/imagenes/epilacion/Axilas.jpg	Disfruta de axilas suaves y sin vello con nuestro servicio de epilación.	15.00	f	20 minutos	t
50	Pecho	6	../../../../public/imagenes/epilacion/Pecho.jpg	Remueve el vello del pecho para una apariencia limpia y cuidada.	25.00	f	30 minutos	t
47	Bikini	6	../../../../public/imagenes/epilacion/Bikini.png	Obtén una piel suave y libre de vello en la zona del bikini con un tratamiento delicado.	20.00	f	30 minutos	t
48	Piernas	6	../../../../public/imagenes/epilacion/Piernas.jpeg	Elimina el vello de las piernas de forma rápida y efectiva.	25.00	f	40 minutos	t
53	Volumen ruso	7	../../../../public/imagenes/extension/Volumen-ruso.jpg	Añade densidad y volumen a tus pestañas con la técnica de volumen ruso.	70.00	f	1 hora 30 minutos	t
54	Híbridas	7	../../../../public/imagenes/extension/Híbridas.jpeg	Combina lo mejor de las extensiones clásicas y de volumen para un look único.	60.00	f	1 hora 15 minutos	t
55	Mega volumen	7	../../../../public/imagenes/extension/Mega-volumen.jpeg	Consigue pestañas ultra densas y dramáticas con la técnica de mega volumen.	80.00	f	2 horas	t
52	Clásicas	7	../../../../public/imagenes/extension/clasica.jpeg	Extensiones clásicas para un look natural y elegante.	50.00	f	1 hora	t
49	Brazos	6	../../../../public/imagenes/epilacion/Brazos.jpg	Mantén tus brazos libres de vello con nuestro servicio de cera.	20.00	f	30 minutos	t
108	dawda	\N	/uploads/categories/1738482070933.png	dawdwa	\N	f	\N	t
51	Espalda	6	../../../../public/imagenes/epilacion/Espalda.jpeg	Elimina el vello de la espalda para una piel suave y sin imperfecciones.	30.00	f	40 minutos	t
22	Decoración de uñas	3	../../../../public/imagenes/manicura/decoracion-uñas.jpg	Añade un toque único con decoraciones personalizadas: piedras, glitter, y más.	15.00	f	30 minutos	t
23	Esmaltado en gel con diseños personalizados	3	../../../../public/imagenes/manicura/esmaltado-gel-diseños-personalizados.jpg	Combina la durabilidad del gel con diseños únicos y personalizados para tus uñas.	35.00	f	1 hora 30 minutos	t
24	Fortalecimiento de uñas	3	../../../../public/imagenes/manicura/fortalecimiento-uñas.jpg	Fortalece tus uñas con nuestro tratamiento especializado para evitar quiebres.	15.00	f	45 minutos	t
25	Tratamiento para cutículas	3	../../../../public/imagenes/manicura/tratamiento-cuticulas-uñas.jpg	Hidratamos y cuidamos tus cutículas para unas uñas más saludables.	10.00	f	30 minutos	t
26	Parafina	3	../../../../public/imagenes/manicura/parafina.jpg	Hidrata profundamente tus manos y uñas con nuestro tratamiento de parafina.	20.00	f	45 minutos	t
27	Tratamiento para hongos	3	../../../../public/imagenes/manicura/hongos-uñas-de-las-manos.jpg	Elimina los hongos de tus uñas con un tratamiento efectivo y seguro.	25.00	f	1 hora	t
17	Manicura clásica	3	../../../../public/imagenes/manicura/manicura-clasica.jpg	Un cuidado completo para tus uñas, incluye limpieza, corte y esmaltado.	10.00	f	45 minutos	t
18	Remoción de esmalte	3	../../../../public/imagenes/manicura/remocion-de-esmalte.jpeg	Eliminamos el esmalte antiguo sin dañar tus uñas, preparándolas para un nuevo look.	5.00	f	15 minutos	t
35	Masaje de pies	4	../../../../public/imagenes/pedicura/masaje-pies.jpeg	Relaja tus pies cansados y mejora la circulación con un masaje terapéutico.	20.00	f	30 minutos	t
36	Parafina	4	../../../../public/imagenes/pedicura/parafinas-pies.jpeg	Hidrata profundamente y revitaliza la piel de tus pies con nuestro tratamiento de parafina.	20.00	f	45 minutos	t
112	jhonangel23032112	111	/uploads/services/1738548010949.jpg	wdaawdaw	1.22	f	1 hora 30 minutos	t
119	Masasjes happy	\N	/uploads/categories/1739478349259.jpg	Disfrute de un mansaje relajante que t permite explorar los beneficios de la relajacion, incluye final feliz	\N	f	\N	t
6	Epilación	\N	../../../../public/imagenes/categorias/epilacion.jpeg	Adaptamos nuestros tratamientos de depilación a tus necesidades, ofreciéndote una piel suave y perfecta durante más tiempo.	\N	t	\N	t
7	Extensión	\N	../../../../public/imagenes/categorias/extension.jpeg	Realza tu mirada con nuestras extensiones de pestañas pelo a pelo. Ofrecemos técnicas clásicas, volumen ruso, híbridas y mega volumen para adaptarse a tus gustos y necesidades.	\N	t	\N	t
38	Tratamiento de uñas encarnadas	5	/uploads/services/1739569625840.PNG	Alivia el dolor y corrige el problema de las uñas encarnadas de forma segura.	25.00	f	1 hora	t
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: tesis_unimas_user
--

COPY public.ratings (id, user_id, appointment_id, rating, rated_by, created_at) FROM stdin;
109	5	129	5	especialista	2025-02-10 03:39:11.733029
110	7	129	5	cliente	2025-02-10 03:39:13.824845
111	7	129	5	cliente	2025-02-10 03:39:35.549433
112	5	131	5	especialista	2025-02-10 04:35:03.220903
113	7	131	5	cliente	2025-02-10 04:35:08.110877
114	5	133	5	especialista	2025-02-10 04:37:30.094184
115	7	133	5	cliente	2025-02-10 04:37:31.778333
116	5	132	2	especialista	2025-02-10 04:37:53.890912
117	7	132	1	cliente	2025-02-10 04:37:55.227938
118	5	135	5	especialista	2025-02-10 05:05:24.652976
119	7	135	5	cliente	2025-02-10 05:05:26.634952
120	5	136	5	especialista	2025-02-10 05:53:42.721286
121	7	136	5	cliente	2025-02-10 05:53:46.451234
122	5	134	5	especialista	2025-02-10 22:05:32.126399
123	7	134	5	cliente	2025-02-10 22:05:33.116082
124	5	137	2	especialista	2025-02-10 22:07:42.339312
125	7	137	2	cliente	2025-02-10 22:07:44.289346
126	5	138	5	especialista	2025-02-10 23:01:26.342846
127	7	138	5	cliente	2025-02-10 23:01:28.18223
128	5	139	5	especialista	2025-02-10 23:25:09.36205
129	7	139	5	cliente	2025-02-10 23:25:12.928703
99	7	125	5	cliente	2025-02-06 02:57:15.764219
100	5	125	5	especialista	2025-02-06 02:57:20.263844
101	5	126	5	especialista	2025-02-06 16:51:55.940868
102	5	126	5	especialista	2025-02-07 01:56:31.708782
103	7	126	5	cliente	2025-02-07 01:59:46.754027
104	5	127	5	especialista	2025-02-07 02:10:43.197548
105	7	127	5	cliente	2025-02-07 02:10:44.863114
106	5	128	5	especialista	2025-02-07 04:30:10.115887
107	5	128	5	especialista	2025-02-07 04:33:26.857707
108	7	128	5	cliente	2025-02-07 04:33:28.035891
130	5	149	5	especialista	2025-02-12 23:27:09.306614
131	7	149	5	cliente	2025-02-12 23:27:10.427359
132	5	150	5	especialista	2025-02-13 01:32:23.735434
133	7	150	5	cliente	2025-02-13 01:32:27.321456
134	48	152	1	especialista	2025-02-13 20:18:10.131886
135	48	152	5	especialista	2025-02-13 20:20:08.15713
136	5	152	5	especialista	2025-02-13 20:36:41.292905
\.


--
-- Data for Name: specialist_cancelled_appointments; Type: TABLE DATA; Schema: public; Owner: tesis_unimas_user
--

COPY public.specialist_cancelled_appointments (id, specialist_id, appointment_id, created_at) FROM stdin;
18	5	152	2025-02-13 20:36:26.737506
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: tesis_unimas_user
--

COPY public."user" (id, name, lastname, identification, email, telephone_number, password, role_id, date_of_birth, created_at, picture_profile, security_question, answer, score, specialization, status, reset_code, gender, secret_password) FROM stdin;
44	rfgggggggggg	wdadaawddaw	12542124	wwwwwwwwwwwwwww@gmail.com	04241338828	$2a$10$etmqP/ccykr3FuqkjHxE6ObTWzD2kL8eJOkJW7Tzoj3iVXMeMtUJy	57	2000-12-11	2025-02-09 03:58:45.329161	/uploads/profile-pics/user.webp	¿En qué ciudad naciste?	\N	0.0	\N	t	\N	masculino	\N
8	Stephany Carolina	Aranguren Conde	30429544	stephanya1405@gmail.com	04242636770	$2a$10$f8AAVFTQ42G/fXhBrwAIbO4xW/OymKAjjOed49hKZ1XuqhRY54HGO	56	2004-05-14	2025-01-18 23:29:40.848363	/uploads/profile-pics/profile-1737308722306-913240773.jpg	\N	\N	0.0	\N	t	\N	femenino	\N
29	Jhonangel	Briceno	43334654	malomalo@gmail.com	04241338828	$2a$10$2fnbzwvQdYsKY7Om8Kfu5uLJ6HuJKA7ZiBBDRf6JSxa0nPefjlGky	57	2003-12-11	2025-02-02 17:18:25.821648	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	f	\N	masculino	\N
36	lalalal	lelelele	19219129	jadjawjda@gmail.com	04241338828	$2a$10$cey6SR72NoiWj/C.3MA/UOIBx4SjdT3OUQD6iwPKCMnbtpDTmoH1S	57	2000-10-17	2025-02-08 21:27:13.331379	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	t	\N	\N	\N
40	mia	miamia	24523156	miamia@gmail.com	04241338828	$2a$10$gmJO6eYrJqKdCQSgMWBMLODFHbjIkdCaOAbgqmbxaiGLDA6FkM3J2	57	1999-07-15	2025-02-09 03:06:43.609167	/uploads/profile-pics/user.webp	¿En qué ciudad naciste?	\N	0.0	\N	t	\N	femenina	\N
42	zzzzzzzzzzzz	zzzzzzzzzzzz	54757788	kkkkkkkkkkk@gmail.com	04241338828	$2a$10$Xg59UwEk06M8ZUajEyCrEuMONG7pF4dTDEjL20hk8lvoIjZFMT5sm	57	1987-12-11	2025-02-09 03:13:09.493862	/uploads/profile-pics/user.webp	¿Cuál es el nombre de tu primera mascota?	\N	0.0	\N	t	\N	masculino	\N
11	jhon	jhoncito	12435153	manolo@gmail.com	04241263355	$2a$10$lY8euejPghwHsDUz2ed7GOW6DM9jEdJssPN6v3vv85cms3mnbG0xC	58	2003-11-12	2025-01-25 18:33:46.497742	/uploads/profile-pics/profile-1737922704151-141552852.jpg	\N	\N	5.0	\N	t	\N	masculino	\N
26	Jhonangel	Briceno	12121124	dadaawdaw@gmail.com	04241338828	$2a$10$Ya2phcZzWshEQpKFp.139OL.Me4fkIRJFdIz5Un5bqQn0an.pOhvq	58	2003-12-31	2025-02-02 08:27:33.468476	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	t	\N	\N	\N
28	Jhonangel	Briceno	36765656	jhona04@gmail.com	04241338828	$2a$10$XDhprtYfNPKiI6Nr/kV8L.cOihubZ4yZvec46AUk67ZCa9rZRXjXG	57	2003-12-11	2025-02-02 08:33:36.924015	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	t	\N	\N	\N
16	juanita	alcachofa	12931245	juanita@gmail.com	04241338828	$2a$10$lY8euejPghwHsDUz2ed7GOW6DM9jEdJssPN6v3vv85cms3mnbG0xC	57	1978-01-17	2025-01-29 02:02:57.862743	/uploads/profile-pics/profile-1737510092572-697954616.jpeg	blablabla	blablabla	5.0	\N	t	\N	femenino	\N
30	manolo	manilito	19838248	ajdajwdawj@gmail.com	04241338828	$2a$10$aAFHXHk8m/sbqh.zJJ7YauuFtQahzPGlrMdtvH8WQ0CjFCJVY13n6	58	2003-12-11	2025-02-02 17:35:39.774727	/uploads/profile-pics/user.webp	\N	\N	0.0	{"Faciales","Manicura"}	t	\N	femenina	\N
22	Jhonangel	Briceno	54336536	hoadlaw@gmail.com	04241338828	$2a$10$aW21Irmr.Dst4URJw16mWeyLXLMMBnkTGeXSDS2d8.UGmsZMtipoC	57	2003-12-11	2025-02-02 08:18:53.864995	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	\N	\N
27	dawdawdaw	wdadwad	12112121	dadwaadwawd@gmail.com	04241338828	$2a$10$hjm8EU522JcpsaDuH7UaLuWk903hWImVneXxyL9KpjhROnzFjkFv6	58	2003-12-11	2025-02-02 08:30:33.591087	/uploads/profile-pics/user.webp	\N	\N	0.0	{"Epilaciones","Faciales","Manicura","Quiropodía","Corporales","Extensiones","Pedicura"}	t	\N	masculino	\N
20	Jhonangel	Briceno	12122112	hola@gmail.com	04241338828	$2a$10$C2OoGyzUDtlZbJn9F9grAOYV47R6KVbjV1h8KJ62N768AOzuNr4GW	57	2003-12-11	2025-02-02 08:11:02.543257	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	t	\N	\N	\N
23	Jhonangel	Briceno	98745745	adkwakdaw@gmail.com	04241338828	$2a$10$3TU.C3ruGGOOjbRf4WX8.u/tyDgVDljqgb7mWCQ1oC/N4l.3S/tzS	57	2003-12-11	2025-02-02 08:22:08.652463	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	\N	\N
4	camila	camila	31123424	dawdawda@gmail.com	04241338828	$2a$10$plTTx6HyPE2hAk3P6Ckz8us0TnspytLp95//ks.AsWNKl2zFPLqWu	57	1978-01-17	2025-01-10 04:38:11.911021	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	femenino	\N
6	dwadaw	dwadaw	1221121	dwadawdaw@gmail.com	04241338828	$2a$10$XJMHtwm8VDJCecfHxqQ.SugknzkderpgzFE145R9ASbaHKJww4w6u	57	1978-01-17	2025-01-10 04:42:45.965831	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	femenino	\N
24	Jhonangel	Briceno	87676767	jhonangelbr@gmail.com	04241338828	$2a$10$/HzUHd8yFBx09DczQqi0w.DusaeWWVvHz.DaaJmocrUCio1A7DESW	57	2003-12-11	2025-02-02 08:25:37.059818	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	\N	\N
10	manuel	manolito	12435123	manolomanolito@gmail.com	04241223355	$2a$10$7Ffe4GEk85g6pco1GY5d7OEDy/v0INaU6lYKTkay.YpzsT8jW1qoK	57	2003-11-12	2025-01-25 18:28:57.235499	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	masculino	\N
12	camila	camilita	12542124	camilacamilita@gmail.com	04241663323	$2a$10$jiPo4ts6oT.WagFb9G7kzOFgW76Hp8IkGPMqiTqOZDkYXbxU/tw2i	57	2003-12-11	2025-01-25 23:30:05.428703	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	femenino	\N
15	eduard	Aranguren Conde	7956971	stephany@gmail.com	04142611162	$2a$10$0Y.DfXu76mCI8p7g417chODF7OCpBFifnuT4yJLNVUBxL3pibYKKO	57	2002-08-09	2025-01-27 22:48:49.608319	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	f	\N	masculino	\N
31	pedro	pedro	12122121	pedropedro@gmail.com	04241338828	$2a$10$2L5u.tPwQRIuUVs.1BwnbuWv0i7x9ZDPqsxGT7jZuwMQG.mkA9H6K	57	2003-12-11	2025-02-03 07:28:02.267652	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	¿Cuál es el nombre de tu primera mascota?	\N	0.0	\N	t	\N	femenina	\N
17	guillermo	sulbaran	29504340	guillermo@gmail.com	0412999999	$2a$10$Wwf0Aoxbd7oOjc4bQpJk3.M6jrXM9DSu7yiAB4cjOMvlmLc12EmR6	57	2002-02-27	2025-01-31 20:10:24.832671	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	\N	\N
19	camila	camilita	12953634	mercantil@gmail.com	04241338828	$2a$10$ChAO2NU2DgCUWCT9dmNBluNtRKTn8X5OJn.Fif8hrrC3IyjGFXAte	57	1998-02-03	2025-02-02 05:17:25.970603	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	princesa	\N	0.0	\N	t	\N	femenina	\N
21	Jhonangel	Briceno	67454554	dwadadaw@gmail.com	04241338828	$2a$10$.NKOHZNW.umYRg0JVCLF7uvLXQ9.EmiM0vAK4ZTVjwLCTx51M.D1C	57	2003-12-11	2025-02-02 08:14:48.482249	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	\N	\N
32	Jhonangel	Briceno	83823832	adjawjdawjdw@gmail.com	04241338828	$2a$10$DprTw4saAxSSBkcDon/4u.IMxUHio9RTxThkGJejpv62FNYqyF3wW	57	2003-12-11	2025-02-03 23:02:53.633254	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	¿Cuál es el nombre de tu mejor amigo de la infancia?	\N	0.0	\N	t	\N	masculino	\N
5	nelso	briceño	9955919	briceo.nelso@yahoo.com	04241338828	$2a$10$lY8euejPghwHsDUz2ed7GOW6DM9jEdJssPN6v3vv85cms3mnbG0xC	58	2003-12-11	2025-01-10 04:39:28.288077	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	¿Cuál es el nombre de tu primera mascota?	princesa	4.7	\N	t	\N	masculino	\N
38	el co;o	de tu madre	12344455	dugugyf@gmail.com	04142611166	$2a$10$Ui/mulICM0WD/A6Vp.QkMeV0f.kyDfubXqAim8ZX3mkPA0PZ3Aihi	57	1999-02-12	2025-02-08 21:29:11.359852	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	f	\N	\N	\N
33	manolo	aranguren	30111356	jhonan@gmail.com	04241338828	$2a$10$hUGmS6cndy6BZ4/MNbin5.3nbMaC5/Jv3sRebB3/xQkTjHzoXKRoW	57	2003-12-11	2025-02-03 23:17:18.60789	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	¿Cuál es el nombre de tu primera mascota?	\N	0.0	\N	t	\N	femenina	\N
13	princesa	princesita	12123123	asdasd12@gmail.com	04241338828	$2a$10$SY6iiyj2lARFHPiS.kUf5uyYmR3S/bq7iII3ZXApvE1wUsen6Hg4O	58	2003-12-11	2025-01-26 06:41:15.433667	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	femenino	\N
9	chucha	chuchita	11692361	patricia72@gmail.com	04125906930	$2a$10$4ztV04tsCbgFV8XtT40WJe/okVxh0Vq24tQLuTyitnzLNYmmT2.UW	57	2004-05-14	2025-01-22 17:21:09.697302	/uploads/profile-pics/profile-1737244972746-163748146.jpeg	\N	\N	0.0	\N	t	\N	femenino	\N
37	Jhonangelwdawdaw	Bricenodwadawd	12122143	jheo04@gmail.com	04241338828	$2a$10$T/mELkyxUqH2I0HKnpXVl.1db13dXmWifMPSW382u/dZJOdpKQB0G	58	1999-06-16	2025-02-08 21:27:57.919679	/uploads/profile-pics/user.webp	\N	\N	0.0	{"Manicura","Faciales","Epilaciones","Quiropodía"}	t	\N	\N	\N
39	maigleawdaw	ñlmjkm	45455544	rtftfttffty@gmail.com	04241338828	$2a$10$iuL47h.obipfjxExUyVWFud.d9Xlzl9nS3IctuVWmC8L4402IXoGi	57	1999-07-14	2025-02-09 01:59:30.880206	/uploads/profile-pics/user.webp	\N	\N	0.0	\N	t	\N	\N	\N
41	maigleeeeeee	awdawdwa	12211441	awdaactyt@gmail.com	04265121212	$2a$10$pysEGeDDdVqC.lDiPWehH.wm50tZBuG7sMim1FSsQtfiXbtJaR3Qe	57	1995-09-19	2025-02-09 03:11:56.403694	/uploads/profile-pics/user.web