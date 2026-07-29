import React, { useEffect, useState } from "react";
import { ResourceCrudPage, ResourceConfig } from "@/components/ResourceCrudPage";
import { ownerApi, pawnshopApi } from "@/api/endpoints";
import type { Owner, Pawnshop } from "@/types";
import { useDictionaries } from "@/utils/useDictionaries";
import { validateClosingHour, validateHour, validatePhone } from "@/utils/validation";

export default function PawnshopsPage() {
  const { options, loading } = useDictionaries();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(true);

  useEffect(() => {
    ownerApi.list().then(setOwners).finally(() => setOwnersLoading(false));
  }, []);

  if (loading || ownersLoading) return <div className="content">Загрузка справочников...</div>;

  const ownerOptions = owners.map((o) => ({
    value: o.owner_id,
    label: `${o.last_name} ${o.first_name}`,
  }));

  const config: ResourceConfig<Pawnshop> = {
    title: "Ломбард",
    permissionResource: "pawnshops",
    idField: "pawnshop_id",
    service: pawnshopApi,
    searchPlaceholder: "Поиск по названию или адресу",
    columns: [
      { key: "pawnshop_id", header: "ID" },
      { key: "name", header: "Название" },
      {
        key: "district_id",
        header: "Район",
        accessor: (r) => options.districts.find((d) => d.value === r.district_id)?.label,
        render: (r) => options.districts.find((d) => d.value === r.district_id)?.label ?? "—",
      },
      { key: "address", header: "Адрес" },
      {
        key: "hours",
        header: "Часы работы",
        sortable: false,
        accessor: (r) => `${r.opening_hour}-${r.closing_hour}`,
        render: (r) =>
          r.opening_hour != null && r.closing_hour != null
            ? `${String(r.opening_hour).padStart(2, "0")}:00 – ${String(r.closing_hour).padStart(2, "0")}:00`
            : "—",
      },
      { key: "phone", header: "Телефон" },
    ],
    fields: [
      { key: "name", label: "Название", type: "text" },
      { key: "ownership_type_id", label: "Форма собственности", type: "select", options: options.ownershipTypes },
      { key: "owner_id", label: "Владелец", type: "select", options: ownerOptions },
      { key: "district_id", label: "Район", type: "select", options: options.districts },
      { key: "address", label: "Адрес", type: "text" },
      { key: "phone", label: "Телефон", type: "text", optional: true, placeholder: "+7XXXXXXXXXX", validate: validatePhone },
      {
        key: "opening_hour",
        label: "Час открытия (0–23)",
        type: "number",
        optional: true,
        validate: validateHour,
      },
      {
        key: "closing_hour",
        label: "Час закрытия (0–23)",
        type: "number",
        optional: true,
        validate: (v, draft) => validateHour(v) ?? validateClosingHour(draft.opening_hour, v),
      },
    ],
    emptyDraft: {},
    confirmDeleteLabel: (r) => `ломбард «${r.name}»`,
  };

  return <ResourceCrudPage config={config} />;
}
