import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ShineCardProps {
  children: ReactNode;
  className?: string;
}

function ShineCard({ children, className }: ShineCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-500 group h-full',
        className
      )}
    >
      {/* Shine effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.2) 55%, transparent 60%)',
          transform: 'translateX(-100%)',
          animation: 'none',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 55%, transparent 60%)',
          transform: 'translateX(-100%)',
          transition: 'transform 0.6s ease',
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export default memo(ShineCard);

