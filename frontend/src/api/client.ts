import axios from "axios";

/**
 * ============================================================================
 *  DATABASE / BACKEND CONNECTION POINT
 * ============================================================================
 * The React app never connects to PostgreSQL directly - browsers can't speak
 * the Postgres wire protocol, and shipping DB credentials to the client
 * would be a serious security hole. Instead this file configures the ONE
 * HTTP client every page uses to reach the Spring Boot REST API, which in
 * turn talks to the database via Hibernate/JDBC.
 *
 * To point this app at your backend:
 *   1. Copy .env.example to .env
 *   2. Set VITE_API_BASE_URL to your Spring Boot server, e.g.
 *        VITE_API_BASE_URL=http://localhost:8080/api
 *   3. (Optional) adjust vite.config.ts's dev proxy target too.
 *
 * Nothing else in the codebase needs to change - every page/service imports
 * `api` from this file.
 * ============================================================================
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT/session token issued by the Spring Boot auth endpoint
// (see src/context/AuthContext.tsx) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central place to react to auth failures (expired/invalid token) coming
// back from the backend, regardless of which page triggered the request.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
