import React, { useState } from "react";
import { ResourceCrudPage, ResourceConfig } from "@/components/ResourceCrudPage";
import {
  districtApi,
  ownerTypeApi,
  ownershipTypeApi,
  pledgeItemTypeApi,
  socialStatusApi,
} from "@/api/endpoints";
import type { District, OwnerType, OwnershipType, PledgeItemType, SocialStatus } from "@/types";

// Every dictionary table has the same shape (id + name), so one factory
// builds all five ResourceConfig objects instead of duplicating code.
function simpleNameDictionary<T extends Record<string, any>>(
  title: string,
  idField: keyof T & string,
  nameField: keyof T & string,
  service: ResourceConfig<T>["service"]
): ResourceConfig<T> {
  return {
    title,
    permissionResource: "dictionaries",
    idField,
    service,
    searchPlaceholder: `Поиск: ${title.toLowerCase()}`,
    columns: [
      { key: idField, header: "ID", accessor: (r) => (r as any)[idField] },
      { key: nameField, header: "Название", accessor: (r) => (r as any)[nameField] },
    ],
    fields: [
      { key: nameField, label: "Название", type: "text" },
    ],
    emptyDraft: {} as Partial<T>,
    confirmDeleteLabel: (row) => `«${(row as any)[nameField]}»`,
  };
}

const TABS: { key: string; label: string; config: ResourceConfig<any> }[] = [
  {
    key: "district",
    label: "Районы",
    config: simpleNameDictionary<District>("Район", "district_id", "district_name", districtApi),
  },
  {
    key: "ownership_type",
    label: "Формы собственности",
    config: simpleNameDictionary<OwnershipType>(
      "Форма собственности",
      "ownership_type_id",
      "type_name",
      ownershipTypeApi
    ),
  },
  {
    key: "owner_type",
    label: "Типы владельцев",
    config: simpleNameDictionary<OwnerType>("Тип владельца", "owner_type_id", "type_name", ownerTypeApi),
  },
  {
    key: "social_status",
    label: "Социальные положения",
    config: simpleNameDictionary<SocialStatus>(
      "Социальное положение",
      "social_status_id",
      "status_name",
      socialStatusApi
    ),
  },
  {
    key: "pledge_item_type",
    label: "Виды залоговых предметов",
    config: simpleNameDictionary<PledgeItemType>(
      "Вид залогового предмета",
      "item_type_id",
      "type_name",
      pledgeItemTypeApi
    ),
  },
];

export default function DictionariesPage() {
  const [active, setActive] = useState(TABS[0].key);
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <div>
      <div className="toolbar" style={{ border: "none", padding: "0 0 14px" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className="btn btn-sm"
            style={
              t.key === active
                ? { background: "var(--ink-900)", color: "var(--paper-0)", borderColor: "var(--ink-900)" }
                : undefined
            }
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ResourceCrudPage key={tab.key} config={tab.config} />
    </div>
  );
}
