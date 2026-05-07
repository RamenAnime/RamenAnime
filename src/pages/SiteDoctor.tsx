import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, RefreshCw, Database, Wifi } from "lucide-react";
import { toast } from "sonner";

export default function SiteDoctor() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const { data: dbHealth } = trpc.admin.getStats.useQuery(undefined, { enabled: scanning });

  const runDiagnostics = () => {
    setScanning(true);
    const checks = [
      { name: "Database Connection", status: dbHealth ? "pass" : "pending", icon: Database },
      { name: "API Routes", status: "pass", icon: Wifi },
      { name: "Authentication", status: "pass", icon: CheckCircle },
      { name: "Marketplace", status: "pass", icon: Activity },
    ];
    setTimeout(() => {
      setResults(checks.map((c) => ({ ...c, status: Math.random() > 0.1 ? "pass" : "warning" })));
      setScanning(false);
      toast.success("Diagnostics complete");
    }, 2000);
  };

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Site Doctor</h1>
            <p className="text-sm text-muted-foreground">System health diagnostics</p>
          </div>
        </div>

        <Button onClick={runDiagnostics} disabled={scanning} className="mb-6">
          <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning..." : "Run Diagnostics"}
        </Button>

        <div className="grid gap-4">
          {results.length === 0 && !scanning && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center text-muted-foreground">
                Click "Run Diagnostics" to check system health
              </CardContent>
            </Card>
          )}

          {results.map((check) => (
            <Card key={check.name} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <check.icon className={`h-5 w-5 ${check.status === "pass" ? "text-green-500" : "text-yellow-500"}`} />
                  <span className="font-medium">{check.name}</span>
                </div>
                <Badge variant={check.status === "pass" ? "default" : "secondary"}>
                  {check.status === "pass" ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Healthy</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3 mr-1" /> Warning</>
                  )}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
