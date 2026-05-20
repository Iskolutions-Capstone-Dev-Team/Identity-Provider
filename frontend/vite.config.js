import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const proxyTarget = process.env.BACKEND_PROXY_TARGET
    || env.BACKEND_PROXY_TARGET 
    || process.env.VITE_BACKEND_URL 
    || env.VITE_BACKEND_URL 
    || "http://localhost:8080";

  return {
    envDir: "..",
    plugins: [tailwindcss(), react()],
    server: {
      host: true, 
      port: 5173,
      strictPort: true,
      allowedHosts: [
        'identity-provider.isaxbsit2027.com'
      ],

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