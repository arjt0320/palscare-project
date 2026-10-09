import { Outlet, Navigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { initDemoSession } from "@/lib/mockData";

export function AppShell() {
  const location = useLocation();

  const isLoggedOut = localStorage.getItem("palscare-logged-out") === "true";
  let token = localStorage.getItem("palscare-token");
  let currentUser = localStorage.getItem("palscare-current-user");

  if (!isLoggedOut && (!token || !currentUser)) {
    initDemoSession();
    token = localStorage.getItem("palscare-token");
    currentUser = localStorage.getItem("palscare-current-user");
  }

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const hideBottomNav = location.pathname.startsWith("/doctor");

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-background pb-24 shadow-elevated">
        <Outlet />
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
