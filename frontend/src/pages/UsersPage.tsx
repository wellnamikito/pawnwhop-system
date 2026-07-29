import React from "react";
import { ResourceCrudPage, ResourceConfig } from "@/components/ResourceCrudPage";
import { userApi } from "@/api/endpoints";
import type { AppUser } from "@/types";
import { roleLabel } from "@/components/Layout/Sidebar";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Администратор" },
  { value: "OPERATOR", label: "Пользователи_1 (оператор — ввод и редактирование данных)" },
  { value: "ANALYST", label: "Пользователи_2 (аналитик — только просмотр и отчёты)" },
];

export default function UsersPage() {
  const config: ResourceConfig<AppUser> = {
    title: "Пользователь",
    permissionResource: "users",
    idField: "user_id",
    service: userApi as any,
    searchPlaceholder: "Поиск по логину или ФИО",
    columns: [
      { key: "user_id", header: "ID" },
      { key: "username", header: "Логин" },
      { key: "full_name", header: "ФИО" },
      {
        key: "role",
        header: "Роль",
        accessor: (r) => roleLabel(r.role),
        render: (r) => roleLabel(r.role),
      },
    ],
    fields: [
      { key: "username", label: "Логин", type: "text" },
      { key: "full_name", label: "ФИО", type: "text" },
      { key: "role", label: "Роль", type: "select", options: ROLE_OPTIONS as any },
    ],
    emptyDraft: { role: "OPERATOR" as any },
    confirmDeleteLabel: (r) => `пользователя «${r.username}»`,
  };

  return (
    <div>
      <div className="helper-text" style={{ marginBottom: 14 }}>
        Один и тот же клиент используется всеми ролями — доступ к разделам и действиям
        меняется ситуативно в зависимости от роли текущего пользователя (см. пункты меню слева).
      </div>
      <ResourceCrudPage config={config} />
    </div>
  );
}
