import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { BorderBeam, AnimatedText, ShimmerButton } from '../effects';

function HeroSection() {
  return (
    <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Text */}
          <div className="text-center lg:text-left scroll-reveal">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium mb-5">
              <Sparkles className="w-3 h-3" /> 
              <span>Free forever • No credit card</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-5">
              Track Every<br />
              <AnimatedText text="Job Application" variant="gradient" className="text-3xl sm:text-4xl lg:text-5xl font-bold" />
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto lg:mx-0">
              The modern job search companion. Organize applications, track interviews, manage resumes - all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <Link to="/login">
                <ShimmerButton className="w-full sm:w-auto h-12 px-6 text-white text-base font-medium shadow-lg shadow-teal-500/25">
                  Start Free Today <ArrowRight className="w-4 h-4 ml-2" />
                </ShimmerButton>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto h-12 px-6 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-300 rounded-full text-base">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-teal-500" /> Free forever</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-teal-500" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-teal-500" /> 30s setup</span>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="scroll-reveal-scale hidden sm:block">
            <BorderBeam duration={8} className="shadow-2xl shadow-teal-500/10">
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <div className="flex-1 mx-3"><div className="h-4 w-32 mx-auto rounded-full bg-slate-200 dark:bg-slate-700" /></div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Applied', count: 12, color: 'bg-blue-500' },
                      { name: 'Interview', count: 5, color: 'bg-amber-500' },
                      { name: 'Offer', count: 2, color: 'bg-emerald-500' },
                    ].map((col, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{col.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${col.color}`}>{col.count}</span>
                        </div>
                        <div className="space-y-1.5">
                          {[1, 2].map(j => (
                            <div key={j} className="bg-white dark:bg-slate-900 rounded p-2 border border-slate-100 dark:border-slate-700">
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-4/5 mb-1" />
                              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded w-3/5" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </BorderBeam>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);

