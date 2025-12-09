import { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, Quote } from 'lucide-react';

export interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
}

function TestimonialCarousel({ 
  testimonials, 
  className,
  speed = 30,
  pauseOnHover = true 
}: TestimonialCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Double the testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Gradient masks for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-white dark:from-[#0B0F17] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-white dark:from-[#0B0F17] to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling container */}
      <div
        ref={containerRef}
        className="flex gap-4 sm:gap-6"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[400px] group">
      <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:border-teal-300 dark:hover:border-teal-700">
        {/* Quote icon */}
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote className="w-12 h-12 text-teal-500" />
        </div>

        {/* Rating stars */}
        {testimonial.rating && (
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < testimonial.rating!
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                )}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-4">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mt-auto">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-teal-500/20"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
              {testimonial.author}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {testimonial.role} at {testimonial.company}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TestimonialCarousel);

