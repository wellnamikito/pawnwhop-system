CREATE OR REPLACE FUNCTION get_loans_by_pawnshop(
    p_pawnshop_id INT
)
RETURNS TABLE (
    loan_id INT,
    last_name fio_domain,
    amount amount_domain,
    issue_date DATE
)
LANGUAGE SQL
AS $$
SELECT
    l.loan_id,
    c.last_name,
    l.amount,
    l.issue_date
FROM loan l
JOIN client c ON l.client_id = c.client_id
INNER JOIN pawnshop p on l.pawnshop_id = p.pawnshop_id
WHERE l.pawnshop_id = p_pawnshop_id;
$$;



CREATE OR REPLACE FUNCTION get_items_by_type(
    p_item_type_id INT
)
RETURNS TABLE (
    loan_id INT,
    item_description TEXT,
    item_value amount_domain,
    type_name VARCHAR(100)
)
LANGUAGE SQL
AS $$
SELECT
    li.loan_id,
    li.item_description,
    li.item_value,
    t.type_name
FROM loan_item li
         JOIN pledge_item_type t
              ON li.item_type_id = t.item_type_id
WHERE li.item_type_id = p_item_type_id;
$$;

CREATE OR REPLACE FUNCTION get_loans_by_period(
    p_date_from DATE,
    p_date_to DATE
)
RETURNS TABLE (
    loan_id INT,
    last_name fio_domain,
    amount amount_domain,
    issue_date DATE
)
LANGUAGE SQL
AS $$
SELECT
    l.loan_id,
    c.last_name,
    l.amount,
    l.issue_date
FROM loan l
         JOIN client c
              ON l.client_id = c.client_id
WHERE l.issue_date
          BETWEEN p_date_from AND p_date_to;
$$;

CREATE OR REPLACE FUNCTION get_overdue_loans(
    p_check_date DATE
)
RETURNS TABLE (
    loan_id INT,
    last_name fio_domain,
    phone phone_domain,
    return_date DATE
)
LANGUAGE SQL
AS $$
SELECT
    l.loan_id,
    c.last_name,
    c.phone,
    l.return_date
FROM loan l
         JOIN client c
              ON l.client_id = c.client_id
WHERE l.return_date < p_check_date
  AND l.is_returned = FALSE;
$$;



CREATE OR REPLACE FUNCTION get_pawnshop_statistics(
    p_pawnshop_id INT
)
RETURNS TABLE (
    pawnshop_name VARCHAR(100),
    loan_count BIGINT,
    total_amount NUMERIC
)
LANGUAGE SQL
AS $$
SELECT
    p.name,
    COUNT(l.loan_id),
    SUM(l.amount)
FROM pawnshop p
         JOIN loan l
              ON p.pawnshop_id = l.pawnshop_id
WHERE p.pawnshop_id = p_pawnshop_id
GROUP BY p.name;
$$;

CREATE OR REPLACE FUNCTION get_pawnshops_by_address(
    p_address_mask VARCHAR(100)
)
RETURNS TABLE (
    pawnshop_name VARCHAR(100),
    loan_count BIGINT,
    avg_amount NUMERIC
)
LANGUAGE SQL
AS $$
SELECT
    p.name,
    COUNT(l.loan_id),
    AVG(l.amount)
FROM pawnshop p
         JOIN loan l
              ON p.pawnshop_id = l.pawnshop_id
WHERE p.address LIKE p_address_mask
GROUP BY p.name;
$$;

CREATE OR REPLACE FUNCTION get_client_statistics_by_id(
    p_client_id INT
)
RETURNS TABLE (
    client_id INT,
    last_name fio_domain,
    loan_count BIGINT,
    total_amount NUMERIC
)
LANGUAGE SQL
AS $$
SELECT
    c.client_id,
    c.last_name,
    COUNT(l.loan_id),
    SUM(l.amount)
FROM client c
         JOIN loan l
              ON c.client_id = l.client_id
WHERE c.client_id = p_client_id
GROUP BY c.client_id, c.last_name;
$$;



CREATE OR REPLACE FUNCTION get_client_statistics_by_phone(
    p_phone phone_domain
)
RETURNS TABLE (
    last_name fio_domain,
    phone phone_domain,
    loan_count BIGINT,
    total_amount NUMERIC
)
LANGUAGE SQL
AS $$
SELECT
    c.last_name,
    c.phone,
    COUNT(l.loan_id),
    SUM(l.amount)
FROM client c
         JOIN loan l
              ON c.client_id = l.client_id
WHERE c.phone = p_phone
GROUP BY c.last_name, c.phone;
$$;



CREATE OR REPLACE FUNCTION get_district_pledge_value(
    p_district_id INT,
    p_min_total_value amount_domain
)
RETURNS TABLE (
    pawnshop_name VARCHAR(100),
    district_name VARCHAR(100),
    total_pledge_value NUMERIC
)
LANGUAGE SQL
AS $$
SELECT
    p.name,
    d.district_name,
    SUM(li.item_value)
FROM pawnshop p
         JOIN district d
              ON p.district_id = d.district_id
         JOIN loan l
              ON p.pawnshop_id = l.pawnshop_id
         JOIN loan_item li
              ON l.loan_id = li.loan_id
WHERE d.district_id = p_district_id
GROUP BY p.name, d.district_name
HAVING SUM(li.item_value) > p_min_total_value;
$$;

CREATE OR REPLACE FUNCTION get_large_or_overdue_loans(
    p_large_amount_threshold amount_domain
)
RETURNS TABLE (
    loan_id INT,
    last_name fio_domain,
    phone phone_domain,
    amount amount_domain,
    return_date DATE,
    reason TEXT
)
LANGUAGE SQL
AS $$
SELECT
    l.loan_id,
    c.last_name,
    c.phone,
    l.amount,
    l.return_date,
    'просрочена'::TEXT
FROM loan l
         JOIN client c
              ON l.client_id = c.client_id
WHERE l.is_returned = FALSE
  AND l.return_date < CURRENT_DATE
UNION
SELECT
    l.loan_id,
    c.last_name,
    c.phone,
    l.amount,
    l.return_date,
    'крупная сумма'::TEXT
FROM loan l
         JOIN client c
              ON l.client_id = c.client_id
WHERE l.amount > p_large_amount_threshold
ORDER BY loan_id;
$$;

CREATE OR REPLACE FUNCTION get_clients_by_item_type(
    p_item_type_id INT
)
RETURNS TABLE (
    client_id INT,
    last_name fio_domain,
    first_name fio_domain,
    phone phone_domain
)
LANGUAGE SQL
AS $$
SELECT
    c.client_id,
    c.last_name,
    c.first_name,
    c.phone
FROM client c
WHERE c.client_id IN (
    SELECT l.client_id
    FROM loan l
             JOIN loan_item li
                  ON l.loan_id = li.loan_id
    WHERE li.item_type_id = p_item_type_id
);
$$;

CREATE OR REPLACE FUNCTION get_pawnshops_without_item_type(
    p_item_type_id INT
)
RETURNS TABLE (
    pawnshop_id INT,
    pawnshop_name VARCHAR(100)
)
LANGUAGE SQL
AS $$
SELECT
    p.pawnshop_id,
    p.name
FROM pawnshop p
WHERE p.pawnshop_id NOT IN (
    SELECT l.pawnshop_id
    FROM loan l
             JOIN loan_item li
                  ON l.loan_id = li.loan_id
    WHERE li.item_type_id = p_item_type_id
);
$$;