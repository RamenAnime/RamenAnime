import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Shield, ArrowLeft, UserPlus, LogIn, Eye, EyeOff, AlertCircle, Check, X, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

function PasswordRequirements({ password }: { password: string }) {
  const reqs = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character (!@#$% etc.)", met: /[@$!%*?&]/.test(password) },
  ];
  return (
    <div className="space-y-1 text-xs">
      {reqs.map((r) => (
        <div key={r.label} className={`flex items-center gap-1.5 ${r.met ? "text-emerald-400" : "text-muted-foreground"}`}>
          {r.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {r.label}
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { toast.success("Welcome back!"); navigate("/"); },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => { toast.success("Account created! Welcome to ラーメンアニメ."); navigate("/"); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password, email: email || undefined });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto mb-3">
              ラ
            </div>
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your ラーメンアニメ account" : "Join the anime community today"}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="your_username" required className="bg-muted/50" />
              </div>
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional, needed for password recovery)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" className="bg-muted/50" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Enter password" required className="bg-muted/50 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "register" && password && <PasswordRequirements password={password} />}
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (mode === "login" ? "Signing in..." : "Creating account...") : (
                  <>{mode === "login" ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}{mode === "login" ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              {mode === "login" ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No account?{" "}
                    <button onClick={() => { setMode("register"); setError(""); }} className="text-primary hover:underline font-medium">Create one</button>
                  </p>
                  <Link to="/forgot-password" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <KeyRound className="mr-1 h-3 w-3" /> Forgot password?
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} className="text-primary hover:underline font-medium">Sign in</button>
                </p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>512-bit scrypt password hashing</span>
              <span>|</span>
              <MessageCircle className="h-3 w-3" />
              <span>Secure session cookies</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
