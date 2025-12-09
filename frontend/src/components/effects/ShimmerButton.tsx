import { memo, ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
}

function ShimmerButton({ 
  children, 
  className, 
  shimmerColor = 'rgba(255, 255, 255, 0.3)',
  ...props 
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all',
        'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600',
        'text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30',
        'hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: 'shine 3s ease-in-out infinite',
        }}
      />
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 blur-xl" />
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

export default memo(ShimmerButton);

