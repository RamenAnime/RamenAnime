import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
            <CardTitle className="text-2xl font-bold text-gradient-gold">Welcome to Ramen Anime</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to access the social forum, create your profile, and connect with fellow anime fans.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              Sign in with Kimi
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Before you join</span>
              </div>
            </div>
            <Link to="/terms" className="block">
              <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                <Shield className="mr-2 h-4 w-4" />
                Read Terms of Service
              </Button>
            </Link>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
              <MessageCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <p>
                By signing in, you agree to our Terms of Service. You must accept the Terms before accessing the social forum.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
