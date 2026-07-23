-- Домены --

CREATE DOMAIN hour_domain AS INTEGER
CHECK ( VALUE BETWEEN 0 AND 23);

CREATE DOMAIN amount_domain AS NUMERIC(10,2)
CHECK ( VALUE > 0);

CREATE DOMAIN demand_domain AS BOOLEAN;

CREATE DOMAIN phone_domain AS VARCHAR(12)
CHECK ( VALUE ~ '^\+7[0-9]{10}$' );

CREATE DOMAIN  fio_domain AS VARCHAR(100)
CHECK ( VALUE ~ '^[A-Za-zА-Яа-яЁё\- ]+$' );

CREATE TABLE IF NOT EXISTS pledge_item_type(
  item_type_id SERIAL PRIMARY KEY,
  type_name varchar(100)
);

CREATE TABLE IF NOT EXISTS ownership_type(
  ownership_type_id SERIAL PRIMARY KEY,
  type_name varchar(100)
);

CREATE TABLE IF NOT EXISTS district(
    district_id SERIAL PRIMARY KEY,
    district_name varchar(100)
);

CREATE TABLE IF NOT EXISTS owner_type(
    owner_type_id SERIAL PRIMARY KEY,
    type_name varchar(100)
);

CREATE TABLE IF NOT EXISTS social_status(
    social_status_id SERIAL PRIMARY KEY,
    status_name varchar(100)
);

CREATE TABLE IF NOT EXISTS owners(
    owner_id SERIAL PRIMARY KEY,
    last_name fio_domain NOT NULL,
    first_name fio_domain NOT NULL,
    middle_name fio_domain,
    owner_type_id INT, FOREIGN KEY (owner_type_id) REFERENCES owner_type,
    phone phone_domain
);

CREATE TABLE IF NOT EXISTS pawnshop(
    pawnshop_id SERIAL PRIMARY KEY,
    name varchar(100) NOT NULL ,
    ownership_type_id INT NOT NULL , FOREIGN KEY (ownership_type_id) REFERENCES ownership_type,
    owner_id INT NOT NULL , FOREIGN KEY (owner_id) REFERENCES owners,
    district_id INT NOT NULL , FOREIGN KEY (district_id) REFERENCES district,
    address varchar(100) NOT NULL ,
    phone phone_domain,
    opening_hour hour_domain,
    closing_hour hour_domain CHECK (closing_hour > opening_hour)
);

CREATE TABLE IF NOT EXISTS client(
    client_id SERIAL PRIMARY KEY,
    last_name fio_domain NOT NULL,
    first_name fio_domain NOT NULL,
    middle_name fio_domain,
    birth_date date,
    social_status_id INT, FOREIGN KEY (social_status_id) REFERENCES social_status,
    address varchar(100),
    phone phone_domain
);

CREATE TABLE IF NOT EXISTS loan(
    loan_id SERIAL PRIMARY KEY,
    pawnshop_id INT, FOREIGN KEY (pawnshop_id) REFERENCES pawnshop,
    client_id INT, FOREIGN KEY (client_id) REFERENCES client,
    amount amount_domain,
    issue_date date,
    return_date date,
    penalty_percent numeric(5,2) CHECK ( penalty_percent BETWEEN 0 AND 100),
    is_returned demand_domain
);

CREATE TABLE IF NOT EXISTS loan_item(
    loan_id INT, FOREIGN KEY (loan_id) REFERENCES loan ON DELETE CASCADE ,
    item_type_id INT, FOREIGN KEY (item_type_id) REFERENCES pledge_item_type,
    PRIMARY KEY (loan_id, item_type_id),
    item_description TEXT,
    item_value amount_domain
);

