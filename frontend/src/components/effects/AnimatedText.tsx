import { memo } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  variant?: 'gradient' | 'shimmer' | 'glow' | 'typewriter';
}

function AnimatedText({ text, className, variant = 'gradient' }: AnimatedTextProps) {
  if (variant === 'gradient') {
    return (
      <span
        className={cn(
          'bg-gradient-to-r from-teal-500 via-emerald-500 to-lime-500 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]',
          className
        )}
      >
        {text}
      </span>
    );
  }

  if (variant === 'shimmer') {
    return (
      <span
        className={cn(
          'relative inline-block',
          className
        )}
      >
        <span className="text-shiny">{text}</span>
      </span>
    );
  }

  if (variant === 'glow') {
    return (
      <span
        className={cn(
          'text-teal-500 text-glow',
          className
        )}
      >
        {text}
      </span>
    );
  }

  if (variant === 'typewriter') {
    return (
      <span className={cn('inline-flex', className)}>
        <span>{text}</span>
        <span className="ml-1 w-[2px] h-[1em] bg-teal-500 animate-blink" />
      </span>
    );
  }

  return <span className={className}>{text}</span>;
}

export default memo(AnimatedText);

