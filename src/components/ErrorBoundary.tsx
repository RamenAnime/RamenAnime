import { Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-xl font-bold text-destructive">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">An error occurred. Try refreshing the page.</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                Reload Page
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
