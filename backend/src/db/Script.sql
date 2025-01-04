DROP DATABASE IF EXISTS DB_UNIMAS;
CREATE DATABASE DB_UNIMAS;


DROP TABLE IF EXISTS public."classification";

CREATE TABLE IF NOT EXISTS public."classification"(
    Id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    classification_type VARCHAR(50) NOT NULL,       
    parent_classification_id BIGINT NULL,           
    icon_url TEXT NULL,           
    service_image text NULL             
    description TEXT NULL,
    price    NUMERIC(10,2) NULL,
    service_category BOOLEAN NULL,
    CONSTRAINT Pk_Classification_Id PRIMARY KEY(Id),
    CONSTRAINT fk_Classification_Parent FOREIGN KEY (parent_classification_id) REFERENCES public."classification"(Id)
);

CREATE INDEX IF NOT EXISTS Idx_Classification_classification_type 
ON public."classification"(classification_type);


DROP TABLE IF EXISTS public."user";

CREATE TABLE IF NOT EXISTS public."user"( 
    Id               BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    name             VARCHAR(100)    NOT NULL,
    lastname         VARCHAR(100)    NOT NULL,
    identification   VARCHAR(10)      NOT NULL,
    email            VARCHAR(100)    NOT NULL UNIQUE,
    telephone_number VARCHAR(15)     NOT NULL,
    password         VARCHAR(255)    NOT NULL,
    role_id          BIGINT          NOT NULL,
    date_of_birth    DATE                NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT Pk_User_Id               PRIMARY KEY (Id),
    CONSTRAINT uq_user_email            UNIQUE(email),
    CONSTRAINT chk_user_email_format    CHECK(email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_user_telephone       CHECK(telephone_number ~ '^\+?[0-9]{10,15}$'),
    CONSTRAINT fk_gender_id             FOREIGN KEY (gender_id) REFERENCES public."classification"(Id),
    CONSTRAINT fk_role_id               FOREIGN KEY (role_id)   REFERENCES public."classification"(Id) 
);

CREATE INDEX IF NOT EXISTS Idx_User_Email ON public."user"(email);
CREATE INDEX IF NOT EXISTS Idx_User_Role ON public."user"(role_id);


DROP TABLE IF EXISTS public."specialist_details";
CREATE TABLE IF NOT EXISTS public."specialist_details"(
    Id                  BIGINT      NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id             BIGINT      NOT NULL,
    verification_status BOOLEAN     NOT NULL DEFAULT TRUE,
    profile_picture     TEXT            NULL,
    average_rating      INT             NULL,
    experience          INT         NOT NULL,
    specialization_id   BIGINT NOT NULL,
    CONSTRAINT Pk_Specialist_Details_Id PRIMARY KEY(Id),
    CONSTRAINT fk_user_id 			FOREIGN KEY (user_id) REFERENCES public."user"(Id),
    CONSTRAINT fk_specialization_type FOREIGN KEY(specialization_id) REFERENCES classification(Id)
);

CREATE INDEX IF NOT EXISTS Idx_Specialist_Details_User_Id ON public."specialist_details"(user_id);
CREATE INDEX IF NOT EXISTS Idx_Specialist_Details_Verification_Status ON public."specialist_details"(verification_status);


DROP TABLE IF EXISTS public."bank_accounts";
CREATE TABLE IF NOT EXISTS public."bank_accounts"(
    Id              BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id         BIGINT          NOT NULL,
    bank_name       VARCHAR(255)    NOT NULL,
    account_number  VARCHAR(50)     NOT NULL,
    account_type    VARCHAR(45)     NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT Pk_Bank_Accounts_Id  PRIMARY KEY(Id),
    CONSTRAINT uq_account_number    UNIQUE(account_number),
    CONSTRAINT fk_user_id           FOREIGN KEY (user_id)  REFERENCES public."user"(Id)
);

CREATE INDEX IF NOT EXISTS Idx_Bank_Accounts_User_Id ON public."bank_accounts"(user_id);


DROP TABLE IF EXISTS public."appointment";
CREATE TABLE IF NOT EXISTS public."appointment"(
    Id                              BIGINT          NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id                         BIGINT          NOT NULL,
    specialist_id                   BIGINT          NOT NULL,
    service_id                      BIGINT          NOT NULL,
    status_id                       BIGINT          NOT NULL,
    scheduled_date                  TIMESTAMP           NULL,
    note                            TEXT                NULL,
    start_appointment               TIMESTAMP           NULL,
    end_appointment                 TIMESTAMP           NULL,
    note_of_services                TEXT                NULL,   

    CONSTRAINT Pk_Appointment_Id    PRIMARY KEY(Id),
    CONSTRAINT chk_appointment_future_date CHECK(scheduled_date > CURRENT_TIMESTAMP),

    CONSTRAINT fk_user_id       FOREIGN KEY (user_id)           REFERENCES public."user"(Id),
    CONSTRAINT fk_specialist_id FOREIGN KEY (specialist_id)     REFERENCES public."user"(Id),
    CONSTRAINT fk_service_id    FOREIGN KEY (service_id)        REFERENCES public."classification"(Id),
    CONSTRAINT fk_status_id     FOREIGN KEY (status_id)         REFERENCES public."classification"(Id)
);

CREATE INDEX IF NOT EXISTS Idx_appointment_user_id ON public."appointment"(user_id);
CREATE INDEX IF NOT EXISTS Idx_appointment_specialist_id ON public."appointment"(specialist_id);
CREATE INDEX IF NOT EXISTS Idx_appointment_scheduled_date ON public."appointment"(scheduled_date);
CREATE INDEX IF NOT EXISTS Idx_appointment_status_id ON public."appointment"(status_id);

CREATE INDEX IF NOT EXISTS Idx_appointment_user_scheduled_date ON public."appointment"(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS Idx_appointment_specialist_scheduled_date ON public."appointment"(specialist_id, scheduled_date);

DROP TABLE IF EXISTS public."appointment_payments";

CREATE TABLE IF NOT EXISTS appointment_payments (
    Id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    appointment_id BIGINT NOT NULL,
    payment_method_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_status_id BIGINT NOT NULL,
    transaction_reference VARCHAR(100) NULL UNIQUE,

    CONSTRAINT pk_appointment_payments_id PRIMARY KEY(Id),
    CONSTRAINT fk_payment_appointment FOREIGN KEY(appointment_id) REFERENCES appointment(Id),
    CONSTRAINT fk_payment_method FOREIGN KEY(payment_method_id) REFERENCES classification(Id),
    CONSTRAINT fk_payment_status FOREIGN KEY(payment_status_id) REFERENCES classification(Id),
    CONSTRAINT chk_payment_amount_positive CHECK(amount > 0)
);

DROP TABLE IF EXISTS public."log";
CREATE TABLE IF NOT EXISTS public."log"(
    Id                  BIGINT  NOT     NULL GENERATED ALWAYS AS IDENTITY,
    user_id             BIGINT          NULL,                 
    log_type_id         BIGINT  NOT     NULL,             
    appointment_id      BIGINT          NULL,          
    details             TEXT    NOT     NULL,               
    rating              INT     NOT     NULL DEFAULT 0,            
    day_and_hour        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT Pk_Log_Id PRIMARY KEY(Id),

    CONSTRAINT fk_user_id        FOREIGN KEY (user_id)           REFERENCES public."user"(Id),
    CONSTRAINT fk_log_type_id    FOREIGN KEY (log_type_id)       REFERENCES public."classification"(Id),
    CONSTRAINT fk_appointment_id FOREIGN KEY (appointment_id)    REFERENCES public."appointment"(Id),
    CONSTRAINT chk_log_rating    CHECK(rating BETWEEN 0 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_log_log_type_id ON public."log"(log_type_id);
CREATE INDEX IF NOT EXISTS idx_log_day_and_hour ON public."log"(day_and_hour);
CREATE INDEX IF NOT EXISTS idx_log_user_id ON public."log"(user_id);
CREATE INDEX IF NOT EXISTS idx_log_appointment_id ON public."log"(appointment_id); 



--Index apartes--
CREATE INDEX Idx_specialist_verification ON specialist_details(verification_status) WHERE verification_status = TRUE;
CREATE INDEX Idx_appointment_date_range ON appointment(scheduled_date, status_id);
CREATE INDEX Idx_specialist_rating ON specialist_details(average_rating) WHERE average_rating IS NOT NULL;