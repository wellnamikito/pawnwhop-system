import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
      <section>
        <h1>Главная</h1>
        <p className="page-description">
          Добро пожаловать, {user?.username}. Доступные разделы определяются вашей ролью.
        </p>

        <div className="info-card">
          <h2>Основа приложения готова</h2>
          <p>
            Следующим шагом добавим первый рабочий раздел — «Ссуды и залоги»:
            таблицу, поиск, фильтры и составную форму со списком залогов.
          </p>
        </div>
      </section>
  );
}