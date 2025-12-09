import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/LoadingSpinner';

// Code splitting - Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ResumeManagerPage = lazy(() => import('./pages/ResumeManagerPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Layout = lazy(() => import('./components/Layout'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LandingPage />
              </Suspense>
            } 
          />
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            } 
          />
          <Route 
            path="/auth/callback" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AuthCallback />
              </Suspense>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Layout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route 
              index 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <DashboardPage />
                </Suspense>
              } 
            />
            <Route 
              path="calendar" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CalendarPage />
                </Suspense>
              } 
            />
            <Route 
              path="resumes" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
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

