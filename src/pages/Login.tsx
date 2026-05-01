import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Shield, ArrowLeft, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Welcome back!");
      await utils.invalidate();
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message || "Login failed");
      setLoading(false);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success("Account created! Welcome to ラーメンアニメ.");
      await utils.invalidate();
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed");
      setLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password, email: email || undefined });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto">
              ラ
            </div>
            <CardTitle className="text-2xl font-bold text-gradient-gold">
              {mode === "login" ? "Welcome Back" : "Join ラーメンアニメ"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your profile, forum, and marketplace."
                : "Create an account to connect with fellow anime fans."}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  className="bg-background/50"
                />
                {mode === "register" && (
                  <p className="text-xs text-muted-foreground">
                    3-30 characters. Letters, numbers, and underscores only.
                  </p>
                )}
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "register" && (
                  <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : mode === "login" ? (
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </span>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {mode === "login" ? "New here?" : "Already a member?"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setUsername("");
                setPassword("");
                setEmail("");
              }}
            >
              {mode === "login" ? (
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create an account
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in to existing account
                </span>
              )}
            </Button>

            <Link to="/terms" className="block">
              <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                <Shield className="mr-2 h-4 w-4" />
                Read Terms of Service
              </Button>
            </Link>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
              <MessageCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <p>
                By creating an account or signing in, you agree to our Terms of Service. You must be 18+ to access the social forum and marketplace.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
