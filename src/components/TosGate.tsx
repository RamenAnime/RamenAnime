import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";
import { LOGIN_PATH } from "@/const";
import { useTranslation } from "react-i18next";

export default function TosGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: tosStatus, isLoading: tosLoading } = trpc.tos.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const acceptMutation = trpc.tos.accept.useMutation({
    onSuccess: () => {
      utils.tos.getStatus.invalidate();
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(LOGIN_PATH);
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || tosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (tosStatus?.needsAcceptance) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{t("terms.acceptRequired")}</h1>
                <p className="text-muted-foreground">{t("terms.acceptDesc")}</p>
              </div>
              <div className="text-left bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-2 max-h-64 overflow-y-auto">
                <p>By clicking "Accept", you agree to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Be at least 13 years of age (18 without parental consent)</li>
                  <li>Not post hateful, threatening, or explicit content</li>
                  <li>Not harass or abuse other community members</li>
                  <li>Not use the service for spam or unsolicited advertising</li>
                  <li>Respect intellectual property rights</li>
                  <li>Accept our data processing practices</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() =>
                    acceptMutation.mutate({
                      accepted: true,
                      ipAddress: undefined,
                      userAgent: navigator.userAgent,
                    })
                  }
                  disabled={acceptMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {acceptMutation.isPending ? "Accepting..." : t("terms.acceptBtn")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/50"
                  onClick={() => navigate("/terms")}
                >
                  {t("terms.readFull")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
