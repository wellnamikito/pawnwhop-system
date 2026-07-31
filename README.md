# PawnWhop System

Информационная система учёта работы ломбардов города: ломбарды, владельцы, клиенты, выданные ссуды под залог, предметы залога и справочники (районы, типы владения, типы предметов залога, социальные статусы).

## Стек

**Backend:** Java 21, Spring Boot, Spring Data JPA (Hibernate), Spring Security, JWT (jjwt), PostgreSQL, Lombok, Bean Validation

**Frontend:** React, TypeScript, HTML/CSS (в отдельной ветке `feature/frontend`)

**Database:** PostgreSQL — кастомные домены и CHECK-констрейнты, ролевая модель для авторизации (`admin_role`, `operator_role`, `analyst_role`)

## Архитектура

Backend построен слоями: `entity → repository → service (интерфейс) → service.impl → controller`, с разделением на request/response DTO для каждой сущности.

Отдельного внимания заслуживают:
- **Composite primary key** у `LoanItem` (`@EmbeddedId` + `@MapsId`) для связи ссуды и типа предмета залога.
- **Аутентификация через роли PostgreSQL**: вместо отдельной таблицы пользователей приложение проверяет роль текущего пользователя БД через `pg_has_role` и на основе неё выдаёт JWT-токен.
- **Bean Validation синхронизирована со схемой БД**: аннотации `@DecimalMin`/`@DecimalMax`/`@Digits` в сущностях повторяют CHECK-констрейнты и кастомные домены Postgres (`amount_domain`, `demand_domain`).

## Эндпоинты

Полный CRUD (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`) реализован для:

- `/api/clients` — клиенты
- `/api/pawnshops` — ломбарды
- `/api/owners` — владельцы
- `/api/loans` — ссуды
- `/api/loans/{loanId}/items` — предметы залога в рамках ссуды
- `/api/districts` — районы
- `/api/owner-types` — типы владельцев
- `/api/ownership-types` — типы владения
- `/api/pledge-item-types` — типы предметов залога
- `/api/social-statuses` — социальные статусы

Аутентификация: `POST /api/auth/login` — выдаёт JWT-токен на основе роли пользователя в PostgreSQL.

> На данный момент выдача токена реализована, но проверка токена на защищённых эндпоинтах ещё в разработке — все эндпоинты пока доступны без авторизации.

## Запуск локально

1. Поднять PostgreSQL:
   ```bash
   docker-compose up -d
   ```
2. Настроить подключение в `backend/src/main/resources/application.properties` (URL, пользователь, пароль).
3. Запустить приложение:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
4. API будет доступно на `http://localhost:8080`.

Для наполнения БД тестовыми данными есть утилита `DataGenerator` (`backend/src/main/java/com/pawnhop/backend/datagen/DataGenerator.java`) — генерирует справочники, ломбарды, клиентов, ссуды и предметы залога с учётом внешних ключей.

## Структура репозитория

Проект разрабатывался по отдельным веткам:
- `feature/database-design` — проектирование схемы БД
- `feature/backend` — backend (актуальный код)
- `feature/frontend` — frontend на React/TypeScript

## Статус

🚧 В разработке. Backend протестирован вручную через Postman, основные CRUD-операции работают. В планах: защита эндпоинтов по ролям через JWT-фильтр, глобальная обработка ошибок, объединение веток в единый релиз.
