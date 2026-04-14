import { lazy, Suspense, useEffect, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useAuthStore } from './store/useAuthStore';
import DashboardSkeleton from './components/DashboardSkeleton';
import { Skeleton } from './components/ui/skeleton';
import OfflinePage from './pages/OfflinePage';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const InterviewsPage = lazy(() => import('./pages/InterviewsPage'));
const HrContactsPage = lazy(() => import('./pages/HrContactsPage'));
const ResumeManagerPage = lazy(() => import('./pages/ResumeManagerPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Layout = lazy(() => import('./components/Layout'));
const MinimalSkeleton = memo(() => (<div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '10rem', height: '1.5rem', borderRadius: '0.375rem' }}/>
      <div className="skeleton" style={{ width: '6rem', height: '2.25rem', borderRadius: '0.5rem' }}/>
    </div>
    
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(7)].map((_, i) => (<div key={i} className="skeleton" style={{ height: '1rem', borderRadius: '0.25rem' }}/>))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (<div key={i} className="skeleton" style={{ height: '4rem', borderRadius: '0.375rem' }}/>))}
      </div>
    </div>
  </div>));
const CalendarSkeleton = memo(() => (<div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '8rem', height: '1.75rem', borderRadius: '0.375rem' }}/>
      <div className="skeleton" style={{ width: '7rem', height: '2.25rem', borderRadius: '0.5rem' }}/>
    </div>
    
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      
      <div className="flex justify-between items-center mb-4">
        <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem' }}/>
        <div className="skeleton" style={{ width: '10rem', height: '1.5rem', borderRadius: '0.375rem' }}/>
        <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem' }}/>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[...Array(7)].map((_, i) => (<div key={i} className="skeleton" style={{ height: '1.5rem', borderRadius: '0.25rem' }}/>))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {[...Array(42)].map((_, i) => (<div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '0.375rem' }}/>))}
      </div>
    </div>
  </div>));
const ResumeSkeleton = memo(() => (<div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '8rem', height: '1.75rem', borderRadius: '0.375rem' }}/>
      <div className="skeleton" style={{ width: '8rem', height: '2.25rem', borderRadius: '0.5rem' }}/>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (<div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="skeleton" style={{ width: '70%', height: '1.25rem', borderRadius: '0.25rem', marginBottom: '0.75rem' }}/>
          <div className="skeleton" style={{ width: '50%', height: '1rem', borderRadius: '0.25rem', marginBottom: '0.5rem' }}/>
          <div className="skeleton" style={{ width: '40%', height: '0.875rem', borderRadius: '0.25rem', marginBottom: '1rem' }}/>
          <div className="flex gap-2">
            <div className="skeleton" style={{ width: '4rem', height: '2rem', borderRadius: '0.375rem' }}/>
            <div className="skeleton" style={{ width: '4rem', height: '2rem', borderRadius: '0.375rem' }}/>
          </div>
        </div>))}
    </div>
  </div>));
const HrContactsSkeleton = memo(() => (<div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '10rem', height: '1.75rem', borderRadius: '0.375rem' }}/>
      <div className="skeleton" style={{ width: '9rem', height: '2.25rem', borderRadius: '0.5rem' }}/>
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (<div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="skeleton" style={{ width: '60%', height: '1.25rem', borderRadius: '0.25rem', marginBottom: '0.75rem' }}/>
          <div className="skeleton" style={{ width: '40%', height: '1rem', borderRadius: '0.25rem' }}/>
        </div>))}
    </div>
  </div>));
const InterviewsSkeleton = memo(() => (<div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
    
    <div className="flex justify-between items-center mb-6">
      <div className="skeleton" style={{ width: '8rem', height: '1.75rem', borderRadius: '0.375rem' }}/>
      <div className="skeleton" style={{ width: '8rem', height: '2.25rem', borderRadius: '0.5rem' }}/>
    </div>
    
    <div className="flex items-center gap-3 mb-6">
      <div className="skeleton" style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem' }}/>
      <div className="skeleton" style={{ width: '11rem', height: '2.75rem', borderRadius: '0.5rem' }}/>
    </div>
    
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (<div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="skeleton" style={{ width: '40%', height: '1.25rem', borderRadius: '0.25rem' }}/>
              <div className="skeleton" style={{ width: '30%', height: '1rem', borderRadius: '0.25rem' }}/>
              <div className="skeleton" style={{ width: '25%', height: '1rem', borderRadius: '0.25rem' }}/>
            </div>
            <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem' }}/>
          </div>
        </div>))}
    </div>
  </div>));
function AuthenticatedRedirect({ children }: {
    children: React.ReactNode;
}) {
    const token = useAuthStore((s) => s.token);
    const { user, isLoading } = useAuth();
    if (!token) {
        return <>{children}</>;
    }
    if (isLoading) {
        return (<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-lg"/>
          <p className="text-sm text-slate-500 dark:text-slate-400">Signing you in…</p>
        </div>
      </div>);
    }
    if (user) {
        return <Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
}
function ProtectedRoute({ children }: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (<div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-9 w-48 mb-6"/>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (<div key={i} className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-24"/>
                  <Skeleton className="h-6 w-8"/>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (<div key={j} className="p-4 bg-background rounded-lg border border-border">
                      <Skeleton className="h-5 w-32 mb-2"/>
                      <Skeleton className="h-4 w-24 mb-2"/>
                      <Skeleton className="h-4 w-20"/>
                    </div>))}
                </div>
              </div>))}
          </div>
        </div>
      </div>);
    }
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    return <>{children}</>;
}
function App() {
    const isOnline = useOnlineStatus();
    const { checkSessionExpiry, refreshSession } = useAuthStore();
    useEffect(() => {
        checkSessionExpiry();
        const interval = setInterval(() => {
            checkSessionExpiry();
        }, 60 * 1000);
        const handleActivity = () => {
            refreshSession();
        };
        window.addEventListener('click', handleActivity);
        window.addEventListener('keydown', handleActivity);
        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keydown', handleActivity);
        };
    }, [checkSessionExpiry, refreshSession]);
    if (!isOnline) {
        return <OfflinePage />;
    }
    return (<BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-9 w-48 mb-6"/>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (<div key={i} className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-24"/>
                    <Skeleton className="h-6 w-8"/>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (<div key={j} className="p-4 bg-background rounded-lg border border-border">
                        <Skeleton className="h-5 w-32 mb-2"/>
                        <Skeleton className="h-4 w-24 mb-2"/>
                        <Skeleton className="h-4 w-20"/>
                      </div>))}
                  </div>
                </div>))}
            </div>
          </div>
        </div>}>
        <Routes>
          <Route path="/" element={<AuthenticatedRedirect>
                <Suspense fallback={<div className="min-h-screen bg-background">
                    <div className="container mx-auto px-4 py-8">
                      <Skeleton className="h-12 w-64 mb-8"/>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-96 w-full"/>
                        <Skeleton className="h-96 w-full"/>
                      </div>
                    </div>
                  </div>}>
                  <LandingPage />
                </Suspense>
              </AuthenticatedRedirect>}/>
          <Route path="/login" element={<AuthenticatedRedirect>
                <Suspense fallback={<div className="min-h-screen bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
                      <Skeleton className="h-full w-full"/>
                      <Skeleton className="h-full w-full"/>
                    </div>
                  </div>}>
                  <LoginPage />
                </Suspense>
              </AuthenticatedRedirect>}/>
          <Route path="/auth/callback" element={<Suspense fallback={<MinimalSkeleton />}>
                <AuthCallback />
              </Suspense>}/>
          <Route path="/dashboard" element={<ProtectedRoute>
                <Suspense fallback={<DashboardSkeleton />}>
                  <Layout />
                </Suspense>
              </ProtectedRoute>}>
            <Route index element={<Suspense fallback={<DashboardSkeleton />}>
                  <DashboardPage />
                </Suspense>}/>
            <Route path="calendar" element={<Suspense fallback={<CalendarSkeleton />}>
                  <CalendarPage />
                </Suspense>}/>
            <Route path="interviews" element={<Suspense fallback={<InterviewsSkeleton />}>
                  <InterviewsPage />
                </Suspense>}/>
            <Route path="hr-contacts" element={<Suspense fallback={<HrContactsSkeleton />}>
                  <HrContactsPage />
                </Suspense>}/>
            <Route path="resumes" element={<Suspense fallback={<ResumeSkeleton />}>
                  <ResumeManagerPage />
                </Suspense>}/>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>);
}
export default App;
