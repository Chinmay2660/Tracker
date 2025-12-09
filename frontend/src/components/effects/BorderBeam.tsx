import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BorderBeamProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  borderWidth?: number;
}

function BorderBeam({ children, className, duration = 4, borderWidth = 1 }: BorderBeamProps) {
  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)}>
      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          padding: borderWidth,
          background: `conic-gradient(from 0deg, transparent 0deg, hsl(162 72% 45%) 60deg, hsl(84 81% 44%) 120deg, transparent 180deg, transparent 360deg)`,
          animation: `gradient-rotate ${duration}s linear infinite`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {/* Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl">
        {children}
      </div>
    </div>
  );
}

export default memo(BorderBeam);

