import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Неверный логин или пароль");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-mark">
          <span className="mark" />
          <span>Реестр ломбардов</span>
        </div>
        <form onSubmit={onSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              style={{ width: "100%" }}
            />
          </div>
          <div className="field" style={{ marginBottom: 6 }}>
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>
            {submitting ? "Вход..." : "Войти"}
          </button>
        </form>
        <div className="helper-text" style={{ marginTop: 16 }}>
          Аутентификация выполняется на сервере (Spring Boot, POST /auth/login).
          Интерфейс один для всех ролей — доступные разделы зависят от роли,
          назначенной администратором.
        </div>
      </div>
    </div>
  );
}
