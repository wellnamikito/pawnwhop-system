package com.pawnhop.backend.datagen;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import java.time.LocalDate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Scanner;
import java.util.Set;

/**
 * Генератор тестовых данных для БД "Ломбарды".
 *
 * Порядок заполнения (учитывает внешние ключи):
 *   1. Справочники: pledge_item_type, ownership_type, district, owner_type, social_status
 *   2. owners
 *   3. pawnshop
 *   4. client
 *   5. loan
 *   6. loan_item
 *
 * Использование:
 *   javac DataGenerator.java
 *   java DataGenerator
 *   (программа сама спросит параметры подключения и количество записей)
 *
 * Либо без интерактивного ввода, через аргументы командной строки:
 *   java DataGenerator <jdbcUrl> <user> <password> <loanCount>
 *   пример:
 *   java DataGenerator jdbc:postgresql://localhost:5432/pawnshop postgres postgres 100000
 */
public class DataGenerator {

    // ---------- Настройки батч-вставки ----------
    private static final int BATCH_SIZE = 2000;

    // ---------- Генератор случайных чисел ----------
    private static final Random RND = new Random();

    // ---------- Справочные данные для генерации ФИО ----------
    private static final String[] MALE_FIRST_NAMES = {
            "Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей", "Артём",
            "Илья", "Кирилл", "Михаил", "Никита", "Матвей", "Роман", "Егор", "Арсений",
            "Иван", "Денис", "Евгений", "Владислав", "Игорь", "Тимур", "Виктор", "Олег"
    };
    private static final String[] FEMALE_FIRST_NAMES = {
            "Анна", "Мария", "Елена", "Ольга", "Наталья", "Татьяна", "Ирина", "Светлана",
            "Екатерина", "Юлия", "Виктория", "Дарья", "Полина", "Алина", "София", "Ксения",
            "Валентина", "Людмила", "Марина", "Оксана", "Кристина", "Вера", "Диана"
    };
    private static final String[] LAST_NAMES = {
            "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Васильев",
            "Соколов", "Михайлов", "Новиков", "Фёдоров", "Морозов", "Волков", "Алексеев",
            "Лебедев", "Семёнов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев",
            "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьёв"
    };
    private static final String[] MALE_MIDDLE_NAMES = {
            "Александрович", "Дмитриевич", "Сергеевич", "Андреевич", "Алексеевич",
            "Игоревич", "Викторович", "Николаевич", "Михайлович", "Юрьевич", "Олегович"
    };
    private static final String[] FEMALE_MIDDLE_NAMES = {
            "Александровна", "Дмитриевна", "Сергеевна", "Андреевна", "Алексеевна",
            "Игоревна", "Викторовна", "Николаевна", "Михайловна", "Юрьевна", "Олеговна"
    };

    private static final String[] STREETS = {
            "ул. Ленина", "ул. Гагарина", "пр. Мира", "ул. Советская", "ул. Центральная",
            "ул. Пушкина", "ул. Садовая", "ул. Кирова", "ул. Молодёжная", "ул. Строителей",
            "ул. Заречная", "ул. Полевая", "пр. Победы", "ул. Школьная", "ул. Лесная"
    };

    // ---------- Справочники (значения, наименование -> будут вставлены и их id считаны обратно) ----------
    private static final String[] OWNERSHIP_TYPES = {"Частная", "Государственная", "Смешанная"};
    private static final String[] OWNER_TYPES = {"Физическое лицо", "Юридическое лицо"};
    private static final String[] DISTRICTS = {
            "Центральный", "Северный", "Южный", "Восточный", "Западный",
            "Приморский", "Заводской", "Ленинский", "Кировский", "Октябрьский"
    };
    private static final String[] SOCIAL_STATUSES = {
            "Работает", "Не работает", "Студент", "Пенсионер", "Предприниматель",
            "Домохозяйка", "Военнослужащий", "Инвалид"
    };
    private static final String[] PLEDGE_ITEM_TYPES = {
            "Ювелирные изделия", "Бытовая техника", "Электроника", "Инструменты",
            "Меха", "Часы", "Антиквариат", "Транспортные средства",
            "Аудио/видео техника", "Музыкальные инструменты", "Одежда",
            "Спортивный инвентарь", "Компьютерная техника", "Мобильные телефоны", "Прочее"
    };

    private static final String[] PAWNSHOP_NAME_PREFIXES = {
            "Ломбард", "Ломбард Плюс", "Городской ломбард", "Ломбард Актив",
            "Ломбард Экспресс", "Ломбард Гарант", "Народный ломбард", "Ломбард Формат"
    };

    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);

        String jdbcUrl, user, password;
        int loanCount;

        if (args.length >= 4) {
            jdbcUrl = args[0];
            user = args[1];
            password = args[2];
            loanCount = Integer.parseInt(args[3]);
        } else {
            System.out.println("=== Генератор тестовых данных для БД 'Ломбарды' ===");
            System.out.print("JDBC URL (например jdbc:postgresql://localhost:5432/pawnshop): ");
            jdbcUrl = scanner.nextLine().trim();
            System.out.print("Пользователь БД: ");
            user = scanner.nextLine().trim();
            System.out.print("Пароль БД: ");
            password = scanner.nextLine().trim();
            System.out.print("Сколько записей 'loan' сгенерировать (1000 / 10000 / 1000000 и т.п.): ");
            loanCount = Integer.parseInt(scanner.nextLine().trim());
        }

        if (loanCount <= 0) {
            System.out.println("Количество записей должно быть положительным числом.");
            return;
        }

        // Добавляем rewriteBatchedInserts для сильного ускорения batch-вставок в PostgreSQL
        if (!jdbcUrl.contains("?")) {
            jdbcUrl += "?reWriteBatchedInserts=true";
        } else if (!jdbcUrl.contains("reWriteBatchedInserts")) {
            jdbcUrl += "&reWriteBatchedInserts=true";
        }

        try (Connection conn = DriverManager.getConnection(jdbcUrl, user, password)) {
            conn.setAutoCommit(false);

            long start = System.currentTimeMillis();

            System.out.println("Заполнение справочников...");
            int[] itemTypeIds = fillDictionary(conn, "pledge_item_type", "item_type_id", "type_name", PLEDGE_ITEM_TYPES);
            int[] ownershipTypeIds = fillDictionary(conn, "ownership_type", "ownership_type_id", "type_name", OWNERSHIP_TYPES);
            int[] districtIds = fillDictionary(conn, "district", "district_id", "district_name", DISTRICTS);
            int[] ownerTypeIds = fillDictionary(conn, "owner_type", "owner_type_id", "type_name", OWNER_TYPES);
            int[] socialStatusIds = fillDictionary(conn, "social_status", "social_status_id", "status_name", SOCIAL_STATUSES);

            // Масштабируем количество записей связанных таблиц относительно количества кредитов
            int ownersCount = Math.max(20, loanCount / 200);
            int pawnshopCount = Math.max(10, loanCount / 300);
            int clientCount = Math.max(50, loanCount / 3);

            System.out.println("Заполнение owners (" + ownersCount + ")...");
            int[] ownerIds = fillOwners(conn, ownersCount, ownerTypeIds);

            System.out.println("Заполнение pawnshop (" + pawnshopCount + ")...");
            int[] pawnshopIds = fillPawnshops(conn, pawnshopCount, ownerIds, ownershipTypeIds, districtIds);

            System.out.println("Заполнение client (" + clientCount + ")...");
            int[] clientIds = fillClients(conn, clientCount, socialStatusIds);

            System.out.println("Заполнение loan (" + loanCount + ")...");
            int[] loanIds = fillLoans(conn, loanCount, pawnshopIds, clientIds);

            System.out.println("Заполнение loan_item...");
            fillLoanItems(conn, loanIds, itemTypeIds);

            conn.commit();

            long elapsed = System.currentTimeMillis() - start;
            System.out.println("Готово. Затрачено времени: " + (elapsed / 1000.0) + " сек.");
        }
    }

    // ============================================================
    //  СПРАВОЧНИКИ
    // ============================================================
    private static int[] fillDictionary(Connection conn, String table, String idColumn,
                                        String nameColumn, String[] values) throws SQLException {
        // Не дублируем данные, если справочник уже заполнен
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM " + table)) {
            rs.next();
            if (rs.getInt(1) == 0) {
                String sql = "INSERT INTO " + table + " (" + nameColumn + ") VALUES (?)";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    for (String v : values) {
                        ps.setString(1, v);
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }
                conn.commit();
            }
        }

        // Считываем реальные id (на случай, если справочник уже содержал данные)
        List<Integer> ids = new ArrayList<>();
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT " + idColumn + " FROM " + table + " ORDER BY " + idColumn)) {
            while (rs.next()) {
                ids.add(rs.getInt(1));
            }
        }
        return ids.stream().mapToInt(Integer::intValue).toArray();
    }

    // ============================================================
    //  OWNERS
    // ============================================================
    private static int[] fillOwners(Connection conn, int count, int[] ownerTypeIds) throws SQLException {
        int startId = maxId(conn, "owners", "owner_id");
        String sql = "INSERT INTO owners (last_name, first_name, middle_name, owner_type_id, phone) VALUES (?,?,?,?,?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int batched = 0;
            for (int i = 0; i < count; i++) {
                boolean male = RND.nextBoolean();
                ps.setString(1, randomLastName());
                ps.setString(2, male ? randomOf(MALE_FIRST_NAMES) : randomOf(FEMALE_FIRST_NAMES));
                ps.setString(3, male ? randomOf(MALE_MIDDLE_NAMES) : randomOf(FEMALE_MIDDLE_NAMES));
                ps.setInt(4, randomOf(ownerTypeIds));
                ps.setString(5, randomPhone());
                ps.addBatch();
                if (++batched % BATCH_SIZE == 0) {
                    ps.executeBatch();
                    conn.commit();
                }
            }
            ps.executeBatch();
            conn.commit();
        }
        return range(startId + 1, startId + count);
    }

    // ============================================================
    //  PAWNSHOP
    // ============================================================
    private static int[] fillPawnshops(Connection conn, int count, int[] ownerIds,
                                       int[] ownershipTypeIds, int[] districtIds) throws SQLException {
        int startId = maxId(conn, "pawnshop", "pawnshop_id");
        String sql = "INSERT INTO pawnshop (name, ownership_type_id, owner_id, district_id, address, phone, opening_hour, closing_hour) " +
                "VALUES (?,?,?,?,?,?,?,?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int batched = 0;
            for (int i = 0; i < count; i++) {
                int opening = 6 + RND.nextInt(6);          // 6..11
                int closing = Math.min(23, opening + 4 + RND.nextInt(9)); // opening+4..opening+12, max 23

                ps.setString(1, randomOf(PAWNSHOP_NAME_PREFIXES) + " №" + (startId + i + 1));
                ps.setInt(2, randomOf(ownershipTypeIds));
                ps.setInt(3, randomOf(ownerIds));
                ps.setInt(4, randomOf(districtIds));
                ps.setString(5, randomAddress());
                ps.setString(6, randomPhone());
                ps.setInt(7, opening);
                ps.setInt(8, closing);
                ps.addBatch();
                if (++batched % BATCH_SIZE == 0) {
                    ps.executeBatch();
                    conn.commit();
                }
            }
            ps.executeBatch();
            conn.commit();
        }
        return range(startId + 1, startId + count);
    }

    // ============================================================
    //  CLIENT
    // ============================================================
    private static int[] fillClients(Connection conn, int count, int[] socialStatusIds) throws SQLException {
        int startId = maxId(conn, "client", "client_id");
        String sql = "INSERT INTO client (last_name, first_name, middle_name, birth_date, social_status_id, address, phone) " +
                "VALUES (?,?,?,?,?,?,?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int batched = 0;
            for (int i = 0; i < count; i++) {
                boolean male = RND.nextBoolean();
                ps.setString(1, randomLastName());
                ps.setString(2, male ? randomOf(MALE_FIRST_NAMES) : randomOf(FEMALE_FIRST_NAMES));
                ps.setString(3, male ? randomOf(MALE_MIDDLE_NAMES) : randomOf(FEMALE_MIDDLE_NAMES));
                ps.setDate(4, Date.valueOf(randomBirthDate()));
                ps.setInt(5, randomOf(socialStatusIds));
                ps.setString(6, randomAddress());
                ps.setString(7, randomPhone());
                ps.addBatch();
                if (++batched % BATCH_SIZE == 0) {
                    ps.executeBatch();
                    conn.commit();
                }
            }
            ps.executeBatch();
            conn.commit();
        }
        return range(startId + 1, startId + count);
    }

    // ============================================================
    //  LOAN
    // ============================================================
    private static int[] fillLoans(Connection conn, int count, int[] pawnshopIds, int[] clientIds) throws SQLException {
        int startId = maxId(conn, "loan", "loan_id");
        String sql = "INSERT INTO loan (pawnshop_id, client_id, amount, issue_date, return_date, penalty_percent, is_returned) " +
                "VALUES (?,?,?,?,?,?,?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int batched = 0;
            for (int i = 0; i < count; i++) {
                LocalDate issueDate = randomDateWithinYears(3);
                int termDays = 7 + RND.nextInt(84); // 7..90 дней
                LocalDate returnDate = issueDate.plusDays(termDays);

                ps.setInt(1, randomOf(pawnshopIds));
                ps.setInt(2, randomOf(clientIds));
                ps.setBigDecimal(3, java.math.BigDecimal.valueOf(500 + RND.nextInt(199500))
                        .setScale(2, java.math.RoundingMode.HALF_UP));
                ps.setDate(4, Date.valueOf(issueDate));
                ps.setDate(5, Date.valueOf(returnDate));
                ps.setBigDecimal(6, java.math.BigDecimal.valueOf(1 + RND.nextInt(15))
                        .setScale(2, java.math.RoundingMode.HALF_UP));
                ps.setBoolean(7, RND.nextInt(100) < 70); // 70% возвращённых кредитов
                ps.addBatch();
                if (++batched % BATCH_SIZE == 0) {
                    ps.executeBatch();
                    conn.commit();
                }
            }
            ps.executeBatch();
            conn.commit();
        }
        return range(startId + 1, startId + count);
    }

    // ============================================================
    //  LOAN_ITEM  (1..3 предмета залога на кредит, без повторов типа в рамках одного кредита)
    // ============================================================
    private static void fillLoanItems(Connection conn, int[] loanIds, int[] itemTypeIds) throws SQLException {
        String sql = "INSERT INTO loan_item (loan_id, item_type_id, item_description, item_value) VALUES (?,?,?,?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int batched = 0;
            for (int loanId : loanIds) {
                int itemsCount = 1 + RND.nextInt(3); // 1..3
                Set<Integer> usedTypes = new HashSet<>();
                for (int i = 0; i < itemsCount; i++) {
                    int typeId;
                    int attempts = 0;
                    do {
                        typeId = randomOf(itemTypeIds);
                        attempts++;
                    } while (!usedTypes.add(typeId) && attempts < 10);
                    if (attempts >= 10 && usedTypes.contains(typeId)) continue; // пропускаем, если не нашли уникальный

                    ps.setInt(1, loanId);
                    ps.setInt(2, typeId);
                    ps.setString(3, randomItemDescription());
                    ps.setBigDecimal(4, java.math.BigDecimal.valueOf(300 + RND.nextInt(250000))
                            .setScale(2, java.math.RoundingMode.HALF_UP));
                    ps.addBatch();
                    if (++batched % BATCH_SIZE == 0) {
                        ps.executeBatch();
                        conn.commit();
                    }
                }
            }
            ps.executeBatch();
            conn.commit();
        }
    }

    // ============================================================
    //  ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================================
    private static int maxId(Connection conn, String table, String idColumn) throws SQLException {
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT COALESCE(MAX(" + idColumn + "), 0) FROM " + table)) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private static int[] range(int fromInclusive, int toInclusive) {
        if (toInclusive < fromInclusive) return new int[0];
        int[] arr = new int[toInclusive - fromInclusive + 1];
        for (int i = 0; i < arr.length; i++) arr[i] = fromInclusive + i;
        return arr;
    }

    private static String randomOf(String[] arr) {
        return arr[RND.nextInt(arr.length)];
    }

    private static int randomOf(int[] arr) {
        return arr[RND.nextInt(arr.length)];
    }

    private static String randomLastName() {
        String base = randomOf(LAST_NAMES);
        // с шансом 50% делаем женское окончание фамилии, если оканчивается на согласный по типовым правилам
        if (RND.nextBoolean()) {
            if (base.endsWith("ов") || base.endsWith("ев") || base.endsWith("ин")) {
                return base + "а";
            }
        }
        return base;
    }

    private static String randomPhone() {
        StringBuilder sb = new StringBuilder("+7");
        for (int i = 0; i < 10; i++) {
            sb.append(RND.nextInt(10));
        }
        return sb.toString();
    }

    private static String randomAddress() {
        return randomOf(STREETS) + ", д. " + (1 + RND.nextInt(150)) +
                (RND.nextBoolean() ? ", кв. " + (1 + RND.nextInt(200)) : "");
    }

    private static LocalDate randomBirthDate() {
        // возраст клиента от 18 до 80 лет
        int age = 18 + RND.nextInt(63);
        LocalDate today = LocalDate.now();
        return today.minusYears(age).minusDays(RND.nextInt(365));
    }

    private static LocalDate randomDateWithinYears(int years) {
        long today = LocalDate.now().toEpochDay();
        long minDay = LocalDate.now().minusYears(years).toEpochDay();
        long randomDay = minDay + (long) (RND.nextDouble() * (today - minDay));
        return LocalDate.ofEpochDay(randomDay);
    }

    private static String randomItemDescription() {
        String[] adjectives = {"Золотое кольцо", "Серебряная цепочка", "Ноутбук", "Смартфон",
                "Наручные часы", "Норковая шуба", "Электродрель", "Гитара акустическая",
                "Телевизор", "Фотоаппарат", "Планшет", "Игровая приставка", "Пылесос",
                "Швейная машина", "Велосипед"};
        String[] brands = {"без клейма", "б/у, хорошее состояние", "новое", "с гарантией",
                "требует ремонта", "оригинальная упаковка", "с документами"};
        return randomOf(adjectives) + ", " + randomOf(brands);
    }
}