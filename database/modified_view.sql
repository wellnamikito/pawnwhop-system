-- =========================================================
-- МОДИФИЦИРУЕМОЕ VIEW + TRIGGER
-- Изменение данных клиента через представление
-- =========================================================
CREATE OR REPLACE VIEW public.vw_client_edit AS
SELECT
    client_id,
    last_name,
    first_name,
    middle_name,
    birth_date,
    address,
    phone
FROM public.client;

CREATE OR REPLACE FUNCTION public.trg_vw_client_edit()
RETURNS trigger AS $$
BEGIN

UPDATE public.client
SET
    last_name = NEW.last_name,
    first_name = NEW.first_name,
    middle_name = NEW.middle_name,
    birth_date = NEW.birth_date,
    address = NEW.address,
    phone = NEW.phone
WHERE client_id = NEW.client_id;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_update_client_view
ON public.vw_client_edit;



CREATE TRIGGER tg_update_client_view
    INSTEAD OF UPDATE
    ON public.vw_client_edit
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_vw_client_edit();