import { memo } from 'react';

const benefits = [
  { icon: '🚀', title: 'Free Forever', desc: 'No hidden costs.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Track in seconds.' },
  { icon: '🎨', title: 'Beautiful UI', desc: 'Modern design.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Any device.' },
  { icon: '📅', title: 'Never Miss Interviews', desc: 'Reschedule easily.' },
  { icon: '📊', title: 'Stage Analytics', desc: 'Track every round.' },
];

function BenefitsSection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 scroll-reveal">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Job Tracker</span>?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {benefits.map((b, i) => (
            <div 
              key={i} 
              className="scroll-reveal group relative flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-500/20 hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 via-emerald-50/0 to-teal-50/0 dark:from-teal-950/0 dark:via-emerald-950/0 dark:to-teal-950/0 group-hover:from-teal-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-teal-950/30 dark:group-hover:via-emerald-950/20 dark:group-hover:to-teal-950/30 transition-all duration-300 rounded-xl" />
              
              {/* Animated icon */}
              <div className="relative z-10 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-2xl block">{b.icon}</span>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                  {b.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                  {b.desc}
                </p>
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(BenefitsSection);

