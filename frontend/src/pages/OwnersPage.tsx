import React from "react";
import { ResourceCrudPage, ResourceConfig } from "@/components/ResourceCrudPage";
import { ownerApi } from "@/api/endpoints";
import type { Owner } from "@/types";
import { useDictionaries } from "@/utils/useDictionaries";
import { validateFio, validatePhone } from "@/utils/validation";

export default function OwnersPage() {
  const { options, loading } = useDictionaries();
  if (loading) return <div className="content">Загрузка справочников...</div>;

  const config: ResourceConfig<Owner> = {
    title: "Владелец",
    permissionResource: "owners",
    idField: "owner_id",
    service: ownerApi,
    searchPlaceholder: "Поиск по ФИО или телефону",
    columns: [
      { key: "owner_id", header: "ID" },
      {
        key: "fio",
        header: "ФИО",
        accessor: (r) => `${r.last_name} ${r.first_name} ${r.middle_name ?? ""}`,
        render: (r) => `${r.last_name} ${r.first_name} ${r.middle_name ?? ""}`,
      },
      {
        key: "owner_type_id",
        header: "Тип владельца",
        accessor: (r) => options.ownerTypes.find((o) => o.value === r.owner_type_id)?.label,
        render: (r) => options.ownerTypes.find((o) => o.value === r.owner_type_id)?.label ?? "—",
      },
      { key: "phone", header: "Телефон", accessor: (r) => r.phone },
    ],
    fields: [
      { key: "last_name", label: "Фамилия", type: "text", validate: (v) => validateFio(v) },
      { key: "first_name", label: "Имя", type: "text", validate: (v) => validateFio(v) },
      { key: "middle_name", label: "Отчество", type: "text", optional: true, validate: (v) => validateFio(v, false) },
      { key: "owner_type_id", label: "Тип владельца", type: "select", options: options.ownerTypes },
      {
        key: "phone",
        label: "Телефон",
        type: "text",
        optional: true,
        placeholder: "+7XXXXXXXXXX",
        validate: (v) => validatePhone(v),
      },
    ],
    emptyDraft: {},
    confirmDeleteLabel: (r) => `владельца «${r.last_name} ${r.first_name}»`,
  };

  return <ResourceCrudPage config={config} />;
}
