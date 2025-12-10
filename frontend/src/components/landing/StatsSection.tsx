import { memo } from 'react';
import { AnimatedCounter } from '../effects';

const stats = [
  { value: 10, suffix: 'K+', label: 'Users' },
  { value: 50, suffix: 'K+', label: 'Jobs' },
  { value: 95, suffix: '%', label: 'Success' },
];

function StatsSection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto scroll-reveal-scale">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-lime-500" />
          <div className="relative px-6 py-8 sm:px-12 sm:py-12">
            <div className="grid grid-cols-3 gap-4 text-center">
              {stats.map((stat, i) => (
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
  );
}

export default memo(StatsSection);

