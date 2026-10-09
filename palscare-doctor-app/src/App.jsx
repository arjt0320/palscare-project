import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.jsx";
import DoctorLogin from "./pages/DoctorLogin.jsx";
import DoctorOnboarding from "./pages/DoctorOnboarding.jsx";
import DoctorPortal from "./pages/DoctorPortal.jsx";
import { initDemoDoctorSession } from "./lib/mockData";

export default function App() {
  const isLoggedOut = typeof window !== "undefined" && localStorage.getItem("palscare-doctor-logged-out") === "true";
  
  if (!isLoggedOut) {
    initDemoDoctorSession();
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={isLoggedOut ? "/doctor/login" : "/doctor/portal"} replace />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/onboarding" element={<DoctorOnboarding />} />
          <Route path="/doctor/portal" element={<DoctorPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}
