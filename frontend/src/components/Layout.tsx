import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Calendar, Briefcase, FileText, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [avatarError, setAvatarError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?._id]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-lg sm:text-xl font-bold animated-gradient-text text-underline-gradient">
                Job Tracker
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-2">
                <Link to="/dashboard">
                  <Button
                    variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                    className="gap-2"
                    size="sm"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden lg:inline">Board</span>
                  </Button>
                </Link>
                <Link to="/dashboard/calendar">
                  <Button
                    variant={location.pathname === '/dashboard/calendar' ? 'default' : 'ghost'}
                    className="gap-2"
                    size="sm"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden lg:inline">Calendar</span>
                  </Button>
                </Link>
                <Link to="/dashboard/resumes">
                  <Button
                    variant={location.pathname === '/dashboard/resumes' ? 'default' : 'ghost'}
                    className="gap-2"
                    size="sm"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden lg:inline">Resumes</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              {user && (
                <div className="hidden sm:flex items-center gap-2">
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
                  <span className="text-sm hidden lg:inline font-medium">
                    {user.name || user.email}
                  </span>
                </div>
              )}
              <Button variant="ghost" onClick={() => logout()} className="gap-2" size="sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2">
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Board
                </Button>
              </Link>
              <Link to="/dashboard/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === '/dashboard/calendar' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Button>
              </Link>
              <Link to="/dashboard/resumes" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === '/dashboard/resumes' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Resumes
                </Button>
              </Link>
              {user && (
                <div className="flex items-center gap-2 pt-2 border-t">
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
                  <span className="text-sm font-medium flex-1">
                    {user.name || user.email}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

