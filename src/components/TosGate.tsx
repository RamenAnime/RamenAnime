import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function TosGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { data: me, refetch } = trpc.auth.me.useQuery(undefined, { enabled: !!user });
  const accept = trpc.tos.accept.useMutation({
    onSuccess: () => {
      toast.success("Terms accepted");
      refetch();
      setTimeout(() => window.location.reload(), 300);
    },
    onError: (err) => toast.error(err.message),
  });
  const [show, setShow] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <>{children}</>;
  if (me && !me.hasAcceptedTos) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Please read and accept our Terms of Service to continue.</p>
            <div className="max-h-[40vh] overflow-y-auto border rounded p-3 text-sm space-y-2 bg-muted/30">
              <p><strong>1. Acceptance:</strong> By using Ramen Anime, you agree to these terms.</p>
              <p><strong>2. Content:</strong> Users are responsible for their own content.</p>
              <p><strong>3. Conduct:</strong> No harassment, illegal items, or fraudulent activity.</p>
              <p><strong>4. Marketplace:</strong> All sales are between users. We charge fees per transaction.</p>
              <p><strong>5. Privacy:</strong> We collect data to improve the platform.</p>
              <p><strong>6. Termination:</strong> We may ban users who violate these terms.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tos-check" checked={show} onChange={(e) => setShow(e.target.checked)} />
              <label htmlFor="tos-check" className="text-sm">I agree to the Terms of Service</label>
            </div>
            <Button disabled={!show || accept.isPending} onClick={() => accept.mutate()} className="w-full">
              {accept.isPending ? "Accepting..." : "Accept & Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}
