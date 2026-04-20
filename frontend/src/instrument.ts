import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { API_BASE_URL } from "./lib/config";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();
const sentryEnvironment =
  import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() || import.meta.env.MODE;
const sentryRelease =
  import.meta.env.VITE_SENTRY_RELEASE?.trim() ||
  import.meta.env.VITE_APP_VERSION?.trim() ||
  undefined;
const tracePropagationTargets = Array.from(
  new Set(["localhost", window.location.origin, API_BASE_URL]),
);

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),
  environment: sentryEnvironment,
  release: sentryRelease,
  sendDefaultPii: true,
  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
  tracePropagationTargets,
  replaysSessionSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,
});
