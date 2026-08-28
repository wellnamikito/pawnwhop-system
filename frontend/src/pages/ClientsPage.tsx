import { useEffect, useState } from "react";

import { clientsApi } from "@/api/clients";
import { socialStatusApi } from "@/api/dictionary";

import type {
    Client,
    ClientRequest,
} from "@/types/client";

import type { Dictionary } from "@/types/dictionary";

const PAGE_SIZE = 50;

export default function ClientsPage() {
    const [items, setItems] = useState<Client[]>([]);

    const [socialStatuses, setSocialStatuses] =
        useState<Dictionary[]>([]);

    const [page, setPage] = useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingItem, setEditingItem] =
        useState<Client | null>(null);

    const [lastName, setLastName] =
        useState("");

    const [firstName, setFirstName] =
        useState("");

    const [middleName, setMiddleName] =
        useState("");

    const [birthDate, setBirthDate] =
        useState("");

    const [socialStatusId, setSocialStatusId] =
        useState<number>(0);

    const [address, setAddress] =
        useState("");

    const [phone, setPhone] =
        useState("");


    /*
     * Загрузка клиентов.
     *
     * requestedPage и requestedSearch всегда передаются
     * явно из места вызова, поэтому функция не зависит
     * от устаревших значений state.
     */
    async function loadClients(
        requestedPage: number,
        requestedSearch: string
    ) {
        setLoading(true);
        setError("");

        try {
            const result =
                await clientsApi.getPage(
                    requestedPage,
                    PAGE_SIZE,
                    requestedSearch.trim()
                );

            setItems(result.content);

            setPage(result.number);

            setTotalElements(
                result.totalElements
            );

            setTotalPages(
                result.totalPages
            );
        } catch (e) {
            console.error(e);

            setError(
                "Не удалось загрузить клиентов."
            );

            setItems([]);

            setTotalElements(0);

            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }


    /*
     * Загрузка справочников.
     */
    async function loadDictionaries() {
        try {
            const result =
                await socialStatusApi.getAll();

            setSocialStatuses(result);
        } catch (e) {
            console.error(e);
        }
    }


    /*
     * Первоначальная загрузка страницы.
     *
     * Всегда начинаем с page = 0.
     */
    useEffect(() => {
        void loadClients(0, "");
        void loadDictionaries();
    }, []);


    /*
     * Поиск по всей базе.
     *
     * При каждом изменении search:
     * 1. ждём 400 мс;
     * 2. сбрасываем pagination на первую страницу;
     * 3. отправляем новый запрос на backend.
     *
     * Важно: search.trim() используется только при запросе,
     * поэтому пробелы в начале/конце не влияют на поиск.
     */
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void loadClients(0, search);
        }, 400);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [search]);


    function openCreate() {
        setEditingItem(null);

        setLastName("");

        setFirstName("");

        setMiddleName("");

        setBirthDate("");

        setSocialStatusId(0);

        setAddress("");

        setPhone("");

        setError("");

        setModalOpen(true);
    }


    function openEdit(item: Client) {
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

        setBirthDate(
            item.birthDate ?? ""
        );

        const status =
            socialStatuses.find(
                (itemStatus) =>
                    itemStatus.name ===
                    item.socialStatus
            );

        setSocialStatusId(
            status?.id ?? 0
        );

        setAddress(
            item.address ?? ""
        );

        setPhone(
            item.phone ?? ""
        );

        setError("");

        setModalOpen(true);
    }


    function closeModal() {
        setModalOpen(false);

        setEditingItem(null);
    }


    async function saveClient() {
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

        if (!socialStatusId) {
            setError(
                "Выберите социальный статус."
            );
            return;
        }

        if (!address.trim()) {
            setError(
                "Введите адрес."
            );
            return;
        }


        const data: ClientRequest = {
            lastName:
                lastName.trim(),

            firstName:
                firstName.trim(),

            middleName:
                middleName.trim() ||
                undefined,

            birthDate:
                birthDate ||
                undefined,

            socialStatusId,

            address:
                address.trim(),

            phone:
                phone.trim() ||
                undefined,
        };


        try {
            setError("");

            if (editingItem) {
                await clientsApi.update(
                    editingItem.clientId,
                    data
                );
            } else {
                await clientsApi.create(
                    data
                );
            }

            closeModal();

            /*
             * После сохранения остаёмся на той же странице
             * и сохраняем текущий поиск.
             */
            await loadClients(
                page,
                search
            );

        } catch (e) {
            console.error(e);

            setError(
                "Ошибка сохранения клиента."
            );
        }
    }


    async function deleteClient(
        id: number
    ) {
        const confirmed =
            window.confirm(
                "Удалить клиента?"
            );

        if (!confirmed) {
            return;
        }


        try {
            setError("");

            await clientsApi.remove(id);


            /*
             * Если удалили последнюю запись
             * на текущей странице, переходим
             * на предыдущую.
             */
            const targetPage =
                page > 0 &&
                items.length === 1
                    ? page - 1
                    : page;


            await loadClients(
                targetPage,
                search
            );

        } catch (e) {
            console.error(e);

            setError(
                "Ошибка удаления клиента."
            );
        }
    }


    /*
     * Переход на страницу.
     *
     * Текущий search сохраняется.
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

        void loadClients(
            targetPage,
            search
        );
    }


    function previousPage() {
        goToPage(page - 1);
    }


    function nextPage() {
        goToPage(page + 1);
    }


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
                        Клиенты
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
                    placeholder="Поиск по клиентам"
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
                                        Дата рождения
                                    </th>

                                    <th>
                                        Социальный статус
                                    </th>

                                    <th>
                                        Адрес
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
                                            key={
                                                item.clientId
                                            }
                                        >

                                            <td>
                                                {item.lastName}{" "}
                                                {item.firstName}{" "}
                                                {item.middleName ||
                                                    ""}
                                            </td>

                                            <td>
                                                {item.birthDate ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {item.socialStatus ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {item.address ||
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
                                                            deleteClient(
                                                                item.clientId
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
                                            colSpan={6}
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
                                    ? "Редактирование клиента"
                                    : "Добавление клиента"}
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
                                Дата рождения

                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) =>
                                        setBirthDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <label>
                                Социальный статус

                                <select
                                    value={
                                        socialStatusId
                                    }
                                    onChange={(e) =>
                                        setSocialStatusId(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={0}>
                                        Выберите статус
                                    </option>


                                    {socialStatuses.map(
                                        (status) => (

                                            <option
                                                key={
                                                    status.id
                                                }
                                                value={
                                                    status.id
                                                }
                                            >
                                                {status.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            <label>
                                Адрес

                                <input
                                    value={address}
                                    onChange={(e) =>
                                        setAddress(
                                            e.target.value
                                        )
                                    }
                                />

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
                                    saveClient
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
