import { useEffect, useRef, useState, memo } from 'react';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

function TextReveal({ text, className, delay = 0, staggerDelay = 30 }: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const words = text.split(' ');

  return (
    <span ref={ref} className={cn('inline-flex flex-wrap', className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              className="inline-block transition-all duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${(wordIndex * word.length + charIndex) * staggerDelay}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default memo(TextReveal);

