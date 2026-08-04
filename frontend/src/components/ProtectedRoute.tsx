import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="content">Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Guards an entire page by permission, e.g. only ADMIN can reach /users. */
export function RequirePermission({
  resource,
  children,
}: {
  resource: Parameters<ReturnType<typeof useAuth>["can"]>[0];
  children: React.ReactElement;
}) {
  const { can } = useAuth();
  if (!can(resource, "view")) {
    return (
      <div className="empty-state">
        <div className="stamp">Доступ ограничен</div>
        <div>У вашей роли нет прав для просмотра этого раздела.</div>
      </div>
    );
  }
  return children;
}
