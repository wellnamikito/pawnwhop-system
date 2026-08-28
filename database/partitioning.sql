CREATE TABLE IF NOT EXISTS loan_range(
  loan_id       SERIAL,
  pawnshop_id   INT NOT NULL REFERENCES pawnshop,
  client_id     INT NOT NULL REFERENCES client,
  amount        amount_domain,
  issue_date    date NOT NULL,
  return_date   date,
  penalty_percent numeric(5,2) CHECK ( penalty_percent BETWEEN 0 AND 100),
  is_returned demand_domain,
  PRIMARY KEY (loan_id, issue_date) -- ключ разбиения обязан входить в PK
) PARTITION BY RANGE (issue_date);

--  Секция 1 -2023
-- Сразу секционирована повторно (доб.требование)
CREATE TABLE loan_range_y2023 PARTITION OF loan_range
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01')
PARTITION BY RANGE (issue_date);

-- данные реально стартуют с 2023-07-23, поэтому кварталы:
-- Q3, Q4 (Q1/Q2 будут пустыми)
CREATE TABLE loan_range_y2023_q1 PARTITION OF loan_range_y2023
FOR VALUES FROM ('2023-01-01') TO ('2023-04-01');
CREATE TABLE loan_range_y2023_q2 PARTITION OF loan_range_y2023
    FOR VALUES FROM ('2023-04-01') TO ('2023-07-01');
CREATE TABLE loan_range_y2023_q3 PARTITION OF loan_range_y2023
    FOR VALUES FROM ('2023-07-01') TO ('2023-10-01');
CREATE TABLE loan_range_y2023_q4 PARTITION OF loan_range_y2023
    FOR VALUES FROM ('2023-10-01') TO ('2024-01-01');

-- Секция 2-4 обычные, по годам
CREATE TABLE loan_range_y2024 PARTITION OF loan_range
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE loan_range_y2025 PARTITION OF loan_range
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE loan_range_y2026 PARTITION OF loan_range
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Секция по умолчанию - на случай дат вне 2023-2026
CREATE TABLE loan_range_default PARTITION OF loan_range DEFAULT;

-- Заливаем  данные
INSERT INTO loan_range (loan_id, pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned)
SELECT loan_id, pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned
FROM loan;

-- Проверка распределения по секциям
SELECT tableoid::regclass AS partition, count(*) AS rows
FROM loan_range
GROUP BY tableoid
ORDER BY partition;

-- Секционная таблица #2 (список LIST)

CREATE TABLE IF NOT EXISTS loan_list(
    loan_id        INT NOT NULL,
    pawnshop_id    INT NOT NULL REFERENCES pawnshop,
    client_id      INT NOT NULL REFERENCES client,
    amount         amount_domain,
    issue_date     date NOT NULL,
    return_date    date,
    penalty_percent numeric(5,2) CHECK (penalty_percent BETWEEN 0 AND 100),
    is_returned    demand_domain,
    pawnshop_group INT NOT NULL,   -- обычная (не generated) колонка — ключ разбиения
    PRIMARY KEY (loan_id, pawnshop_group)
) PARTITION BY LIST(pawnshop_group);

-- 4 группы ломбардов
CREATE TABLE loan_list_g1 PARTITION OF loan_list FOR VALUES IN(1); -- id 1..600
CREATE TABLE loan_list_g2 PARTITION OF loan_list FOR VALUES IN(2); -- id 600..1200
CREATE TABLE loan_list_g3 PARTITION OF loan_list FOR VALUES IN(3); -- id 1200..1800
CREATE TABLE loan_list_g4 PARTITION OF loan_list FOR VALUES IN(4); -- id 1891..1990
CREATE TABLE loan_list_default PARTITION OF loan_list DEFAULT;     -- id 1990..1999

-- Переносим данные из первой патриции таблицы 1 (loan_range_y2023 - весь 2023 год)
INSERT INTO loan_list (loan_id, pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned, pawnshop_group)
SELECT
    loan_id, pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned,
    CASE
        WHEN pawnshop_id BETWEEN 1    AND 600  THEN 1
        WHEN pawnshop_id BETWEEN 601  AND 1200 THEN 2
        WHEN pawnshop_id BETWEEN 1201 AND 1800 THEN 3
        WHEN pawnshop_id BETWEEN 1801 AND 1990 THEN 4
        ELSE 99   -- 1991..1999 намеренно уходят в DEFAULT
        END
FROM loan_range_y2023;

SELECT tableoid::regclass AS partition, count(*) AS rows
FROM loan_list
GROUP BY tableoid
ORDER BY partition;

-- Обычная (не секционированная) таблица

CREATE TABLE IF NOT EXISTS loan_plain(
    loan_id        SERIAL PRIMARY KEY,
    pawnshop_id    INT NOT NULL REFERENCES pawnshop,
    client_id      INT NOT NULL REFERENCES client,
    amount         amount_domain,
    issue_date     date NOT NULL,
    return_date    date,
    penalty_percent numeric(5,2) CHECK (penalty_percent BETWEEN 0 AND 100),
     is_returned    demand_domain
);

INSERT INTO loan_plain (loan_id, pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned)
SELECT loan_id, pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned
FROM loan_range_y2023;

-- сихронизируем счётчик serial, чтобы дальнейшие вставки не конфликтовали по id-ку
SELECT setval('loan_plain_loan_id_seq', (SELECT max(loan_id) FROM loan_plain));

SELECT count(*) FROM loan_plain;

-- ИНДЕКСЫ

-- ===== loan_range (RANGE) =====
CREATE INDEX idx_loan_range_issue_date ON loan_range (issue_date);   -- по ключу разбиения
CREATE INDEX idx_loan_range_pawnshop   ON loan_range (pawnshop_id);
CREATE INDEX idx_loan_range_client     ON loan_range (client_id);
CREATE INDEX idx_loan_range_returned   ON loan_range (is_returned);

-- ===== loan_list (LIST) =====
CREATE INDEX idx_loan_list_group    ON loan_list (pawnshop_group);   -- по ключу разбиения
CREATE INDEX idx_loan_list_pawnshop ON loan_list (pawnshop_id);
CREATE INDEX idx_loan_list_client   ON loan_list (client_id);
CREATE INDEX idx_loan_list_date     ON loan_list (issue_date);

-- ===== loan_plain (обычная таблица) =====
CREATE INDEX idx_loan_plain_issue_date ON loan_plain (issue_date);
CREATE INDEX idx_loan_plain_pawnshop   ON loan_plain (pawnshop_id);
CREATE INDEX idx_loan_plain_client     ON loan_plain (client_id);
CREATE INDEX idx_loan_plain_returned   ON loan_plain (is_returned);

-- обновляем статистику планировщика, чтобы EXPLAIN дальше давал корректные оценки
ANALYZE loan_range;
ANALYZE loan_list;
ANALYZE loan_plain;

SELECT tablename, indexname FROM pg_indexes
WHERE tablename LIKE 'loan_range%'
ORDER BY tablename;

-- Сравнение секций и обычной таблицы:

-- ТЕСТ 1. Выборка по диапазону дат (один квартал) на loan_range
-- ожидаем: сработает partition pruning, читается только 1 секция
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT count(*), avg(amount)
FROM loan_range
WHERE issue_date BETWEEN '2023-07-23' AND '2023-09-30';

-- ТЕСТ 2. Тот же диапазон, но на loan_plain — там ВСЕ данные того же периода
-- (т.к. loan_plain = копия loan_range_y2023 целиком)
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT count(*), avg(amount)
FROM loan_plain
WHERE issue_date BETWEEN '2023-07-23' AND '2023-09-30';

-- ТЕСТ 3. Запрос БЕЗ фильтра по ключу разбиения — по всей loan_range
-- ожидаем: секции НЕ отсекаются, сканируются все
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT pawnshop_id, count(*), sum(amount)
FROM loan_range
GROUP BY pawnshop_id
ORDER BY pawnshop_id
LIMIT 20;

-- ТЕСТ 4. loan_list — выборка по одной группе ломбардов (одна секция)
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT count(*), avg(amount)
FROM loan_list
WHERE pawnshop_group = 2;

-- ТЕСТ 5. loan_plain — та же выборка по pawnshop_id (601..1200), без секционирования
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT count(*), avg(amount)
FROM loan_plain
WHERE pawnshop_id BETWEEN 601 AND 1200;

-- ТЕСТ 6. Точечный поиск НЕ по ключу разбиения (client_id) — loan_range
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT * FROM loan_range WHERE client_id = 100;

-- ТЕСТ 7. Тот же поиск — loan_plain
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT * FROM loan_plain WHERE client_id = 100;

-- ТЕСТ 8. Проверка вложенной секции — попадание в конкретный квартал 2023
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT count(*) FROM loan_range WHERE issue_date BETWEEN '2023-08-01' AND '2023-08-31';