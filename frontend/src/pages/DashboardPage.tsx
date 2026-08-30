import { useAuth } from "@/context/AuthContext";

type DashboardSection = {
  resource:
    | "loans"
    | "clients"
    | "pawnshops"
    | "owners"
    | "dictionaries"
    | "reports"
    | "users";

  title: string;

  description: string;

  viewLabel: string;

  createLabel?: string;
};

export default function DashboardPage() {
  const { user, can } = useAuth();

  const sections: DashboardSection[] = [
    {
      resource: "loans",
      title: "Ссуды и залоги",
      description:
        "Просмотр и работа со ссудами и связанными залогами.",
      viewLabel: "Просмотр данных",
      createLabel: "Добавление и редактирование",
    },
    {
      resource: "clients",
      title: "Клиенты",
      description:
        "Просмотр информации о клиентах и управление записями.",
      viewLabel: "Просмотр данных",
      createLabel: "Добавление и редактирование",
    },
    {
      resource: "pawnshops",
      title: "Ломбарды",
      description:
        "Информация о ломбардах и их основных характеристиках.",
      viewLabel: "Просмотр данных",
      createLabel: "Добавление и редактирование",
    },
    {
      resource: "owners",
      title: "Владельцы",
      description:
        "Просмотр и управление информацией о владельцах ломбардов.",
      viewLabel: "Просмотр данных",
      createLabel: "Добавление и редактирование",
    },
    {
      resource: "dictionaries",
      title: "Справочники",
      description:
        "Работа со справочной информацией приложения.",
      viewLabel: "Просмотр справочников",
      createLabel: "Изменение данных",
    },
    {
      resource: "reports",
      title: "Отчёты",
      description:
        "Просмотр результатов итоговых запросов и аналитической информации.",
      viewLabel: "Просмотр отчётов",
    },
  ];

  const availableSections = sections.filter((section) =>
    can(section.resource, "view")
  );

  const editableSections = availableSections.filter(
    (section) =>
      can(section.resource, "create") ||
      can(section.resource, "edit") ||
      can(section.resource, "delete")
  );

  function getRoleName() {
    switch (user?.role) {
      case "ADMIN":
        return "Администратор";

      case "OPERATOR":
        return "Оператор";

      case "ANALYST":
        return "Аналитик";

      default:
        return "Пользователь";
    }
  }

  function getRoleDescription() {
    switch (user?.role) {
      case "ADMIN":
        return "Полный доступ ко всем разделам приложения и данным.";

      case "OPERATOR":
        return "Работа с основными данными приложения и просмотр справочной информации.";

      case "ANALYST":
        return "Просмотр данных и работа с отчётами без возможности изменения записей.";

      default:
        return "Доступ к разделам приложения определяется назначенными правами.";
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Главная</h1>

          <p className="page-description">
            Добро пожаловать, {user?.username}.
          </p>
        </div>
      </div>

      <div className="info-card">
        <h2>Информация о пользователе</h2>

        <p>
          <strong>Роль:</strong> {getRoleName()}
        </p>

        <p>{getRoleDescription()}</p>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h2>Доступные разделы</h2>

        <p className="page-description">
          Список разделов сформирован с учётом ваших прав доступа.
        </p>
      </div>

      {availableSections.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {availableSections.map((section) => {
            const canCreate = can(
              section.resource,
              "create"
            );

            const canEdit = can(
              section.resource,
              "edit"
            );

            const canDelete = can(
              section.resource,
              "delete"
            );

            const canModify =
              canCreate ||
              canEdit ||
              canDelete;

            return (
              <div
                key={section.resource}
                className="info-card"
              >
                <h2>{section.title}</h2>

                <p>{section.description}</p>

                <p>
                  <strong>
                    {section.viewLabel}
                  </strong>
                </p>

                {canModify && (
                  <p>
                    {canCreate && (
                      <>
                        Добавление{" "}
                      </>
                    )}

                    {canEdit && (
                      <>
                        редактирование{" "}
                      </>
                    )}

                    {canDelete && (
                      <>
                        и удаление
                      </>
                    )}
                  </p>
                )}

                {!canModify && (
                  <p>
                    Только просмотр
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="info-card">
          <h2>Нет доступных разделов</h2>

          <p>
            Для вашей учётной записи не назначены
            права на просмотр разделов приложения.
          </p>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <h2>Ваши возможности</h2>

        <p className="page-description">
          Сводка действий, доступных текущему пользователю.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        <div className="info-card">
          <h2>Просмотр</h2>

          <p>
            Доступно разделов:{" "}
            <strong>
              {availableSections.length}
            </strong>
          </p>

          <p>
            Вы можете просматривать данные
            доступных таблиц, представлений
            и отчётов.
          </p>
        </div>

        <div className="info-card">
          <h2>Изменение данных</h2>

          <p>
            Доступно разделов:{" "}
            <strong>
              {editableSections.length}
            </strong>
          </p>

          {editableSections.length > 0 ? (
            <p>
              В этих разделах разрешены
              операции добавления, редактирования
              или удаления в соответствии
              с вашей ролью.
            </p>
          ) : (
            <p>
              Изменение данных недоступно.
              Доступен режим просмотра.
            </p>
          )}
        </div>

        <div className="info-card">
          <h2>Отчёты</h2>

          <p>
            {can("reports", "view")
              ? "Доступен просмотр отчётов и результатов итоговых запросов."
              : "Доступ к отчётам отсутствует."}
          </p>
        </div>
      </div>
    </section>
  );
}
