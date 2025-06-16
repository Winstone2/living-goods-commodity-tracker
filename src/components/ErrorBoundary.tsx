import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-gray-500">Please try refreshing the page</p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {this.state.error?.message}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}