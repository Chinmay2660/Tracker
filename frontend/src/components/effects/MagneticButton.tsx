import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

// Simplified - removed magnetic effect as it was too distracting
function MagneticButton({ children, className }: MagneticButtonProps) {
  return (
    <div className={cn('inline-block', className)}>
      {children}
    </div>
  );
}

export default memo(MagneticButton);

