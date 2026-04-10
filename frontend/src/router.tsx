import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./ui/RootLayout";
import { GuestPage } from "./pages/GuestPage";
import { BookingPage } from "./pages/BookingPage";
import { AdminPage } from "./pages/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
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
