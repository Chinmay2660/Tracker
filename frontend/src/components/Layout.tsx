import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Calendar, Briefcase, FileText, LogOut, User as UserIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?._id]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold animated-gradient-text text-underline-gradient">
              Job Tracker
            </Link>
            <div className="flex gap-4">
              <Link to="/dashboard">
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Board
                </Button>
              </Link>
              <Link to="/dashboard/calendar">
                <Button
                  variant={location.pathname === '/dashboard/calendar' ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Button>
              </Link>
              <Link to="/dashboard/resumes">
                <Button
                  variant={location.pathname === '/dashboard/resumes' ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Resumes
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="h-8 w-8 rounded-full border-2 border-border object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="text-sm hidden sm:inline font-medium">
                  {user.name || user.email}
                </span>
              </div>
            )}
            <Button variant="ghost" onClick={() => logout()} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

