import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import ThemeToggle from '../ThemeToggle';
import { ShimmerButton } from '../effects';

interface NavbarProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

function Navbar({ scrolled, mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-200 ${scrolled ? 'h-14 sm:h-14' : 'h-16 sm:h-16'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Job Tracker</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">Sign In</Button>
            </Link>
            <Link to="/login">
              <ShimmerButton className="h-9 px-4 text-white text-sm font-medium">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </ShimmerButton>
            </Link>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700 dark:text-slate-200" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200 font-medium">Sign In</Link>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
            <ShimmerButton className="w-full h-11 text-white">Get Started Free</ShimmerButton>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default memo(Navbar);

