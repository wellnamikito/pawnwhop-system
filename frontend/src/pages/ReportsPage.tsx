import { useEffect, useRef, useState } from "react";

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

import api from "@/api/client";
import { reportApi } from "@/api/endpoints";
import type { SpringPage } from "@/api/endpoints";

const PAGE_SIZE = 50;
const CLIENT_PAGE_SIZE = 20;

const CHART_PALETTE = [
  "#2563eb",
  "#374151",
  "#047857",
  "#b91c1c",
  "#6b7280",
  "#1d4ed8",
  "#9ca3af",
  "#111827",
];

/*
 * ---------------------------------------------------------
 * ТИПЫ
 * ---------------------------------------------------------
 */

type Column = {
  key: string;
  label: string;
};

type ChartPoint = {
  name: string;
  value: number;
};

type ChartSpec = {
  type: "bar" | "pie";
  build: (rows: any[]) => ChartPoint[];
  colorFor?: (name: string, index: number) => string;
};

type ParamField = {
  name: string;
  label: string;
  type: "number" | "date" | "text" | "select" | "client";
  step?: string;
};

type PawnshopOption = {
  id: number;
  name: string;
};

type ItemTypeOption = {
  id: number;
  name: string;
};

type DistrictOption = {
  id: number;
  name: string;
};

type ClientOption = {
  clientId: number;
  lastName: string;
  firstName: string;
  middleName?: string | null;
};

interface ClientPage {
  content: ClientOption[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/*
 * ---------------------------------------------------------
 * КЛИЕНТЫ — РЕДАКТИРУЕМОЕ ПРЕДСТАВЛЕНИЕ
 * (vw_client_edit / ClientEditViewDto)
 * ---------------------------------------------------------
 */

interface ClientEditRow {
  clientId: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
}

const CLIENT_EDIT_COLUMNS: Column[] = [
  { key: "lastName", label: "Фамилия" },
  { key: "firstName", label: "Имя" },
  { key: "middleName", label: "Отчество" },
  { key: "birthDate", label: "Дата рождения" },
  { key: "address", label: "Адрес" },
  { key: "phone", label: "Телефон" },
];

type OverviewReport =
    | {
  id: string;
  label: string;
  columns: Column[];
  chart?: ChartSpec;
  paginated: true;
  fetchPage: (
      page: number,
      size: number
  ) => Promise<SpringPage<any>>;
}
    | {
  id: string;
  label: string;
  columns: Column[];
  chart?: ChartSpec;
  paginated: false;
  fetchList: () => Promise<any[]>;
};

type ParamReport =
    | {
  id: string;
  label: string;
  columns: Column[];
  params: ParamField[];
  autoRun?: boolean;
  chart?: ChartSpec;
  paginated: true;
  fetchPage: (
      values: Record<string, string>,
      page: number,
      size: number
  ) => Promise<SpringPage<any>>;
}
    | {
  id: string;
  label: string;
  columns: Column[];
  params: ParamField[];
  autoRun?: boolean;
  chart?: ChartSpec;
  paginated: false;
  fetchList: (
      values: Record<string, string>
  ) => Promise<any[]>;
};

/*
 * ---------------------------------------------------------
 * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ---------------------------------------------------------
 */

function statusBadgeClass(status: string): string {
  const value = status.toLowerCase();

  if (value.includes("просроч")) {
    return "status-overdue";
  }

  if (value.includes("возвращ")) {
    return "status-returned";
  }

  return "status-open";
}

function statusColor(
    status: string,
    fallbackIndex: number
): string {
  const cls = statusBadgeClass(status);

  if (cls === "status-overdue") {
    return "#b91c1c";
  }

  if (cls === "status-returned") {
    return "#047857";
  }

  const value = status.toLowerCase();

  if (
      value.includes("откр") ||
      value.includes("актив")
  ) {
    return "#1d4ed8";
  }

  return CHART_PALETTE[
  fallbackIndex % CHART_PALETTE.length
      ];
}

function clientFullName(
    client: ClientOption
): string {
  return [
    client.lastName,
    client.firstName,
    client.middleName,
  ]
      .filter(Boolean)
      .join(" ");
}

function formatValue(
    key: string,
    value: any
): string {
  if (
      value === null ||
      value === undefined ||
      value === ""
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }

  if (typeof value === "number") {
    if (/percent/i.test(key)) {
      return `${value.toLocaleString("ru-RU", {
        maximumFractionDigits: 2,
      })}%`;
    }

    if (
        /amount|value|total|average|avg/i.test(key)
    ) {
      return value.toLocaleString("ru-RU", {
        maximumFractionDigits: 2,
      });
    }

    return String(value);
  }

  return String(value);
}

function renderCell(
    column: Column,
    row: any
) {
  const value = row[column.key];

  if (
      column.key === "loanStatus" &&
      typeof value === "string"
  ) {
    return (
        <span
            className={`status ${statusBadgeClass(
                value
            )}`}
        >
        {value}
      </span>
    );
  }

  if (
      column.key === "returned" &&
      typeof value === "boolean"
  ) {
    return value ? (
        <span className="status status-returned">
        Возвращена
      </span>
    ) : (
        <span className="status status-open">
        Не возвращена
      </span>
    );
  }

  return formatValue(column.key, value);
}

/*
 * ---------------------------------------------------------
 * ОБЗОРНЫЕ ОТЧЁТЫ
 * ---------------------------------------------------------
 */

const OVERVIEW_REPORTS: OverviewReport[] = [
  {
    id: "allPawnshops",
    label: "Все ломбарды",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.allPawnshops(page, size),
    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "ownership",
        label: "Форма собственности",
      },
      {
        key: "ownerFio",
        label: "Владелец",
      },
      {
        key: "districtName",
        label: "Район",
      },
      {
        key: "address",
        label: "Адрес",
      },
      {
        key: "phone",
        label: "Телефон",
      },
    ],
  },

  {
    id: "allLoans",
    label: "Все ссуды",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.allLoans(page, size),
    columns: [
      {
        key: "pawnshop",
        label: "Ломбард",
      },
      {
        key: "clientFio",
        label: "Клиент",
      },
      {
        key: "amount",
        label: "Сумма",
      },
      {
        key: "issueDate",
        label: "Дата выдачи",
      },
      {
        key: "returnDate",
        label: "Срок возврата",
      },
      {
        key: "returned",
        label: "Статус",
      },
    ],
  },

  {
    id: "allLoanItems",
    label: "Все залоговые предметы",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.allLoanItems(page, size),
    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "lastName",
        label: "Клиент",
      },
      {
        key: "typeName",
        label: "Тип предмета",
      },
      {
        key: "itemDescription",
        label: "Описание",
      },
      {
        key: "itemValue",
        label: "Оценка",
      },
    ],
  },

  {
    id: "pawnshopsWithLoans",
    label: "Ломбарды и их ссуды",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.pawnshopsWithLoans(
            page,
            size
        ),
    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "amount",
        label: "Сумма",
      },
      {
        key: "issueDate",
        label: "Дата выдачи",
      },
    ],
  },

  {
    id: "clientsWithLoans",
    label: "Клиенты со ссудами",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.clientsWithLoans(
            page,
            size
        ),
    columns: [
      {
        key: "lastName",
        label: "Фамилия",
      },
      {
        key: "firstName",
        label: "Имя",
      },
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "amount",
        label: "Сумма",
      },
    ],
  },

  {
    id: "clientsWithoutLoans",
    label: "Клиенты без ссуд",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.clientsWithoutLoans(
            page,
            size
        ),
    columns: [
      {
        key: "clientId",
        label: "ID клиента",
      },
      {
        key: "lastName",
        label: "Фамилия",
      },
      {
        key: "firstName",
        label: "Имя",
      },
    ],
  },

  {
    id: "clientsWithMultipleLoans",
    label: "Клиенты с несколькими ссудами",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.clientsWithMultipleLoans(
            page,
            size
        ),
    columns: [
      {
        key: "clientId",
        label: "ID клиента",
      },
      {
        key: "lastName",
        label: "Фамилия",
      },
      {
        key: "firstName",
        label: "Имя",
      },
      {
        key: "loanCount",
        label: "Число ссуд",
      },
    ],
  },

  {
    id: "loansCountByClient",
    label: "Число ссуд по клиентам",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.loansCountByClient(
            page,
            size
        ),
    columns: [
      {
        key: "clientId",
        label: "ID клиента",
      },
      {
        key: "name",
        label: "Фамилия",
      },
      {
        key: "firstName",
        label: "Имя",
      },
      {
        key: "loanCount",
        label: "Число ссуд",
      },
    ],
    chart: {
      type: "bar",
      build: (rows) =>
          rows.map((row) => ({
            name:
                `${row.name ?? ""} ${
                    row.firstName ?? ""
                }`.trim() ||
                `Клиент #${row.clientId}`,
            value: Number(row.loanCount ?? 0),
          })),
    },
  },

  {
    id: "pawnshopsAboveAverageLoans",
    label:
        "Ломбарды выше среднего по сумме ссуды",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.pawnshopsAboveAverageLoans(
            page,
            size
        ),
    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "avgAmount",
        label: "Средняя сумма ссуды",
      },
    ],
  },

  {
    id: "loanStatuses",
    label: "Статусы ссуд",
    paginated: true,
    fetchPage: (page, size) =>
        reportApi.loanStatuses(
            page,
            size
        ),
    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "lastName",
        label: "Клиент",
      },
      {
        key: "amount",
        label: "Сумма",
      },
      {
        key: "returnDate",
        label: "Срок возврата",
      },
      {
        key: "loanStatus",
        label: "Статус",
      },
    ],
    chart: {
      type: "pie",

      build: (rows) => {
        const counts =
            new Map<string, number>();

        rows.forEach((row) => {
          const key =
              row.loanStatus ??
              "Без статуса";

          counts.set(
              key,
              (counts.get(key) ?? 0) + 1
          );
        });

        return Array.from(
            counts.entries()
        ).map(([name, value]) => ({
          name,
          value,
        }));
      },

      colorFor: statusColor,
    },
  },

  {
    id: "pawnshopLoanShare",
    label:
        "Доля ломбарда в общей сумме ссуд",
    paginated: false,
    fetchList: () =>
        reportApi.pawnshopLoanShare(),
    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "pawnshopTotal",
        label: "Сумма ссуд",
      },
      {
        key: "percentOfTotal",
        label: "Доля от общей суммы",
      },
    ],
    chart: {
      type: "pie",
      build: (rows) =>
          rows.map((row) => ({
            name: row.name,
            value: Number(
                row.percentOfTotal ?? 0
            ),
          })),
    },
  },

  {
    id: "pawnshopLoanStatistics",
    label: "Статистика по ломбардам",
    paginated: false,
    fetchList: () =>
        reportApi.pawnshopLoanStatistics(),
    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "totalLoans",
        label: "Всего ссуд",
      },
      {
        key: "returnedCount",
        label: "Возвращено",
      },
      {
        key: "notReturnedCount",
        label: "Не возвращено",
      },
    ],
    chart: {
      type: "bar",
      build: (rows) =>
          rows.map((row) => ({
            name: row.name,
            value: Number(
                row.totalLoans ?? 0
            ),
          })),
    },
  },
];

/*
 * ---------------------------------------------------------
 * ОТЧЁТЫ С ПАРАМЕТРАМИ
 * ---------------------------------------------------------
 */

const PARAM_REPORTS: ParamReport[] = [
  {
    id: "loansByPawnshop",
    label: "Ссуды конкретного ломбарда",

    params: [
      {
        name: "pawnshopId",
        label: "Ломбард",
        type: "select",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.loansByPawnshop(
            Number(values.pawnshopId),
            page,
            size
        ),

    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "lastName",
        label: "Клиент",
      },
      {
        key: "amount",
        label: "Сумма",
      },
      {
        key: "issueDate",
        label: "Дата выдачи",
      },
    ],
  },

  {
    id: "loanItemsByType",
    label: "Залоговые предметы по типу",

    params: [
      {
        name: "itemTypeId",
        label: "Тип предмета",
        type: "select",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.loanItemsByType(
            Number(values.itemTypeId),
            page,
            size
        ),

    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "itemDescription",
        label: "Описание",
      },
      {
        key: "itemValue",
        label: "Оценка",
      },
      {
        key: "typeName",
        label: "Тип предмета",
      },
    ],
  },

  {
    id: "loansByPeriod",
    label: "Ссуды за период",

    params: [
      {
        name: "startDate",
        label: "С даты",
        type: "date",
      },
      {
        name: "endDate",
        label: "По дату",
        type: "date",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.loansByPeriod(
            values.startDate,
            values.endDate,
            page,
            size
        ),

    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "lastName",
        label: "Клиент",
      },
      {
        key: "amount",
        label: "Сумма",
      },
      {
        key: "issueDate",
        label: "Дата выдачи",
      },
    ],
  },

  {
    id: "overdueLoans",
    label: "Просроченные ссуды на дату",

    params: [
      {
        name: "reportDate",
        label: "На дату",
        type: "date",
      },
    ],

    autoRun: true,

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.overdueLoans(
            values.reportDate,
            page,
            size
        ),

    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "lastName",
        label: "Клиент",
      },
      {
        key: "phone",
        label: "Телефон",
      },
      {
        key: "returnDate",
        label: "Срок возврата",
      },
    ],
  },

  {
    id: "loanAverageByAddress",
    label: "Средняя сумма ссуды по адресу",

    params: [
      {
        name: "address",
        label: "Фрагмент адреса",
        type: "text",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.loanAverageByAddress(
            values.address,
            page,
            size
        ),

    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "loanCount",
        label: "Число ссуд",
      },
      {
        key: "avgAmount",
        label: "Средняя сумма",
      },
    ],
  },

  {
    id: "pawnshopsPledgeValue",
    label:
        "Ломбарды района от суммы залогов",

    params: [
      {
        name: "districtId",
        label: "Район",
        type: "select",
      },
      {
        name: "minTotalValue",
        label:
            "Минимальная сумма залогов",
        type: "number",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.pawnshopsPledgeValue(
            Number(values.districtId),
            Number(values.minTotalValue),
            page,
            size
        ),

    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "districtName",
        label: "Район",
      },
      {
        key: "totalPledgeValue",
        label: "Сумма залогов",
      },
    ],
  },

  {
    id: "clientsByPledgeItemType",
    label:
        "Клиенты по типу залогового предмета",

    params: [
      {
        name: "itemTypeId",
        label: "Тип предмета",
        type: "select",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.clientsByPledgeItemType(
            Number(values.itemTypeId),
            page,
            size
        ),

    columns: [
      {
        key: "clientId",
        label: "ID клиента",
      },
      {
        key: "lastName",
        label: "Фамилия",
      },
      {
        key: "firstName",
        label: "Имя",
      },
      {
        key: "phone",
        label: "Телефон",
      },
    ],
  },

  {
    id: "pawnshopsWithoutPledgeItemType",
    label:
        "Ломбарды без типа залогового предмета",

    params: [
      {
        name: "itemTypeId",
        label: "Тип предмета",
        type: "select",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.pawnshopsWithoutPledgeItemType(
            Number(values.itemTypeId),
            page,
            size
        ),

    columns: [
      {
        key: "pawnshopId",
        label: "ID ломбарда",
      },
      {
        key: "name",
        label: "Ломбард",
      },
    ],
  },

  {
    id: "problematicLoans",
    label: "Проблемные ссуды",

    params: [
      {
        name: "largeAmountThreshold",
        label: "Порог крупной суммы",
        type: "number",
      },
    ],

    paginated: true,

    fetchPage: (
        values,
        page,
        size
    ) =>
        reportApi.problematicLoans(
            Number(
                values.largeAmountThreshold
            ),
            page,
            size
        ),

    columns: [
      {
        key: "loanId",
        label: "ID ссуды",
      },
      {
        key: "lastName",
        label: "Клиент",
      },
      {
        key: "phone",
        label: "Телефон",
      },
      {
        key: "amount",
        label: "Сумма",
      },
      {
        key: "returnDate",
        label: "Срок возврата",
      },
      {
        key: "reason",
        label: "Причина",
      },
    ],
  },

  {
    id: "pawnshopLoanStatisticsById",
    label:
        "Статистика по конкретному ломбарду",

    params: [
      {
        name: "pawnshopId",
        label: "Ломбард",
        type: "select",
      },
    ],

    paginated: false,

    fetchList: (values) =>
        reportApi.pawnshopLoanStatisticsById(
            Number(values.pawnshopId)
        ),

    columns: [
      {
        key: "name",
        label: "Ломбард",
      },
      {
        key: "loanCount",
        label: "Число ссуд",
      },
      {
        key: "totalAmount",
        label: "Сумма ссуд",
      },
    ],
  },

  {
    id: "clientLoanStatistics",
    label:
        "Статистика по конкретному клиенту",

    params: [
      {
        name: "clientId",
        label: "Клиент",
        type: "client",
      },
    ],

    paginated: false,

    fetchList: (values) =>
        reportApi.clientLoanStatistics(
            Number(values.clientId)
        ),

    columns: [
      {
        key: "clientId",
        label: "ID клиента",
      },
      {
        key: "lastName",
        label: "Фамилия",
      },
      {
        key: "loanCount",
        label: "Число ссуд",
      },
      {
        key: "totalAmount",
        label: "Сумма ссуд",
      },
    ],
  },
];

/*
 * ---------------------------------------------------------
 * COMPONENT
 * ---------------------------------------------------------
 */

export default function ReportsPage() {
  const [mode, setMode] =
      useState<
          | "overview"
          | "params"
          | "clientEditView"
      >(
          "overview"
      );

  const isClientEditMode =
      mode === "clientEditView";

  const [
    activeOverviewId,
    setActiveOverviewId,
  ] = useState(
      OVERVIEW_REPORTS[0].id
  );

  const [
    activeParamId,
    setActiveParamId,
  ] = useState(
      PARAM_REPORTS[0].id
  );

  const activeReport:
      | OverviewReport
      | ParamReport =
      mode === "overview"
          ? OVERVIEW_REPORTS.find(
              (report) =>
                  report.id ===
                  activeOverviewId
          )!
          : PARAM_REPORTS.find(
              (report) =>
                  report.id === activeParamId
          )!;

  /*
   * ---------------------------------------------------------
   * РЕЗУЛЬТАТ ОТЧЁТА
   * ---------------------------------------------------------
   */

  const [rows, setRows] =
      useState<any[]>([]);

  const [page, setPage] =
      useState(0);

  const [totalElements, setTotalElements] =
      useState(0);

  const [totalPages, setTotalPages] =
      useState(0);

  /*
   * ---------------------------------------------------------
   * ПАРАМЕТРЫ
   * ---------------------------------------------------------
   */

  const [paramValues, setParamValues] =
      useState<Record<string, string>>({});

  const [hasRun, setHasRun] =
      useState(false);

  /*
   * ---------------------------------------------------------
   * СПРАВОЧНИКИ
   * ---------------------------------------------------------
   */

  const [pawnshops, setPawnshops] =
      useState<PawnshopOption[]>([]);

  const [itemTypes, setItemTypes] =
      useState<ItemTypeOption[]>([]);

  const [districts, setDistricts] =
      useState<DistrictOption[]>([]);

  const [dictionariesLoading, setDictionariesLoading] =
      useState(false);

  /*
   * ---------------------------------------------------------
   * ПОИСК КЛИЕНТА
   * ---------------------------------------------------------
   */

  const [clients, setClients] =
      useState<ClientOption[]>([]);

  const [clientSearch, setClientSearch] =
      useState("");

  const [clientLoading, setClientLoading] =
      useState(false);

  const [
    clientSearchStarted,
    setClientSearchStarted,
  ] = useState(false);

  const [
    selectedClient,
    setSelectedClient,
  ] = useState<ClientOption | null>(
      null
  );

  const clientSearchTimeout =
      useRef<ReturnType<
          typeof setTimeout
      > | null>(null);

  /*
   * ---------------------------------------------------------
   * СОСТОЯНИЕ
   * ---------------------------------------------------------
   */

  const [loading, setLoading] =
      useState(false);

  const [error, setError] =
      useState("");

  /*
   * ---------------------------------------------------------
   * РЕДАКТИРОВАНИЕ КЛИЕНТОВ (ClientEditView)
   * ---------------------------------------------------------
   */

  const [
    editingClientId,
    setEditingClientId,
  ] = useState<number | null>(null);

  const [editDraft, setEditDraft] =
      useState<Partial<ClientEditRow>>(
          {}
      );

  const [savingClientId, setSavingClientId] =
      useState<number | null>(null);

  /*
   * ---------------------------------------------------------
   * ЗАГРУЗКА СПРАВОЧНИКОВ
   *
   * Те же endpoints, что используются
   * в LoansPage.
   * ---------------------------------------------------------
   */

  async function loadDictionaries() {
    setDictionariesLoading(true);

    try {
      const [
        pawnshopsResponse,
        itemTypesResponse,
        districtsResponse,
      ] = await Promise.all([
        api.get<PawnshopOption[]>(
            "/pawnshops"
        ),

        api.get<ItemTypeOption[]>(
            "/pledge-item-types"
        ),

        api.get<DistrictOption[]>(
            "/districts"
        ),
      ]);

      setPawnshops(
          pawnshopsResponse.data
      );

      setItemTypes(
          itemTypesResponse.data
      );

      setDistricts(
          districtsResponse.data
      );
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось загрузить справочники."
      );
    } finally {
      setDictionariesLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ПОИСК КЛИЕНТОВ
   *
   * Полностью аналогично LoansPage:
   *
   * /clients/page
   * page=0
   * size=20
   * search=...
   * ---------------------------------------------------------
   */

  async function searchClients(
      value: string
  ) {
    const query = value.trim();

    if (!query) {
      setClients([]);
      setClientSearchStarted(false);
      return;
    }

    if (query.length < 2) {
      setClients([]);
      setClientSearchStarted(false);
      return;
    }

    setClientLoading(true);
    setClientSearchStarted(true);

    try {
      const response =
          await api.get<ClientPage>(
              "/clients/page",
              {
                params: {
                  page: 0,
                  size: CLIENT_PAGE_SIZE,
                  search: query,
                },
              }
          );

      setClients(
          response.data.content
      );
    } catch (e) {
      console.error(e);

      setClients([]);

      setError(
          "Не удалось выполнить поиск клиентов."
      );
    } finally {
      setClientLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * DEBOUNCE ПОИСКА КЛИЕНТА
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (clientSearchTimeout.current) {
      clearTimeout(
          clientSearchTimeout.current
      );
    }

    clientSearchTimeout.current =
        setTimeout(() => {
          void searchClients(
              clientSearch
          );
        }, 400);

    return () => {
      if (clientSearchTimeout.current) {
        clearTimeout(
            clientSearchTimeout.current
        );
      }
    };
  }, [clientSearch]);

  /*
   * ---------------------------------------------------------
   * ВЫБОР КЛИЕНТА
   * ---------------------------------------------------------
   */

  function chooseClient(
      client: ClientOption
  ) {
    setSelectedClient(client);

    setParamValues((current) => ({
      ...current,
      clientId: String(
          client.clientId
      ),
    }));

    setClientSearch(
        clientFullName(client)
    );

    setClients([]);
    setClientSearchStarted(false);
  }

  /*
   * ---------------------------------------------------------
   * СБРОС СОСТОЯНИЯ ПАРАМЕТРОВ
   * ---------------------------------------------------------
   */

  function createDefaultValues(
      report: ParamReport
  ) {
    const defaults: Record<
        string,
        string
    > = {};

    report.params.forEach((param) => {
      if (
          param.name === "reportDate"
      ) {
        defaults[param.name] =
            new Date()
                .toISOString()
                .slice(0, 10);

        return;
      }

      defaults[param.name] = "";
    });

    return defaults;
  }

  /*
   * ---------------------------------------------------------
   * ЗАПУСК ОБЗОРНОГО ОТЧЁТА
   * ---------------------------------------------------------
   */

  async function loadOverview(
      report: OverviewReport,
      requestedPage: number
  ) {
    setLoading(true);
    setError("");

    try {
      if (report.paginated) {
        const result =
            await report.fetchPage(
                requestedPage,
                PAGE_SIZE
            );

        setRows(result.content);
        setPage(result.number);
        setTotalElements(
            result.totalElements
        );
        setTotalPages(
            result.totalPages
        );
      } else {
        const result =
            await report.fetchList();

        setRows(result);
        setPage(0);
        setTotalElements(
            result.length
        );
        setTotalPages(
            result.length ? 1 : 0
        );
      }
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось выполнить запрос."
      );

      setRows([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ЗАПУСК ОТЧЁТА С ПАРАМЕТРАМИ
   * ---------------------------------------------------------
   */

  async function runParamReport(
      report: ParamReport,
      values: Record<string, string>,
      requestedPage: number
  ) {
    const missing =
        report.params.find((param) => {
          if (
              param.type === "client"
          ) {
            return !values[param.name];
          }

          return !values[param.name]?.trim();
        });

    if (missing) {
      setError(
          `Заполните поле «${missing.label}».`
      );

      return;
    }

    setLoading(true);
    setError("");
    setHasRun(true);

    try {
      if (report.paginated) {
        const result =
            await report.fetchPage(
                values,
                requestedPage,
                PAGE_SIZE
            );

        setRows(result.content);
        setPage(result.number);
        setTotalElements(
            result.totalElements
        );
        setTotalPages(
            result.totalPages
        );
      } else {
        const result =
            await report.fetchList(
                values
            );

        setRows(result);
        setPage(0);
        setTotalElements(
            result.length
        );
        setTotalPages(
            result.length ? 1 : 0
        );
      }
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось выполнить запрос. Проверьте параметры."
      );

      setRows([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * ЗАГРУЗКА РЕДАКТИРУЕМОГО СПИСКА КЛИЕНТОВ
   *
   * GET /api/report/clients/edit-view
   * ---------------------------------------------------------
   */

  async function loadClientEditView(
      requestedPage: number
  ) {
    setLoading(true);
    setError("");

    try {
      const response =
          await api.get<
              SpringPage<ClientEditRow>
          >(
              "/report/clients/edit-view",
              {
                params: {
                  page: requestedPage,
                  size: PAGE_SIZE,
                },
              }
          );

      const result = response.data;

      setRows(result.content);
      setPage(result.number);
      setTotalElements(
          result.totalElements
      );
      setTotalPages(
          result.totalPages
      );
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось загрузить список клиентов."
      );

      setRows([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * РЕДАКТИРОВАНИЕ СТРОКИ КЛИЕНТА
   * ---------------------------------------------------------
   */

  function startClientEdit(
      row: ClientEditRow
  ) {
    setEditingClientId(row.clientId);

    setEditDraft({
      lastName: row.lastName ?? "",
      firstName: row.firstName ?? "",
      middleName: row.middleName ?? "",
      birthDate: row.birthDate ?? "",
      address: row.address ?? "",
      phone: row.phone ?? "",
    });

    setError("");
  }

  function cancelClientEdit() {
    setEditingClientId(null);
    setEditDraft({});
  }

  function updateEditDraft(
      field: keyof Omit<
          ClientEditRow,
          "clientId"
      >,
      value: string
  ) {
    setEditDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveClientEdit(
      row: ClientEditRow
  ) {
    if (
        !editDraft.lastName?.trim() ||
        !editDraft.firstName?.trim()
    ) {
      setError(
          "Заполните фамилию и имя клиента."
      );

      return;
    }

    setSavingClientId(row.clientId);
    setError("");

    const payload: ClientEditRow = {
      clientId: row.clientId,
      lastName:
          editDraft.lastName!.trim(),
      firstName:
          editDraft.firstName!.trim(),
      middleName:
          editDraft.middleName?.trim()
              ? editDraft.middleName.trim()
              : null,
      birthDate: editDraft.birthDate
          ? editDraft.birthDate
          : null,
      address: editDraft.address?.trim()
          ? editDraft.address.trim()
          : null,
      phone: editDraft.phone?.trim()
          ? editDraft.phone.trim()
          : null,
    };

    try {
      await api.put(
          "/report/clients/edit-view",
          payload
      );

      setRows((current) =>
          current.map((item) =>
              item.clientId ===
              row.clientId
                  ? {
                    ...item,
                    ...payload,
                  }
                  : item
          )
      );

      setEditingClientId(null);
      setEditDraft({});
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось сохранить изменения клиента."
      );
    } finally {
      setSavingClientId(null);
    }
  }

  /*
   * ---------------------------------------------------------
   * НАЧАЛЬНАЯ ЗАГРУЗКА
   * ---------------------------------------------------------
   */

  useEffect(() => {
    void loadDictionaries();
  }, []);

  /*
   * ---------------------------------------------------------
   * ПЕРЕКЛЮЧЕНИЕ ОБЗОРНОГО ОТЧЁТА
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (mode !== "overview") {
      return;
    }

    const report =
        OVERVIEW_REPORTS.find(
            (item) =>
                item.id === activeOverviewId
        )!;

    void loadOverview(
        report,
        0
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    activeOverviewId,
  ]);

  /*
   * ---------------------------------------------------------
   * ПЕРЕКЛЮЧЕНИЕ ОТЧЁТА С ПАРАМЕТРАМИ
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (mode !== "params") {
      return;
    }

    const report =
        PARAM_REPORTS.find(
            (item) =>
                item.id === activeParamId
        )!;

    const defaults =
        createDefaultValues(
            report
        );

    setParamValues(defaults);

    setRows([]);
    setError("");
    setHasRun(false);
    setPage(0);
    setTotalElements(0);
    setTotalPages(0);

    setClientSearch("");
    setClients([]);
    setClientSearchStarted(false);
    setSelectedClient(null);

    if (report.autoRun) {
      void runParamReport(
          report,
          defaults,
          0
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    activeParamId,
  ]);

  /*
   * ---------------------------------------------------------
   * ПЕРЕКЛЮЧЕНИЕ НА РЕДАКТИРОВАНИЕ КЛИЕНТОВ
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (mode !== "clientEditView") {
      return;
    }

    setEditingClientId(null);
    setEditDraft({});
    setError("");

    void loadClientEditView(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /*
   * ---------------------------------------------------------
   * ПАГИНАЦИЯ
   * ---------------------------------------------------------
   */

  function goToPage(
      targetPage: number
  ) {
    if (
        targetPage < 0 ||
        targetPage >= totalPages ||
        targetPage === page
    ) {
      return;
    }

    if (mode === "overview") {
      void loadOverview(
          activeReport as OverviewReport,
          targetPage
      );
    } else if (mode === "params") {
      void runParamReport(
          activeReport as ParamReport,
          paramValues,
          targetPage
      );
    } else {
      void loadClientEditView(
          targetPage
      );
    }
  }

  function previousPage() {
    goToPage(page - 1);
  }

  function nextPage() {
    goToPage(page + 1);
  }

  function getPageNumbers(): (
      | number
      | "ellipsis"
      )[] {
    if (totalPages <= 7) {
      return Array.from(
          {
            length: totalPages,
          },
          (_, index) => index
      );
    }

    const pages: (
        | number
        | "ellipsis"
        )[] = [];

    pages.push(0);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(
        1,
        page - 2
    );

    const end = Math.min(
        totalPages - 2,
        page + 2
    );

    for (
        let i = start;
        i <= end;
        i++
    ) {
      pages.push(i);
    }

    if (
        page <
        totalPages - 4
    ) {
      pages.push("ellipsis");
    }

    pages.push(
        totalPages - 1
    );

    return pages;
  }

  /*
   * ---------------------------------------------------------
   * EXCEL
   * ---------------------------------------------------------
   */

  const [exportLoading, setExportLoading] =
      useState(false);

  /*
   * Для экрана используется PAGE_SIZE = 50.
   * Для Excel загружается весь результат текущего
   * запроса: все страницы пагинируемого отчёта.
   * Состояние rows при этом не изменяется.
   */
  async function getAllRowsForExport(): Promise<any[]> {
    if (isClientEditMode) {
      const firstResponse =
          await api.get<SpringPage<ClientEditRow>>(
              "/report/clients/edit-view",
              {
                params: {
                  page: 0,
                  size: PAGE_SIZE,
                },
              }
          );

      const firstPage = firstResponse.data;
      const allRows = [
        ...firstPage.content,
      ];

      for (
          let requestedPage = 1;
          requestedPage < firstPage.totalPages;
          requestedPage++
      ) {
        const response =
            await api.get<SpringPage<ClientEditRow>>(
                "/report/clients/edit-view",
                {
                  params: {
                    page: requestedPage,
                    size: PAGE_SIZE,
                  },
                }
            );

        allRows.push(
            ...response.data.content
        );
      }

      return allRows;
    }

    if (activeReport.paginated) {
      if (mode === "overview") {
        const firstPage =
            await activeReport.fetchPage(
                0,
                PAGE_SIZE
            );

        const allRows = [
          ...firstPage.content,
        ];

        for (
            let requestedPage = 1;
            requestedPage < firstPage.totalPages;
            requestedPage++
        ) {
          const result =
              await activeReport.fetchPage(
                  requestedPage,
                  PAGE_SIZE
              );

          allRows.push(
              ...result.content
          );
        }

        return allRows;
      }

      const firstPage =
          await activeReport.fetchPage(
              paramValues,
              0,
              PAGE_SIZE
          );

      const allRows = [
        ...firstPage.content,
      ];

      for (
          let requestedPage = 1;
          requestedPage < firstPage.totalPages;
          requestedPage++
      ) {
        const result =
            await activeReport.fetchPage(
                paramValues,
                requestedPage,
                PAGE_SIZE
            );

        allRows.push(
            ...result.content
        );
      }

      return allRows;
    }

    if (mode === "overview") {
      return await activeReport.fetchList();
    }

    return await activeReport.fetchList(
        paramValues
    );
  }

  async function exportToExcel() {
    if (loading || exportLoading || !rows.length) {
      return;
    }

    setExportLoading(true);
    setError("");

    try {
      const exportRowsData =
          await getAllRowsForExport();

      if (!exportRowsData.length) {
        setError(
            "Нет данных для экспорта."
        );
        return;
      }

      const exportColumns =
          isClientEditMode
              ? CLIENT_EDIT_COLUMNS
              : activeReport.columns;

      const exportRows =
          exportRowsData.map((row) => {
            const result: Record<
                string,
                any
            > = {};

            exportColumns.forEach(
                (column) => {
                  result[column.label] =
                      row[column.key];
                }
            );

            return result;
          });

      const worksheet =
          XLSX.utils.json_to_sheet(
              exportRows
          );

      const workbook =
          XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Результат запроса"
      );

      XLSX.writeFile(
          workbook,
          `${
              isClientEditMode
                  ? "clients-edit-view"
                  : activeReport.id
          }.xlsx`
      );
    } catch (e) {
      console.error(e);

      setError(
          "Не удалось экспортировать результат запроса в Excel."
      );
    } finally {
      setExportLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * PARAMETER SELECT
   * ---------------------------------------------------------
   */

  const selectStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    height: "40px",
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
    fontFamily: "inherit",
  };

  function renderSelectField(
      param: ParamField
  ) {
    const value =
        paramValues[param.name] ??
        "";

    if (
        param.name === "pawnshopId"
    ) {
      return (
          <select
              style={selectStyle}
              value={value}
              onChange={(e) => {
                setParamValues(
                    (current) => ({
                      ...current,
                      [param.name]:
                      e.target.value,
                    })
                );
              }}
              disabled={
                dictionariesLoading
              }
          >
            <option value="">
              Выберите ломбард
            </option>

            {pawnshops.map(
                (pawnshop) => (
                    <option
                        key={pawnshop.id}
                        value={pawnshop.id}
                    >
                      {pawnshop.name}
                    </option>
                )
            )}
          </select>
      );
    }

    if (
        param.name === "itemTypeId"
    ) {
      return (
          <select
              style={selectStyle}
              value={value}
              onChange={(e) => {
                setParamValues(
                    (current) => ({
                      ...current,
                      [param.name]:
                      e.target.value,
                    })
                );
              }}
              disabled={
                dictionariesLoading
              }
          >
            <option value="">
              Выберите тип предмета
            </option>

            {itemTypes.map(
                (itemType) => (
                    <option
                        key={itemType.id}
                        value={itemType.id}
                    >
                      {itemType.name}
                    </option>
                )
            )}
          </select>
      );
    }

    if (
        param.name === "districtId"
    ) {
      return (
          <select
              style={selectStyle}
              value={value}
              onChange={(e) => {
                setParamValues(
                    (current) => ({
                      ...current,
                      [param.name]:
                      e.target.value,
                    })
                );
              }}
              disabled={
                dictionariesLoading
              }
          >
            <option value="">
              Выберите район
            </option>

            {districts.map(
                (district) => (
                    <option
                        key={district.id}
                        value={district.id}
                    >
                      {district.name}
                    </option>
                )
            )}
          </select>
      );
    }

    return null;
  }

  /*
   * ---------------------------------------------------------
   * CLIENT SEARCH FIELD
   * ---------------------------------------------------------
   */

  function renderClientField() {
    return (
        <label className="client-search-field">
          Клиент

          <input
              type="text"
              placeholder="Введите фамилию, имя или отчество"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(
                    e.target.value
                );

                setSelectedClient(
                    null
                );

                setParamValues(
                    (current) => ({
                      ...current,
                      clientId: "",
                    })
                );
              }}
          />

          {clientLoading && (
              <p className="table-message">
                Поиск клиентов...
              </p>
          )}

          {!clientLoading &&
              clientSearchStarted &&
              clientSearch.trim()
                  .length >= 2 &&
              !selectedClient && (
                  <div className="client-search-results">
                    {clients.length ? (
                        clients.map(
                            (client) => (
                                <button
                                    type="button"
                                    key={
                                      client.clientId
                                    }
                                    className="client-search-result"
                                    onClick={() =>
                                        chooseClient(
                                            client
                                        )
                                    }
                                >
                                  {clientFullName(
                                      client
                                  )}
                                </button>
                            )
                        )
                    ) : (
                        <p className="table-message">
                          Клиенты не найдены.
                        </p>
                    )}
                  </div>
              )}

          {selectedClient && (
              <p
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                  }}
              >
                Выбран:
                {" "}
                <strong>
                  {clientFullName(
                      selectedClient
                  )}
                </strong>
              </p>
          )}
        </label>
    );
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
      <section>
        <div className="page-header">
          <div>
            <h1>Отчёты</h1>

            <p className="page-description">
              {isClientEditMode ||
              activeReport.paginated
                  ? `Всего записей: ${totalElements.toLocaleString(
                      "ru-RU"
                  )}`
                  : `Записей: ${rows.length}`}
            </p>
          </div>

          <button
              className="button button-secondary"
              onClick={
                exportToExcel
              }
              disabled={
                  rows.length === 0 ||
                  loading ||
                  exportLoading
              }
          >
            {exportLoading
                ? "Подготовка Excel..."
                : "Экспорт в Excel"}
          </button>
        </div>

        {error && (
            <p className="form-error">
              {error}
            </p>
        )}

        <div className="dictionary-tabs">
          <button
              className={
                mode === "overview"
                    ? "dictionary-tab dictionary-tab-active"
                    : "dictionary-tab"
              }
              onClick={() =>
                  setMode("overview")
              }
          >
            Обзорные отчёты
          </button>

          <button
              className={
                mode === "params"
                    ? "dictionary-tab dictionary-tab-active"
                    : "dictionary-tab"
              }
              onClick={() =>
                  setMode("params")
              }
          >
            Запросы с параметрами
          </button>

          <button
              className={
                isClientEditMode
                    ? "dictionary-tab dictionary-tab-active"
                    : "dictionary-tab"
              }
              onClick={() =>
                  setMode(
                      "clientEditView"
                  )
              }
          >
            Редактирование клиентов
          </button>
        </div>

        {!isClientEditMode && (
            <div className="dictionary-tabs">
              {(mode === "overview"
                      ? OVERVIEW_REPORTS
                      : PARAM_REPORTS
              ).map((report) => (
                  <button
                      key={report.id}
                      className={
                        report.id ===
                        activeReport.id
                            ? "dictionary-tab dictionary-tab-active"
                            : "dictionary-tab"
                      }
                      onClick={() => {
                        if (
                            mode === "overview"
                        ) {
                          setActiveOverviewId(
                              report.id
                          );
                        } else {
                          setActiveParamId(
                              report.id
                          );
                        }
                      }}
                  >
                    {report.label}
                  </button>
              ))}
            </div>
        )}

        {mode === "params" && (
            <form
                onSubmit={(event) => {
                  event.preventDefault();

                  void runParamReport(
                      activeReport as ParamReport,
                      paramValues,
                      0
                  );
                }}
            >
              <div className="form-grid">
                {(
                    activeReport as ParamReport
                ).params.map((param) => {
                  if (
                      param.type === "client"
                  ) {
                    return (
                        <div
                            key={param.name}
                        >
                          {renderClientField()}
                        </div>
                    );
                  }

                  return (
                      <label
                          key={param.name}
                      >
                        {param.label}

                        {param.type ===
                        "select"
                            ? renderSelectField(
                                param
                            )
                            : (
                                <input
                                    type={
                                      param.type
                                    }
                                    step={
                                      param.name ===
                                      "minTotalValue" ||
                                      param.name ===
                                      "largeAmountThreshold"
                                          ? "0.01"
                                          : undefined
                                    }
                                    value={
                                        paramValues[
                                            param.name
                                            ] ?? ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setParamValues(
                                            (current) => ({
                                              ...current,
                                              [param.name]:
                                              event
                                                  .target
                                                  .value,
                                            })
                                        )
                                    }
                                />
                            )}
                      </label>
                  );
                })}
              </div>

              <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
              >
                {loading
                    ? "Выполнение..."
                    : "Выполнить запрос"}
              </button>
            </form>
        )}

        {!isClientEditMode &&
            activeReport.chart &&
            rows.length > 0 &&
            (() => {
              const chart =
                  activeReport.chart;

              const data =
                  chart.build(rows);

              return (
                  <div
                      className="table-card"
                      style={{
                        marginTop: 20,
                        marginBottom: 16,
                        height: 320,
                        padding: 16,
                      }}
                  >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                      {chart.type ===
                      "bar" ? (
                          <BarChart
                              data={data}
                              margin={{
                                top: 16,
                                right: 20,
                                left: 0,
                                bottom: 8,
                              }}
                          >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />

                            <XAxis
                                dataKey="name"
                                tick={{
                                  fontSize: 12,
                                }}
                            />

                            <YAxis
                                tick={{
                                  fontSize: 12,
                                }}
                            />

                            <Tooltip
                                formatter={(
                                    value: number
                                ) =>
                                    value.toLocaleString(
                                        "ru-RU"
                                    )
                                }
                            />

                            <Bar
                                dataKey="value"
                                radius={[
                                  3,
                                  3,
                                  0,
                                  0,
                                ]}
                            >
                              {data.map(
                                  (
                                      point,
                                      index
                                  ) => (
                                      <Cell
                                          key={`${point.name}-${index}`}
                                          fill={
                                            chart.colorFor
                                                ? chart.colorFor(
                                                    point.name,
                                                    index
                                                )
                                                : CHART_PALETTE[
                                                index %
                                                CHART_PALETTE.length
                                                    ]
                                          }
                                      />
                                  )
                              )}
                            </Bar>
                          </BarChart>
                      ) : (
                          <PieChart>
                            <Tooltip
                                formatter={(
                                    value: number
                                ) =>
                                    value.toLocaleString(
                                        "ru-RU"
                                    )
                                }
                            />

                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={110}
                                label={(
                                    point: any
                                ) =>
                                    point.name
                                }
                            >
                              {data.map(
                                  (
                                      point,
                                      index
                                  ) => (
                                      <Cell
                                          key={`${point.name}-${index}`}
                                          fill={
                                            chart.colorFor
                                                ? chart.colorFor(
                                                    point.name,
                                                    index
                                                )
                                                : CHART_PALETTE[
                                                index %
                                                CHART_PALETTE.length
                                                    ]
                                          }
                                      />
                                  )
                              )}
                            </Pie>
                          </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
              );
            })()}

        {isClientEditMode ? (
            <div
                className="table-card"
                style={{
                  marginTop: 20,
                }}
            >
              {loading ? (
                  <p className="table-message">
                    Загрузка списка клиентов...
                  </p>
              ) : (
                  <>
                    <div
                        style={{
                          overflowX:
                              "auto",
                          maxWidth:
                              "100%",
                        }}
                    >
                      <table
                          className="data-table"
                          style={{
                            minWidth:
                                "960px",
                          }}
                      >
                        <thead>
                        <tr>
                          {CLIENT_EDIT_COLUMNS.map(
                              (column) => (
                                  <th
                                      key={
                                        column.key
                                      }
                                  >
                                    {
                                      column.label
                                    }
                                  </th>
                              )
                          )}
                          <th>
                            Действия
                          </th>
                        </tr>
                        </thead>

                        <tbody>
                        {(
                            rows as ClientEditRow[]
                        ).map((row) => {
                          const isEditing =
                              editingClientId ===
                              row.clientId;

                          const isSaving =
                              savingClientId ===
                              row.clientId;

                          return (
                              <tr
                                  key={
                                    row.clientId
                                  }
                              >
                                <td>
                                  {isEditing ? (
                                      <input
                                          style={
                                            selectStyle
                                          }
                                          value={
                                              editDraft.lastName ??
                                              ""
                                          }
                                          onChange={(
                                              e
                                          ) =>
                                              updateEditDraft(
                                                  "lastName",
                                                  e
                                                      .target
                                                      .value
                                              )
                                          }
                                      />
                                  ) : (
                                      formatValue(
                                          "lastName",
                                          row.lastName
                                      )
                                  )}
                                </td>

                                <td>
                                  {isEditing ? (
                                      <input
                                          style={
                                            selectStyle
                                          }
                                          value={
                                              editDraft.firstName ??
                                              ""
                                          }
                                          onChange={(
                                              e
                                          ) =>
                                              updateEditDraft(
                                                  "firstName",
                                                  e
                                                      .target
                                                      .value
                                              )
                                          }
                                      />
                                  ) : (
                                      formatValue(
                                          "firstName",
                                          row.firstName
                                      )
                                  )}
                                </td>

                                <td>
                                  {isEditing ? (
                                      <input
                                          style={
                                            selectStyle
                                          }
                                          value={
                                              editDraft.middleName ??
                                              ""
                                          }
                                          onChange={(
                                              e
                                          ) =>
                                              updateEditDraft(
                                                  "middleName",
                                                  e
                                                      .target
                                                      .value
                                              )
                                          }
                                      />
                                  ) : (
                                      formatValue(
                                          "middleName",
                                          row.middleName
                                      )
                                  )}
                                </td>

                                <td>
                                  {isEditing ? (
                                      <input
                                          type="date"
                                          style={
                                            selectStyle
                                          }
                                          value={
                                              editDraft.birthDate ??
                                              ""
                                          }
                                          onChange={(
                                              e
                                          ) =>
                                              updateEditDraft(
                                                  "birthDate",
                                                  e
                                                      .target
                                                      .value
                                              )
                                          }
                                      />
                                  ) : (
                                      formatValue(
                                          "birthDate",
                                          row.birthDate
                                      )
                                  )}
                                </td>

                                <td>
                                  {isEditing ? (
                                      <input
                                          style={
                                            selectStyle
                                          }
                                          value={
                                              editDraft.address ??
                                              ""
                                          }
                                          onChange={(
                                              e
                                          ) =>
                                              updateEditDraft(
                                                  "address",
                                                  e
                                                      .target
                                                      .value
                                              )
                                          }
                                      />
                                  ) : (
                                      formatValue(
                                          "address",
                                          row.address
                                      )
                                  )}
                                </td>

                                <td>
                                  {isEditing ? (
                                      <input
                                          style={
                                            selectStyle
                                          }
                                          value={
                                              editDraft.phone ??
                                              ""
                                          }
                                          onChange={(
                                              e
                                          ) =>
                                              updateEditDraft(
                                                  "phone",
                                                  e
                                                      .target
                                                      .value
                                              )
                                          }
                                      />
                                  ) : (
                                      formatValue(
                                          "phone",
                                          row.phone
                                      )
                                  )}
                                </td>

                                <td>
                                  {isEditing ? (
                                      <div
                                          style={{
                                            display:
                                                "flex",
                                            gap: 8,
                                          }}
                                      >
                                        <button
                                            type="button"
                                            className="button button-primary"
                                            disabled={
                                              isSaving
                                            }
                                            onClick={() =>
                                                void saveClientEdit(
                                                    row
                                                )
                                            }
                                        >
                                          {isSaving
                                              ? "Сохранение..."
                                              : "Сохранить"}
                                        </button>

                                        <button
                                            type="button"
                                            className="button button-secondary"
                                            disabled={
                                              isSaving
                                            }
                                            onClick={
                                              cancelClientEdit
                                            }
                                        >
                                          Отмена
                                        </button>
                                      </div>
                                  ) : (
                                      <button
                                          type="button"
                                          className="button button-secondary"
                                          disabled={
                                              editingClientId !==
                                              null
                                          }
                                          onClick={() =>
                                              startClientEdit(
                                                  row
                                              )
                                          }
                                      >
                                        Изменить
                                      </button>
                                  )}
                                </td>
                              </tr>
                          );
                        })}

                        {!rows.length && (
                            <tr>
                              <td
                                  colSpan={
                                      CLIENT_EDIT_COLUMNS.length +
                                      1
                                  }
                                  className="table-message"
                              >
                                Нет данных
                              </td>
                            </tr>
                        )}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                          <button
                              className="button button-secondary"
                              onClick={
                                previousPage
                              }
                              disabled={
                                  page === 0 ||
                                  loading
                              }
                              aria-label="Предыдущая страница"
                          >
                            ‹
                          </button>

                          {getPageNumbers().map(
                              (
                                  pageNumber,
                                  index
                              ) => {
                                if (
                                    pageNumber ===
                                    "ellipsis"
                                ) {
                                  return (
                                      <span
                                          key={`ellipsis-${index}`}
                                          className="pagination-ellipsis"
                                      >
                            …
                          </span>
                                  );
                                }

                                return (
                                    <button
                                        key={
                                          pageNumber
                                        }
                                        className={
                                          pageNumber ===
                                          page
                                              ? "button button-primary pagination-page active"
                                              : "button button-secondary pagination-page"
                                        }
                                        onClick={() =>
                                            goToPage(
                                                pageNumber
                                            )
                                        }
                                        disabled={
                                            pageNumber ===
                                            page ||
                                            loading
                                        }
                                    >
                                      {pageNumber +
                                          1}
                                    </button>
                                );
                              }
                          )}

                          <button
                              className="button button-secondary"
                              onClick={
                                nextPage
                              }
                              disabled={
                                  page >=
                                  totalPages -
                                  1 ||
                                  loading
                              }
                              aria-label="Следующая страница"
                          >
                            ›
                          </button>
                        </div>
                    )}
                  </>
              )}
            </div>
        ) : (
            <div
                className="table-card"
                style={{
                  marginTop:
                      mode === "params"
                          ? 20
                          : activeReport.chart
                              ? 0
                              : 20,
                }}
            >
              {loading ? (
                  <p className="table-message">
                    Выполнение запроса...
                  </p>
              ) : mode === "params" &&
              !hasRun ? (
                  <p className="table-message">
                    Заполните параметры и
                    нажмите
                    {" "}
                    «Выполнить запрос».
                  </p>
              ) : (
                  <>
                    <div
                        style={{
                          overflowX:
                              "auto",
                          maxWidth:
                              "100%",
                        }}
                    >
                      <table
                          className="data-table"
                          style={{
                            minWidth:
                                "900px",
                          }}
                      >
                        <thead>
                        <tr>
                          {activeReport.columns.map(
                              (column) => (
                                  <th
                                      key={
                                        column.key
                                      }
                                  >
                                    {
                                      column.label
                                    }
                                  </th>
                              )
                          )}
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map(
                            (
                                row,
                                index
                            ) => (
                                <tr
                                    key={
                                        row.id ??
                                        row.loanId ??
                                        row.clientId ??
                                        row.pawnshopId ??
                                        index
                                    }
                                >
                                  {activeReport.columns.map(
                                      (
                                          column
                                      ) => (
                                          <td
                                              key={
                                                column.key
                                              }
                                          >
                                            {renderCell(
                                                column,
                                                row
                                            )}
                                          </td>
                                      )
                                  )}
                                </tr>
                            )
                        )}

                        {!rows.length && (
                            <tr>
                              <td
                                  colSpan={
                                    activeReport
                                        .columns
                                        .length
                                  }
                                  className="table-message"
                              >
                                Нет данных
                              </td>
                            </tr>
                        )}
                        </tbody>
                      </table>
                    </div>

                    {activeReport.paginated &&
                        totalPages > 1 && (
                            <div className="pagination">
                              <button
                                  className="button button-secondary"
                                  onClick={
                                    previousPage
                                  }
                                  disabled={
                                      page === 0 ||
                                      loading
                                  }
                                  aria-label="Предыдущая страница"
                              >
                                ‹
                              </button>

                              {getPageNumbers().map(
                                  (
                                      pageNumber,
                                      index
                                  ) => {
                                    if (
                                        pageNumber ===
                                        "ellipsis"
                                    ) {
                                      return (
                                          <span
                                              key={`ellipsis-${index}`}
                                              className="pagination-ellipsis"
                                          >
                            …
                          </span>
                                      );
                                    }

                                    return (
                                        <button
                                            key={
                                              pageNumber
                                            }
                                            className={
                                              pageNumber ===
                                              page
                                                  ? "button button-primary pagination-page active"
                                                  : "button button-secondary pagination-page"
                                            }
                                            onClick={() =>
                                                goToPage(
                                                    pageNumber
                                                )
                                            }
                                            disabled={
                                                pageNumber ===
                                                page ||
                                                loading
                                            }
                                        >
                                          {pageNumber +
                                              1}
                                        </button>
                                    );
                                  }
                              )}

                              <button
                                  className="button button-secondary"
                                  onClick={
                                    nextPage
                                  }
                                  disabled={
                                      page >=
                                      totalPages -
                                      1 ||
                                      loading
                                  }
                                  aria-label="Следующая страница"
                              >
                                ›
                              </button>
                            </div>
                        )}
                  </>
              )}
            </div>
        )}
      </section>
  );
}