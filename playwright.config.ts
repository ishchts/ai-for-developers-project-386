import { defineConfig } from "@playwright/test";

const backendHost = "127.0.0.1";
const backendPort = 18080;
const frontendHost = "127.0.0.1";
const frontendPort = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://${frontendHost}:${frontendPort}`,
    timezoneId: "UTC",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: `HOST=${backendHost} PORT=${backendPort} TZ=UTC npm start`,
      url: `http://${backendHost}:${backendPort}/healthz`,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120 * 1000,
    },
    {
      command: `VITE_API_PROXY_TARGET=http://${backendHost}:${backendPort} npm run dev --prefix frontend -- --host ${frontendHost} --port ${frontendPort}`,
      url: `http://${frontendHost}:${frontendPort}`,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120 * 1000,
    },
  ],
});
