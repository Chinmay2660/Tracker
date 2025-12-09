import { ReactNode, useEffect, useRef, memo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
}

function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.3,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('scroll-revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px 200px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  const directionClasses = {
    up: 'scroll-reveal-up',
    down: 'scroll-reveal-down',
    left: 'scroll-reveal-left',
    right: 'scroll-reveal-right',
    fade: 'scroll-reveal-fade',
    scale: 'scroll-reveal-scale',
  };

  return (
    <div
      ref={ref}
      className={`${directionClasses[direction]} ${className}`}
      style={{ '--duration': `${duration}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default memo(ScrollReveal);

