import { useEffect, useRef, useState } from "react";

import { ownerApi } from "@/api/owner";
import { ownerTypeApi } from "@/api/dictionary";

import type {
    Owner,
    OwnerRequest,
} from "@/types/owner";

import type { Dictionary } from "@/types/dictionary";

const PAGE_SIZE = 50;

export default function OwnersPage() {
    const [items, setItems] =
        useState<Owner[]>([]);

    const [ownerTypes, setOwnerTypes] =
        useState<Dictionary[]>([]);

    const [page, setPage] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingItem, setEditingItem] =
        useState<Owner | null>(null);

    const [lastName, setLastName] =
        useState("");

    const [firstName, setFirstName] =
        useState("");

    const [middleName, setMiddleName] =
        useState("");

    const [ownerTypeId, setOwnerTypeId] =
        useState<number>(0);

    const [phone, setPhone] =
        useState("");


    /*
     * Загрузка страницы владельцев.
     *
     * Поиск выполняется на backend.
     */
    async function loadOwners(
        requestedPage = page,
        requestedSearch = search
    ) {
        setLoading(true);
        setError("");

        try {
            const result =
                await ownerApi.getAll(
                    requestedPage,
                    PAGE_SIZE,
                    requestedSearch
                );

            setItems(
                result.content
            );

            setPage(
                result.number
            );

            setTotalElements(
                result.totalElements
            );

            setTotalPages(
                result.totalPages
            );
        } catch (e) {
            console.error(e);

            setError(
                "Не удалось загрузить владельцев."
            );

            setItems([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }


    /*
     * Загрузка типов владельцев.
     */
    async function loadOwnerTypes() {
        try {
            const result =
                await ownerTypeApi.getAll();

            setOwnerTypes(result);
        } catch (e) {
            console.error(e);
        }
    }


    /*
     * Первоначальная загрузка.
     */
    useEffect(() => {
        void loadOwners(0);
        void loadOwnerTypes();
    }, []);


    /*
     * Поиск по всей базе через backend.
     *
     * Debounce 400 мс, чтобы не отправлять
     * запрос на каждое нажатие клавиши.
     *
     * Первый рендер пропускаем, потому что
     * начальную загрузку выполняет эффект выше.
     */
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId =
            setTimeout(() => {
                void loadOwners(0, search);
            }, 400);

        return () =>
            clearTimeout(timeoutId);
    }, [search]);


    /*
     * Добавление владельца.
     */
    function openCreate() {
        setEditingItem(null);

        setLastName("");
        setFirstName("");
        setMiddleName("");
        setOwnerTypeId(0);
        setPhone("");

        setError("");
        setModalOpen(true);
    }


    /*
     * Редактирование владельца.
     */
    function openEdit(
        item: Owner
    ) {
        setEditingItem(item);

        setLastName(
            item.lastName
        );

        setFirstName(
            item.firstName
        );

        setMiddleName(
            item.middleName ?? ""
        );

        setPhone(
            item.phone ?? ""
        );

        const type =
            ownerTypes.find(
                (itemType) =>
                    itemType.name ===
                    item.ownerType
            );

        setOwnerTypeId(
            type?.id ?? 0
        );

        setError("");
        setModalOpen(true);
    }


    /*
     * Закрытие модального окна.
     */
    function closeModal() {
        setModalOpen(false);
        setEditingItem(null);
    }


    /*
     * Сохранение владельца.
     */
    async function saveOwner() {
        if (!lastName.trim()) {
            setError(
                "Введите фамилию."
            );
            return;
        }

        if (!firstName.trim()) {
            setError(
                "Введите имя."
            );
            return;
        }

        if (!ownerTypeId) {
            setError(
                "Выберите тип владельца."
            );
            return;
        }

        if (!phone.trim()) {
            setError(
                "Введите телефон."
            );
            return;
        }


        const data: OwnerRequest = {
            lastName:
                lastName.trim(),

            firstName:
                firstName.trim(),

            middleName:
                middleName.trim() ||
                undefined,

            ownerTypeId,

            phone:
                phone.trim(),
        };


        try {
            setError("");

            if (editingItem) {
                await ownerApi.update(
                    editingItem.id,
                    data
                );
            } else {
                await ownerApi.create(
                    data
                );
            }

            closeModal();

            /*
             * После сохранения остаёмся
             * на текущей странице и сохраняем
             * текущий поиск.
             */
            await loadOwners(
                page,
                search
            );

        } catch (e) {
            console.error(e);

            setError(
                "Ошибка сохранения владельца."
            );
        }
    }


    /*
     * Удаление владельца.
     */
    async function deleteOwner(
        id: number
    ) {
        const confirmed =
            window.confirm(
                "Удалить владельца?"
            );

        if (!confirmed) {
            return;
        }


        try {
            setError("");

            await ownerApi.remove(id);


            /*
             * Если удалили последний
             * элемент текущей страницы,
             * переходим на предыдущую.
             */
            const targetPage =
                page > 0 &&
                items.length === 1
                    ? page - 1
                    : page;


            await loadOwners(
                targetPage,
                search
            );

        } catch (e) {
            console.error(e);

            setError(
                "Ошибка удаления владельца."
            );
        }
    }


    /*
     * Переход на конкретную страницу.
     *
     * Backend использует нумерацию:
     * 0, 1, 2...
     *
     * Пользователь видит:
     * 1, 2, 3...
     */
    function goToPage(
        targetPage: number
    ) {
        if (
            targetPage < 0 ||
            targetPage >= totalPages ||
            targetPage === page
        ) {
            return;
        }

        /*
         * Search НЕ сбрасываем.
         *
         * Если пользователь ищет "Иванов",
         * переключение страницы должно продолжать
         * показывать результаты поиска.
         */
        void loadOwners(
            targetPage,
            search
        );
    }


    /*
     * Предыдущая страница.
     */
    function previousPage() {
        goToPage(
            page - 1
        );
    }


    /*
     * Следующая страница.
     */
    function nextPage() {
        goToPage(
            page + 1
        );
    }


    /*
     * Формируем номера страниц.
     */
    function getPageNumbers(): (
        number | "ellipsis"
    )[] {
        if (totalPages <= 7) {
            return Array.from(
                { length: totalPages },
                (_, index) => index
            );
        }

        const pages: (
            number | "ellipsis"
        )[] = [];

        pages.push(0);

        if (page > 3) {
            pages.push("ellipsis");
        }

        const start = Math.max(
            1,
            page - 2
        );

        const end = Math.min(
            totalPages - 2,
            page + 2
        );

        for (
            let i = start;
            i <= end;
            i++
        ) {
            pages.push(i);
        }

        if (
            page < totalPages - 4
        ) {
            pages.push("ellipsis");
        }

        pages.push(
            totalPages - 1
        );

        return pages;
    }


    return (
        <section>

            <div className="page-header">

                <div>

                    <h1>
                        Владельцы
                    </h1>

                    <p className="page-description">
                        Всего записей:{" "}
                        {totalElements}
                    </p>

                </div>


                <button
                    className="button button-primary"
                    onClick={openCreate}
                >
                    Добавить
                </button>

            </div>


            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}


            <div className="filter-bar">

                <input
                    placeholder="Поиск по владельцам"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            <div className="table-card">

                {loading ? (

                    <p className="table-message">
                        Загрузка...
                    </p>

                ) : (

                    <>

                        <table className="data-table">

                            <thead>

                            <tr>

                                <th>
                                    ФИО
                                </th>

                                <th>
                                    Тип владельца
                                </th>

                                <th>
                                    Телефон
                                </th>

                                <th>
                                    Действия
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {items.map(
                                (item) => (

                                    <tr
                                        key={item.id}
                                    >

                                        <td>
                                            {item.lastName}{" "}
                                            {item.firstName}{" "}
                                            {item.middleName}
                                        </td>


                                        <td>
                                            {item.ownerType ||
                                                "—"}
                                        </td>


                                        <td>
                                            {item.phone ||
                                                "—"}
                                        </td>


                                        <td>

                                            <div className="table-actions">

                                                <button
                                                    className="button button-secondary"
                                                    onClick={() =>
                                                        openEdit(
                                                            item
                                                        )
                                                    }
                                                >
                                                    Изменить
                                                </button>


                                                <button
                                                    className="button button-danger"
                                                    onClick={() =>
                                                        deleteOwner(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    Удалить
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}


                            {!items.length && (

                                <tr>

                                    <td
                                        colSpan={4}
                                        className="table-message"
                                    >
                                        Нет данных
                                    </td>

                                </tr>

                            )}

                            </tbody>

                        </table>


                        {totalPages > 1 && (

                            <div className="pagination">

                                <button
                                    className="button button-secondary"
                                    onClick={
                                        previousPage
                                    }
                                    disabled={
                                        page === 0
                                    }
                                    aria-label="Предыдущая страница"
                                >
                                    ‹
                                </button>


                                {getPageNumbers().map(
                                    (
                                        pageNumber,
                                        index
                                    ) => {

                                        if (
                                            pageNumber ===
                                            "ellipsis"
                                        ) {
                                            return (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="pagination-ellipsis"
                                                >
                                                    …
                                                </span>
                                            );
                                        }


                                        return (
                                            <button
                                                key={
                                                    pageNumber
                                                }
                                                className={
                                                    pageNumber ===
                                                    page
                                                        ? "button button-primary pagination-page active"
                                                        : "button button-secondary pagination-page"
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        pageNumber
                                                    )
                                                }
                                                disabled={
                                                    pageNumber ===
                                                    page
                                                }
                                            >
                                                {pageNumber + 1}
                                            </button>
                                        );
                                    }
                                )}


                                <button
                                    className="button button-secondary"
                                    onClick={
                                        nextPage
                                    }
                                    disabled={
                                        page >=
                                        totalPages - 1
                                    }
                                    aria-label="Следующая страница"
                                >
                                    ›
                                </button>

                            </div>

                        )}

                    </>

                )}

            </div>


            {modalOpen && (

                <div className="modal-backdrop">

                    <div className="modal-card">

                        <div className="modal-header">

                            <h2>
                                {editingItem
                                    ? "Редактирование владельца"
                                    : "Добавление владельца"}
                            </h2>


                            <button
                                className="close-button"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="form-grid">

                            <label>

                                Фамилия

                                <input
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <label>

                                Имя

                                <input
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <label>

                                Отчество

                                <input
                                    value={middleName}
                                    onChange={(e) =>
                                        setMiddleName(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <label>

                                Тип владельца

                                <select
                                    value={
                                        ownerTypeId
                                    }
                                    onChange={(e) =>
                                        setOwnerTypeId(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={0}>
                                        Выберите тип
                                    </option>


                                    {ownerTypes.map(
                                        (type) => (

                                            <option
                                                key={
                                                    type.id
                                                }
                                                value={
                                                    type.id
                                                }
                                            >
                                                {type.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            <label>

                                Телефон

                                <input
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    placeholder="+79493716918"
                                />

                            </label>

                        </div>


                        <div className="modal-footer">

                            <button
                                className="button button-secondary"
                                onClick={
                                    closeModal
                                }
                            >
                                Отмена
                            </button>


                            <button
                                className="button button-primary"
                                onClick={
                                    saveOwner
                                }
                            >
                                Сохранить
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}
