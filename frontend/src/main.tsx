import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'

// Lazy load non-critical components
const Toaster = lazy(() => import('./components/ui/toaster').then(m => ({ default: m.Toaster })));

// Optimized QueryClient with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - reduces refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - keeps data in cache longer
    },
  },
})

// Mark performance for debugging
if (typeof performance !== 'undefined') {
  performance.mark('app-init-start');
}

// Use concurrent features for faster hydration
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

// Mark when app is fully rendered
if (typeof performance !== 'undefined') {
  requestIdleCallback?.(() => {
    performance.mark('app-init-end');
    performance.measure('app-init', 'app-init-start', 'app-init-end');
  });
}

