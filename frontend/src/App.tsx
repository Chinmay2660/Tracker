import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Skeleton } from './components/ui/skeleton';

// Code splitting - Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ResumeManagerPage = lazy(() => import('./pages/ResumeManagerPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));
const Layout = lazy(() => import('./components/Layout'));

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

  // Show offline page if offline
  if (!isOnline) {
    return (
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
        }>
          <Routes>
            <Route path="*" element={<OfflinePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
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
              <Suspense fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-48 mx-auto" />
                  </div>
                </div>
              }>
                <AuthCallback />
              </Suspense>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
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
                  <Layout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route 
              index 
              element={
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
                  <DashboardPage />
                </Suspense>
              } 
            />
            <Route 
              path="calendar" 
              element={
                <Suspense fallback={
                  <div className="min-h-screen bg-background">
                    <div className="container mx-auto px-4 py-8">
                      <Skeleton className="h-9 w-48 mb-6" />
                      <Skeleton className="h-[600px] w-full rounded-lg" />
                    </div>
                  </div>
                }>
                  <CalendarPage />
                </Suspense>
              } 
            />
            <Route 
              path="resumes" 
              element={
                <Suspense fallback={
                  <div className="min-h-screen bg-background">
                    <div className="container mx-auto px-4 py-8">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <Skeleton className="h-9 w-48 mb-2" />
                          <Skeleton className="h-5 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="p-4 bg-background rounded-lg border border-border">
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-24 mb-4" />
                            <div className="flex gap-2">
                              <Skeleton className="h-10 flex-1" />
                              <Skeleton className="h-10 w-10" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                }>
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

