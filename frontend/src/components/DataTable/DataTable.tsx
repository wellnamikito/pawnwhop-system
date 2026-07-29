import React, { useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  // dotted path or function used for both search and default sort
  accessor?: (row: T) => string | number | null | undefined;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  searchPlaceholder?: string;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  onRowClick?: (row: T) => void;
  renderRowActions?: (row: T) => React.ReactNode;
  emptyLabel?: string;
  pageSize?: number;
  expandedRowId?: string | number | null;
  renderExpandedRow?: (row: T) => React.ReactNode;
}

/**
 * Client-side table used across all dictionary/entity pages: covers the
 * spec's "просмотр содержимого таблиц", "поиск и фильтрация" and provides
 * the row-action slot used for edit/delete + the expandable-row slot used
 * by the master-detail Loans page.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  searchPlaceholder = "Поиск...",
  toolbarLeft,
  toolbarRight,
  onRowClick,
  renderRowActions,
  emptyLabel = "Нет данных, удовлетворяющих условиям",
  pageSize = 10,
  expandedRowId,
  renderExpandedRow,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const value = col.accessor ? col.accessor(row) : (row as any)[col.key];
        return String(value ?? "").toLowerCase().includes(q);
      })
    );
  }, [rows, query, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.accessor ? col.accessor(a) : (a as any)[col.key];
      const bv = col.accessor ? col.accessor(b) : (b as any)[col.key];
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), "ru");
    });
    if (sort.dir === "desc") copy.reverse();
    return copy;
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return (
    <div className="card">
      <div className="toolbar">
        <div className="search-input">
          <span aria-hidden>🔎</span>
          <input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        {toolbarLeft}
        <div className="spacer" />
        {toolbarRight}
      </div>

      {pageRows.length === 0 ? (
        <div className="empty-state">
          <div className="stamp">Реестр пуст</div>
          <div>{emptyLabel}</div>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                >
                  {col.header}
                  {sort?.key === col.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
              {renderRowActions && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const key = rowKey(row);
              const isExpanded = expandedRowId === key;
              return (
                <React.Fragment key={key}>
                  <tr
                    className={isExpanded ? "expanded" : ""}
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>{col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}</td>
                    ))}
                    {renderRowActions && (
                      <td>
                        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                          {renderRowActions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                  {isExpanded && renderExpandedRow && (
                    <tr>
                      <td colSpan={columns.length + (renderRowActions ? 1 : 0)} style={{ padding: 0, background: "var(--paper-0)" }}>
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <span>
          {sorted.length} записей
        </span>
        <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ← Назад
        </button>
        <span>
          Стр. {page + 1} из {totalPages}
        </span>
        <button
          className="btn btn-sm"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}
