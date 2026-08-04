# Реестр ломбардов — фронтенд (React + TypeScript)

Клиентское приложение для работы с базой данных ломбардов/ссуд/клиентов,
описанной в ТЗ. Бэкенд (Java, Spring Boot + Hibernate, REST API, Kafka)
разрабатывается отдельно — этот репозиторий содержит только фронтенд.

## Где настраивается подключение к БД / бэкенду

**Важно:** браузер никогда не подключается к PostgreSQL напрямую. Фронтенд
обращается только к REST API (Spring Boot), а тот уже сам работает с базой
через Hibernate/JDBC.

1. Скопируйте `.env.example` в `.env`
2. Укажите адрес вашего Spring Boot сервера:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. Это единственное место, которое нужно менять — все запросы идут через
   `src/api/client.ts`, который читает эту переменную окружения.

Если бэкенд ещё не готов, приложение можно поднять и посмотреть, но запросы
будут падать с сетевой ошибкой, пока по указанному адресу нет сервера,
реализующего контракт из `src/api/endpoints.ts`.

## Установка и запуск

```bash
npm install
npm run dev       # http://localhost:5173
```

Для продакшн-сборки:

```bash
npm run build
npm run preview
```

## Структура проекта

```
src/
  api/
    client.ts        # <-- HTTP-клиент и адрес backend (см. выше)
    endpoints.ts      # REST-контракт: пути, ожидаемые от Spring Boot контроллеров
  types/index.ts       # TypeScript-типы, зеркалящие таблицы БД
  context/AuthContext.tsx  # роли и права доступа (администратор / пользователи_1 / пользователи_2)
  components/
    DataTable/          # универсальная таблица: поиск, сортировка, пагинация, expand-строки
    ResourceCrudPage.tsx # универсальная CRUD-страница, управляемая конфигом полей
    Modal/, Layout/, Common/
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    LoansPage.tsx        # составная форма "ссуда + предметы залога" (1-ко-многим)
    ClientsPage.tsx
    PawnshopsPage.tsx
    OwnersPage.tsx
    DictionariesPage.tsx # 5 справочников: районы, формы собственности, типы владельцев,
                          # социальные положения, виды залоговых предметов
    ReportsPage.tsx      # результаты запросов + визуализация (графики) + экспорт в Excel
    UsersPage.tsx         # только для роли ADMIN: управление пользователями и ролями
```

## Ожидаемый REST-контракт backend'а

См. подробно `src/api/endpoints.ts`. Кратко:

- `GET/POST/PUT/DELETE /api/districts`, `/owner-types`, `/ownership-types`,
  `/social-statuses`, `/pledge-item-types` — справочники
- `GET/POST/PUT/DELETE /api/owners`, `/pawnshops`, `/clients`, `/loans`
- `GET/POST/PUT/DELETE /api/loans/{id}/items` и
  `/api/loans/{id}/items/{item_type_id}` — дочерняя таблица `loan_item`
  (составной ключ `loan_id + item_type_id`)
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/PATCH/DELETE /api/users` — управление пользователями (роль ADMIN)
- `GET /api/reports/loans-by-district`, `/reports/top-item-types`,
  `/reports/overdue-loans` — готовые аналитические запросы для раздела
  «Запросы и визуализация»

## Роли и права (реализуют п. 1–2 ТЗ)

Одно приложение для всех ролей, доступ к разделам меняется ситуативно:

- **ADMIN** (администратор) — полный доступ + управление пользователями/ролями
- **OPERATOR** (пользователи_1) — полный CRUD по ломбардам/владельцам/клиентам/ссудам,
  справочники — только просмотр
- **ANALYST** (пользователи_2) — только просмотр, поиск/фильтрация, отчёты и экспорт

Матрица прав задаётся в `src/context/AuthContext.tsx`.
