import { useEffect, useRef, useState } from "react";

import api from "@/api/client";

import {
  loanApi,
  loanItemApi,
} from "@/api/loans";

import { useAuth } from "@/context/AuthContext";

import type {
  ClientOption,
  Loan,
  LoanItem,
  LoanItemPayload,
  LoanPayload,
  PawnshopOption,
  PledgeItemType,
} from "@/types/loan";

const PAGE_SIZE = 50;
const CLIENT_PAGE_SIZE = 20;

interface ClientPage {
  content: ClientOption[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface PartitionStat {
  partition: string;
  rows: number;
}

interface PartitionOverview {
  table: string;
  partitioningType: string;
  partitions: PartitionStat[];
}

function money(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function isOverdue(loan: Loan) {
  if (loan.isReturned) {
    return false;
  }

  if (!loan.returnDate) {
    return false;
  }

  const currentDate = new Date()
      .toISOString()
      .slice(0, 10);

  return loan.returnDate < currentDate;
}

function loanStatus(loan: Loan) {
  if (loan.isReturned) {
    return (
        <span className="status status-returned">
        Возвращена
      </span>
    );
  }

  if (isOverdue(loan)) {
    return (
        <span className="status status-overdue">
        Просрочена
      </span>
    );
  }

  return (
      <span className="status status-open">
      Открыта
    </span>
  );
}

function clientFullName(client: ClientOption) {
  return [
    client.lastName,
    client.firstName,
    client.middleName,
  ]
      .filter(Boolean)
      .join(" ");
}

export default function LoansPage() {
  const { can } = useAuth();

  /*
   * Права текущего пользователя.
   *
   * ADMIN / OPERATOR -> полный CRUD по ссудам и залогам.
   * ANALYST           -> только просмотр.
   */
  const canCreate = can("loans", "create");
  const canEdit = can("loans", "edit");
  const canDelete = can("loans", "delete");
  const hasActions = canEdit || canDelete;

  /*
   * ---------------------------------------------------------
   * ССУДЫ
   * ---------------------------------------------------------
   */

  const [items, setItems] = useState<Loan[]>([]);

  const [pawnshops, setPawnshops] =
      useState<PawnshopOption[]>([]);

  const [itemTypes, setItemTypes] =
      useState<PledgeItemType[]>([]);

  const [page, setPage] = useState(0);

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

  /*
   * ---------------------------------------------------------
   * ПАРТИЦИОНИРОВАНИЕ
   * ---------------------------------------------------------
   */

  const [rangeStats, setRangeStats] =
      useState<PartitionOverview | null>(null);

  const [listStats, setListStats] =
      useState<PartitionOverview | null>(null);

  const [partitionLoading, setPartitionLoading] =
      useState(true);

  const [partitionError, setPartitionError] =
      useState("");

  /*
   * ---------------------------------------------------------
   * ФОРМА ССУДЫ
   * ---------------------------------------------------------
   */

  const [modalOpen, setModalOpen] =
      useState(false);

  const [editingItem, setEditingItem] =
      useState<Loan | null>(null);

  const [pawnshopId, setPawnshopId] =
      useState<number>(0);

  const [clientId, setClientId] =
      useState<number>(0);

  const [amount, setAmount] =
      useState<string>("");

  const [issueDate, setIssueDate] =
      useState<string>("");

  const [returnDate, setReturnDate] =
      useState<string>("");

  const [penaltyPercent, setPenaltyPercent] =
      useState<string>("");

  const [isReturned, setIsReturned] =
      useState<boolean>(false);

  /*
   * ---------------------------------------------------------
   * КЛИЕНТ
   * ---------------------------------------------------------
   */

  const [clients, setClients] =
      useState<ClientOption[]>([]);

  const [clientSearch, setClientSearch] =
      useState("");

  const [clientLoading, setClientLoading] =
      useState(false);

  const [clientSearchStarted, setClientSearchStarted] =
      useState(false);

  const [selectedClient, setSelectedClient] =
      useState<ClientOption | null>(null);

  const clientSearchTimeout =
      useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * ---------------------------------------------------------
   * ВЫБРАННАЯ ССУДА И ЗАЛОГИ
   * ---------------------------------------------------------
   */

  const [selectedLoan, setSelectedLoan] =
      useState<Loan | null>(null);

  const [loanItems, setLoanItems] =
      useState<LoanItem[]>([]);

  const [itemsLoading, setItemsLoading] =
      useState(false);

  /*
   * ---------------------------------------------------------
   * ФОРМА ЗАЛОГА
   * ---------------------------------------------------------
   */

  const [itemModalOpen, setItemModalOpen] =
      useState(false);

  const [editingLoanItem, setEditingLoanItem] =
      useState<LoanItem | null>(null);

  const [itemTypeId, setItemTypeId] =
      useState<number>(0);

  const [itemDescription, setItemDescription] =
      useState("");

  const [itemValue, setItemValue] =
      useState<string>("");

  const [itemSaving, setItemSaving] =
      useState(false);

  /*
   * ---------------------------------------------------------
   * ЗАГРУЗКА ССУД
   * ---------------------------------------------------------
   */

  async function loadLoans(
      requestedPage = page,
      requestedSearch = search
  ) {
    setLoading(true);
    setError("");

    try {
      const result =
          await loanApi.getPage(
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

      setSelectedLoan((current) => {
        if (!current) {
          return null;
        }

        const exists =
            result.content.some(
                (loan) =>
                    loan.loanId ===
                    current.loanId
            );

        return exists
            ? current
            : null;
      });
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось загрузить ссуды."
      );

      setItems([]);

      setTotalElements(0);

      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ЗАГРУЗКА СПРАВОЧНИКОВ
   * ---------------------------------------------------------
   */

  async function loadDictionaries() {
    try {
      const [
        pawnshopsResponse,
        itemTypesResponse,
      ] = await Promise.all([
        api.get<PawnshopOption[]>(
            "/pawnshops"
        ),

        api.get<PledgeItemType[]>(
            "/pledge-item-types"
        ),
      ]);

      setPawnshops(
          pawnshopsResponse.data
      );

      setItemTypes(
          itemTypesResponse.data
      );
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось загрузить справочники."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * ПОИСК КЛИЕНТОВ
   * ---------------------------------------------------------
   */

  async function searchClients(
      value: string
  ) {
    const query = value.trim();

    if (!query) {
      setClients([]);
      setClientSearchStarted(false);
      return;
    }

    if (query.length < 2) {
      setClients([]);
      setClientSearchStarted(false);
      return;
    }

    setClientLoading(true);
    setClientSearchStarted(true);

    try {
      const response =
          await api.get<ClientPage>(
              "/clients/page",
              {
                params: {
                  page: 0,
                  size: CLIENT_PAGE_SIZE,
                  search: query,
                },
              }
          );

      setClients(
          response.data.content
      );
    } catch (e) {
      console.error(e);

      setClients([]);

      setError(
          "Не удалось выполнить поиск клиентов."
      );
    } finally {
      setClientLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ЗАГРУЗКА СТАТИСТИКИ ПАРТИЦИЙ
   * ---------------------------------------------------------
   */

  async function loadPartitionStats() {
    setPartitionLoading(true);
    setPartitionError("");

    try {
      const [rangeResponse, listResponse] =
          await Promise.all([
            api.get<PartitionOverview>(
                "/partitions/range/stats"
            ),
            api.get<PartitionOverview>(
                "/partitions/list/stats"
            ),
          ]);

      setRangeStats(rangeResponse.data);
      setListStats(listResponse.data);
    } catch (e) {
      console.error(e);
      setRangeStats(null);
      setListStats(null);
      setPartitionError(
          "Не удалось загрузить статистику партиций. Проверьте наличие таблиц loan_range и loan_list в PostgreSQL."
      );
    } finally {
      setPartitionLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * НАЧАЛЬНАЯ ЗАГРУЗКА
   * ---------------------------------------------------------
   */

  useEffect(() => {
    void loadLoans(0);
    void loadDictionaries();
    void loadPartitionStats();
  }, []);

  /*
   * ---------------------------------------------------------
   * ПОИСК ССУД
   * ---------------------------------------------------------
   */

  const isFirstRender =
      useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId =
        setTimeout(() => {
          void loadLoans(0, search);
        }, 400);

    return () =>
        clearTimeout(timeoutId);
  }, [search]);

  /*
   * ---------------------------------------------------------
   * ПОИСК КЛИЕНТА С DEBOUNCE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
        clientSearchTimeout.current
    ) {
      clearTimeout(
          clientSearchTimeout.current
      );
    }

    clientSearchTimeout.current =
        setTimeout(() => {
          void searchClients(
              clientSearch
          );
        }, 400);

    return () => {
      if (
          clientSearchTimeout.current
      ) {
        clearTimeout(
            clientSearchTimeout.current
        );
      }
    };
  }, [clientSearch]);

  /*
   * ---------------------------------------------------------
   * ВЫБОР ССУДЫ
   * ---------------------------------------------------------
   */

  async function selectLoan(
      loan: Loan
  ) {
    setSelectedLoan(loan);

    setItemsLoading(true);

    setError("");

    try {
      const result =
          await loanItemApi.list(
              loan.loanId
          );

      setLoanItems(result);
    } catch (e) {
      console.error(e);

      setLoanItems([]);

      setError(
          "Не удалось загрузить предметы залога."
      );
    } finally {
      setItemsLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * СОЗДАНИЕ ССУДЫ
   * ---------------------------------------------------------
   */

  function openCreate() {
    if (!canCreate) {
      return;
    }

    setEditingItem(null);

    setPawnshopId(0);

    setClientId(0);

    setSelectedClient(null);

    setClientSearch("");

    setClients([]);

    setAmount("");

    setIssueDate("");

    setReturnDate("");

    setPenaltyPercent("");

    setIsReturned(false);

    setError("");

    setModalOpen(true);
  }

  /*
   * ---------------------------------------------------------
   * РЕДАКТИРОВАНИЕ ССУДЫ
   * ---------------------------------------------------------
   */

  function openEdit(
      loan: Loan
  ) {
    if (!canEdit) {
      return;
    }

    setEditingItem(loan);

    const pawnshop =
        pawnshops.find(
            (item) =>
                item.name ===
                loan.pawnshop
        );

    setPawnshopId(
        pawnshop?.id ?? 0
    );

    setClientId(0);

    setSelectedClient(null);

    setClientSearch(
        loan.client
    );

    setAmount(
        String(
            loan.amount ?? ""
        )
    );

    setIssueDate(
        loan.issueDate ?? ""
    );

    setReturnDate(
        loan.returnDate ?? ""
    );

    setPenaltyPercent(
        loan.penaltyPercent == null
            ? ""
            : String(
                loan.penaltyPercent
            )
    );

    setIsReturned(
        Boolean(
            loan.isReturned
        )
    );

    setError("");

    setModalOpen(true);

    void searchClients(
        loan.client
    );
  }

  /*
   * ---------------------------------------------------------
   * ЗАКРЫТИЕ ФОРМЫ ССУДЫ
   * ---------------------------------------------------------
   */

  function closeModal() {
    setModalOpen(false);

    setEditingItem(null);

    setClientSearch("");

    setClients([]);

    setSelectedClient(null);
  }

  /*
   * ---------------------------------------------------------
   * ВЫБОР КЛИЕНТА
   * ---------------------------------------------------------
   */

  function chooseClient(
      client: ClientOption
  ) {
    setSelectedClient(client);

    setClientId(
        client.clientId
    );

    setClientSearch(
        clientFullName(client)
    );

    setClients([]);

    setClientSearchStarted(false);
  }

  /*
   * ---------------------------------------------------------
   * СОХРАНЕНИЕ ССУДЫ
   * ---------------------------------------------------------
   */

  async function saveLoan() {
    if (editingItem ? !canEdit : !canCreate) {
      return;
    }

    if (!pawnshopId) {
      setError(
          "Выберите ломбард."
      );

      return;
    }

    if (!clientId) {
      setError(
          "Выберите клиента из результатов поиска."
      );

      return;
    }

    if (!amount.trim()) {
      setError(
          "Введите сумму ссуды."
      );

      return;
    }

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {
      setError(
          "Введите корректную сумму."
      );

      return;
    }

    let numericPenalty:
        number | null = null;

    if (
        penaltyPercent.trim()
    ) {
      numericPenalty =
          Number(
              penaltyPercent
          );

      if (
          !Number.isFinite(
              numericPenalty
          ) ||
          numericPenalty < 0 ||
          numericPenalty > 100
      ) {
        setError(
            "Штраф должен быть от 0 до 100%."
        );

        return;
      }
    }

    const data: LoanPayload = {
      pawnshopId,

      clientId,

      amount:
      numericAmount,

      issueDate:
          issueDate ||
          null,

      returnDate:
          returnDate ||
          null,

      penaltyPercent:
      numericPenalty,

      isReturned:
      isReturned,
    };

    console.log(
        "Сохраняем ссуду с данными:",
        data
    );

    try {
      setError("");

      if (editingItem) {
        console.log(
            "Обновляем ссуду ID:",
            editingItem.loanId
        );

        await loanApi.update(
            editingItem.loanId,
            data
        );
      } else {
        console.log(
            "Создаем новую ссуду"
        );

        await loanApi.create(
            data
        );
      }

      closeModal();

      await loadLoans(
          page,
          search
      );
    } catch (e) {
      console.error(e);

      setError(
          "Ошибка сохранения ссуды."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * УДАЛЕНИЕ ССУДЫ
   * ---------------------------------------------------------
   */

  async function deleteLoan(
      loan: Loan
  ) {
    if (!canDelete) {
      return;
    }

    const confirmed =
        window.confirm(
            "Удалить выбранную ссуду?"
        );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await loanApi.remove(
          loan.loanId
      );

      if (
          selectedLoan?.loanId ===
          loan.loanId
      ) {
        setSelectedLoan(null);

        setLoanItems([]);
      }

      const targetPage =
          page > 0 &&
          items.length === 1
              ? page - 1
              : page;

      await loadLoans(
          targetPage,
          search
      );
    } catch (e) {
      console.error(e);

      setError(
          "Ошибка удаления ссуды."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * СОЗДАНИЕ ЗАЛОГА
   * ---------------------------------------------------------
   */

  function openCreateItem() {
    if (!canCreate) {
      return;
    }

    if (!selectedLoan) {
      setError(
          "Сначала выберите ссуду."
      );

      return;
    }

    setEditingLoanItem(null);

    setItemTypeId(0);

    setItemDescription("");

    setItemValue("");

    setError("");

    setItemModalOpen(true);
  }

  /*
   * ---------------------------------------------------------
   * РЕДАКТИРОВАНИЕ ЗАЛОГА
   * ---------------------------------------------------------
   */

  function openEditItem(
      item: LoanItem
  ) {
    if (!canEdit) {
      return;
    }

    setEditingLoanItem(item);

    setItemTypeId(
        item.itemTypeId
    );

    setItemDescription(
        item.itemDescription ?? ""
    );

    setItemValue(
        String(
            item.itemValue ?? ""
        )
    );

    setError("");

    setItemModalOpen(true);
  }

  /*
   * ---------------------------------------------------------
   * ЗАКРЫТИЕ ФОРМЫ ЗАЛОГА
   * ---------------------------------------------------------
   */

  function closeItemModal() {
    setItemModalOpen(false);

    setEditingLoanItem(null);
  }

  /*
   * ---------------------------------------------------------
   * СОХРАНЕНИЕ ЗАЛОГА
   * ---------------------------------------------------------
   */

  async function saveLoanItem() {
    if (editingLoanItem ? !canEdit : !canCreate) {
      return;
    }

    if (!selectedLoan) {
      setError(
          "Не удалось определить номер ссуды."
      );

      return;
    }

    if (!itemTypeId) {
      setError(
          "Выберите тип предмета."
      );

      return;
    }

    if (!itemValue.trim()) {
      setError(
          "Введите стоимость предмета."
      );

      return;
    }

    const numericValue =
        Number(itemValue);

    if (
        !Number.isFinite(
            numericValue
        ) ||
        numericValue <= 0
    ) {
      setError(
          "Введите корректную стоимость."
      );

      return;
    }

    const data: LoanItemPayload = {
      loanId:
      selectedLoan.loanId,

      itemTypeId,

      itemDescription:
          itemDescription.trim(),

      itemValue:
      numericValue,
    };

    try {
      setItemSaving(true);

      setError("");

      if (editingLoanItem) {
        await loanItemApi.update(
            selectedLoan.loanId,
            editingLoanItem.itemTypeId,
            data
        );
      } else {
        await loanItemApi.create(
            selectedLoan.loanId,
            data
        );
      }

      closeItemModal();

      const result =
          await loanItemApi.list(
              selectedLoan.loanId
          );

      setLoanItems(result);
    } catch (e) {
      console.error(e);

      setError(
          "Ошибка сохранения предмета залога."
      );
    } finally {
      setItemSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * УДАЛЕНИЕ ЗАЛОГА
   * ---------------------------------------------------------
   */

  async function deleteLoanItem(
      item: LoanItem
  ) {
    if (!canDelete) {
      return;
    }

    if (!selectedLoan) {
      setError(
          "Не удалось определить номер ссуды."
      );

      return;
    }

    const confirmed =
        window.confirm(
            "Удалить предмет залога?"
        );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await loanItemApi.remove(
          selectedLoan.loanId,
          item.itemTypeId
      );

      const result =
          await loanItemApi.list(
              selectedLoan.loanId
          );

      setLoanItems(result);
    } catch (e) {
      console.error(e);

      setError(
          "Ошибка удаления предмета залога."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * ПАГИНАЦИЯ
   * ---------------------------------------------------------
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

    void loadLoans(
        targetPage,
        search
    );
  }

  function previousPage() {
    goToPage(
        page - 1
    );
  }

  function nextPage() {
    goToPage(
        page + 1
    );
  }

  function getPageNumbers(): (
      number | "ellipsis"
      )[] {
    if (totalPages <= 7) {
      return Array.from(
          {
            length: totalPages,
          },
          (_, index) =>
              index
      );
    }

    const pages: (
        number | "ellipsis"
        )[] = [];

    pages.push(0);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start =
        Math.max(
            1,
            page - 2
        );

    const end =
        Math.min(
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
        page <
        totalPages - 4
    ) {
      pages.push("ellipsis");
    }

    pages.push(
        totalPages - 1
    );

    return pages;
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
      <section>
        <div className="page-header">
          <div>
            <h1>
              Ссуды и залоги
            </h1>

            <p className="page-description">
              Всего записей:{" "}
              {totalElements.toLocaleString(
                  "ru-RU"
              )}
            </p>
          </div>

          {canCreate && (
              <button
                  className="button button-primary"
                  onClick={
                    openCreate
                  }
              >
                Добавить
              </button>
          )}
        </div>

        {error && (
            <p className="form-error">
              {error}
            </p>
        )}

        <div className="filter-bar">
          <input
              placeholder="Поиск по ссудам"
              value={search}
              onChange={(e) =>
                  setSearch(
                      e.target.value
                  )
              }
          />
        </div>

        <div className="loans-layout">
          <div className="table-card">
            {loading ? (
                <p className="table-message">
                  Загрузка...
                </p>
            ) : (
                <>
                  <div
                      style={{
                        overflowX: "auto",
                        maxWidth: "100%",
                      }}
                  >
                    <table
                        className="data-table"
                        style={{
                          minWidth: "1100px",
                        }}
                    >
                      <thead>
                      <tr>
                        <th
                            style={{
                              width: "50px",
                            }}
                        >
                          №
                        </th>

                        <th
                            style={{
                              minWidth: "150px",
                            }}
                        >
                          Ломбард
                        </th>

                        <th
                            style={{
                              minWidth: "200px",
                            }}
                        >
                          Клиент
                        </th>

                        <th
                            style={{
                              minWidth: "120px",
                            }}
                        >
                          Сумма
                        </th>

                        <th
                            style={{
                              minWidth: "120px",
                            }}
                        >
                          Дата
                          <br />
                          выдачи
                        </th>

                        <th
                            style={{
                              minWidth: "120px",
                            }}
                        >
                          Дата
                          <br />
                          возврата
                        </th>

                        <th
                            style={{
                              minWidth: "80px",
                            }}
                        >
                          Штраф
                          <br />
                          %
                        </th>

                        <th
                            style={{
                              minWidth: "120px",
                            }}
                        >
                          Статус
                        </th>

                        {hasActions && (
                            <th
                                style={{
                                  minWidth: "200px",
                                  textAlign:
                                      "center",
                                }}
                            >
                              Действия
                            </th>
                        )}
                      </tr>
                      </thead>

                      <tbody>
                      {items.map(
                          (
                              loan,
                              index
                          ) => (
                              <tr
                                  key={
                                    loan.loanId
                                  }
                                  className={
                                    selectedLoan?.loanId ===
                                    loan.loanId
                                        ? "selected-row"
                                        : ""
                                  }
                                  onClick={() =>
                                      void selectLoan(
                                          loan
                                      )
                                  }
                              >
                                <td>
                                  {index + 1}
                                </td>

                                <td>
                                  {
                                    loan.pawnshop
                                  }
                                </td>

                                <td>
                                  {
                                    loan.client
                                  }
                                </td>

                                <td>
                                  {money(
                                      loan.amount
                                  )}
                                </td>

                                <td>
                                  {loan.issueDate ||
                                      "—"}
                                </td>

                                <td>
                                  {loan.returnDate ||
                                      "—"}
                                </td>

                                <td>
                                  {loan.penaltyPercent ==
                                  null
                                      ? "—"
                                      : `${loan.penaltyPercent}%`}
                                </td>

                                <td>
                                  {loanStatus(
                                      loan
                                  )}
                                </td>

                                {hasActions && (
                                    <td
                                        style={{
                                          textAlign:
                                              "center",
                                        }}
                                    >
                                      <div
                                          style={{
                                            display:
                                                "inline-flex",
                                            gap: "8px",
                                            justifyContent:
                                                "center",
                                            alignItems:
                                                "center",
                                          }}
                                          onClick={(
                                              e
                                          ) =>
                                              e.stopPropagation()
                                          }
                                      >
                                        {canEdit && (
                                            <button
                                                className="button button-secondary"
                                                onClick={() =>
                                                    openEdit(
                                                        loan
                                                    )
                                                }
                                            >
                                              Изменить
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button
                                                className="button button-danger"
                                                onClick={() =>
                                                    void deleteLoan(
                                                        loan
                                                    )
                                                }
                                            >
                                              Удалить
                                            </button>
                                        )}
                                      </div>
                                    </td>
                                )}
                              </tr>
                          )
                      )}

                      {!items.length && (
                          <tr>
                            <td
                                colSpan={
                                  hasActions
                                      ? 9
                                      : 8
                                }
                                className="table-message"
                            >
                              Нет данных
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>

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
                                    {
                                        pageNumber +
                                        1
                                    }
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

          <aside
              className="details-card"
              style={{
                height:
                    "calc(100vh - 180px)",
                maxHeight:
                    "calc(100vh - 180px)",
                overflowY: "auto",
                overflowX: "hidden",
              }}
          >
            {!selectedLoan ? (
                <p className="table-message">
                  Выберите ссуду,
                  чтобы посмотреть
                  предметы залога.
                </p>
            ) : (
                <>
                  <div className="details-header">
                    <div>
                      <h2>
                        Предметы залога
                      </h2>

                      <p>
                        {
                          selectedLoan.client
                        }
                      </p>
                    </div>

                    {canCreate && (
                        <button
                            className="button button-primary"
                            onClick={
                              openCreateItem
                            }
                        >
                          Добавить
                        </button>
                    )}
                  </div>

                  {itemsLoading ? (
                      <p className="table-message">
                        Загрузка
                        залогов...
                      </p>
                  ) : (
                      <div className="pledge-list">
                        {loanItems.map(
                            (
                                item
                            ) => (
                                <article
                                    className="pledge-item"
                                    key={`${item.loanId}-${item.itemTypeId}`}
                                >
                                  <div>
                                    <strong>
                                      {
                                        item.itemTypeName
                                      }
                                    </strong>

                                    <p>
                                      {
                                        item.itemDescription
                                      }
                                    </p>

                                    <span>
                            {money(
                                item.itemValue
                            )}
                          </span>
                                  </div>

                                  {hasActions && (
                                      <div className="table-actions">
                                        {canEdit && (
                                            <button
                                                className="button button-secondary"
                                                onClick={() =>
                                                    openEditItem(
                                                        item
                                                    )
                                                }
                                            >
                                              Изменить
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button
                                                className="button button-danger"
                                                onClick={() =>
                                                    void deleteLoanItem(
                                                        item
                                                    )
                                                }
                                            >
                                              Удалить
                                            </button>
                                        )}
                                      </div>
                                  )}
                                </article>
                            )
                        )}

                        {!loanItems.length && (
                            <p className="table-message">
                              Предметы
                              залога
                              отсутствуют.
                            </p>
                        )}
                      </div>
                  )}
                </>
            )}
          </aside>
        </div>

        <div style={{ marginTop: "24px" }}>
          <h2>Партиционирование</h2>

          <p className="page-description">
            Статистика распределения записей по физическим секциям PostgreSQL.
            Основная таблица ссуд при этом продолжает использовать обычную
            постраничную загрузку по 50 записей.
          </p>
        </div>

        {partitionError && (
            <p className="form-error">
              {partitionError}
            </p>
        )}

        {partitionLoading ? (
            <div className="info-card" style={{ marginTop: "16px" }}>
              <p className="table-message">
                Загрузка статистики партиций...
              </p>
            </div>
        ) : (
            <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "16px",
                  marginTop: "16px",
                }}
            >
              {[
                {
                  title: "RANGE — loan_range",
                  overview: rangeStats,
                  description: "Разбиение по дате выдачи с вложенным разбиением 2023 года по кварталам.",
                },
                {
                  title: "LIST — loan_list",
                  overview: listStats,
                  description: "Разбиение по группам ломбардов.",
                },
              ].map((block) => (
                  <div className="info-card" key={block.title}>
                    <h2>{block.title}</h2>

                    <p>{block.description}</p>

                    {!block.overview ? (
                        <p className="table-message">
                          Данные о партициях недоступны.
                        </p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table className="data-table">
                            <thead>
                            <tr>
                              <th>Секция</th>
                              <th>Записей</th>
                            </tr>
                            </thead>

                            <tbody>
                            {block.overview.partitions.map((stat) => (
                                <tr key={stat.partition}>
                                  <td>{stat.partition}</td>
                                  <td>
                                    {stat.rows.toLocaleString("ru-RU")}
                                  </td>
                                </tr>
                            ))}

                            {!block.overview.partitions.length && (
                                <tr>
                                  <td colSpan={2} className="table-message">
                                    Секции не содержат записей.
                                  </td>
                                </tr>
                            )}
                            </tbody>
                          </table>
                        </div>
                    )}
                  </div>
              ))}
            </div>
        )}

        {modalOpen && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h2>
                    {editingItem
                        ? "Редактирование ссуды"
                        : "Добавление ссуды"}
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
                    Ломбард

                    <select
                        value={
                          pawnshopId
                        }
                        onChange={(
                            e
                        ) =>
                            setPawnshopId(
                                Number(
                                    e
                                        .target
                                        .value
                                )
                            )
                        }
                    >
                      <option value={0}>
                        Выберите
                        ломбард
                      </option>

                      {pawnshops.map(
                          (
                              pawnshop
                          ) => (
                              <option
                                  key={
                                    pawnshop.id
                                  }
                                  value={
                                    pawnshop.id
                                  }
                              >
                                {
                                  pawnshop.name
                                }
                              </option>
                          )
                      )}
                    </select>
                  </label>

                  <label className="client-search-field">
                    Клиент

                    <input
                        type="text"
                        placeholder="Введите фамилию, имя или отчество"
                        value={
                          clientSearch
                        }
                        onChange={(
                            e
                        ) => {
                          setClientSearch(
                              e.target
                                  .value
                          );

                          setSelectedClient(
                              null
                          );

                          setClientId(
                              0
                          );
                        }}
                    />

                    {clientLoading && (
                        <p className="table-message">
                          Поиск
                          клиентов...
                        </p>
                    )}

                    {!clientLoading &&
                        clientSearchStarted &&
                        clientSearch.trim()
                            .length >=
                        2 &&
                        !selectedClient && (
                            <div className="client-search-results">
                              {clients.length ? (
                                  clients.map(
                                      (
                                          client
                                      ) => (
                                          <button
                                              type="button"
                                              key={
                                                client.clientId
                                              }
                                              className="client-search-result"
                                              onClick={() =>
                                                  chooseClient(
                                                      client
                                                  )
                                              }
                                          >
                                            {clientFullName(
                                                client
                                            )}
                                          </button>
                                      )
                                  )
                              ) : (
                                  <p className="table-message">
                                    Клиенты
                                    не
                                    найдены.
                                  </p>
                              )}
                            </div>
                        )}
                  </label>

                  <label>
                    Сумма

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          amount
                        }
                        onChange={(
                            e
                        ) =>
                            setAmount(
                                e.target
                                    .value
                            )
                        }
                    />
                  </label>

                  <label>
                    Дата выдачи

                    <input
                        type="date"
                        value={
                          issueDate
                        }
                        onChange={(
                            e
                        ) =>
                            setIssueDate(
                                e.target
                                    .value
                            )
                        }
                    />
                  </label>

                  <label>
                    Дата возврата

                    <input
                        type="date"
                        value={
                          returnDate
                        }
                        onChange={(
                            e
                        ) =>
                            setReturnDate(
                                e.target
                                    .value
                            )
                        }
                    />
                  </label>

                  <label>
                    Штраф, %

                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={
                          penaltyPercent
                        }
                        onChange={(
                            e
                        ) =>
                            setPenaltyPercent(
                                e.target
                                    .value
                            )
                        }
                    />
                  </label>

                  <label>
                    Статус

                    <select
                        value={
                          isReturned
                              ? "true"
                              : "false"
                        }
                        onChange={(
                            e
                        ) => {
                          const newValue =
                              e.target
                                  .value ===
                              "true";

                          setIsReturned(
                              newValue
                          );

                          console.log(
                              "Статус изменен на:",
                              newValue
                                  ? "Возвращена"
                                  : "Открыта"
                          );
                        }}
                    >
                      <option value="false">
                        Открыта
                      </option>

                      <option value="true">
                        Возвращена
                      </option>
                    </select>
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
                      onClick={() =>
                          void saveLoan()
                      }
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
        )}

        {itemModalOpen && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h2>
                    {editingLoanItem
                        ? "Редактирование залога"
                        : "Добавление залога"}
                  </h2>

                  <button
                      className="close-button"
                      onClick={
                        closeItemModal
                      }
                  >
                    ×
                  </button>
                </div>

                <div className="form-grid">
                  <label>
                    Тип предмета

                    <select
                        value={
                          itemTypeId
                        }
                        onChange={(
                            e
                        ) =>
                            setItemTypeId(
                                Number(
                                    e
                                        .target
                                        .value
                                )
                            )
                        }
                    >
                      <option value={0}>
                        Выберите
                        тип
                      </option>

                      {itemTypes.map(
                          (
                              type
                          ) => (
                              <option
                                  key={
                                    type.id
                                  }
                                  value={
                                    type.id
                                  }
                              >
                                {
                                  type.name
                                }
                              </option>
                          )
                      )}
                    </select>
                  </label>

                  <label>
                    Описание

                    <input
                        value={
                          itemDescription
                        }
                        onChange={(
                            e
                        ) =>
                            setItemDescription(
                                e.target
                                    .value
                            )
                        }
                    />
                  </label>

                  <label>
                    Стоимость

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          itemValue
                        }
                        onChange={(
                            e
                        ) =>
                            setItemValue(
                                e.target
                                    .value
                            )
                        }
                    />
                  </label>
                </div>

                <div className="modal-footer">
                  <button
                      className="button button-secondary"
                      onClick={
                        closeItemModal
                      }
                  >
                    Отмена
                  </button>

                  <button
                      className="button button-primary"
                      disabled={
                        itemSaving
                      }
                      onClick={() =>
                          void saveLoanItem()
                      }
                  >
                    {itemSaving
                        ? "Сохранение..."
                        : "Сохранить"}
                  </button>
                </div>
              </div>
            </div>
        )}
      </section>
  );
}