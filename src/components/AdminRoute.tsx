import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
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
          <p className="text-destructive font-medium text-lg">Access denied</p>
          <p className="text-muted-foreground text-sm mt-1">
            This area is restricted to administrators only.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
