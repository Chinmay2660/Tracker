import { memo } from 'react';
import { TestimonialCarousel, Testimonial } from '../effects';

const testimonials: Testimonial[] = [
  { id: 1, content: "Job Tracker transformed my job search. I went from losing track of applications to landing my dream job in 3 months!", author: "Tanmay Patil", role: "Software Engineer", company: "Google", rating: 5 },
  { id: 2, content: "As someone who applied to 100+ jobs, this tool was a lifesaver. The Kanban board helped me visualize my entire pipeline.", author: "Chinmay Bhoir", role: "Full Stack Developer", company: "Microsoft", rating: 5 },
  { id: 3, content: "Finally, a job tracker that doesn't feel like another spreadsheet! The UI is beautiful and interview scheduling is so easy.", author: "Manas Shettigar", role: "UX Designer", company: "Swiggy", rating: 5 },
  { id: 4, content: "I landed 3 offers and Job Tracker helped me keep them all straight. The stage-wise progress tracking is brilliant!", author: "Manvi Morye", role: "Data Scientist", company: "Flipkart", rating: 5 },
  { id: 5, content: "The analytics feature helped me understand my funnel. Seeing my interview progress across stages was a game changer!", author: "Rakshanda Madan", role: "Engineering Manager", company: "Razorpay", rating: 5 },
  { id: 6, content: "Perfect for career transitions. Multiple resumes and custom interview stages are incredibly helpful.", author: "Sayali Bangale", role: "Frontend Developer", company: "Zerodha", rating: 5 },
  { id: 7, content: "The reschedule feature saved me so many times. Managing interviews across companies has never been easier.", author: "Shubh Agrawal", role: "Backend Developer", company: "PhonePe", rating: 5 },
  { id: 8, content: "Love how I can filter interviews by status. No more missing follow-ups on pending rounds!", author: "Avinash Indla", role: "DevOps Engineer", company: "Groww", rating: 5 },
  { id: 9, content: "The calendar view is amazing! I can see all my interviews at a glance and plan my preparation accordingly.", author: "Uday Gangapuram", role: "SDE - 3 | IITian", company: "CRED", rating: 5 },
  { id: 10, content: "From applied to offer, I could track every stage. The notes feature for completed interviews is super useful!", author: "Aditi Anand", role: "UI/UX Designer", company: "Amazon", rating: 5 },
  { id: 11, content: "Clean UI, powerful features, and completely free. This is exactly what every job seeker needs!", author: "Bhumika Gopale", role: "Business Analyst", company: "Walmart", rating: 5 },
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

