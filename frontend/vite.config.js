import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const proxyTarget =
    env.BACKEND_PROXY_TARGET || env.VITE_BACKEND_URL || "http://localhost:8080";

  return {
    envDir: "..",
    plugins: [tailwindcss(), react()],
    server: {
      host: true,
      proxy: {
        "/api/v1": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
