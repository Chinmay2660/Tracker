import { ReactNode } from 'react';

interface GradientBorderProps {
  children: ReactNode;
  className?: string;
}

export default function GradientBorder({ children, className = '' }: GradientBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-20 blur-xl" />
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50">
        {children}
      </div>
    </div>
  );
}

