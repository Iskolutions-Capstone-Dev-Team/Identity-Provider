import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import sri from "vite-plugin-sri-gen";
import compression from "vite-plugin-compression2";
import { Plugin as importToCDN } from "vite-plugin-cdn-import";

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
      compression({ algorithm: "brotliCompress" }),
      compression({ algorithm: "gzip" }),
      importToCDN({
        modules: [
          {
            name: "react",
            var: "React",
            path: "https://cdn.jsdelivr.net/npm/react@19.2.3/umd/react.production.min.js",
          },
          {
            name: "react-dom",
            var: "ReactDOM",
            path: "https://cdn.jsdelivr.net/npm/react-dom@19.2.3/umd/react-dom.production.min.js",
          },
          {
            name: "axios",
            var: "axios",
            path: "https://cdn.jsdelivr.net/npm/axios@1.7.9/dist/axios.min.js",
          }
        ],
      }),
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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
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