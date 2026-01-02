import { lazy, Suspense, useEffect, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useAuthStore } from './store/useAuthStore';
import DashboardSkeleton from './components/DashboardSkeleton';
import { Skeleton } from './components/ui/skeleton';
// OfflinePage is NOT lazy loaded - it must be available immediately when offline
import OfflinePage from './pages/OfflinePage';

// Code splitting - Lazy load pages with preload hints
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const InterviewsPage = lazy(() => import('./pages/InterviewsPage'));
const ResumeManagerPage = lazy(() => import('./pages/ResumeManagerPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Layout = lazy(() => import('./components/Layout'));

// Minimal page skeleton - shows content structure instead of a spinner
const MinimalSkeleton = memo(() => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    {/* Header skeleton */}
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '10rem', height: '1.5rem', borderRadius: '0.375rem' }} />
      <div className="skeleton" style={{ width: '6rem', height: '2.25rem', borderRadius: '0.5rem' }} />
    </div>
    {/* Content skeleton */}
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '1rem', borderRadius: '0.25rem' }} />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '4rem', borderRadius: '0.375rem' }} />
        ))}
      </div>
    </div>
  </div>
));

// Calendar page skeleton
const CalendarSkeleton = memo(() => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '8rem', height: '1.75rem', borderRadius: '0.375rem' }} />
      <div className="skeleton" style={{ width: '7rem', height: '2.25rem', borderRadius: '0.5rem' }} />
    </div>
    {/* Calendar grid */}
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      {/* Navigation bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem' }} />
        <div className="skeleton" style={{ width: '10rem', height: '1.5rem', borderRadius: '0.375rem' }} />
        <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem' }} />
      </div>
      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '1.5rem', borderRadius: '0.25rem' }} />
        ))}
      </div>
      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(42)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '0.375rem' }} />
        ))}
      </div>
    </div>
  </div>
));

// Resume page skeleton
const ResumeSkeleton = memo(() => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '8rem', height: '1.75rem', borderRadius: '0.375rem' }} />
      <div className="skeleton" style={{ width: '8rem', height: '2.25rem', borderRadius: '0.5rem' }} />
    </div>
    {/* Resume cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="skeleton" style={{ width: '70%', height: '1.25rem', borderRadius: '0.25rem', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ width: '50%', height: '1rem', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ width: '40%', height: '0.875rem', borderRadius: '0.25rem', marginBottom: '1rem' }} />
          <div className="flex gap-2">
            <div className="skeleton" style={{ width: '4rem', height: '2rem', borderRadius: '0.375rem' }} />
            <div className="skeleton" style={{ width: '4rem', height: '2rem', borderRadius: '0.375rem' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
));

// Interviews page skeleton
const InterviewsSkeleton = memo(() => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '8rem', height: '1.75rem', borderRadius: '0.375rem' }} />
      <div className="skeleton" style={{ width: '8rem', height: '2.25rem', borderRadius: '0.5rem' }} />
    </div>
    {/* Filter */}
    <div className="flex items-center gap-3 mb-6">
      <div className="skeleton" style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem' }} />
      <div className="skeleton" style={{ width: '11rem', height: '2.75rem', borderRadius: '0.5rem' }} />
    </div>
    {/* Interview cards */}
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="skeleton" style={{ width: '40%', height: '1.25rem', borderRadius: '0.25rem' }} />
              <div className="skeleton" style={{ width: '30%', height: '1rem', borderRadius: '0.25rem' }} />
              <div className="skeleton" style={{ width: '25%', height: '1rem', borderRadius: '0.25rem' }} />
            </div>
            <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-9 w-48 mb-6" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-8" />
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="p-4 bg-background rounded-lg border border-border">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const isOnline = useOnlineStatus();
  const { checkSessionExpiry, refreshSession } = useAuthStore();

  // Check session expiry on app load and periodically
  useEffect(() => {
    // Check immediately on load
    checkSessionExpiry();

    // Check every minute
    const interval = setInterval(() => {
      checkSessionExpiry();
    }, 60 * 1000);

    // Refresh session on user activity
    const handleActivity = () => {
      refreshSession();
    };

    // Listen to user activity events
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [checkSessionExpiry, refreshSession]);

  // Show offline page if offline - OfflinePage is bundled, no lazy loading needed
  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-9 w-48 mb-6" />
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="p-4 bg-background rounded-lg border border-border">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <Routes>
          <Route 
            path="/" 
            element={
              <Suspense fallback={
                <div className="min-h-screen bg-background">
                  <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Skeleton className="h-96 w-full" />
                      <Skeleton className="h-96 w-full" />
                    </div>
                  </div>
                </div>
              }>
                <LandingPage />
              </Suspense>
            } 
          />
          <Route 
            path="/login" 
            element={
              <Suspense fallback={
                <div className="min-h-screen bg-background">
                  <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
                    <Skeleton className="h-full w-full" />
                    <Skeleton className="h-full w-full" />
                  </div>
                </div>
              }>
                <LoginPage />
              </Suspense>
            } 
          />
          <Route 
            path="/auth/callback" 
            element={
              <Suspense fallback={<MinimalSkeleton />}>
                <AuthCallback />
              </Suspense>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <Layout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route 
              index 
              element={
                <Suspense fallback={<DashboardSkeleton />}>
                  <DashboardPage />
                </Suspense>
              } 
            />
            <Route 
              path="calendar" 
              element={
                <Suspense fallback={<CalendarSkeleton />}>
                  <CalendarPage />
                </Suspense>
              } 
            />
            <Route 
              path="interviews" 
              element={
                <Suspense fallback={<InterviewsSkeleton />}>
                  <InterviewsPage />
                </Suspense>
              } 
            />
            <Route 
              path="resumes" 
              element={
                <Suspense fallback={<ResumeSkeleton />}>
                  <ResumeManagerPage />
                </Suspense>
              } 
            />
          </Route>
          {/* Redirect root to dashboard if authenticated, otherwise to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

