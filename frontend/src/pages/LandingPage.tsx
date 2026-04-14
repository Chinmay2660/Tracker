import { useState, useEffect, useRef } from 'react';
import { memo } from 'react';
import SEO from '../components/SEO';
import { AnimatedGradientBackground } from '../components/effects';
import { Navbar, HeroSection, LogoCarousel, StatsSection, FeaturesSection, BenefitsSection, HowItWorksSection, TestimonialsSection, FAQSection, CTASection, Footer, } from '../components/landing';
function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale').forEach((el) => {
            observerRef.current?.observe(el);
        });
        return () => observerRef.current?.disconnect();
    }, []);
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);
    return (<>
      <SEO title="Job Tracker - Track Your Job Applications & Interviews | Free Forever" description="Organize and track your job applications with Job Tracker. Manage interview stages, schedule rounds, reschedule easily, filter by status, and visualize progress with analytics. Beautiful Kanban board, resume manager, and more. Free forever." keywords="job tracker, job application tracker, interview scheduler, interview stages, resume manager, job search, application management, career tracker, job board, kanban board, job hunting, interview calendar"/>
      <div className="min-h-screen bg-white dark:bg-[#0B0F17] relative overflow-x-hidden transition-colors duration-0">
        
        <AnimatedGradientBackground />
        
        
        <Navbar scrolled={scrolled} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}/>

        
        <HeroSection />

        
        <LogoCarousel />

        
        <StatsSection />

        
        <FeaturesSection />

        
        <BenefitsSection />

        
        <HowItWorksSection />

        
        <TestimonialsSection />

        
        <FAQSection />

        
        <CTASection />

        
        <Footer />
      </div>
    </>);
}
export default memo(LandingPage);
