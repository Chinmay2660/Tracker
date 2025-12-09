import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  BarChart3,
  Shield,
  Sparkles,
  Check,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { memo } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { 
  BorderBeam, 
  AnimatedText, 
  Marquee, 
  TestimonialCarousel, 
  Testimonial,
  AnimatedCounter
} from '../components/effects';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const features = [
    { icon: Briefcase, title: 'Kanban Board', description: 'Drag-and-drop columns to track every application.', iconColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Calendar, title: 'Interview Calendar', description: 'Never miss an interview with scheduling view.', iconColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: FileText, title: 'Resume Manager', description: 'Store and organize multiple resume versions.', iconColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: TrendingUp, title: 'Progress Tracking', description: 'Track tags, locations, and notes for every app.', iconColor: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { icon: BarChart3, title: 'Smart Analytics', description: 'Visualize your application funnel and metrics.', iconColor: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { icon: Shield, title: 'Secure & Private', description: 'Your data stays private with Google OAuth.', iconColor: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-800' },
  ];

  const benefits = [
    { icon: '🚀', title: 'Free Forever', desc: 'No hidden costs.' },
    { icon: '⚡', title: 'Lightning Fast', desc: 'Track in seconds.' },
    { icon: '🎨', title: 'Beautiful UI', desc: 'Modern design.' },
    { icon: '📱', title: 'Works Everywhere', desc: 'Any device.' },
    { icon: '🔒', title: 'Privacy First', desc: 'Data never sold.' },
    { icon: '📊', title: 'Smart Insights', desc: 'Track progress.' },
  ];

  const logos = ['Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Microsoft', 'Stripe', 'Airbnb'];

  const testimonials: Testimonial[] = [
    { id: 1, content: "JobTracker transformed my job search. I went from losing track of applications to landing my dream job in 3 months!", author: "Sarah Martinez", role: "Software Engineer", company: "Google", rating: 5 },
    { id: 2, content: "As someone who applied to 100+ jobs, this tool was a lifesaver. The Kanban board helped me visualize my entire pipeline.", author: "James Chen", role: "Product Manager", company: "Meta", rating: 5 },
    { id: 3, content: "Finally, a job tracker that doesn't feel like another spreadsheet! The UI is beautiful.", author: "Emily Rodriguez", role: "UX Designer", company: "Apple", rating: 5 },
    { id: 4, content: "I landed 3 offers and JobTracker helped me keep them all straight. Brilliant!", author: "Michael Thompson", role: "Data Scientist", company: "Netflix", rating: 5 },
    { id: 5, content: "The analytics feature helped me understand my funnel. Game changer!", author: "Priya Patel", role: "Engineering Manager", company: "Stripe", rating: 5 },
    { id: 6, content: "Perfect for career transitions. Multiple resumes feature is incredibly helpful.", author: "David Kim", role: "Frontend Developer", company: "Airbnb", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] relative overflow-x-hidden">
      {/* Simple gradient background - CSS only, no JS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 dark:bg-teal-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between transition-all duration-200 ${scrolled ? 'h-14' : 'h-16'}`}>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">JobTracker</span>
            </Link>

            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button className="h-9 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full text-sm font-medium">
                  Get Started <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
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
              <Button className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full">Get Started Free</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left scroll-reveal">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium mb-5">
                <Sparkles className="w-3 h-3" /> 
                <span>Now with AI insights</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-5">
                Track Every<br />
                <AnimatedText text="Job Application" variant="gradient" className="text-3xl sm:text-4xl lg:text-5xl font-bold" />
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto lg:mx-0">
                The modern job search companion. Organize applications, track interviews, manage resumes—all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link to="/login">
                  <Button className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full text-base font-medium shadow-lg shadow-teal-500/25">
                    Start Free Today <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto h-12 px-6 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-base">
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

      {/* Logo Carousel */}
      <section className="py-6 border-y border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
        <p className="text-center text-[10px] font-medium tracking-widest text-slate-400 dark:text-slate-500 mb-4">TRUSTED BY JOB SEEKERS AT</p>
        <Marquee speed={40} className="py-1">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center justify-center px-6 sm:px-10">
              <span className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-500">{logo}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto scroll-reveal-scale">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-lime-500" />
            <div className="relative px-6 py-8 sm:px-12 sm:py-12">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: 10, suffix: 'K+', label: 'Users' },
                  { value: 50, suffix: 'K+', label: 'Jobs' },
                  { value: 95, suffix: '%', label: 'Success' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl sm:text-4xl font-bold text-white mb-1">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000} />
                    </div>
                    <div className="text-[10px] sm:text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Single column on mobile */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Everything you need</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Powerful features to streamline your job search</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="scroll-reveal p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0`}>
                    <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits - Single column on mobile */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">JobTracker</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="scroll-reveal flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{b.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel - faster on mobile */}
      <section className="py-12 sm:py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
          <div className="text-center scroll-reveal">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Loved by job seekers worldwide
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              See what our users say
            </p>
          </div>
        </div>
        
        <TestimonialCarousel 
          testimonials={testimonials} 
          speed={25}
          pauseOnHover={true}
        />
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto scroll-reveal-scale">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-12 text-center">
            <div className="absolute inset-0 bg-grid opacity-5" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to organize your job search?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-md mx-auto">
                Join thousands of successful job seekers. Start tracking in under a minute.
              </p>
              <Link to="/login">
                <Button className="h-12 px-8 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full text-base font-medium shadow-lg shadow-teal-500/25">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">JobTracker</span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2025 JobTracker. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

export default memo(LandingPage);
