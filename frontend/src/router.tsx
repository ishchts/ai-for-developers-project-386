import * as Sentry from "@sentry/react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./ui/RootLayout";
import { GuestPage } from "./pages/GuestPage";
import { BookingPage } from "./pages/BookingPage";
import { AdminPage } from "./pages/AdminPage";
import { RouteErrorBoundary } from "./ui/RouteErrorBoundary";

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <GuestPage />,
      },
      {
        path: "book/:eventTypeId",
        element: <BookingPage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
    ],
  },
]);
