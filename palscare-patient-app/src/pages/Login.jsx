import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading: authLoading, user, getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (isAuthenticated && user) {
        setIsSyncing(true);
        try {
          // 1. Fetch live JWT Token from Auth0 (use ID token first as it's cached, fallback to access token)
          let token;
          try {
            const claims = await getIdTokenClaims();
            token = claims?.__raw;
          } catch (tokenErr) {
            token = await getAccessTokenSilently();
          }

          if (!token) {
            throw new Error("Could not retrieve authentication token.");
          }

          localStorage.setItem("palscare-token", token);

          // Store temporary user details
          localStorage.setItem("palscare-current-user", JSON.stringify({
            userId: user.sub,
            email: user.email,
            name: user.name || "Patient"
          }));

          // 2. Synchronize user with user-service
          try {
            await apiRequest("/api/v1/auth/register", "POST", { userType: "PATIENT" }, "PATIENT");
          } catch (regError) {
            console.log("Registration step completed or skipped:", regError.message);
          }

          toast.success("Welcome back!");
          navigate("/");

        } catch (error) {
          console.error("Auth sync failed", error);
          toast.error("Authentication sync failed: " + error.message);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (!authLoading) {
      handleAuthCallback();
    }
  }, [isAuthenticated, authLoading, user, getAccessTokenSilently, navigate]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  const showLoader = authLoading || isSyncing;

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 pb-8 pt-16">
      {/* Decorative background grids/blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-accent-soft opacity-30 blur-3xl" />
      
      <div className="z-10 mx-auto w-full max-w-md animate-fade-up">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero text-primary-foreground shadow-glow">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">Palscare</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your booking & health tracking portal</p>
        </div>

        {/* Card Panel */}
        <div className="mt-12 rounded-3xl bg-card/80 p-8 shadow-elevated backdrop-blur-xl border border-border/50 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {showLoader ? "Authenticating..." : "Patient Access Portal"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {showLoader 
              ? "Please wait while we establish a secure connection."
              : "Book doctor appointments, track medical records, and access virtual care."
            }
          </p>

          <div className="mt-8">
            {showLoader ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-xs text-muted-foreground">Synchronizing credentials with server...</p>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/95"
              >
                Log In / Register with Auth0
              </button>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Secure authentication powered by Auth0</span>
          </div>
        </div>
      </div>

      <div className="z-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Palscare Health. All rights reserved.
      </div>
    </div>
  );
}
