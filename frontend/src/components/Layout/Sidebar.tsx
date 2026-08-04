import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  "nav-link" + (isActive ? " active" : "");

export function Sidebar() {
  const { user, can } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="mark" />
        <span className="title">Реестр ломбардов</span>
      </div>

      <div className="sidebar-section-label">Обзор</div>
      <NavLink to="/" end className={linkClass}>
        Панель показателей
      </NavLink>

      <div className="sidebar-section-label">Операции</div>
      {can("loans", "view") && (
        <NavLink to="/loans" className={linkClass}>
          Ссуды и залоги
        </NavLink>
      )}
      {can("clients", "view") && (
        <NavLink to="/clients" className={linkClass}>
          Клиенты
        </NavLink>
      )}
      {can("pawnshops", "view") && (
        <NavLink to="/pawnshops" className={linkClass}>
          Ломбарды
        </NavLink>
      )}
      {can("owners", "view") && (
        <NavLink to="/owners" className={linkClass}>
          Владельцы
        </NavLink>
      )}

      <div className="sidebar-section-label">Справочники</div>
      {can("dictionaries", "view") && (
        <NavLink to="/dictionaries" className={linkClass}>
          Справочники
        </NavLink>
      )}

      <div className="sidebar-section-label">Аналитика</div>
      {can("reports", "view") && (
        <NavLink to="/reports" className={linkClass}>
          Запросы и визуализация
        </NavLink>
      )}

      <div className="sidebar-footer">
        {user?.full_name}
        <br />
        роль: {roleLabel(user?.role)}
      </div>
    </aside>
  );
}

export function roleLabel(role?: string) {
  switch (role) {
    case "ADMIN":
      return "администратор";
    case "OPERATOR":
      return "пользователь_1 (оператор)";
    case "ANALYST":
      return "пользователь_2 (аналитик)";
    default:
      return "—";
  }
}
