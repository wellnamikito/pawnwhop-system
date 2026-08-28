import { useEffect, useRef, useState } from "react";

import { pawnshopApi } from "@/api/pawnshop";
import { ownerApi } from "@/api/owner";
import {
    districtApi,
    ownershipTypeApi,
} from "@/api/dictionary";

import type {
    Pawnshop,
    PawnshopRequest,
} from "@/types/pawnshop";

import type { Dictionary } from "@/types/dictionary";

const PAGE_SIZE = 50;

function workingHours(pawnshop: Pawnshop) {
    if (
        pawnshop.openingHour == null ||
        pawnshop.closingHour == null
    ) {
        return "—";
    }

    return `${String(pawnshop.openingHour).padStart(
        2,
        "0"
    )}:00 – ${String(pawnshop.closingHour).padStart(
        2,
        "0"
    )}:00`;
}

export default function PawnshopsPage() {
    const [items, setItems] = useState<Pawnshop[]>([]);

    const [ownershipTypes, setOwnershipTypes] =
        useState<Dictionary[]>([]);

    const [owners, setOwners] =
        useState<Dictionary[]>([]);

    const [districts, setDistricts] =
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
        useState<Pawnshop | null>(null);

    const [name, setName] = useState("");

    const [ownershipTypeId, setOwnershipTypeId] =
        useState<number>(0);

    const [ownerId, setOwnerId] =
        useState<number>(0);

    const [districtId, setDistrictId] =
        useState<number>(0);

    const [address, setAddress] = useState("");

    const [phone, setPhone] = useState("");

    const [openingHour, setOpeningHour] =
        useState<number | "">("");

    const [closingHour, setClosingHour] =
        useState<number | "">("");


    async function loadPawnshops(
        requestedPage = page,
        requestedSearch = search
    ) {
        setLoading(true);
        setError("");

        try {
            const result =
                await pawnshopApi.getPage(
                    requestedPage,
                    PAGE_SIZE,
                    requestedSearch
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
                "Не удалось загрузить ломбарды."
            );

            setItems([]);

            setTotalElements(0);

            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }


    async function loadDictionaries() {
        try {
            const [
                ownershipTypesResult,
                ownersPage,
                districtsResult,
            ] = await Promise.all([
                ownershipTypeApi.getAll(),
                ownerApi.getAll(0, 1000),
                districtApi.getAll(),
            ]);

            setOwnershipTypes(
                ownershipTypesResult
            );

            setOwners(
                ownersPage.content.map(
                    (owner) => ({
                        id: owner.id,
                        name: [
                            owner.lastName,
                            owner.firstName,
                            owner.middleName,
                        ]
                            .filter(Boolean)
                            .join(" "),
                    })
                )
            );

            setDistricts(
                districtsResult
            );
        } catch (e) {
            console.error(e);
        }
    }


    useEffect(() => {
        void loadPawnshops(0);
        void loadDictionaries();
    }, []);


    /*
     * Поиск по всей базе через бэкенд.
     * Debounce 400мс, чтобы не слать запрос на каждое нажатие клавиши.
     * Пропускаем самый первый рендер — начальную загрузку
     * уже делает эффект выше.
     */
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            void loadPawnshops(0, search);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [search]);


    function openCreate() {
        setEditingItem(null);

        setName("");

        setOwnershipTypeId(0);

        setOwnerId(0);

        setDistrictId(0);

        setAddress("");

        setPhone("");

        setOpeningHour("");

        setClosingHour("");

        setError("");

        setModalOpen(true);
    }


    function openEdit(item: Pawnshop) {
        setEditingItem(item);

        setName(item.name);

        const ownershipType =
            ownershipTypes.find(
                (type) =>
                    type.name ===
                    item.ownershipType
            );

        setOwnershipTypeId(
            ownershipType?.id ?? 0
        );


        const owner =
            owners.find(
                (itemOwner) =>
                    itemOwner.name ===
                    item.owner
            );

        setOwnerId(
            owner?.id ?? 0
        );


        const district =
            districts.find(
                (itemDistrict) =>
                    itemDistrict.name ===
                    item.district
            );

        setDistrictId(
            district?.id ?? 0
        );


        setAddress(
            item.address ?? ""
        );

        setPhone(
            item.phone ?? ""
        );

        setOpeningHour(
            item.openingHour ?? ""
        );

        setClosingHour(
            item.closingHour ?? ""
        );

        setError("");

        setModalOpen(true);
    }


    function closeModal() {
        setModalOpen(false);

        setEditingItem(null);
    }


    async function savePawnshop() {
        if (!name.trim()) {
            setError(
                "Введите название ломбарда."
            );
            return;
        }

        if (!ownershipTypeId) {
            setError(
                "Выберите форму собственности."
            );
            return;
        }

        if (!ownerId) {
            setError(
                "Выберите владельца."
            );
            return;
        }

        if (!districtId) {
            setError(
                "Выберите район."
            );
            return;
        }

        if (!address.trim()) {
            setError(
                "Введите адрес."
            );
            return;
        }


        const data: PawnshopRequest = {
            name: name.trim(),

            ownershipTypeId,

            ownerId,

            districtId,

            address: address.trim(),

            phone:
                phone.trim() ||
                undefined,

            openingHour:
                openingHour === ""
                    ? undefined
                    : openingHour,

            closingHour:
                closingHour === ""
                    ? undefined
                    : closingHour,
        };


        try {
            setError("");

            if (editingItem) {
                await pawnshopApi.update(
                    editingItem.id,
                    data
                );
            } else {
                await pawnshopApi.create(
                    data
                );
            }

            closeModal();

            await loadPawnshops(page);

        } catch (e) {
            console.error(e);

            setError(
                "Ошибка сохранения ломбарда."
            );
        }
    }


    async function deletePawnshop(
        id: number
    ) {
        const confirmed =
            window.confirm(
                "Удалить ломбард?"
            );

        if (!confirmed) {
            return;
        }


        try {
            setError("");

            await pawnshopApi.remove(id);


            const targetPage =
                page > 0 &&
                items.length === 1
                    ? page - 1
                    : page;


            await loadPawnshops(
                targetPage
            );

        } catch (e) {
            console.error(e);

            setError(
                "Ошибка удаления ломбарда."
            );
        }
    }


    /*
     * Клиентской фильтрации больше нет: поиск выполняется на бэкенде
     * (см. debounce-эффект выше), items уже содержит только то,
     * что подходит под текущий search.
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

        void loadPawnshops(
            targetPage
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
                        Ломбарды
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
                    placeholder="Поиск по ломбардам"
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
                                    Название
                                </th>

                                <th>
                                    Форма собственности
                                </th>

                                <th>
                                    Владелец
                                </th>

                                <th>
                                    Район
                                </th>

                                <th>
                                    Адрес
                                </th>

                                <th>
                                    Часы работы
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
                                            {item.name}
                                        </td>

                                        <td>
                                            {item.ownershipType ||
                                                "—"}
                                        </td>

                                        <td>
                                            {item.owner ||
                                                "—"}
                                        </td>

                                        <td>
                                            {item.district ||
                                                "—"}
                                        </td>

                                        <td>
                                            {item.address ||
                                                "—"}
                                        </td>

                                        <td>
                                            {workingHours(
                                                item
                                            )}
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
                                                        deletePawnshop(
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
                                        colSpan={8}
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
                                                key={pageNumber}
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
                                    ? "Редактирование ломбарда"
                                    : "Добавление ломбарда"}
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
                                Название

                                <input
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>


                            <label>
                                Форма собственности

                                <select
                                    value={
                                        ownershipTypeId
                                    }
                                    onChange={(e) =>
                                        setOwnershipTypeId(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={0}>
                                        Выберите форму
                                    </option>

                                    {ownershipTypes.map(
                                        (type) => (

                                            <option
                                                key={type.id}
                                                value={type.id}
                                            >
                                                {type.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            <label>
                                Владелец

                                <select
                                    value={ownerId}
                                    onChange={(e) =>
                                        setOwnerId(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={0}>
                                        Выберите владельца
                                    </option>

                                    {owners.map(
                                        (owner) => (

                                            <option
                                                key={owner.id}
                                                value={owner.id}
                                            >
                                                {owner.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            <label>
                                Район

                                <select
                                    value={districtId}
                                    onChange={(e) =>
                                        setDistrictId(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={0}>
                                        Выберите район
                                    </option>

                                    {districts.map(
                                        (district) => (

                                            <option
                                                key={district.id}
                                                value={district.id}
                                            >
                                                {district.name}
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


                            <label>
                                Час открытия

                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={
                                        openingHour
                                    }
                                    onChange={(e) =>
                                        setOpeningHour(
                                            e.target.value ===
                                            ""
                                                ? ""
                                                : Number(
                                                    e.target.value
                                                )
                                        )
                                    }
                                />

                            </label>


                            <label>
                                Час закрытия

                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={
                                        closingHour
                                    }
                                    onChange={(e) =>
                                        setClosingHour(
                                            e.target.value ===
                                            ""
                                                ? ""
                                                : Number(
                                                    e.target.value
                                                )
                                        )
                                    }
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
                                    savePawnshop
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