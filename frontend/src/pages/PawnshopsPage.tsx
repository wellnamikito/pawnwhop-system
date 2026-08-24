import { useEffect, useMemo, useState } from "react";
import api from "@/api/client";
import type { Pawnshop } from "@/types";

const PAGE_SIZE = 50;

function workingHours(pawnshop: Pawnshop) {
  if (
      pawnshop.openingHour == null ||
      pawnshop.closingHour == null
  ) {
    return "—";
  }

  return `${String(pawnshop.openingHour).padStart(2, "0")}:00 – ${String(
      pawnshop.closingHour,
  ).padStart(2, "0")}:00`;
}

export default function PawnshopsPage() {
  const [pawnshops, setPawnshops] = useState<Pawnshop[]>([]);

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
      const response = await api.get("/pawnshops/page", {
        params: {
          page: requestedPage,
          size: PAGE_SIZE,
        },
      });

      const result = response.data;

      setPawnshops(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (caughtError) {
      const message =
          caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить страницу ломбардов.";

      setError(message);
      setPawnshops([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(0);
  }, []);

  const visiblePawnshops = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return pawnshops;
    }

    return pawnshops.filter((pawnshop) => {
      const name = pawnshop.name?.toLowerCase() ?? "";
      const ownershipType =
          pawnshop.ownershipType?.toLowerCase() ?? "";
      const owner =
          pawnshop.owner?.toLowerCase() ?? "";
      const district =
          pawnshop.district?.toLowerCase() ?? "";
      const address =
          pawnshop.address?.toLowerCase() ?? "";
      const phone =
          pawnshop.phone?.toLowerCase() ?? "";

      return (
          name.includes(text) ||
          ownershipType.includes(text) ||
          owner.includes(text) ||
          district.includes(text) ||
          address.includes(text) ||
          phone.includes(text)
      );
    });
  }, [pawnshops, search]);

  return (
      <section>
        <div className="page-header">
          <div>
            <h1>Ломбарды</h1>

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
              placeholder="Поиск по названию или адресу"
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
                    <th>Название</th>
                    <th>Форма собственности</th>
                    <th>Владелец</th>
                    <th>Район</th>
                    <th>Адрес</th>
                    <th>Часы работы</th>
                    <th>Телефон</th>
                  </tr>
                  </thead>

                  <tbody>
                  {visiblePawnshops.map((pawnshop) => (
                      <tr key={pawnshop.id}>
                        <td>
                          {pawnshop.name}
                        </td>

                        <td>
                          {pawnshop.ownershipType || "—"}
                        </td>

                        <td>
                          {pawnshop.owner || "—"}
                        </td>

                        <td>
                          {pawnshop.district || "—"}
                        </td>

                        <td>
                          {pawnshop.address || "—"}
                        </td>

                        <td>
                          {workingHours(pawnshop)}
                        </td>

                        <td>
                          {pawnshop.phone || "—"}
                        </td>
                      </tr>
                  ))}

                  {!visiblePawnshops.length && (
                      <tr>
                        <td
                            colSpan={7}
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