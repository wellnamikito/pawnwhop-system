-- 1. Индекс на само поле, в котором хранится
-- JSON - документ
-- (GIN по всему документу)
CREATE INDEX idx_loan_doc_gin ON loan_document USING GIN(doc jsonb_path_ops);

-- 2. Индекс по выражению для конкретного ключа: ссума ссуды
CREATE INDEX idx_loan_doc_amount ON loan_document
(((doc ->> 'amount'):: numeric));

-- 3. Индекс по выражению для конкретного ключа: статус возврата
CREATE INDEX idx_loan_doc_is_returned ON loan_document
(((doc ->> 'is_returned'):: boolean));

-- 4. Индекс по вложенному ключу: район расположения ломбарда
CREATE INDEX idx_loan_doc_district ON loan_document
((doc -> 'pawnshop' -> 'district' ->> 'name'));

-- 5. Индекс по вложенному ключу: социальный статус клиента (нужен для запросов из разд. 4.1 и 5.1)
CREATE INDEX idx_loan_doc_social_status ON loan_document ((doc -> 'client' ->> 'social_status'));

-- 6. Индекс по выражению: дата возврата ссуды (нужен для запроса удаления из разд. 5.1)
CREATE INDEX idx_loan_doc_return_date ON loan_document (((doc ->> 'return_date')::date));