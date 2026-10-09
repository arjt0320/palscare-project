import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { loginUser, registerUser, defaultPatient } from "@/lib/mockData";
import { toast } from "sonner";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("alex.morgan@example.com"); // Pre-filled for demo ease
  const [password, setPassword] = useState("password123"); // Pre-filled for demo ease
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleQuickDemo = () => {
    setIsLoading(true);
    localStorage.removeItem("palscare-logged-out");
    loginUser("alex.morgan@example.com", "password123");
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome, Alex Morgan!", {
        description: "Logged in as Demo Patient.",
      });
      navigate("/");
    }, 400);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isLogin) {
      if (!identifier) {
        toast.error("Please enter your email or phone number.");
        return;
      }
    } else {
      if (!name || !email) {
        toast.error("Name and email are required for registration.");
        return;
      }
    }

    setIsLoading(true);
    localStorage.removeItem("palscare-logged-out");

    setTimeout(() => {
      setIsLoading(false);
      if (isLogin) {
        loginUser(identifier, password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        registerUser(name, email, password);
        toast.success("Account created successfully!");
        navigate("/profile");
      }
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 pb-8 pt-12">
      {/* Decorative background grids/blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-accent-soft opacity-30 blur-3xl" />

      <div className="z-10 mx-auto w-full max-w-md animate-fade-up">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero text-primary-foreground shadow-glow">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">PalsCare</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your modern health tracking & booking portal</p>
        </div>

        {/* Quick Demo Access Pill */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary-soft/60 px-4 py-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground shadow-soft"
          >
            <Sparkles className="h-4 w-4 transition group-hover:scale-110" />
            <span>One-Click Demo Login (Alex Morgan)</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-5 flex rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setIdentifier("alex.morgan@example.com");
              setPassword("password123");
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
              setName("");
              setEmail("");
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
        <form onSubmit={handleSubmit} className="mt-5 rounded-3xl bg-card/80 p-6 shadow-elevated backdrop-blur-xl border border-border/50">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {isLogin ? "Sign in to your account" : "Create your demo account"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isLogin ? "Enter your email/phone and password" : "Get started with instant demo registration"}
          </p>

          <div className="mt-5 space-y-3.5">
            {!isLogin && (
              <>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Full Name"
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
        Demo Mode • No server required
      </div>
    </div>
  );
}
