CREATE OR REPLACE VIEW vw_pawnshop_info AS
SELECT
    p.name,
    ot.type_name AS ownership,
    o.last_name || ' ' || o.first_name AS owner_fio,
    d.district_name,
    p.address,
    p.phone
FROM pawnshop p
         JOIN ownership_type ot
              ON p.ownership_type_id = ot.ownership_type_id
         JOIN owners o
              ON p.owner_id = o.owner_id
         JOIN district d
              ON p.district_id = d.district_id;

CREATE OR REPLACE VIEW vw_loan_info AS
SELECT
    p.name AS pawnshop,
    c.last_name || ' ' || c.first_name AS client_fio,
    l.amount,
    l.issue_date,
    l.return_date,
    l.is_returned
FROM loan l
         JOIN pawnshop p
              ON l.pawnshop_id = p.pawnshop_id
         JOIN client c
              ON l.client_id = c.client_id;

CREATE OR REPLACE VIEW vw_loan_items_info AS
SELECT
    l.loan_id,
    c.last_name,
    t.type_name,
    li.item_description,
    li.item_value
FROM loan_item li
         JOIN loan l
              ON li.loan_id = l.loan_id
         JOIN client c
              ON l.client_id = c.client_id
         JOIN pledge_item_type t
              ON li.item_type_id = t.item_type_id;

CREATE OR REPLACE VIEW vw_pawnshops_with_loans AS
SELECT
    p.name,
    l.loan_id,
    l.amount,
    l.issue_date
FROM pawnshop p
         LEFT JOIN loan l
                   ON p.pawnshop_id = l.pawnshop_id;

CREATE OR REPLACE VIEW vw_clients_with_loans AS
SELECT
    c.last_name,
    c.first_name,
    l.loan_id,
    l.amount
FROM client c
         LEFT JOIN loan l
                   ON c.client_id = l.client_id;

CREATE OR REPLACE VIEW vw_clients_without_loans AS
SELECT client_id, last_name, first_name
FROM (
         SELECT c.client_id, c.last_name, c.first_name, l.loan_id
         FROM client c
                  LEFT JOIN loan l ON c.client_id = l.client_id
     ) AS client_loans
WHERE loan_id IS NULL;


CREATE OR REPLACE VIEW vw_pawnshop_loan_count AS
SELECT
    c.client_id,
    c.last_name,
    c.first_name,
    COUNT(l.loan_id) AS loan_count
FROM client c
JOIN loan l ON c.client_id = l.client_id
GROUP BY c.client_id, c.last_name, c.first_name
HAVING COUNT(l.loan_id) > 1;



CREATE OR REPLACE VIEW vw_pawnshop_loan_statistics AS
SELECT
    p.pawnshop_id,
    p.name,
    COUNT(l.loan_id) AS total_loans,
    COUNT(l.loan_id)
                        FILTER (WHERE l.is_returned = TRUE) AS returned_count,
    COUNT(l.loan_id)
        FILTER (WHERE l.is_returned = FALSE) AS not_returned_count
FROM pawnshop p
         JOIN loan l
              ON p.pawnshop_id = l.pawnshop_id
GROUP BY
    p.pawnshop_id,
    p.name;

CREATE OR REPLACE VIEW vw_loan_status AS
SELECT
    l.loan_id,
    c.last_name,
    l.amount,
    l.return_date,
    CASE
        WHEN l.is_returned = TRUE THEN 'возвращена'
        WHEN l.is_returned = FALSE
            AND l.return_date < CURRENT_DATE
            THEN 'просрочена'
        ELSE 'в процессе'
        END AS loan_status
FROM loan l
         JOIN client c
              ON l.client_id = c.client_id;

CREATE OR REPLACE VIEW vw_pawnshop_total_share AS
SELECT
    p.pawnshop_id,
    p.name,
    SUM(l.amount) AS pawnshop_total,
    ROUND(
            SUM(l.amount)
                / (SELECT SUM(amount) FROM loan)
                * 100,
            2
    ) AS percent_of_total
FROM pawnshop p
         JOIN loan l
              ON p.pawnshop_id = l.pawnshop_id
GROUP BY
    p.pawnshop_id,
    p.name;

CREATE OR REPLACE  VIEW vw_pawnshop_above_average_loan_count AS
SELECT sub.name,
       sub.avg_amount
FROM (
         SELECT p.name,
                AVG(l.amount) AS avg_amount
         FROM pawnshop p
                  JOIN loan l
                       ON p.pawnshop_id = l.pawnshop_id
         GROUP BY p.name
     ) AS sub
WHERE sub.avg_amount > (
    SELECT AVG(amount)
    FROM loan
)
ORDER BY sub.avg_amount DESC;