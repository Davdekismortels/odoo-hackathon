import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
