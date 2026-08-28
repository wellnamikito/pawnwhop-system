import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

const roleLabels: Record<Role, string> = {
  ADMIN: "Администратор",
  OPERATOR: "Оператор",
  ANALYST: "Аналитик",
};

export function AppLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  function exit() {
    logout();
    navigate("/login");
  }

  return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">Реестр ломбардов</div>

          <nav className="navigation">
            <NavLink to="/" end>Главная</NavLink>

            {can("loans", "view") && <NavLink to="/loans">Ссуды и залоги</NavLink>}
            {can("clients", "view") && <NavLink to="/clients">Клиенты</NavLink>}
            {can("pawnshops", "view") && <NavLink to="/pawnshops">Ломбарды</NavLink>}
            {can("owners", "view") && <NavLink to="/owners">Владельцы</NavLink>}
            {can("dictionaries", "view") && <NavLink to="/dictionaries">Справочники</NavLink>}
            {can("reports", "view") && <NavLink to="/reports">Отчёты</NavLink>}
          </nav>

          <div className="profile">
            <strong>{user?.username}</strong>
            <span>{user && roleLabels[user.role]}</span>
            <button className="button button-secondary" onClick={exit}>
              Выйти
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
  );
}