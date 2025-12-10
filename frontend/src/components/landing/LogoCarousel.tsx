import { memo } from 'react';
import { Marquee } from '../effects';

const logos = ['Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Microsoft', 'Stripe', 'Airbnb'];

function LogoCarousel() {
  return (
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
  );
}

export default memo(LogoCarousel);

