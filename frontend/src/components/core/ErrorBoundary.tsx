import React from 'react';
import { AlertTriangle } from 'lucide-react';

// ==========================================
// ERROR BOUNDARY
// ==========================================

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("UI Error Caught:", error, errorInfo);
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#10221C] p-4 text-center">
                    <div className="max-w-md rounded-xl bg-white dark:bg-[#17262C] p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">We encountered an issue rendering this section of your portfolio builder.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
