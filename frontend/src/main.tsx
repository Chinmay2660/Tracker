import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status !== undefined && status >= 400 && status < 500) {
        return false;
    }
    return failureCount < 1;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: shouldRetryQuery,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
        },
    },
});
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>);
