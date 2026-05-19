import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium text-lg">{t("common.accessDenied")}</p>
          <p className="text-muted-foreground text-sm mt-1">{t("common.accessDeniedAdmin")}</p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
