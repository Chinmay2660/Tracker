import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

function Footer() {
  return (
    <footer className="py-6 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">Job Tracker</span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400">© 2025 Job Tracker. Built with ❤️</p>
      </div>
    </footer>
  );
}

export default memo(Footer);

