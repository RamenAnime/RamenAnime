import { Component, type ReactNode } from "react";
import i18n from "i18next";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-bold">{i18n.t("errorBoundary.title")}</h1>
        <p className="text-muted-foreground">{i18n.t("errorBoundary.body")}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          {i18n.t("errorBoundary.refresh")}
        </button>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const reports = JSON.parse(localStorage.getItem("ramen_site_errors") || "[]");
    reports.unshift({
      id: "err_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      count: 1,
      status: "new",
    });
    localStorage.setItem("ramen_site_errors", JSON.stringify(reports.slice(0, 100)));
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
