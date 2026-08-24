import React, { useEffect, useState } from "react";
import { Column, DataTable } from "@/components/DataTable/DataTable";
import { Modal } from "@/components/Modal/Modal";
import { useAuth } from "@/context/AuthContext";

export type FieldType =
    | "text"
    | "number"
    | "date"
    | "select"
    | "checkbox"
    | "textarea";

export interface FieldConfig<T> {
  key: keyof T & string;
  label: string;
  type: FieldType;
  options?: { value: number | string; label: string }[];
  validate?: (value: any, draft: Partial<T>) => string | null;
  optional?: boolean;
  placeholder?: string;
}

export interface ResourceConfig<T> {
  title: string;
  permissionResource: string;
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

export function ResourceCrudPage<
    T extends Record<string, any>,
>({ config }: { config: ResourceConfig<T> }) {
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
      setError(
          e?.response?.data?.message ||
          "Не удалось загрузить данные с сервера",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
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

  function validateAll(
      draft: Partial<T>,
  ): Record<string, string> {
    const errs: Record<string, string> = {};

    for (const f of config.fields) {
      const value = (draft as any)[f.key];

      if (
          !f.optional &&
          (value === undefined ||
              value === null ||
              value === "")
      ) {
        errs[f.key] = "Обязательное поле";
        continue;
      }

      if (f.validate) {
        const message = f.validate(value, draft);

        if (message) {
          errs[f.key] = message;
        }
      }
    }

    return errs;
  }

  async function save() {
    if (!editing) {
      return;
    }

    const errors = validateAll(editing);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      if (isNew) {
        await config.service.create(editing);
      } else {
        await config.service.update(
            (editing as any)[config.idField],
            editing,
        );
      }

      setEditing(null);
      await load();
    } catch (e: any) {
      setFormErrors({
        _form:
            e?.response?.data?.message ||
            "Ошибка сохранения. Проверьте данные.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    const label = config.confirmDeleteLabel
        ? config.confirmDeleteLabel(row)
        : "эту запись";

    if (
        !window.confirm(
            `Удалить ${label}? Действие необратимо.`,
        )
    ) {
      return;
    }

    try {
      await config.service.remove(
          (row as any)[config.idField],
      );

      await load();
    } catch (e: any) {
      alert(
          e?.response?.data?.message ||
          "Не удалось удалить запись (возможно, есть связанные данные).",
      );
    }
  }

  function setField(key: string, value: any) {
    setEditing((prev) =>
        prev
            ? {
              ...prev,
              [key]: value,
            }
            : prev,
    );
  }

  return (
      <>
        {error && (
            <div
                className="card"
                style={{
                  padding: 14,
                  marginBottom: 14,
                  color: "var(--danger-600)",
                }}
            >
              {error}
            </div>
        )}

        <DataTable<T>
            columns={config.columns}
            rows={rows}
            rowKey={(row) => (row as any)[config.idField]}
            searchPlaceholder={config.searchPlaceholder}
            toolbarRight={
              canCreate ? (
                  <button
                      className="btn btn-brass"
                      onClick={openCreate}
                  >
                    + Добавить
                  </button>
              ) : undefined
            }
            renderRowActions={
              canEdit || canDelete
                  ? (row) => (
                      <>
                        {canEdit && (
                            <button
                                className="btn btn-sm"
                                onClick={() => openEdit(row)}
                            >
                              Изменить
                            </button>
                        )}

                        {canDelete && (
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => void remove(row)}
                            >
                              Удалить
                            </button>
                        )}
                      </>
                  )
                  : undefined
            }
            emptyLabel={
              loading ? "Загрузка..." : "Нет записей"
            }
        />

        {editing && (
            <Modal
                title={
                  isNew
                      ? `Новая запись: ${config.title}`
                      : `Редактирование: ${config.title}`
                }
                onClose={() => setEditing(null)}
                footer={
                  <>
                    <button
                        className="btn"
                        onClick={() => setEditing(null)}
                    >
                      Отмена
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => void save()}
                        disabled={saving}
                    >
                      {saving ? "Сохранение..." : "Сохранить"}
                    </button>
                  </>
                }
            >
              {formErrors._form && (
                  <div
                      className="error-text"
                      style={{ marginBottom: 10 }}
                  >
                    {formErrors._form}
                  </div>
              )}

              <div className="form-grid">
                {config.fields.map((field) => (
                    <div
                        className="field"
                        key={field.key}
                        style={
                          field.type === "textarea"
                              ? { gridColumn: "1 / -1" }
                              : undefined
                        }
                    >
                      <label>
                        {field.label}
                        {!field.optional && " *"}
                      </label>

                      {renderInput(
                          field,
                          editing,
                          setField,
                      )}

                      {formErrors[field.key] && (
                          <div className="error-text">
                            {formErrors[field.key]}
                          </div>
                      )}
                    </div>
                ))}
              </div>
            </Modal>
        )}
      </>
  );
}

function renderInput<T>(
    field: FieldConfig<T>,
    editing: Partial<T>,
    setField: (
        key: string,
        value: any,
    ) => void,
) {
  const value = (editing as any)[field.key] ?? "";

  if (field.type === "select") {
    const firstOptionValue =
        field.options?.[0]?.value;

    const isNumeric =
        typeof firstOptionValue === "number";

    return (
        <select
            value={value}
            onChange={(event) => {
              const raw = event.target.value;

              if (!raw) {
                setField(field.key, "");
                return;
              }

              setField(
                  field.key,
                  isNumeric ? Number(raw) : raw,
              );
            }}
        >
          <option value="">
            — выберите —
          </option>

          {field.options?.map((option) => (
              <option
                  key={option.value}
                  value={option.value}
              >
                {option.label}
              </option>
          ))}
        </select>
    );
  }

  if (field.type === "checkbox") {
    return (
        <input
            type="checkbox"
            checked={!!value}
            onChange={(event) =>
                setField(
                    field.key,
                    event.target.checked,
                )
            }
            style={{
              width: 18,
              height: 18,
            }}
        />
    );
  }

  if (field.type === "textarea") {
    return (
        <textarea
            rows={3}
            value={value}
            placeholder={field.placeholder}
            onChange={(event) =>
                setField(
                    field.key,
                    event.target.value,
                )
            }
        />
    );
  }

  return (
      <input
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) =>
              setField(
                  field.key,
                  field.type === "number"
                      ? event.target.value === ""
                          ? ""
                          : Number(event.target.value)
                      : event.target.value,
              )
          }
      />
  );
}