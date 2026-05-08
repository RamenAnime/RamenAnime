import { useTranslation } from "react-i18next";
  import { useAuth } from "@/hooks/useAuth";
  import { Card, CardContent } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Send, User, MessageSquare } from "lucide-react";

  export default function Messages() {
    const { t } = useTranslation();
    const { user } = useAuth();

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("messages.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("messages.login_to_view")}</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-8 bg-background">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("messages.title")}</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-semibold mb-2">{t("messages.no_messages")}</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">{t("messages.coming_soon")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  