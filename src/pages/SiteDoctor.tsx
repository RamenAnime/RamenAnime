import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, Check, Copy, Wrench } from "lucide-react";

interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  component?: string;
  url: string;
  userAgent: string;
  count: number;
  status: "new" | "investigating" | "fixed";
  suggestedFix?: string;
}

function statusLabel(t: (key: string) => string, status: ErrorReport["status"]) {
  if (status === "new") return t("siteDoctor.statusNew");
  if (status === "investigating") return t("siteDoctor.statusInvestigating");
  return t("siteDoctor.statusFixed");
}

export default function SiteDoctor() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ramen_site_errors");
    if (stored) {
      try {
        setErrors(JSON.parse(stored));
      } catch {}
    }

    const handler = (event: ErrorEvent) => {
      const report: ErrorReport = {
        id: "err_" + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        count: 1,
        status: "new",
      };

      setErrors((prev) => {
        const existing = prev.find((e) => e.message === report.message);
        if (existing) {
          existing.count++;
          existing.timestamp = report.timestamp;
          return [...prev];
        }
        const updated = [report, ...prev].slice(0, 100);
        localStorage.setItem("ramen_site_errors", JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  const generateFix = (error: ErrorReport) => {
    let suggestion = "";

    if (error.message.includes("Cannot read properties of undefined")) {
      suggestion = `// Add optional chaining or null check:
const value = obj?.property ?? defaultValue;
// Or:
if (!obj) return null;`;
    } else if (error.message.includes("is not a function")) {
      suggestion = `// Check function exists before calling:
if (typeof myFunction === "function") {
  myFunction();
}`;
    } else if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
      suggestion = `// Add retry logic and error handling:
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
} catch (err) {
  console.error("Fetch failed:", err);
  // Show user-friendly error
}`;
    } else if (error.message.includes("React")) {
      suggestion = `// Check for common React issues:
// 1. Missing key prop in lists
// 2. State update during render
// 3. Hook called conditionally
// Review component lifecycle`;
    } else {
      suggestion = `// General debugging steps:
// 1. Add console.log before error line
// 2. Check data is loaded before use
// 3. Verify API response shape
// 4. Add try/catch block`;
    }

    setErrors((prev) =>
      prev.map((e) =>
        e.id === error.id ? { ...e, suggestedFix: suggestion, status: "investigating" } : e
      )
    );
    setSelectedError({ ...error, suggestedFix: suggestion, status: "investigating" });
  };

  const markFixed = (id: string) => {
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status: "fixed" } : e)));
    if (selectedError?.id === id) {
      setSelectedError({ ...selectedError, status: "fixed" });
    }
  };

  const clearAll = () => {
    setErrors([]);
    localStorage.removeItem("ramen_site_errors");
    setSelectedError(null);
  };

  const activeErrors = errors.filter((e) => e.status !== "fixed");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="w-6 h-6 text-destructive" />
          {t("siteDoctor.title")}
        </h1>
        <div className="flex gap-2">
          <Badge variant={activeErrors.length > 0 ? "destructive" : "default"}>
            {t("siteDoctor.activeIssues", { count: activeErrors.length })}
          </Badge>
          <Button variant="outline" size="sm" onClick={clearAll}>
            {t("siteDoctor.clearAll")}
          </Button>
        </div>
      </div>

      {errors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium">{t("siteDoctor.noErrors")}</p>
            <p className="text-muted-foreground">{t("siteDoctor.runningSmooth")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            {errors.map((error) => (
              <Card
                key={error.id}
                className={`cursor-pointer transition-colors ${selectedError?.id === error.id ? "border-primary" : ""} ${error.status === "fixed" ? "opacity-50" : ""}`}
                onClick={() => setSelectedError(error)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 ${error.status === "fixed" ? "text-green-500" : "text-destructive"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{error.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {error.count}x • {new Date(error.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        error.status === "new"
                          ? "destructive"
                          : error.status === "investigating"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {statusLabel(t, error.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            {selectedError ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">{t("siteDoctor.errorDetails")}</h3>
                    <p className="text-sm text-destructive">{selectedError.message}</p>
                  </div>

                  {selectedError.stack && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">
                        {t("siteDoctor.stackTrace")}
                      </h4>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-40">
                        {selectedError.stack}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{t("siteDoctor.url")}</span>{" "}
                      {selectedError.url}
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("siteDoctor.count")}</span>{" "}
                      {selectedError.count}
                    </div>
                  </div>

                  {selectedError.suggestedFix ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          {t("siteDoctor.suggestedFix")}
                        </h4>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          aria-label={t("a11y.copyToClipboard")}
                          onClick={() =>
                            navigator.clipboard.writeText(selectedError.suggestedFix || "")
                          }
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <pre className="bg-primary/5 border border-primary/20 p-3 rounded text-xs overflow-x-auto">
                        {selectedError.suggestedFix}
                      </pre>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("siteDoctor.reviewFix")}
                      </p>
                    </div>
                  ) : (
                    <Button onClick={() => generateFix(selectedError)} className="w-full">
                      <Wrench className="w-4 h-4 mr-2" />
                      {t("siteDoctor.generateFix")}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => markFixed(selectedError.id)}
                      disabled={selectedError.status === "fixed"}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t("siteDoctor.markFixed")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {t("siteDoctor.selectError")}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
