import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Не удалось войти. Проверьте логин, пароль и доступность сервера.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <main className="login-page">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>Реестр ломбардов</h1>
          <p>Введите учётные данные PostgreSQL.</p>

          <label>
            Логин
            <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
            />
          </label>

          <label>
            Пароль
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="button button-primary" disabled={submitting}>
            {submitting ? "Вход…" : "Войти"}
          </button>
        </form>
      </main>
  );
}