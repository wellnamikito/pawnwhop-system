import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Resource } from "@/types/auth";

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loader">Проверяем доступ…</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

export function RequirePermission({
                                    resource,
                                    children,
                                  }: {
  resource: Resource;
  children: React.ReactElement;
}) {
  const { can } = useAuth();

  if (!can(resource, "view")) {
    return (
        <section className="empty-state">
          <h2>Нет доступа</h2>
          <p>Для вашей роли этот раздел недоступен.</p>
        </section>
    );
  }

  return children;
}