import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { InlineMessage } from "../components/common/InlineMessage";

function toRouteError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (isRouteErrorResponse(error)) {
    return new Error(`${error.status} ${error.statusText}`);
  }

  if (typeof error === "string" && error) {
    return new Error(error);
  }

  return new Error("Unknown route error");
}

export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const routeError = useRouteError();

  useEffect(() => {
    if (isRouteErrorResponse(routeError)) {
      Sentry.captureException(toRouteError(routeError), {
        extra: {
          data: routeError.data,
          status: routeError.status,
          statusText: routeError.statusText,
        },
      });
      return;
    }

    if (routeError instanceof Error) {
      Sentry.captureException(routeError);
      return;
    }

    Sentry.captureException(toRouteError(routeError), {
      extra: {
        routeError,
      },
    });
  }, [routeError]);

  const message = isRouteErrorResponse(routeError)
    ? `${routeError.status} ${routeError.statusText}`
    : t("states.routeErrorMessage");

  return (
    <main className="page">
      <div className="page-shell">
        <Card as="section" elevated>
          <InlineMessage title={t("states.routeErrorTitle")} message={message} tone="error">
            <Button onClick={() => window.location.reload()}>{t("common.refresh")}</Button>
          </InlineMessage>
        </Card>
      </div>
    </main>
  );
}
