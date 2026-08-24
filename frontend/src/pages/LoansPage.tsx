import { useEffect, useMemo, useState } from "react";
import {
  loanItemsApi,
  loansApi,
  type Loan,
  type LoanItem,
} from "@/api";

const PAGE_SIZE = 50;

function money(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function isOverdue(loan: Loan) {
  const currentDate = new Date().toISOString().slice(0, 10);

  return Boolean(
      !loan.isReturned &&
      loan.returnDate &&
      loan.returnDate < currentDate,
  );
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [items, setItems] = useState<LoanItem[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "returned" | "overdue">("all");

  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPage(requestedPage = 0) {
    setLoading(true);
    setError("");
    setSelectedLoan(null);
    setItems([]);

    try {
      const result = await loansApi.listPage(requestedPage, PAGE_SIZE);

      setLoans(result.content);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (caughtError) {
      const message =
          caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить страницу ссуд.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function selectLoan(loan: Loan) {
    setSelectedLoan(loan);
    setItemsLoading(true);
    setError("");

    try {
      setItems(await loanItemsApi.listForLoan(loan.id));
    } catch {
      setItems([]);
      setError("Не удалось загрузить предметы залога.");
    } finally {
      setItemsLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(0);
  }, []);

  const visibleLoans = useMemo(() => {
    const text = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const matchesText =
          !text ||
          String(loan.id).includes(text) ||
          loan.pawnshop.toLowerCase().includes(text) ||
          loan.client.toLowerCase().includes(text);

      const matchesStatus =
          status === "all" ||
          (status === "open" && !loan.isReturned && !isOverdue(loan)) ||
          (status === "returned" && loan.isReturned) ||
          (status === "overdue" && isOverdue(loan));

      return matchesText && matchesStatus;
    });
  }, [loans, search, status]);

  return (
      <section>
        <div className="page-header">
          <div>
            <h1>Ссуды и залоги</h1>
            <p className="page-description">
              Всего записей: {totalElements.toLocaleString("ru-RU")}.
            </p>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="filter-bar">
          <input
              placeholder="Поиск на текущей странице"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
          />

          <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="all">Все статусы</option>
            <option value="open">Открытые</option>
            <option value="returned">Возвращённые</option>
            <option value="overdue">Просроченные</option>
          </select>
        </div>

        <div className="loans-layout">
          <div className="table-card">
            {loading ? (
                <p className="table-message">Загрузка 50 записей…</p>
            ) : (
                <>
                  <table className="data-table">
                    <thead>
                    <tr>
                      <th>№</th>
                      <th>Ломбард</th>
                      <th>Клиент</th>
                      <th>Сумма</th>
                      <th>Дата выдачи</th>
                      <th>Статус</th>
                    </tr>
                    </thead>

                    <tbody>
                    {visibleLoans.map((loan) => (
                        <tr
                            key={loan.id}
                            className={selectedLoan?.id === loan.id ? "selected-row" : ""}
                            onClick={() => void selectLoan(loan)}
                        >
                          <td>{loan.id}</td>
                          <td>{loan.pawnshop}</td>
                          <td>{loan.client}</td>
                          <td>{money(loan.amount)}</td>
                          <td>{loan.issueDate || "—"}</td>
                          <td>
                            {loan.isReturned ? (
                                <span className="status status-returned">Возвращена</span>
                            ) : isOverdue(loan) ? (
                                <span className="status status-overdue">Просрочена</span>
                            ) : (
                                <span className="status status-open">Открыта</span>
                            )}
                          </td>
                        </tr>
                    ))}

                    {!visibleLoans.length && (
                        <tr>
                          <td colSpan={6} className="table-message">
                            На этой странице нет подходящих записей.
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>

                  <div className="pagination-bar">
                    <button
                        className="button"
                        disabled={loading || page === 0}
                        onClick={() => void loadPage(page - 1)}
                    >
                      Назад
                    </button>

                    <span>
                  Страница {page + 1} из {totalPages}
                </span>

                    <button
                        className="button"
                        disabled={loading || page >= totalPages - 1}
                        onClick={() => void loadPage(page + 1)}
                    >
                      Вперёд
                    </button>
                  </div>
                </>
            )}
          </div>

          <aside className="details-card">
            {!selectedLoan ? (
                <p className="table-message">
                  Выберите ссуду, чтобы посмотреть предметы залога.
                </p>
            ) : (
                <>
                  <div className="details-header">
                    <div>
                      <h2>Залоги по ссуде №{selectedLoan.id}</h2>
                      <p>{selectedLoan.client}</p>
                    </div>
                  </div>

                  {itemsLoading ? (
                      <p className="table-message">Загрузка залогов…</p>
                  ) : (
                      <div className="pledge-list">
                        {items.map((item) => (
                            <article className="pledge-item" key={item.itemTypeId}>
                              <div>
                                <strong>{item.itemTypeName}</strong>
                                <p>{item.itemDescription || "Без описания"}</p>
                                <span>{money(item.itemValue)}</span>
                              </div>
                            </article>
                        ))}

                        {!items.length && (
                            <p className="table-message">
                              Предметы залога отсутствуют.
                            </p>
                        )}
                      </div>
                  )}
                </>
            )}
          </aside>
        </div>
      </section>
  );
}