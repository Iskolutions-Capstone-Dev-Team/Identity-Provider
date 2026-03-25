import { existsSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function getProxyTarget(env) {
  const fallbackTarget = env.VITE_BACKEND_URL || env.VITE_API_BASE_URL || "http://localhost:8080";
  const isRunningInDocker = existsSync("/.dockerenv");

  try {
    const targetUrl = new URL(fallbackTarget);
    const usesLocalhost =
      targetUrl.hostname === "localhost" || targetUrl.hostname === "127.0.0.1";

    if (isRunningInDocker && usesLocalhost) {
      targetUrl.hostname = "backend";
    }

    return targetUrl.origin;
  } catch {
    return isRunningInDocker ? "http://backend:8080" : "http://localhost:8080";
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const proxyTarget = getProxyTarget(env);

  return {
    envDir: "..",
    envPrefix: ["VITE_", "BACKEND_API_KEY"],
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
