import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-server proxy: forwards /api/* calls to the Spring Boot backend so the
// browser never needs the backend's real host/port and there are no CORS
// issues during development. In production the app talks to VITE_API_BASE_URL
// directly (see src/api/client.ts and .env.example).
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the "@/*" -> "src/*" alias declared in tsconfig.json.
    // tsconfig's "paths" only affects type-checking; Vite needs its own
    // alias to actually resolve these imports at build/dev time.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
