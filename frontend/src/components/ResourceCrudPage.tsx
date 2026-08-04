import React, { useEffect, useState } from "react";
import { Column, DataTable } from "@/components/DataTable/DataTable";
import { Modal } from "@/components/Modal/Modal";
import { useAuth } from "@/context/AuthContext";

export type FieldType = "text" | "number" | "date" | "select" | "checkbox" | "textarea";

export interface FieldConfig<T> {
  key: keyof T & string;
  label: string;
  type: FieldType;
  options?: { value: number | string; label: string }[]; // for select
  validate?: (value: any, draft: Partial<T>) => string | null;
  optional?: boolean;
  placeholder?: string;
}

export interface ResourceConfig<T> {
  title: string;
  permissionResource: string; // key from AuthContext's Resource union, kept loose here
  columns: Column<T>[];
  fields: FieldConfig<T>[];
  emptyDraft: Partial<T>;
  searchPlaceholder?: string;
  idField: keyof T & string;
  service: {
    list: () => Promise<T[]>;
    create: (payload: Partial<T>) => Promise<T>;
    update: (id: any, payload: Partial<T>) => Promise<T>;
    remove: (id: any) => Promise<void>;
  };
  confirmDeleteLabel?: (row: T) => string;
}

export function ResourceCrudPage<T extends Record<string, any>>({ config }: { config: ResourceConfig<T> }) {
  const { can } = useAuth() as any;
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const canEdit = can(config.permissionResource, "edit");
  const canCreate = can(config.permissionResource, "create");
  const canDelete = can(config.permissionResource, "delete");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await config.service.list();
      setRows(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Не удалось загрузить данные с сервера");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing({ ...config.emptyDraft });
    setIsNew(true);
    setFormErrors({});
  }

  function openEdit(row: T) {
    setEditing({ ...row });
    setIsNew(false);
    setFormErrors({});
  }

  function validateAll(draft: Partial<T>): Record<string, string> {
    const errs: Record<string, string> = {};
    for (const f of config.fields) {
      if (f.validate) {
        const msg = f.validate((draft as any)[f.key], draft);
        if (msg) errs[f.key] = msg;
      } else if (!f.optional && (draft as any)[f.key] === undefined) {
        errs[f.key] = "Обязательное поле";
      }
    }
    return errs;
  }

  async function save() {
    if (!editing) return;
    const errs = validateAll(editing);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      if (isNew) {
        await config.service.create(editing);
      } else {
        await config.service.update((editing as any)[config.idField], editing);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      setFormErrors({ _form: e?.response?.data?.message || "Ошибка сохранения. Проверьте данные." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    const label = config.confirmDeleteLabel ? config.confirmDeleteLabel(row) : "эту запись";
    if (!window.confirm(`Удалить ${label}? Действие необратимо.`)) return;
    try {
      await config.service.remove((row as any)[config.idField]);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Не удалось удалить запись (возможно, есть связанные данные).");
    }
  }

  function setField(key: string, value: any) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <>
      {error && (
        <div className="card" style={{ padding: 14, marginBottom: 14, color: "var(--danger-600)" }}>
          {error}
        </div>
      )}
      <DataTable<T>
        columns={config.columns}
        rows={rows}
        rowKey={(r) => (r as any)[config.idField]}
        searchPlaceholder={config.searchPlaceholder}
        toolbarRight={
          canCreate ? (
            <button className="btn btn-brass" onClick={openCreate}>
              + Добавить
            </button>
          ) : undefined
        }
        renderRowActions={
          canEdit || canDelete
            ? (row) => (
                <>
                  {canEdit && (
                    <button className="btn btn-sm" onClick={() => openEdit(row)}>
                      Изменить
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn btn-sm btn-danger" onClick={() => remove(row)}>
                      Удалить
                    </button>
                  )}
                </>
              )
            : undefined
        }
        emptyLabel={loading ? "Загрузка..." : "Нет записей"}
      />

      {editing && (
        <Modal
          title={isNew ? `Новая запись: ${config.title}` : `Редактирование: ${config.title}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditing(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          }
        >
          {formErrors._form && <div className="error-text" style={{ marginBottom: 10 }}>{formErrors._form}</div>}
          <div className="form-grid">
            {config.fields.map((f) => (
              <div className="field" key={f.key} style={f.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
                <label>
                  {f.label}
                  {!f.optional && " *"}
                </label>
                {renderInput(f, editing, setField)}
                {formErrors[f.key] && <div className="error-text">{formErrors[f.key]}</div>}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

function renderInput<T>(
  f: FieldConfig<T>,
  editing: Partial<T>,
  setField: (key: string, value: any) => void
) {
  const value = (editing as any)[f.key] ?? "";

  if (f.type === "select") {
    // Option values may be numeric FK ids (e.g. district_id) or string enum
    // codes (e.g. role = "ADMIN"). Cast back to the same type on change.
    const firstOptionValue = f.options?.[0]?.value;
    const isNumeric = typeof firstOptionValue === "number";
    return (
      <select
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return setField(f.key, "");
          setField(f.key, isNumeric ? Number(raw) : raw);
        }}
      >
        <option value="">— выберите —</option>
        {f.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (f.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => setField(f.key, e.target.checked)}
        style={{ width: 18, height: 18 }}
      />
    );
  }
  if (f.type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value}
        placeholder={f.placeholder}
        onChange={(e) => setField(f.key, e.target.value)}
      />
    );
  }
  return (
    <input
      type={f.type}
      value={value}
      placeholder={f.placeholder}
      onChange={(e) =>
        setField(f.key, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
      }
    />
  );
}
