-- =========================================================
-- ТРИГГЕР 1
-- BEFORE INSERT ON loan
-- Проверка корректности дат
-- =========================================================

CREATE OR REPLACE FUNCTION trg_loan_before_insert()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.return_date <= NEW.issue_date THEN
        RAISE EXCEPTION
            'Дата возврата должна быть позже даты выдачи.';
    END IF;

    RETURN NEW;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER tg_loan_before_insert
    BEFORE INSERT
    ON loan
    FOR EACH ROW
EXECUTE FUNCTION trg_loan_before_insert();



-- =========================================================
-- ТРИГГЕР 2
-- BEFORE UPDATE ON loan
-- Проверка суммы ссуды
-- =========================================================

CREATE OR REPLACE FUNCTION trg_loan_before_update()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION
            'Сумма ссуды должна быть больше нуля.';
    END IF;

    RETURN NEW;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER tg_loan_before_update
    BEFORE UPDATE
    ON loan
    FOR EACH ROW
EXECUTE FUNCTION trg_loan_before_update();



-- =========================================================
-- ТРИГГЕР 3
-- AFTER DELETE ON loan
-- =========================================================

CREATE OR REPLACE FUNCTION trg_loan_after_delete()
    RETURNS TRIGGER AS
$$
BEGIN
    RAISE NOTICE
        'Ссуда с идентификатором % удалена.',
        OLD.loan_id;

    RETURN OLD;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER tg_loan_after_delete
    AFTER DELETE
    ON loan
    FOR EACH ROW
EXECUTE FUNCTION trg_loan_after_delete();



-- =========================================================
-- ТРИГГЕР 4
-- BEFORE INSERT ON client
-- Приведение ФИО к красивому виду
-- =========================================================

CREATE OR REPLACE FUNCTION trg_client_before_insert()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.last_name := INITCAP(NEW.last_name);
    NEW.first_name := INITCAP(NEW.first_name);

    IF NEW.middle_name IS NOT NULL THEN
        NEW.middle_name := INITCAP(NEW.middle_name);
    END IF;

    RETURN NEW;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER tg_client_before_insert
    BEFORE INSERT
    ON client
    FOR EACH ROW
EXECUTE FUNCTION trg_client_before_insert();



-- =========================================================
-- ТРИГГЕР 5
-- BEFORE UPDATE ON client
-- Проверка даты рождения
-- =========================================================

CREATE OR REPLACE FUNCTION trg_client_before_update()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.birth_date > CURRENT_DATE THEN
        RAISE EXCEPTION
            'Дата рождения не может быть больше текущей даты.';
    END IF;

    RETURN NEW;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER tg_client_before_update
    BEFORE UPDATE
    ON client
    FOR EACH ROW
EXECUTE FUNCTION trg_client_before_update();



-- =========================================================
-- ТРИГГЕР 6
-- AFTER DELETE ON client
-- =========================================================

CREATE OR REPLACE FUNCTION trg_client_after_delete()
    RETURNS TRIGGER AS
$$
BEGIN
    RAISE NOTICE
        'Клиент с идентификатором % удалён.',
        OLD.client_id;

    RETURN OLD;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER tg_client_after_delete
    AFTER DELETE
    ON client
    FOR EACH ROW
EXECUTE FUNCTION trg_client_after_delete();