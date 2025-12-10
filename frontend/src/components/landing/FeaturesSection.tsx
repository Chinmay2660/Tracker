import { memo } from 'react';
import { Briefcase, Calendar, FileText, TrendingUp, BarChart3, Shield } from 'lucide-react';

const features = [
  { icon: Briefcase, title: 'Kanban Board', description: 'Drag-and-drop columns to track every application.', iconColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { icon: Calendar, title: 'Interview Calendar', description: 'Never miss an interview with scheduling view.', iconColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { icon: FileText, title: 'Resume Manager', description: 'Store and organize multiple resume versions.', iconColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Track tags, locations, and notes for every app.', iconColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { icon: BarChart3, title: 'Smart Analytics', description: 'Visualize your application funnel and metrics.', iconColor: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  { icon: Shield, title: 'Secure & Private', description: 'Your data stays private with Google OAuth.', iconColor: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-800' },
];

function FeaturesSection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 scroll-reveal">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Everything you need</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Powerful features to streamline your job search</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="scroll-reveal group relative p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-500/20 hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 via-emerald-50/0 to-teal-50/0 dark:from-teal-950/0 dark:via-emerald-950/0 dark:to-teal-950/0 group-hover:from-teal-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-teal-950/30 dark:group-hover:via-emerald-950/20 dark:group-hover:to-teal-950/30 transition-all duration-300 rounded-xl" />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">{f.description}</p>
                </div>
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

export default memo(FeaturesSection);

