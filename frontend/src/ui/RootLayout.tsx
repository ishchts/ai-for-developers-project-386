import { Link, NavLink, Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Call Booker
        </Link>
        <nav className="nav">
          <NavLink
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            end
            to="/"
          >
            Guest
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            to="/admin"
          >
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
