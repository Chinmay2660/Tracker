import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShimmerButton } from '../effects';

function CTASection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto scroll-reveal-scale">
        <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20 dark:hover:shadow-teal-500/10 hover:-translate-y-1">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 via-emerald-50/0 to-teal-50/0 dark:from-teal-950/0 dark:via-emerald-950/0 dark:to-teal-950/0 group-hover:from-teal-50/30 group-hover:via-emerald-50/20 group-hover:to-teal-50/30 dark:group-hover:from-teal-950/20 dark:group-hover:via-emerald-950/15 dark:group-hover:to-teal-950/20 transition-all duration-500" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid opacity-5 dark:opacity-10" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
              Ready to organize your job search?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
              Join thousands of successful job seekers. Start tracking in under a minute.
            </p>
            <Link to="/login">
              <ShimmerButton className="h-12 px-8 text-white text-base font-medium shadow-lg shadow-teal-500/25">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CTASection);

