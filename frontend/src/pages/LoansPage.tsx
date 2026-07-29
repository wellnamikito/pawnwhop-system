import React, { useEffect, useMemo, useState } from "react";
import { DataTable, Column } from "@/components/DataTable/DataTable";
import { Modal } from "@/components/Modal/Modal";
import { Badge } from "@/components/Common/Badge";
import { clientApi, loanApi, loanItemApi, pawnshopApi } from "@/api/endpoints";
import type { Client, Loan, LoanItem, Pawnshop } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useDictionaries } from "@/utils/useDictionaries";
import { validatePercent, validatePositiveAmount } from "@/utils/validation";

const emptyLoanDraft: Partial<Loan> = { is_returned: false };
const emptyItemDraft: Partial<LoanItem> = {};

export default function LoansPage() {
  const { can } = useAuth();
  const { options: dictOptions, loading: dictLoading } = useDictionaries();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [pawnshops, setPawnshops] = useState<Pawnshop[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [editingLoan, setEditingLoan] = useState<Partial<Loan> | null>(null);
  const [isNewLoan, setIsNewLoan] = useState(false);
  const [loanErrors, setLoanErrors] = useState<Record<string, string>>({});
  const [savingLoan, setSavingLoan] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "returned" | "overdue">("all");

  async function loadAll() {
    setLoading(true);
    const [l, p, c] = await Promise.all([loanApi.list(), pawnshopApi.list(), clientApi.list()]);
    setLoans(l);
    setPawnshops(p);
    setClients(c);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const pawnshopOptions = pawnshops.map((p) => ({ value: p.pawnshop_id, label: p.name }));
  const clientOptions = clients.map((c) => ({ value: c.client_id, label: `${c.last_name} ${c.first_name}` }));

  const canEdit = can("loans", "edit");
  const canCreate = can("loans", "create");
  const canDelete = can("loans", "delete");

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (l: Loan) => !l.is_returned && !!l.return_date && l.return_date < today;

  const visibleLoans = useMemo(() => {
    switch (statusFilter) {
      case "returned":
        return loans.filter((l) => l.is_returned);
      case "open":
        return loans.filter((l) => !l.is_returned && !isOverdue(l));
      case "overdue":
        return loans.filter(isOverdue);
      default:
        return loans;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans, statusFilter]);

  const columns: Column<Loan>[] = [
    { key: "loan_id", header: "ID ссуды" },
    {
      key: "pawnshop_id",
      header: "Ломбард",
      accessor: (r) => pawnshops.find((p) => p.pawnshop_id === r.pawnshop_id)?.name,
      render: (r) => pawnshops.find((p) => p.pawnshop_id === r.pawnshop_id)?.name ?? "—",
    },
    {
      key: "client_id",
      header: "Клиент",
      accessor: (r) => clients.find((c) => c.client_id === r.client_id)?.last_name,
      render: (r) => {
        const c = clients.find((c) => c.client_id === r.client_id);
        return c ? `${c.last_name} ${c.first_name}` : "—";
      },
    },
    {
      key: "amount",
      header: "Сумма",
      render: (r) => <span className="mono">{Number(r.amount).toLocaleString("ru-RU")} ₽</span>,
    },
    { key: "issue_date", header: "Дата выдачи" },
    { key: "return_date", header: "Дата возврата" },
    {
      key: "status",
      header: "Статус",
      sortable: false,
      accessor: (r) => (r.is_returned ? "возвращена" : isOverdue(r) ? "просрочена" : "открыта"),
      render: (r) =>
        r.is_returned ? (
          <Badge tone="ok">возвращена</Badge>
        ) : isOverdue(r) ? (
          <Badge tone="danger">просрочена</Badge>
        ) : (
          <Badge tone="warn">открыта</Badge>
        ),
    },
  ];

  function openCreateLoan() {
    setEditingLoan({ ...emptyLoanDraft });
    setIsNewLoan(true);
    setLoanErrors({});
  }
  function openEditLoan(l: Loan) {
    setEditingLoan({ ...l });
    setIsNewLoan(false);
    setLoanErrors({});
  }

  function validateLoan(draft: Partial<Loan>) {
    const errs: Record<string, string> = {};
    if (!draft.pawnshop_id) errs.pawnshop_id = "Выберите ломбард";
    if (!draft.client_id) errs.client_id = "Выберите клиента";
    const amountErr = validatePositiveAmount(draft.amount);
    if (amountErr) errs.amount = amountErr;
    if (!draft.issue_date) errs.issue_date = "Укажите дату выдачи";
    const pct = validatePercent(draft.penalty_percent);
    if (pct) errs.penalty_percent = pct;
    if (draft.return_date && draft.issue_date && draft.return_date < draft.issue_date) {
      errs.return_date = "Дата возврата раньше даты выдачи";
    }
    return errs;
  }

  async function saveLoan() {
    if (!editingLoan) return;
    const errs = validateLoan(editingLoan);
    setLoanErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingLoan(true);
    try {
      if (isNewLoan) {
        await loanApi.create(editingLoan);
      } else {
        await loanApi.update(editingLoan.loan_id, editingLoan);
      }
      setEditingLoan(null);
      await loadAll();
    } catch (e: any) {
      setLoanErrors({ _form: e?.response?.data?.message || "Ошибка сохранения ссуды" });
    } finally {
      setSavingLoan(false);
    }
  }

  async function removeLoan(l: Loan) {
    if (!window.confirm(`Удалить ссуду №${l.loan_id} вместе со всеми залоговыми предметами?`)) return;
    await loanApi.remove(l.loan_id);
    await loadAll();
  }

  if (loading || dictLoading) return <div className="content">Загрузка данных...</div>;

  return (
    <>
      <DataTable<Loan>
        columns={columns}
        rows={visibleLoans}
        rowKey={(r) => r.loan_id}
        searchPlaceholder="Поиск по ломбарду, клиенту, суммам"
        onRowClick={(row) => setExpandedId((prev) => (prev === row.loan_id ? null : row.loan_id))}
        expandedRowId={expandedId}
        toolbarLeft={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">Все статусы</option>
            <option value="open">Открытые</option>
            <option value="overdue">Просроченные</option>
            <option value="returned">Возвращённые</option>
          </select>
        }
        toolbarRight={
          canCreate ? (
            <button className="btn btn-brass" onClick={openCreateLoan}>
              + Новая ссуда
            </button>
          ) : undefined
        }
        renderRowActions={
          canEdit || canDelete
            ? (row) => (
                <>
                  {canEdit && (
                    <button className="btn btn-sm" onClick={() => openEditLoan(row)}>
                      Изменить
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn btn-sm btn-danger" onClick={() => removeLoan(row)}>
                      Удалить
                    </button>
                  )}
                </>
              )
            : undefined
        }
        renderExpandedRow={(row) => (
          <LoanItemsPanel
            loan={row}
            itemTypeOptions={dictOptions.itemTypes}
            canEdit={canEdit}
            canCreate={canCreate}
            canDelete={canDelete}
          />
        )}
        emptyLabel="Нет ссуд, удовлетворяющих условиям фильтра"
      />

      {editingLoan && (
        <Modal
          title={isNewLoan ? "Новая ссуда" : `Редактирование ссуды №${editingLoan.loan_id}`}
          onClose={() => setEditingLoan(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditingLoan(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={saveLoan} disabled={savingLoan}>
                {savingLoan ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          }
        >
          {loanErrors._form && <div className="error-text" style={{ marginBottom: 10 }}>{loanErrors._form}</div>}
          <div className="form-grid">
            <div className="field">
              <label>Ломбард *</label>
              <select
                value={editingLoan.pawnshop_id ?? ""}
                onChange={(e) => setEditingLoan({ ...editingLoan, pawnshop_id: Number(e.target.value) })}
              >
                <option value="">— выберите —</option>
                {pawnshopOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {loanErrors.pawnshop_id && <div className="error-text">{loanErrors.pawnshop_id}</div>}
            </div>
            <div className="field">
              <label>Клиент *</label>
              <select
                value={editingLoan.client_id ?? ""}
                onChange={(e) => setEditingLoan({ ...editingLoan, client_id: Number(e.target.value) })}
              >
                <option value="">— выберите —</option>
                {clientOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {loanErrors.client_id && <div className="error-text">{loanErrors.client_id}</div>}
            </div>
            <div className="field">
              <label>Сумма ссуды *</label>
              <input
                type="number"
                value={editingLoan.amount ?? ""}
                onChange={(e) => setEditingLoan({ ...editingLoan, amount: Number(e.target.value) })}
              />
              {loanErrors.amount && <div className="error-text">{loanErrors.amount}</div>}
            </div>
            <div className="field">
              <label>Пеня за день просрочки, %</label>
              <input
                type="number"
                value={editingLoan.penalty_percent ?? ""}
                onChange={(e) => setEditingLoan({ ...editingLoan, penalty_percent: Number(e.target.value) })}
              />
              {loanErrors.penalty_percent && <div className="error-text">{loanErrors.penalty_percent}</div>}
            </div>
            <div className="field">
              <label>Дата выдачи *</label>
              <input
                type="date"
                value={editingLoan.issue_date ?? ""}
                onChange={(e) => setEditingLoan({ ...editingLoan, issue_date: e.target.value })}
              />
              {loanErrors.issue_date && <div className="error-text">{loanErrors.issue_date}</div>}
            </div>
            <div className="field">
              <label>Дата возврата</label>
              <input
                type="date"
                value={editingLoan.return_date ?? ""}
                onChange={(e) => setEditingLoan({ ...editingLoan, return_date: e.target.value })}
              />
              {loanErrors.return_date && <div className="error-text">{loanErrors.return_date}</div>}
            </div>
            <div className="field">
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!editingLoan.is_returned}
                  onChange={(e) => setEditingLoan({ ...editingLoan, is_returned: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                Ссуда возвращена
              </label>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/**
 * Child table of the master-detail form: loan_item rows for one loan.
 * Composite PK (loan_id, item_type_id) - a loan can pledge each item TYPE
 * at most once, so item types already used are excluded when adding a new
 * pledged item.
 */
function LoanItemsPanel({
  loan,
  itemTypeOptions,
  canEdit,
  canCreate,
  canDelete,
}: {
  loan: Loan;
  itemTypeOptions: { value: number | string; label: string }[];
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
}) {
  const [items, setItems] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<LoanItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const data = await loanItemApi.listForLoan(loan.loan_id);
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loan.loan_id]);

  const usedTypeIds = new Set(items.map((i) => i.item_type_id));
  const availableTypeOptions = itemTypeOptions.filter(
    (o) => isNew ? !usedTypeIds.has(Number(o.value)) : true
  );

  function openCreate() {
    setEditing({ ...emptyItemDraft });
    setIsNew(true);
    setErrors({});
  }
  function openEdit(item: LoanItem) {
    setEditing({ ...item });
    setIsNew(false);
    setErrors({});
  }

  function validate(draft: Partial<LoanItem>) {
    const errs: Record<string, string> = {};
    if (!draft.item_type_id) errs.item_type_id = "Выберите вид предмета";
    const valErr = validatePositiveAmount(draft.item_value);
    if (valErr) errs.item_value = valErr;
    return errs;
  }

  async function save() {
    if (!editing) return;
    const errs = validate(editing);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      if (isNew) {
        await loanItemApi.add(loan.loan_id, editing);
      } else {
        await loanItemApi.update(loan.loan_id, editing.item_type_id!, editing);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      setErrors({ _form: e?.response?.data?.message || "Ошибка сохранения предмета залога" });
    }
  }

  async function remove(item: LoanItem) {
    if (!window.confirm("Удалить этот предмет залога из ссуды?")) return;
    await loanItemApi.remove(loan.loan_id, item.item_type_id);
    await load();
  }

  return (
    <div style={{ padding: "14px 20px 20px 44px", borderTop: "1px dashed var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Предметы залога — ссуда №{loan.loan_id}
        </div>
        {canCreate && (
          <button className="btn btn-sm" onClick={openCreate}>
            + Добавить предмет
          </button>
        )}
      </div>

      {loading ? (
        <div className="helper-text">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="helper-text">По этой ссуде ещё не внесено ни одного предмета залога.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Вид предмета</th>
              <th>Описание</th>
              <th>Оценочная стоимость</th>
              {(canEdit || canDelete) && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.item_type_id}>
                <td>{itemTypeOptions.find((o) => o.value === it.item_type_id)?.label ?? it.item_type_id}</td>
                <td>{it.item_description || "—"}</td>
                <td className="mono">{Number(it.item_value).toLocaleString("ru-RU")} ₽</td>
                {(canEdit || canDelete) && (
                  <td>
                    <div className="row-actions">
                      {canEdit && (
                        <button className="btn btn-sm" onClick={() => openEdit(it)}>
                          Изменить
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-sm btn-danger" onClick={() => remove(it)}>
                          Удалить
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <Modal
          title={isNew ? "Новый предмет залога" : "Редактирование предмета залога"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditing(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={save}>
                Сохранить
              </button>
            </>
          }
        >
          {errors._form && <div className="error-text" style={{ marginBottom: 10 }}>{errors._form}</div>}
          <div className="form-grid">
            <div className="field">
              <label>Вид предмета *</label>
              <select
                value={editing.item_type_id ?? ""}
                disabled={!isNew}
                onChange={(e) => setEditing({ ...editing, item_type_id: Number(e.target.value) })}
              >
                <option value="">— выберите —</option>
                {availableTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.item_type_id && <div className="error-text">{errors.item_type_id}</div>}
            </div>
            <div className="field">
              <label>Оценочная стоимость *</label>
              <input
                type="number"
                value={editing.item_value ?? ""}
                onChange={(e) => setEditing({ ...editing, item_value: Number(e.target.value) })}
              />
              {errors.item_value && <div className="error-text">{errors.item_value}</div>}
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Описание</label>
              <textarea
                rows={2}
                value={editing.item_description ?? ""}
                onChange={(e) => setEditing({ ...editing, item_description: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
