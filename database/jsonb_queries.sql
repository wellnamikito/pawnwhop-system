-- 1. Запросы с выводом конкретных полей /
-- объектов / массивов с условиями

-- 1. ФИО и телефон клиента, сумма ссуды
-- - по невозвращённым ссудам свыше 30 000
EXPLAIN (ANALYSE, BUFFERS )
SELECT
    doc -> 'client' -> 'full_name' ->> 'last_name'  AS client_last_name,
    doc -> 'client' -> 'full_name' ->> 'first_name'  AS client_first_name,
    doc -> 'client' -> 'full_name' ->> 'middle_name'  AS client_middle_name,
    doc -> 'client' -> 'contacts' ->> 'phone' AS client_phone,
    doc ->> 'amount' AS amount
FROM loan_document
WHERE (doc ->> 'amount'):: numeric > 30000
    AND (doc ->> 'is_returned'):: boolean = false;

-- 2. Название, адрес ломбарда и массив
-- заложенных предметов - для ломбардов
-- Центрального района, обслуживающих студентов
EXPLAIN (ANALYSE, BUFFERS)
SELECT
    doc -> 'pawnshop' ->> 'name' AS pawnshop_name,
    doc -> 'pawnshop' ->> 'address' AS pawnshop_address,
    doc -> 'items' AS items
FROM loan_document
WHERE doc -> 'pawnshop' ->'district' ->> 'name' = 'Центральный'
AND doc -> 'client' ->> 'social_status' = 'Студент';

-- 3. Объекты предметов залога типа "электроника"
-- стоимостью выше 5 000
EXPLAIN (ANALYSE, BUFFERS )
SELECT
    id,
    item
FROM loan_document,
     jsonb_array_elements(doc -> 'items') AS item
WHERE item ->> 'type' = 'электроника'
  AND (item ->> 'value')::numeric > 5000;

-- 2 Выборки с использованием jsonpath

-- 1. Все предметы залога дороже 20000 внутри документа
EXPLAIN (ANALYSE, BUFFERS )
SELECT id, jsonb_path_query(doc, '$.items[*] ? (@.value > 20000)') AS expensive_item
FROM loan_document
LIMIT 100;

-- 2. Невозвращённые ссуды с пеней выше 3%
EXPLAIN (ANALYSE, BUFFERS )
SELECT id, doc
FROM loan_document
WHERE jsonb_path_exists(doc, '$ ? (@.is_returned == false && @.penalty_percent > 3)');


-- 3. Владельцы ломбардов — юридические лица (проверка вложенного пути owner.owner_type)
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, jsonb_path_query(doc, '$.pawnshop.owner ? (@.owner_type == "Юридическое лицо")') AS owner_info
FROM loan_document;

-- 3. Выборки с использованием функций обработки JSON

-- 1. Количество заложенных элементов в каждой ссуде
SELECT id, jsonb_array_length(doc -> 'items') AS item_count
FROM loan_document
LIMIT 100;

-- 2. Суммарная стоимость заложенных предметов по каждой ссуде
-- (разворот массива в строки)
SELECT
    id,
    sum((item ->> 'value'):: numeric) AS total_pledge_value
FROM loan_document,
     jsonb_array_elements(doc -> 'items') AS item
GROUP BY id
LIMIT 100;

-- 3. Агрегация: количество ссуд по соц.статусу
-- клиента, собранное в один JSON-объект
EXPLAIN (ANALYSE, BUFFERS )
SELECT jsonb_object_agg(social_status, cnt) AS stats_by_status
FROM(
    SELECT doc -> 'client' ->> 'social_status' AS social_status,
           count(*) AS cnt
    FROM loan_document
    GROUP BY 1
    ) t;

-- ============================================= --

-- Оптимизированные запросы

SELECT doc -> 'client' -> 'full_name', doc -> 'client' -> 'contacts' ->> 'phone', doc ->> 'amount'
FROM loan_document
WHERE (doc ->> 'amount')::numeric > 30000
  AND (doc ->> 'is_returned')::boolean = false;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, item
FROM loan_document,
     jsonb_array_elements(doc -> 'items') AS item
WHERE doc @> '{"items": [{"type": "электроника"}]}'::jsonb
  AND item ->> 'type' = 'электроника'
  AND (item ->> 'value')::numeric > 5000;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, doc
FROM loan_document
WHERE ((doc ->> 'is_returned')::boolean) = false
  AND ((doc ->> 'penalty_percent')::numeric) > 3;


EXPLAIN (ANALYZE, BUFFERS)
SELECT id, doc -> 'pawnshop' -> 'owner'
FROM loan_document
WHERE doc -> 'pawnshop' -> 'owner' ->> 'owner_type' = 'Юридическое лицо';