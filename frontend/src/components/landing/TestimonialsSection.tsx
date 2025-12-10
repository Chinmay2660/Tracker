import { memo } from 'react';
import { TestimonialCarousel, Testimonial } from '../effects';

const testimonials: Testimonial[] = [
  { id: 1, content: "Job Tracker transformed my job search. I went from losing track of applications to landing my dream job in 3 months!", author: "Sarah Martinez", role: "Software Engineer", company: "Google", rating: 5 },
  { id: 2, content: "As someone who applied to 100+ jobs, this tool was a lifesaver. The Kanban board helped me visualize my entire pipeline.", author: "James Chen", role: "Product Manager", company: "Meta", rating: 5 },
  { id: 3, content: "Finally, a job tracker that doesn't feel like another spreadsheet! The UI is beautiful.", author: "Emily Rodriguez", role: "UX Designer", company: "Apple", rating: 5 },
  { id: 4, content: "I landed 3 offers and Job Tracker helped me keep them all straight. Brilliant!", author: "Michael Thompson", role: "Data Scientist", company: "Netflix", rating: 5 },
  { id: 5, content: "The analytics feature helped me understand my funnel. Game changer!", author: "Priya Patel", role: "Engineering Manager", company: "Stripe", rating: 5 },
  { id: 6, content: "Perfect for career transitions. Multiple resumes feature is incredibly helpful.", author: "David Kim", role: "Frontend Developer", company: "Airbnb", rating: 5 },
];

function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-20 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
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
  );
}

export default memo(TestimonialsSection);

