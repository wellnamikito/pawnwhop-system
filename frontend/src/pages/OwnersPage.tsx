import { useEffect, useMemo, useState } from "react";
import api from "@/api/client";
import type { Owner } from "@/types";

const PAGE_SIZE = 50;

function fullName(owner: Owner) {
  return `${owner.lastName} ${owner.firstName} ${owner.middleName ?? ""}`.trim();
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPage(requestedPage = 0) {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/owners/page", {
        params: {
          page: requestedPage,
          size: PAGE_SIZE,
        },
      });

      const result = response.data;

      setOwners(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (caughtError) {
      const message =
          caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить страницу владельцев.";

      setError(message);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(0);
  }, []);

  const visibleOwners = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return owners;
    }

    return owners.filter((owner) => {
      const name = fullName(owner).toLowerCase();

      const ownerType =
          owner.ownerType?.toLowerCase() ?? "";

      const phone =
          owner.phone?.toLowerCase() ?? "";

      return (
          name.includes(text) ||
          ownerType.includes(text) ||
          phone.includes(text)
      );
    });
  }, [owners, search]);

  return (
      <section>
        <div className="page-header">
          <div>
            <h1>Владельцы</h1>

            <p className="page-description">
              Всего записей:{" "}
              {totalElements.toLocaleString("ru-RU")}.
            </p>
          </div>
        </div>

        {error && (
            <p className="form-error">
              {error}
            </p>
        )}

        <div className="filter-bar">
          <input
              placeholder="Поиск по ФИО, типу владельца или телефону"
              value={search}
              onChange={(event) =>
                  setSearch(event.target.value)
              }
          />
        </div>

        <div className="table-card">
          {loading ? (
              <p className="table-message">
                Загрузка 50 записей…
              </p>
          ) : (
              <>
                <table className="data-table">
                  <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Тип владельца</th>
                    <th>Телефон</th>
                  </tr>
                  </thead>

                  <tbody>
                  {visibleOwners.map((owner) => (
                      <tr key={owner.id}>
                        <td>
                          {fullName(owner)}
                        </td>

                        <td>
                          {owner.ownerType || "—"}
                        </td>

                        <td>
                          {owner.phone || "—"}
                        </td>
                      </tr>
                  ))}

                  {!visibleOwners.length && (
                      <tr>
                        <td
                            colSpan={3}
                            className="table-message"
                        >
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
                      onClick={() =>
                          void loadPage(page - 1)
                      }
                  >
                    Назад
                  </button>

                  <span>
                Страница {page + 1} из {totalPages}
              </span>

                  <button
                      className="button"
                      disabled={
                          loading ||
                          page >= totalPages - 1
                      }
                      onClick={() =>
                          void loadPage(page + 1)
                      }
                  >
                    Вперёд
                  </button>
                </div>
              </>
          )}
        </div>
      </section>
  );
}