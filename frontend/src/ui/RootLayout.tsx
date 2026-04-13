import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";

export function RootLayout() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          {t("common.appName")}
        </Link>
        <nav className="nav">
          <NavLink
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            end
            to="/"
          >
            {t("nav.guest")}
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            to="/admin"
          >
            {t("nav.admin")}
          </NavLink>
        </nav>
      </header>
      <main className="page">
        <div className="page-shell">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
