BEGIN;


CREATE TABLE IF NOT EXISTS public.appointment
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    user_id bigint NOT NULL,
    services text COLLATE pg_catalog."default" NOT NULL,
    status_id bigint NOT NULL,
    status_order boolean NOT NULL,
    paid boolean NOT NULL,
    address text COLLATE pg_catalog."default" NOT NULL,
    payment_method integer NOT NULL,
    amount text COLLATE pg_catalog."default" NOT NULL,
    scheduled_date text COLLATE pg_catalog."default" NOT NULL,
    reference_payment character varying(30) COLLATE pg_catalog."default",
    point character varying(100) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_appointment_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.appointment_specialists
(
    appointment_id bigint NOT NULL,
    specialist_id bigint NOT NULL,
    service_id bigint,
    sessions_assigned integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status_id integer,
    start_appointment timestamp without time zone,
    end_appointment timestamp without time zone,
    earnings numeric(10, 2),
    CONSTRAINT appointment_specialists_pkey PRIMARY KEY (appointment_id, specialist_id),
    CONSTRAINT unique_assignment UNIQUE (appointment_id, specialist_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.classification
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    classification_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    parent_classification_id bigint,
    service_image text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    price numeric(10, 2),
    service_category boolean,
    "time" character varying(100) COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    CONSTRAINT pk_classification_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.ratings
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    user_id bigint NOT NULL,
    appointment_id bigint NOT NULL,
    rating integer NOT NULL,
    rated_by character varying(20) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_ratings_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.specialist_cancelled_appointments
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    specialist_id bigint NOT NULL,
    appointment_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_specialist_cancelled_appointments_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public."user"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(100) COLLATE pg_catalog."default" NOT NULL,
    identification character varying(10) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    telephone_number character varying(15) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role_id bigint NOT NULL,
    date_of_birth date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    picture_profile text COLLATE pg_catalog."default",
    security_question character varying(100) COLLATE pg_catalog."default",
    answer character varying(100) COLLATE pg_catalog."default",
    score numeric(2, 1) DEFAULT 0.0,
    specialization character varying(100) COLLATE pg_catalog."default",
    status boolean DEFAULT true,
    reset_code character varying(6) COLLATE pg_catalog."default",
    gender genero,
    secret_password character varying(120) COLLATE pg_catalog."default",
    CONSTRAINT pk_user_id PRIMARY KEY (id),
    CONSTRAINT uq_user_email UNIQUE (email)
);

ALTER TABLE IF EXISTS public.appointment
    ADD CONSTRAINT fk_payment_method_id FOREIGN KEY (payment_method)
    REFERENCES public.classification (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.appointment
    ADD CONSTRAINT fk_status_id FOREIGN KEY (status_id)
    REFERENCES public.classification (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_appointment_status_id
    ON public.appointment(status_id);


ALTER TABLE IF EXISTS public.appointment
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_appointment_user_id
    ON public.appointment(user_id);


ALTER TABLE IF EXISTS public.appointment_specialists
    ADD CONSTRAINT appointment_specialists_appointment_id_fkey FOREIGN KEY (appointment_id)
    REFERENCES public.appointment (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.appointment_specialists
    ADD CONSTRAINT appointment_specialists_specialist_id_fkey FOREIGN KEY (specialist_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.appointment_specialists
    ADD CONSTRAINT appointment_specialists_specialist_status_id_fkey FOREIGN KEY (status_id)
    REFERENCES public.classification (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.appointment_specialists
    ADD CONSTRAINT fk_service_id FOREIGN KEY (service_id)
    REFERENCES public.classification (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_appointment_specialists_service
    ON public.appointment_specialists(service_id);


ALTER TABLE IF EXISTS public.classification
    ADD CONSTRAINT fk_classification_parent FOREIGN KEY (parent_classification_id)
    REFERENCES public.classification (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.ratings
    ADD CONSTRAINT ratings_appointment_id_fkey FOREIGN KEY (appointment_id)
    REFERENCES public.appointment (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.specialist_cancelled_appointments
    ADD CONSTRAINT fk_appointment_id FOREIGN KEY (appointment_id)
    REFERENCES public.appointment (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.specialist_cancelled_appointments
    ADD CONSTRAINT fk_specialist_id FOREIGN KEY (specialist_id)
    REFERENCES public."user" (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public."user"
    ADD CONSTRAINT fk_role_id FOREIGN KEY (role_id)
    REFERENCES public.classification (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_user_role
    ON public."user"(role_id);

END;