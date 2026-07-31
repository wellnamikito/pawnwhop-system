-- ============================================
-- roles.sql
-- Роли и пользователи PostgreSQL
-- ============================================

-- ============================================
-- Удаление (если уже существуют)
-- ============================================

DROP ROLE IF EXISTS admin;
DROP ROLE IF EXISTS operator;
DROP ROLE IF EXISTS analyst;

DROP ROLE IF EXISTS admin_role;
DROP ROLE IF EXISTS operator_role;
DROP ROLE IF EXISTS analyst_role;


-- ============================================
-- Создание ролей (наборы прав)
-- ============================================

CREATE ROLE admin_role NOLOGIN;

CREATE ROLE operator_role NOLOGIN;

CREATE ROLE analyst_role NOLOGIN;


-- ============================================
-- Создание пользователей
-- ============================================

CREATE ROLE pawnwhop_admin
    LOGIN
    PASSWORD 'admin123';

CREATE ROLE pawnwhop_operator
    LOGIN
    PASSWORD 'operator123';

CREATE ROLE pawnwhop_analyst
    LOGIN
    PASSWORD 'analyst123';


-- ============================================
-- Назначение ролей пользователям
-- ============================================

GRANT admin_role TO pawnwhop_admin;

GRANT operator_role TO pawnwhop_operator;

GRANT analyst_role TO pawnwhop_analyst;


-- ============================================
-- Администратор может создавать пользователей
-- ============================================

ALTER ROLE pawnwhop_admin CREATEROLE;

SELECT
    r.rolname,
    m.rolname AS member_of
FROM pg_auth_members am
         JOIN pg_roles r ON am.member = r.oid
         JOIN pg_roles m ON am.roleid = m.oid;

-- ============================================
-- Права администратора
-- ============================================

GRANT ALL PRIVILEGES
    ON ALL TABLES IN SCHEMA public
    TO admin_role;


GRANT ALL PRIVILEGES
    ON ALL SEQUENCES IN SCHEMA public
    TO admin_role;



-- ============================================
-- Права оператора
-- ============================================

-- основные таблицы CRUD
GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE
    pawnshop,
    owners,
    client,
    loan,
    loan_item
    TO operator_role;


-- справочники только просмотр
GRANT SELECT
    ON TABLE
    district,
    owner_type,
    ownership_type,
    social_status,
    pledge_item_type
    TO operator_role;



-- ============================================
-- Права аналитика
-- ============================================

-- только чтение
GRANT SELECT
    ON ALL TABLES IN SCHEMA public
    TO analyst_role;

SELECT session_user, current_user;

\du pawnshop_operator
