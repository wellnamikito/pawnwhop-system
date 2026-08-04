import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import { reportApi } from "@/api/endpoints";

/**
 * The real backend (ReportController, /api/report/**) exposes ~20 report
 * endpoints - only ADMIN and ANALYST can reach it per SecurityConfig. This
 * page wires up 3 of them that map cleanly onto the spec's requirement for
 * "просмотр результатов запросов" + "визуализация" (bar/pie chart + Excel
 * export). The other ~17 endpoints (loans by period, pawnshops above
 * average, clients with multiple loans, etc.) follow the exact same
 * pattern in src/api/endpoints.ts - add them here the same way if needed.
 */

type QueryKey = "loansCountByClient" | "pawnshopLoanShare" | "overdueLoans";

const QUERIES: { key: QueryKey; label: string; chart: "bar" | "pie" | "table" }[] = [
  { key: "loansCountByClient", label: "Число ссуд по клиентам", chart: "bar" },
  { key: "pawnshopLoanShare", label: "Доля ломбарда в общей сумме ссуд", chart: "pie" },
  { key: "overdueLoans", label: "Просроченные ссуды на сегодня", chart: "table" },
];

const PIE_COLORS = ["#b8863b", "#3f6b4a", "#6b737a", "#832f2f", "#8a4b1f", "#383f44"];

const today = new Date().toISOString().slice(0, 10);

export default function ReportsPage() {
  const [active, setActive] = useState<QueryKey>("loansCountByClient");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const call =
      active === "loansCountByClient"
        ? reportApi.loansCountByClient()
        : active === "pawnshopLoanShare"
        ? reportApi.pawnshopLoanShare()
        : reportApi.overdueLoans(today);

    call
      .then((data) => setRows(data as any[]))
      .catch((e) =>
        setError(e?.response?.data?.message || "Не удалось получить результат запроса с сервера")
      )
      .finally(() => setLoading(false));
  }, [active]);

  const config = QUERIES.find((q) => q.key === active)!;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  // chart x/y keys per query - see field names documented in api/endpoints.ts
  const chartXKey = active === "loansCountByClient" ? "name" : "name";
  const chartYKey = active === "loansCountByClient" ? "loanCount" : "percentOfTotal";

  function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Результат запроса");
    XLSX.writeFile(wb, `${active}.xlsx`);
  }

  return (
    <div>
      <div className="toolbar" style={{ border: "none", padding: "0 0 14px" }}>
        {QUERIES.map((q) => (
          <button
            key={q.key}
            className="btn btn-sm"
            style={
              q.key === active
                ? { background: "var(--ink-900)", color: "var(--paper-0)", borderColor: "var(--ink-900)" }
                : undefined
            }
            onClick={() => setActive(q.key)}
          >
            {q.label}
          </button>
        ))}
        <div className="spacer" />
        <button className="btn" onClick={exportToExcel} disabled={rows.length === 0}>
          Экспорт в Excel
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: 14, marginBottom: 14, color: "var(--danger-600)" }}>
          {error}
        </div>
      )}

      {config.chart !== "table" && rows.length > 0 && (
        <div className="card chart-card" style={{ marginBottom: 16, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            {config.chart === "bar" ? (
              <BarChart data={rows} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey={chartXKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey={chartYKey} fill="var(--brass-500)" radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Tooltip />
                <Pie
                  data={rows}
                  dataKey={chartYKey}
                  nameKey={chartXKey}
                  outerRadius={110}
                  label={(d: any) => d[chartXKey]}
                >
                  {rows.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">Выполнение запроса...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <div className="stamp">Результат пуст</div>
            <div>Запрос не вернул данных.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c}>{String(r[c])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
