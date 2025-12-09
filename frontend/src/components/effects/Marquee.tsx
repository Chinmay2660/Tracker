import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
}

function Marquee({ 
  children, 
  className, 
  speed = 30,
  pauseOnHover = true,
  direction = 'left'
}: MarqueeProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'flex gap-4',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export default memo(Marquee);

