import React from "react";
import { ResourceCrudPage, ResourceConfig } from "@/components/ResourceCrudPage";
import { clientApi } from "@/api/endpoints";
import type { Client } from "@/types";
import { useDictionaries } from "@/utils/useDictionaries";
import { validateFio, validatePhone } from "@/utils/validation";

export default function ClientsPage() {
  const { options, loading } = useDictionaries();
  if (loading) return <div className="content">Загрузка справочников...</div>;

  const config: ResourceConfig<Client> = {
    title: "Клиент",
    permissionResource: "clients",
    idField: "client_id",
    service: clientApi,
    searchPlaceholder: "Поиск по ФИО, адресу или телефону",
    columns: [
      { key: "client_id", header: "ID" },
      {
        key: "fio",
        header: "ФИО",
        accessor: (r) => `${r.last_name} ${r.first_name} ${r.middle_name ?? ""}`,
        render: (r) => `${r.last_name} ${r.first_name} ${r.middle_name ?? ""}`,
      },
      { key: "birth_date", header: "Дата рождения", accessor: (r) => r.birth_date },
      {
        key: "social_status_id",
        header: "Соц. положение",
        accessor: (r) => options.socialStatuses.find((s) => s.value === r.social_status_id)?.label,
        render: (r) => options.socialStatuses.find((s) => s.value === r.social_status_id)?.label ?? "—",
      },
      { key: "phone", header: "Телефон" },
    ],
    fields: [
      { key: "last_name", label: "Фамилия", type: "text", validate: (v) => validateFio(v) },
      { key: "first_name", label: "Имя", type: "text", validate: (v) => validateFio(v) },
      { key: "middle_name", label: "Отчество", type: "text", optional: true, validate: (v) => validateFio(v, false) },
      { key: "birth_date", label: "Дата рождения", type: "date", optional: true },
      { key: "social_status_id", label: "Социальное положение", type: "select", options: options.socialStatuses, optional: true },
      { key: "address", label: "Домашний адрес", type: "text", optional: true },
      { key: "phone", label: "Телефон", type: "text", optional: true, placeholder: "+7XXXXXXXXXX", validate: validatePhone },
    ],
    emptyDraft: {},
    confirmDeleteLabel: (r) => `клиента «${r.last_name} ${r.first_name}»`,
  };

  return <ResourceCrudPage config={config} />;
}
