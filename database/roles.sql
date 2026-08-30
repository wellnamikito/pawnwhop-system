-- ============================================
-- roles.sql
-- PostgreSQL roles + privileges + RLS
-- ============================================


-- ============================================
-- 1. УДАЛЕНИЕ СТАРЫХ ПОЛЬЗОВАТЕЛЕЙ И РОЛЕЙ
-- ============================================

DROP ROLE IF EXISTS pawnwhop_admin;
DROP ROLE IF EXISTS pawnwhop_operator;
DROP ROLE IF EXISTS pawnwhop_analyst;

DROP ROLE IF EXISTS admin_role;
DROP ROLE IF EXISTS operator_role;
DROP ROLE IF EXISTS analyst_role;


-- ============================================
-- 2. СОЗДАНИЕ ГРУПП РОЛЕЙ
-- ============================================

CREATE ROLE admin_role NOLOGIN;

CREATE ROLE operator_role NOLOGIN;

CREATE ROLE analyst_role NOLOGIN;


-- ============================================
-- 3. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЕЙ
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
-- 4. НАЗНАЧЕНИЕ РОЛЕЙ
-- ============================================

GRANT admin_role
    TO pawnwhop_admin;

GRANT operator_role
    TO pawnwhop_operator;

GRANT analyst_role
    TO pawnwhop_analyst;


-- ============================================
-- 5. АДМИНИСТРАТОР МОЖЕТ СОЗДАВАТЬ РОЛИ
-- ============================================

ALTER ROLE pawnwhop_admin
    CREATEROLE;


-- ============================================
-- 6. ДОСТУП К SCHEMA PUBLIC
-- ============================================

GRANT USAGE
    ON SCHEMA public
    TO admin_role;

GRANT USAGE
    ON SCHEMA public
    TO operator_role;

GRANT USAGE
    ON SCHEMA public
    TO analyst_role;


-- ============================================================
-- 7. ПРАВА АДМИНИСТРАТОРА
-- ============================================================

-- Администратор имеет полный доступ
-- ко всем таблицам приложения.

GRANT ALL PRIVILEGES
    ON ALL TABLES IN SCHEMA public
    TO admin_role;


-- Полный доступ к sequence,
-- необходимый для SERIAL / BIGSERIAL.

GRANT ALL PRIVILEGES
    ON ALL SEQUENCES IN SCHEMA public
    TO admin_role;


-- ============================================================
-- 8. ПРАВА ОПЕРАТОРА
-- ============================================================


-- ------------------------------------------------------------
-- Основные таблицы
-- ------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE
    pawnshop,
    owners,
    client,
    loan,
    loan_item
    TO operator_role;


-- ------------------------------------------------------------
-- Документы
-- ------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE
    ON TABLE
    loan_document
    TO operator_role;


-- ------------------------------------------------------------
-- Справочники
-- Только просмотр
-- ------------------------------------------------------------

GRANT SELECT
    ON TABLE
    district,
    owner_type,
    ownership_type,
    social_status,
    pledge_item_type
    TO operator_role;


-- ------------------------------------------------------------
-- Секционированные таблицы
-- ------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE
    ON TABLE
    loan_range,
    loan_list
    TO operator_role;


-- Таблица для сравнения производительности

GRANT SELECT, INSERT, UPDATE
    ON TABLE
    loan_plain
    TO operator_role;


-- ------------------------------------------------------------
-- Sequence
-- ------------------------------------------------------------

GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA public
    TO operator_role;


-- ============================================================
-- 9. ПРАВА АНАЛИТИКА
-- ============================================================

-- Аналитик не изменяет данные.
-- Только SELECT.

GRANT SELECT
    ON ALL TABLES IN SCHEMA public
    TO analyst_role;


-- Sequence аналитику не нужны.


-- ============================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================

-- Основные таблицы

ALTER TABLE pawnshop
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE owners
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE client
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE loan
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE loan_item
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE loan_document
    ENABLE ROW LEVEL SECURITY;


-- Справочники

ALTER TABLE district
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE owner_type
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE ownership_type
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE social_status
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE pledge_item_type
    ENABLE ROW LEVEL SECURITY;


-- Секционированные таблицы

ALTER TABLE loan_range
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE loan_list
    ENABLE ROW LEVEL SECURITY;


-- Таблица сравнения

ALTER TABLE loan_plain
    ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 11. FORCE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE pawnshop
    FORCE ROW LEVEL SECURITY;

ALTER TABLE owners
    FORCE ROW LEVEL SECURITY;

ALTER TABLE client
    FORCE ROW LEVEL SECURITY;

ALTER TABLE loan
    FORCE ROW LEVEL SECURITY;

ALTER TABLE loan_item
    FORCE ROW LEVEL SECURITY;

ALTER TABLE loan_document
    FORCE ROW LEVEL SECURITY;

ALTER TABLE district
    FORCE ROW LEVEL SECURITY;

ALTER TABLE owner_type
    FORCE ROW LEVEL SECURITY;

ALTER TABLE ownership_type
    FORCE ROW LEVEL SECURITY;

ALTER TABLE social_status
    FORCE ROW LEVEL SECURITY;

ALTER TABLE pledge_item_type
    FORCE ROW LEVEL SECURITY;

ALTER TABLE loan_range
    FORCE ROW LEVEL SECURITY;

ALTER TABLE loan_list
    FORCE ROW LEVEL SECURITY;

ALTER TABLE loan_plain
    FORCE ROW LEVEL SECURITY;


-- ============================================================
-- 12. RLS: PAWNSHOP
-- ============================================================

CREATE POLICY pawnshop_admin_policy
    ON pawnshop
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY pawnshop_operator_policy
    ON pawnshop
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY pawnshop_analyst_policy
    ON pawnshop
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 13. RLS: OWNERS
-- ============================================================

CREATE POLICY owners_admin_policy
    ON owners
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY owners_operator_policy
    ON owners
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY owners_analyst_policy
    ON owners
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 14. RLS: CLIENT
-- ============================================================

CREATE POLICY client_admin_policy
    ON client
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY client_operator_policy
    ON client
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY client_analyst_policy
    ON client
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 15. RLS: LOAN
-- ============================================================

CREATE POLICY loan_admin_policy
    ON loan
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_operator_policy
    ON loan
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_analyst_policy
    ON loan
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 16. RLS: LOAN_ITEM
-- ============================================================

CREATE POLICY loan_item_admin_policy
    ON loan_item
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_item_operator_policy
    ON loan_item
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_item_analyst_policy
    ON loan_item
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 17. RLS: LOAN_DOCUMENT
-- ============================================================

CREATE POLICY loan_document_admin_policy
    ON loan_document
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_document_operator_policy
    ON loan_document
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_document_analyst_policy
    ON loan_document
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 18. RLS: DISTRICT
-- ============================================================

CREATE POLICY district_admin_policy
    ON district
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY district_operator_policy
    ON district
    FOR SELECT
    TO operator_role
    USING (true);


CREATE POLICY district_analyst_policy
    ON district
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 19. RLS: OWNER_TYPE
-- ============================================================

CREATE POLICY owner_type_admin_policy
    ON owner_type
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY owner_type_operator_policy
    ON owner_type
    FOR SELECT
    TO operator_role
    USING (true);


CREATE POLICY owner_type_analyst_policy
    ON owner_type
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 20. RLS: OWNERSHIP_TYPE
-- ============================================================

CREATE POLICY ownership_type_admin_policy
    ON ownership_type
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY ownership_type_operator_policy
    ON ownership_type
    FOR SELECT
    TO operator_role
    USING (true);


CREATE POLICY ownership_type_analyst_policy
    ON ownership_type
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 21. RLS: SOCIAL_STATUS
-- ============================================================

CREATE POLICY social_status_admin_policy
    ON social_status
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY social_status_operator_policy
    ON social_status
    FOR SELECT
    TO operator_role
    USING (true);


CREATE POLICY social_status_analyst_policy
    ON social_status
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 22. RLS: PLEDGE_ITEM_TYPE
-- ============================================================

CREATE POLICY pledge_item_type_admin_policy
    ON pledge_item_type
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY pledge_item_type_operator_policy
    ON pledge_item_type
    FOR SELECT
    TO operator_role
    USING (true);


CREATE POLICY pledge_item_type_analyst_policy
    ON pledge_item_type
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 23. RLS: LOAN_RANGE
-- ============================================================

CREATE POLICY loan_range_admin_policy
    ON loan_range
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_range_operator_policy
    ON loan_range
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_range_analyst_policy
    ON loan_range
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 24. RLS: LOAN_LIST
-- ============================================================

CREATE POLICY loan_list_admin_policy
    ON loan_list
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_list_operator_policy
    ON loan_list
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_list_analyst_policy
    ON loan_list
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 25. RLS: LOAN_PLAIN
-- ============================================================

CREATE POLICY loan_plain_admin_policy
    ON loan_plain
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_plain_operator_policy
    ON loan_plain
    FOR ALL
    TO operator_role
    USING (true)
    WITH CHECK (true);


CREATE POLICY loan_plain_analyst_policy
    ON loan_plain
    FOR SELECT
    TO analyst_role
    USING (true);


-- ============================================================
-- 26. ПРОВЕРКА ЧЛЕНСТВА В РОЛЯХ
-- ============================================================

SELECT
    member.rolname AS user_name,
    role.rolname AS granted_role
FROM pg_auth_members am
         JOIN pg_roles member
              ON member.oid = am.member
         JOIN pg_roles role
              ON role.oid = am.roleid
WHERE member.rolname IN (
                         'pawnwhop_admin',
                         'pawnwhop_operator',
                         'pawnwhop_analyst'
    )
ORDER BY member.rolname;


-- ============================================================
-- 27. ПРОВЕРКА RLS
-- ============================================================

SELECT
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables
WHERE tablename IN (
                    'pawnshop',
                    'owners',
                    'client',
                    'loan',
                    'loan_item',
                    'loan_document',
                    'district',
                    'owner_type',
                    'ownership_type',
                    'social_status',
                    'pledge_item_type',
                    'loan_range',
                    'loan_list',
                    'loan_plain'
    )
ORDER BY tablename;


-- ============================================================
-- 28. ПРОВЕРКА ПОЛИТИК
-- ============================================================

SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN (
                    'pawnshop',
                    'owners',
                    'client',
                    'loan',
                    'loan_item',
                    'loan_document',
                    'district',
                    'owner_type',
                    'ownership_type',
                    'social_status',
                    'pledge_item_type',
                    'loan_range',
                    'loan_list',
                    'loan_plain'
    )
ORDER BY
    tablename,
    policyname;


-- ============================================================
-- 29. ПРОВЕРКА ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
-- ============================================================

SELECT
            session_user,
            current_user;

DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'pawnwhop_user'
        ) THEN
            CREATE ROLE pawnwhop_user
                LOGIN
                PASSWORD 'pawnwhop_pass';
        END IF;
    END
$$;

GRANT USAGE ON SCHEMA public TO pawnwhop_user;

SELECT
    member.rolname AS user_name,
    role.rolname AS granted_role
FROM pg_auth_members am
         JOIN pg_roles member
              ON member.oid = am.member
         JOIN pg_roles role
              ON role.oid = am.roleid
WHERE member.rolname IN (
                         'pawnwhop_admin',
                         'pawnwhop_operator',
                         'pawnwhop_analyst'
    );

SELECT
    t.schemaname,
    t.tablename,
    t.rowsecurity,
    c.relforcerowsecurity AS forcerowsecurity
FROM pg_tables t
         JOIN pg_class c
              ON c.relname = t.tablename
         JOIN pg_namespace n
              ON n.oid = c.relnamespace
                  AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
                      'pawnshop',
                      'owners',
                      'client',
                      'loan',
                      'loan_item',
                      'loan_document',
                      'district',
                      'owner_type',
                      'ownership_type',
                      'social_status',
                      'pledge_item_type',
                      'loan_range',
                      'loan_list',
                      'loan_plain'
    )
ORDER BY t.tablename;

SELECT current_user, session_user;