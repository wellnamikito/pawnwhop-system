import { useEffect, useMemo, useState } from "react";
import api from "@/api/client";
import type { Client } from "@/types";

const PAGE_SIZE = 50;

function clientFio(client: Client) {
  return [
    client.lastName,
    client.firstName,
    client.middleName,
  ]
      .filter(Boolean)
      .join(" ");
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

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
      const response = await api.get("/clients/page", {
        params: {
          page: requestedPage,
          size: PAGE_SIZE,
        },
      });

      const result = response.data;

      setClients(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (caughtError) {
      const message =
          caughtError instanceof Error
              ? caughtError.message
              : "Не удалось загрузить страницу клиентов.";

      setError(message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(0);
  }, []);

  const visibleClients = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return clients;
    }

    return clients.filter((client) => {
      const fio = clientFio(client).toLowerCase();
      const address = client.address?.toLowerCase() ?? "";
      const phone = client.phone?.toLowerCase() ?? "";
      const socialStatus =
          client.socialStatus?.toLowerCase() ?? "";

      return (
          fio.includes(text) ||
          address.includes(text) ||
          phone.includes(text) ||
          socialStatus.includes(text)
      );
    });
  }, [clients, search]);

  return (
      <section>
        <div className="page-header">
          <div>
            <h1>Клиенты</h1>

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
              placeholder="Поиск по ФИО, адресу или телефону"
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
                    <th>Дата рождения</th>
                    <th>Соц. положение</th>
                    <th>Адрес</th>
                    <th>Телефон</th>
                  </tr>
                  </thead>

                  <tbody>
                  {visibleClients.map((client) => (
                      <tr key={client.clientId}>
                        <td>
                          {clientFio(client)}
                        </td>

                        <td>
                          {client.birthDate || "—"}
                        </td>

                        <td>
                          {client.socialStatus || "—"}
                        </td>

                        <td>
                          {client.address || "—"}
                        </td>

                        <td>
                          {client.phone || "—"}
                        </td>
                      </tr>
                  ))}

                  {!visibleClients.length && (
                      <tr>
                        <td
                            colSpan={5}
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