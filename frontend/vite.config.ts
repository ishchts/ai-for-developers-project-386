import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:4010";
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN?.trim();
  const sentryOrg = env.SENTRY_ORG?.trim();
  const sentryProject = env.SENTRY_PROJECT?.trim();
  const sentryPlugins =
    sentryAuthToken && sentryOrg && sentryProject
      ? sentryVitePlugin({
          authToken: sentryAuthToken,
          org: sentryOrg,
          project: sentryProject,
        })
      : [];

  return {
    build: {
      sourcemap: "hidden",
    },
    plugins: [react(), tailwindcss(), ...sentryPlugins],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
