import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Phone, ShieldCheck, Stethoscope } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export default function DoctorLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState(""); // For login (email or phone)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleAuthRedirect = async (userId, userEmail, userPhone, userType) => {
    try {
      // Fetch user profile status
      const profile = await apiRequest("/api/v1/doctors/profile", "GET", null, "DOCTOR");
      
      // Check if registration number has been completed (i.e. is not default REG- prefix)
      // and other personal details are filled
      if (profile && profile.registrationNumber && !profile.registrationNumber.startsWith("REG-") && profile.experienceYears) {
        toast.success("Welcome back, Dr. " + profile.name.replace("Dr. ", "") + "!");
        navigate("/doctor/portal");
      } else {
        toast.info("Please complete your clinical onboarding setup.");
        navigate("/doctor/onboarding");
      }
    } catch (profileError) {
      toast.info("Please complete your clinical onboarding setup.");
      navigate("/doctor/onboarding");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (isLogin) {
      if (!identifier || !password) {
        toast.error("Please fill in all fields.");
        return;
      }
    } else {
      if (!name || !email || !password) {
        toast.error("Name, Email, and Password are required for registration.");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Log In
        const res = await apiRequest("/api/v1/auth/login", "POST", {
          identifier,
          password,
          userType: "DOCTOR"
        }, "DOCTOR");

        localStorage.setItem("palscare-token", res.token);
        localStorage.setItem("palscare-current-user", JSON.stringify({
          userId: res.userId,
          email: res.email,
          phone: res.phone,
          name: res.name
        }));

        await handleAuthRedirect(res.userId, res.email, res.phone, "DOCTOR");
      } else {
        // Register
        const res = await apiRequest("/api/v1/auth/register", "POST", {
          name,
          email,
          phone,
          password,
          userType: "DOCTOR"
        }, "DOCTOR");

        localStorage.setItem("palscare-token", res.token);
        localStorage.setItem("palscare-current-user", JSON.stringify({
          userId: res.userId,
          email: res.email,
          phone: res.phone,
          name: res.name
        }));

        toast.success("Account created successfully!");
        navigate("/doctor/onboarding");
      }
    } catch (error) {
      console.error("Auth failed", error);
      toast.error(error.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 pb-8 pt-16">
      {/* Decorative background grids/blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-accent-soft opacity-30 blur-3xl" />
      
      <div className="z-10 mx-auto w-full max-w-md animate-fade-up">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero text-primary-foreground shadow-glow">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">Palscare</h1>
          <p className="mt-2 text-sm text-muted-foreground">Doctor Consultation & Portal Management</p>
        </div>

        {/* Tab Selector */}
        <div className="mt-8 flex rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setPassword("");
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
              isLogin ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setPassword("");
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
              !isLogin ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="mt-6 rounded-3xl bg-card/80 p-6 shadow-elevated backdrop-blur-xl border border-border/50">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {isLogin ? "Sign in as Doctor" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isLogin ? "Enter your email/phone and password below" : "Register a new clinical account to get started"}
          </p>

          <div className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Dr. Sarah Smith)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Email or Phone Number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/95 disabled:opacity-75"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : isLogin ? (
              "Log In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>

      <div className="z-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Palscare Health. All rights reserved.
      </div>
    </div>
  );
}
