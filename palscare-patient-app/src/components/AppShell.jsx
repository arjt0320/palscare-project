import { Outlet, Navigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const token = localStorage.getItem("palscare-token");
  const currentUser = localStorage.getItem("palscare-current-user");
  const location = useLocation();

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  
  const hideBottomNav = location.pathname.startsWith("/doctor");

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-background pb-24 shadow-elevated">
        <Outlet />
        {/* <BottomNav /> */}
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
