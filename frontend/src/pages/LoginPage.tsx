import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { 
  Briefcase, 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  Zap, 
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle2,
  Rocket,
  BarChart3
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingElements from '../components/FloatingElements';
import GradientBorder from '../components/GradientBorder';
import ScrollReveal from '../components/ScrollReveal';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    login();
  };

  const features = [
    {
      icon: Calendar,
      title: 'Track Interviews',
      description: 'Never miss an interview with our calendar integration',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Resume Manager',
      description: 'Keep multiple resume versions organized',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Job Analytics',
      description: 'Visualize your job search progress',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />
      
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen max-h-screen overflow-hidden">
        {/* Left Side - Visual Content */}
        <div className="hidden lg:flex flex-col justify-center p-6 xl:p-8 relative z-10">
          <ScrollReveal direction="fade" delay={0} duration={0.3}>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-all group w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-medium">Back to home</span>
            </Link>
          </ScrollReveal>

          <div className="space-y-4">
            <ScrollReveal direction="up" delay={100} duration={0.3}>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <Briefcase className="h-8 w-8 text-white animate-pulse" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-0.5 -right-0.5 animate-bounce" />
                </div>
                <span className="text-2xl font-bold text-white">
                  JobTracker
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200} duration={0.3}>
              <h1 className="text-3xl xl:text-4xl font-bold text-white mb-2 leading-tight">
                Organize Your
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Job Search
                </span>
              </h1>
              <p className="text-sm text-white/80 mb-4 max-w-lg">
                Join thousands of job seekers who stay organized
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300} duration={0.3}>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {features.slice(0, 2).map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10"
                    >
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-xs">{feature.title}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>

            {/* Stats - Compact */}
            <ScrollReveal direction="up" delay={400} duration={0.3}>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">10K+</div>
                  <div className="text-[10px] text-white/70">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">50K+</div>
                  <div className="text-[10px] text-white/70">Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">95%</div>
                  <div className="text-[10px] text-white/70">Success</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-4 lg:p-4 xl:p-6 relative z-10">
          <div className="w-full max-w-md">
            {/* Back to landing - Mobile */}
            <ScrollReveal direction="fade" delay={0} duration={0.2}>
              <Link 
                to="/" 
                className="lg:hidden inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 transition-all group"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-medium">Back to home</span>
              </Link>
            </ScrollReveal>

            <ScrollReveal direction="scale" delay={100} duration={0.3}>
              <GradientBorder className="p-1">
                <div className="relative rounded-xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5" />
                  
                  <div className="relative p-5 md:p-6">
                    {/* Header */}
                    <div className="text-center space-y-3 mb-5">
                      <ScrollReveal direction="fade" delay={200} duration={0.2}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="relative">
                            <Briefcase className="h-7 w-7 text-primary dark:text-violet-400 animate-pulse" />
                            <Sparkles className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400 absolute -top-0.5 -right-0.5 animate-bounce" />
                          </div>
                          <span className="text-lg font-bold animated-gradient-text text-glow">
                            JobTracker
                          </span>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal direction="up" delay={300} duration={0.2}>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                          Welcome back
                        </h1>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Sign in to continue
                        </p>
                      </ScrollReveal>
                    </div>

                    {/* Google Sign In Button */}
                    <ScrollReveal direction="up" delay={400} duration={0.2}>
                      <Button 
                        onClick={handleLogin} 
                        className="w-full h-11 text-sm font-semibold group relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
                        size="lg"
                        disabled={isLoading}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2.5">
                          {isLoading ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path
                                  fill="currentColor"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="currentColor"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="currentColor"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                  fill="currentColor"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                              </svg>
                              <span>Continue with Google</span>
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      </Button>
                    </ScrollReveal>

                    {/* Security Features - Single Row */}
                    <ScrollReveal direction="up" delay={500} duration={0.2}>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-800/50">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-[10px]">One-click</p>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-[10px]">Private</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </GradientBorder>
            </ScrollReveal>

            {/* Footer - Compact */}
            <ScrollReveal direction="fade" delay={600} duration={0.2}>
              <p className="text-center text-[10px] text-slate-500 dark:text-slate-400 mt-4">
                By signing in, you agree to our{' '}
                <a href="#" className="text-primary dark:text-violet-400 hover:underline">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-primary dark:text-violet-400 hover:underline">Privacy</a>
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Left Side Gradient Overlay */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-90 dark:opacity-95 z-0" />
      </div>
    </div>
  );
}
