-- 1.Симметричное внутреннее соединение с услвоием
-- а) два запроса с условием по внеш.ключу
-- Ссуды, выданные конкретным ломбардом

SELECT l.loan_id, c.last_name,
       c.first_name, l.amount, l.issue_date
FROM loan l
INNER JOIN client c ON l.client_id = c.client_id
INNER JOIN pawnshop p ON l.pawnshop_id = p.pawnshop_id
WHERE p.pawnshop_id = :pawnshop_id;

-- Залоговые предметы определённого типа
SELECT li.loan_id, li.item_description,
       li.item_value, t.type_name
FROM loan_item li
INNER JOIN pledge_item_type t
    on li.item_type_id = t.item_type_id
WHERE t.item_type_id = :item_type_id;

-- б) два запроса с условием по датам

-- ссуды, выданные за указанный период
SELECT l.loan_id, c.last_name, l.amount, l.issue_date
FROM loan l
         JOIN client c ON l.client_id = c.client_id
WHERE l.issue_date BETWEEN DATE '2024-05-01' AND DATE '2024-06-06';

-- Просроченные невозвращённые ссуды на заданную дату
SELECT l.loan_id, c.last_name, c.phone, l.return_date
FROM loan l
         JOIN client c ON l.client_id = c.client_id
WHERE l.return_date < '2023-11-26' AND l.is_returned = false;

-- 2. Симметричное внутреннее соединение без условия
-- Полная информация о ломбардах
SELECT p.name, ot.type_name AS ownership,
       o.last_name || ' ' || o.first_name AS owner_fio,
       d.district_name, p.address, p.phone
FROM pawnshop p
INNER JOIN ownership_type ot ON p.ownership_type_id = ot.ownership_type_id
INNER JOIN owners o ON p.owner_id = o.owner_id
INNER JOIN district d ON p.district_id = d.district_id;

-- Полная информация о ссудах
SELECT p.name AS pawnshop,
       c.last_name || ' ' || c.first_name AS client_fio,
       l.amount, l.issue_date, l.return_date, l.is_returned
FROM loan l
INNER JOIN pawnshop p ON l.pawnshop_id = p.pawnshop_id
INNER JOIN client c ON l.client_id = c.client_id;

-- Полная информация о заложенных предметах
SELECT l.loan_id, c.last_name, t.type_name, li.item_description, li.item_value
FROM loan_item li
INNER JOIN loan l ON li.loan_id = l.loan_id
INNER JOIN client c ON l.client_id = c.client_id
INNER JOIN pledge_item_type t ON li.item_type_id = t.item_type_id;

-- 3.Левое внешнее соединение

-- Все ломбарды со своими ссудами, включая те, у которых пока ссуд нет
SELECT p.name, l.loan_id, l.amount, l.issue_date
FROM pawnshop p
LEFT JOIN loan l ON p.pawnshop_id = l.pawnshop_id
ORDER BY p.name;

-- 4. Правое внешнее соединение
-- Все клиенты и их ссуды, включая клиентов, ни разу не бравших ссуду:
SELECT c.last_name, c.first_name, l.loan_id, l.amount
FROM loan l
RIGHT JOIN client c ON l.client_id = c.client_id
ORDER BY c.last_name;

-- 5. Запрос на запросе по принципу левого соединени

-- Клиенты, которые ни разну не брали ссуду
-- (внешний запрос отбирает из результата LEFT JOIN только строки без пары)
SELECT client_id, last_name, first_name
FROM (
 SELECT c.client_id, c.last_name, c.first_name, l.loan_id
FROM client c
LEFT JOIN loan l ON c.client_id = l.client_id
) AS client_loans
WHERE loan_id IS NULL;

-- 6. Итоговый запрос без условия
-- Общая сумма выданных ссуд и их
-- количество по каждому ломбарду
SELECT p.name, COUNT(l.loan_id) AS loan_count
FROM pawnshop p
INNER JOIN loan l ON p.pawnshop_id = l.pawnshop_id
GROUP BY p.name;

-- 7.Итоговый запрос с условием на данные (WHERE)
-- Средняя сумма ссуды по каждому ломбарду,
-- но только по возращённым ссудам.
SELECT p.name, AVG(l.amount) AS avg_amount
FROM pawnshop p
JOIN loan l ON p.pawnshop_id = l.pawnshop_id
WHERE l.is_returned = true
GROUP BY p.name;

-- 8. Итоговый запрос с условием на группы (HAVING)
-- Клиенты, оформившие более одной ссуды
SELECT c.client_id, c.last_name,
       c.first_name, COUNT(l.loan_id) AS loan_count
FROM client c
JOIN loan l ON c.client_id = l.client_id
GROUP BY c.client_id, c.last_name, c.first_name
HAVING COUNT(l.loan_id) > 1;

-- 9. Итоговый запрос с условием на данные и на группы
--(WHERE + HAVING)
-- Ломбарды заданного района, суммарная стоимость
-- залогов которых превышает указанный параметр
SELECT p.name, d.district_name,
       SUM(li.item_value) AS total_pledge_value
FROM pawnshop p
JOIN district d ON p.district_id = d.district_id
JOIN loan l ON p.pawnshop_id = l.pawnshop_id
JOIN loan_item li ON l.loan_id = li.loan_id
WHERE d.district_id = :district_id
GROUP BY p.name, d.district_name
HAVING SUM(li.item_value) > :min_total_value;

-- 10. ЗАпрос на запросе по принципу итогового запроса
-- Ломбарды, у которых средняя сумма ссуды выше средней
-- по городу.
-- (сначала строим итог по ломбардам, затем фильтруем
-- внешним запросом)
SELECT sub.name, sub.avg_amount
FROM (
SELECT p.name, AVG(l.amount) AS avg_amount
FROM pawnshop p
JOIN loan l ON p.pawnshop_id = l.pawnshop_id
GROUP BY p.name
) AS sub
WHERE sub.avg_amount > (
SELECT AVG(amount) FROM loan
)
ORDER BY sub.avg_amount DESC;

-- 11. Запрос с подзапросом
-- Клиенты, бравше ссуды под залог предметов
-- определённого типа (подзапрос в where...in)
SELECT c.client_id, c.last_name,
       c.first_name, c.phone
FROM client c
WHERE c.client_id IN (
SELECT l.client_id
FROM loan l
JOIN loan_item li ON l.loan_id = li.loan_id
WHERE li.item_type_id = :item_type_id
);
-- на момент 24.07.2026 16 запросов