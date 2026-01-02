import { memo } from 'react';
import { ChevronRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Sign Up Free',
    description: 'Create your account with Google OAuth. No credit card required, no hidden fees.',
    icon: '🔐',
  },
  {
    step: '02',
    title: 'Add Your Jobs',
    description: 'Add applications with company details, roles, salary info, and define your interview stages.',
    icon: '📝',
  },
  {
    step: '03',
    title: 'Track & Succeed',
    description: 'Schedule interviews, track stage progress, manage resumes, and view analytics to land your dream job.',
    icon: '📊',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 scroll-reveal">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Get started in minutes, not hours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, i) => (
            <div key={i} className="scroll-reveal relative group">
              <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-500/20 hover:-translate-y-1 h-full overflow-hidden">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 via-emerald-50/0 to-teal-50/0 dark:from-teal-950/0 dark:via-emerald-950/0 dark:to-teal-950/0 group-hover:from-teal-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-teal-950/30 dark:group-hover:via-emerald-950/20 dark:group-hover:to-teal-950/30 transition-all duration-300 rounded-xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-teal-500/20">
                      {item.step}
                    </div>
                    <span className="text-3xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 block">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl" />
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                  <ChevronRight className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(HowItWorksSection);

