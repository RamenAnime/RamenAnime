import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
