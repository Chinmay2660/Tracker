import { ReactNode } from 'react';

interface GradientBorderProps {
  children: ReactNode;
  className?: string;
}

export default function GradientBorder({ children, className = '' }: GradientBorderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Teal/Lime gradient glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-lime-400 opacity-15 blur-xl" />
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
        {children}
      </div>
    </div>
  );
}
