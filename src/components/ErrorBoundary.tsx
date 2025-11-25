import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Terjadi Kesalahan</h1>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Maaf, terjadi kesalahan yang tidak terduga. Silakan refresh halaman atau hubungi admin.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40">
                            <code className="text-xs text-red-400 font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition"
                        >
                            Refresh Halaman
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
