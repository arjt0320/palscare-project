import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { loginUser, registerUser } from "@/lib/mockData";
import { toast } from "sonner";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    
    // Simulate brief network delay
    setTimeout(() => {
      if (isLogin) {
        const res = loginUser(email, password);
        setIsLoading(false);
        if (res.success) {
          toast.success("Welcome back!", {
            description: "Successfully logged in to your Palscare portal."
          });
          navigate("/");
        } else {
          toast.error(res.message || "Failed to log in.");
        }
      } else {
        const res = registerUser(name, email, password);
        setIsLoading(false);
        if (res.success) {
          toast.success("Account created!", {
            description: "Welcome to Palscare. Your profile has been generated."
          });
          navigate("/");
        } else {
          toast.error(res.message || "Failed to register.");
        }
      }
    }, 1200);
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
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">Palscare</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your booking & health tracking portal</p>
        </div>

        {/* Tab Selector */}
        <div className="mt-8 flex rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setEmail("");
              setPassword("");
              setName("");
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
              setEmail("");
              setPassword("");
              setName("");
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
            {isLogin ? "Sign in to account" : "Create your account"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isLogin ? "Enter your email and password below" : "Get started by filling out your details"}
          </p>

          <div className="mt-6 space-y-4">
            {!isLogin && (
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
            )}

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

        {isLogin && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Mock login details: <span className="font-semibold text-foreground">alex.morgan@example.com</span> / <span className="font-semibold text-foreground">password123</span>
            </p>
          </div>
        )}
      </div>

      <div className="z-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Palscare Health. All mock rights reserved.
      </div>
    </div>
  );
}
