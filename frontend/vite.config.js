import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import sri from "vite-plugin-sri-gen";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const proxyTarget = process.env.BACKEND_PROXY_TARGET
    || env.BACKEND_PROXY_TARGET 
    || process.env.VITE_BACKEND_URL 
    || env.VITE_BACKEND_URL 
    || "http://localhost:8080";

  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setupTests.js',
    },
    envDir: "..",
    plugins: [
      tailwindcss(),
      react(),
      sri(),
      {
        name: "block-unsafe-vite-dep-version-query",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const requestUrl = new URL(req.url ?? "/", "http://localhost");

            if (!requestUrl.pathname.startsWith("/node_modules/.vite/deps/")) {
              next();
              return;
            }

            const versionParam = requestUrl.searchParams.get("v");

            if (!versionParam) {
              next();
              return;
            }

            const hasSafeVersionParam =
              /^[a-zA-Z0-9._-]+$/.test(versionParam) &&
              !versionParam.includes("..");

            if (hasSafeVersionParam) {
              next();
              return;
            }

            res.statusCode = 400;
            res.end("Bad Request");
          });
        },
      },
    ],
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