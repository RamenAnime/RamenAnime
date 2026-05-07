import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Log to Site Doctor
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
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">The error has been logged. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
