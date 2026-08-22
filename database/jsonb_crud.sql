-- 1. ОБНОВЛЕНИЕ: изменить сумму ссуды
-- (jsonb_set по конкретному пути)
UPDATE loan_document
SET doc = jsonb_set(doc, '{amount}', '17650.00', false)
WHERE id = 1 RETURNING *;

-- 2. ОБНОВЛЕНИЕ: отметить ссуду как возвращённую
UPDATE loan_document
SET doc = jsonb_set(doc, '{is_returned}', 'true', false)
WHERE id = 2 RETURNING *;

-- 3. ОБНОВЛЕНИЕ вложенного поля: изменить адрес ломбарда (путь глубиной 2)
UPDATE loan_document
SET doc = jsonb_set(doc, '{pawnshop, address}', '"ул. Гагарина, д. 5"', false)
WHERE id = 3 RETURNING *;

-- 4. ДОБАВЛЕНИЕ нового поля верхнего уровня через оператор
-- конкатенации ||
UPDATE loan_document
SET doc = doc || jsonb_build_object('last_updated', now():: date)
WHERE id = 4 RETURNING *;

-- 5. ДОБАВЛЕНИЕ нового элемента в массиве items
-- (jsonb_insert - вставка в конец массива)
UPDATE loan_document
SET doc = jsonb_insert(
          doc,
          '{items, 9999}',
         jsonb_build_object('type', 'картина', 'description',
         'Пейзаж маслом', 'value', 32000.00),
          true
          )
WHERE id = 5 RETURNING *;

-- 6. УДАЛЕНИЕ поля аз документа
-- ( оператор # -)
UPDATE loan_document
SET doc = doc #- '{penalty_percent}'
WHERE id = 6 AND (doc ->> 'is_returned'):: boolean = true RETURNING *;

-- 7. УДАЛЕНИЕ конкертного элемента массива items по индексу 0
UPDATE loan_document
SET doc = doc #- '{items, 0}'
WHERE id = 7 AND jsonb_array_length(doc -> 'items') > 1 RETURNING *;

-- ================================================== ---

-- Удаление данных

-- 1. Удалить очень старые невозвращённые ссуды
-- (просрочены и старше начала 2024 года)
DELETE FROM loan_document
WHERE (doc ->> 'is_returned'):: boolean = false
AND (doc ->> 'return_date'):: date < '2024-01-01';

-- 2. Удалить мелкие ссуды студентов
-- (< 1000)
DELETE FROM loan_document
WHERE doc -> 'client' ->> 'social_status' = 'студент'
    AND (doc ->> 'amount'):: numeric < 1000;