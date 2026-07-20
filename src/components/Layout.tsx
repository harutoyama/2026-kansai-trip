import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="app-shell">
      <main
        className={`safe-bottom app-main ${isHome ? "app-main-home" : "app-main-page"}`}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
