import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, roleLabel } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

interface TitleContextValue {
  setTitle: (title: string, subtitle?: string) => void;
}
export const TitleContext = React.createContext<TitleContextValue>({
  setTitle: () => {},
});

export function AppLayout() {
  const { user, logout } = useAuth();
  const [title, setTitleState] = React.useState("Панель показателей");
  const [subtitle, setSubtitleState] = React.useState<string | undefined>();

  const setTitle = React.useCallback((t: string, s?: string) => {
    setTitleState(t);
    setSubtitleState(s);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <div className="subtitle">{subtitle}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="role-badge">{roleLabel(user?.role)}</span>
            <button className="btn btn-sm" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
        <div className="content">
          <TitleContext.Provider value={{ setTitle }}>
            <Outlet />
          </TitleContext.Provider>
        </div>
      </div>
    </div>
  );
}
