import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
  Rocket
} from 'lucide-react';
import { memo } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingElements from '../components/FloatingElements';
import GradientBorder from '../components/GradientBorder';
import ThemeToggle from '../components/ThemeToggle';
import ScrollReveal from '../components/ScrollReveal';

function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />
      
      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-4 py-6 flex items-center justify-between backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Briefcase className="h-8 w-8 text-primary animate-pulse" />
            <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            JobTracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link to="/login">
            <Button className="relative overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <ScrollReveal direction="fade" delay={0}>
            <div className="text-gradient-border">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Streamline Your Job Search</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="animated-gradient-text text-glow">
                Track Every
              </span>
              <br />
              <span className="text-slate-900 dark:text-slate-100 text-expand">Application</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Organize your job search with a beautiful Kanban board, track interviews on your calendar, 
              and manage multiple resume versions—all in one place.
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 group relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Watch Demo
              </Button>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="fade" delay={400}>
            <p className="text-sm text-slate-500 dark:text-slate-500 pt-2">
              No credit card required • Free forever
            </p>
          </ScrollReveal>
        </div>

        {/* Hero Dashboard Preview with Glassmorphism */}
        <ScrollReveal direction="scale" delay={500} className="mt-20 max-w-6xl mx-auto">
          <GradientBorder className="p-1">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5" />
              <div className="relative p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Applied', 'Interview', 'Offer'].map((status, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{status}</h3>
                        <span className="text-xs text-slate-600 dark:text-slate-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full font-medium">
                          {idx + 2}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div 
                            key={i} 
                            className="bg-white/80 dark:bg-slate-900/80 rounded-lg p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="h-4 bg-gradient-to-r from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 rounded w-3/4 mb-2 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GradientBorder>
        </ScrollReveal>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 container mx-auto px-4 py-20">
        <ScrollReveal direction="up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Everything you need to land your{' '}
            <span className="animated-gradient-text text-gradient-shadow">
              dream job
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-underline-gradient">
            Powerful features designed to help you stay organized and never miss an opportunity
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto stagger-children">
          {[
            {
              icon: Briefcase,
              title: 'Kanban Board',
              description: 'Visualize your job applications with drag-and-drop columns. Track progress from application to offer.',
              color: 'text-violet-600 dark:text-violet-400',
              bgColor: 'bg-violet-50 dark:bg-violet-900/20',
              gradient: 'from-violet-500 to-purple-500',
            },
            {
              icon: Calendar,
              title: 'Interview Calendar',
              description: 'Never miss an interview. View all your scheduled interviews in a beautiful calendar interface.',
              color: 'text-purple-600 dark:text-purple-400',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              gradient: 'from-purple-500 to-fuchsia-500',
            },
            {
              icon: FileText,
              title: 'Resume Manager',
              description: 'Upload and manage multiple resume versions. Attach the right resume to each application.',
              color: 'text-fuchsia-600 dark:text-fuchsia-400',
              bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
              gradient: 'from-fuchsia-500 to-pink-500',
            },
            {
              icon: TrendingUp,
              title: 'Smart Tracking',
              description: 'Track tags, locations, applied dates, and notes for each application. Stay organized effortlessly.',
              color: 'text-green-600 dark:text-green-400',
              bgColor: 'bg-green-50 dark:bg-green-900/20',
              gradient: 'from-green-500 to-emerald-500',
            },
            {
              icon: BarChart3,
              title: 'Progress Insights',
              description: 'See your application pipeline at a glance. Understand where you are in each process.',
              color: 'text-orange-600 dark:text-orange-400',
              bgColor: 'bg-orange-50 dark:bg-orange-900/20',
              gradient: 'from-orange-500 to-red-500',
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              description: 'Your data is yours. Secure authentication with Google OAuth. Your information stays private.',
              color: 'text-red-600 dark:text-red-400',
              bgColor: 'bg-red-50 dark:bg-red-900/20',
              gradient: 'from-red-500 to-pink-500',
            },
          ].map((feature, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              delay={idx * 100}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
              <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-transparent transition-all duration-300 h-full">
                <div className={`${feature.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 text-underline-gradient">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <ScrollReveal direction="scale" delay={0}>
          <GradientBorder>
            <div className="p-12 md:p-16">
              <div className="max-w-5xl mx-auto">
                <ScrollReveal direction="up" delay={0} duration={0.2} className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Why <span className="text-gradient-border animated-gradient-text">JobTracker</span>?
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 text-underline-gradient mb-8">
                    Join thousands of job seekers who stay organized and land their dream jobs
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        10K+
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        50K+
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Jobs Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        95%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                    </div>
                  </div>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 gap-6 stagger-children mb-12">
                  {[
                    {
                      icon: '🚀',
                      title: 'Free forever',
                      description: 'No hidden costs, no subscriptions. Everything you need is completely free.',
                    },
                    {
                      icon: '🎨',
                      title: 'Beautiful interface',
                      description: 'Modern, intuitive design that makes job tracking a pleasure, not a chore.',
                    },
                    {
                      icon: '📱',
                      title: 'Works everywhere',
                      description: 'Access your job board from any device - desktop, tablet, or mobile.',
                    },
                    {
                      icon: '🔒',
                      title: 'Secure & private',
                      description: 'Your data is encrypted and private. We never share your information.',
                    },
                    {
                      icon: '⚡',
                      title: 'Lightning fast',
                      description: 'Built for speed. Track applications and interviews in seconds, not minutes.',
                    },
                    {
                      icon: '📊',
                      title: 'Smart insights',
                      description: 'Visualize your progress and identify patterns in your job search journey.',
                    },
                  ].map((benefit, idx) => (
                    <ScrollReveal
                      key={idx}
                      direction="up"
                      delay={idx * 50}
                      duration={0.2}
                      className="group"
                    >
                      <div className="flex items-start gap-4 p-6 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg transition-all h-full">
                        <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                          {benefit.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 text-underline-gradient">
                            {benefit.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Testimonial Section */}
                <ScrollReveal direction="up" delay={300} duration={0.2} className="mt-12">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-violet-200/50 dark:border-violet-800/50">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">💬</div>
                      <div>
                        <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-4">
                          "JobTracker transformed my job search. I went from losing track of applications to landing my dream job in 3 months. The calendar feature saved me from missing multiple interviews!"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            SM
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">Sarah Martinez</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Software Engineer at Google</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </GradientBorder>
        </ScrollReveal>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <ScrollReveal direction="scale" delay={0} className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-violet-600/90 to-purple-600/90 dark:from-violet-700/90 dark:to-purple-700/90 backdrop-blur-sm rounded-3xl p-12 md:p-16 text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">Ready to organize your job search?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-underline-gradient">
                Start tracking your applications today. It's free and takes less than a minute.
              </p>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-slate-100 hover:scale-105 transition-transform"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-12 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold animated-gradient-text">
              JobTracker
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © 2025 JobTracker. Built with ❤️ for job seekers.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default memo(LandingPage);
