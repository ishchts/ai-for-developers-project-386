import "./instrument";
import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./app/providers/AppProviders";
import { router } from "./router";
import { AppErrorFallback } from "./ui/AppErrorFallback";
import "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
        <RouterProvider router={router} />
      </Sentry.ErrorBoundary>
    </AppProviders>
  </React.StrictMode>,
);
