import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { 
  Briefcase, 
  ArrowLeft, 
  Shield, 
  Zap, 
  Calendar,
  FileText,
  BarChart3,
  Sparkles,
  Check
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { Particles, BorderBeam, ShimmerButton } from '../components/effects';

export default function LoginPage() {
  // Use lightweight login hook - does NOT call any APIs
  const { login, isLoading } = useLogin();

  const handleLogin = () => {
    login();
  };

  const features = [
    { icon: Calendar, label: 'Track Interviews' },
    { icon: FileText, label: 'Manage Resumes' },
    { icon: BarChart3, label: 'View Analytics' },
  ];

  const benefits = [
    'Kanban board for applications',
    'Never miss an interview',
    'Store multiple resumes',
    'Track compensation details',
    'Analytics and insights',
    'Mobile-friendly interface',
  ];

  return (
    <div className="h-screen bg-white dark:bg-[#0B0F17] flex relative overflow-hidden">
      {/* Particles */}
      <Particles quantity={30} className="opacity-30 dark:opacity-20" />

      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 border border-white/10 rounded-full animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 border border-white/10 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-6 overflow-y-auto max-h-screen">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Job Tracker</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
            Organize Your<br />Job Search
          </h1>
          <p className="text-base text-white/90 mb-6 max-w-md">
            Join thousands of job seekers who stay organized and land their dream jobs.
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 group">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <f.icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-sm">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Benefits List */}
          <div className="mb-6 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-xs font-semibold text-white mb-2">What you'll get:</p>
            <div className="space-y-1.5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90">
                  <Check className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                  <span className="text-xs">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-4 border-t border-white/20">
            <div>
              <div className="text-xl font-bold text-white">10K+</div>
              <div className="text-xs text-white/70">Users</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">50K+</div>
              <div className="text-xs text-white/70">Jobs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">95%</div>
              <div className="text-xs text-white/70">Success</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50 dark:opacity-30" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 pt-6 sm:pt-8">
          <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form container - centered on mobile */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 pt-6 pb-8 sm:pt-8 lg:py-12">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile logo - smaller spacing */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Job Tracker</span>
            </div>

            {/* Form card with Border Beam */}
            <BorderBeam duration={6} className="animate-scale-in">
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Secure login</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p>
                </div>

                {/* Google Sign In */}
                <ShimmerButton 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="w-full h-11 mb-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </ShimmerButton>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">One-click</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Private</span>
                  </div>
                </div>
              </div>
            </BorderBeam>

            {/* Mobile benefits - show on mobile only */}
            <div className="lg:hidden mt-3 p-3 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800/50">
              <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mb-2">What you'll get:</p>
              <div className="space-y-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile stats */}
            <div className="lg:hidden flex justify-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <div className="text-base font-bold text-teal-600 dark:text-teal-400">10K+</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Users</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">50K+</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-lime-600 dark:text-lime-400">95%</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Success</div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4">
              By signing in, you agree to our{' '}
              <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
