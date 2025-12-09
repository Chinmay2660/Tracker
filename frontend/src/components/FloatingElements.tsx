import { memo } from 'react';

function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Geometric gradient orbs - Teal/Lime palette */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Subtle geometric accents */}
      <div className="absolute top-1/4 right-10 w-32 h-32 border border-teal-500/10 rounded-2xl rotate-12 animate-subtle-rotate" style={{ animationDuration: '30s' }} />
      <div className="absolute bottom-1/4 left-20 w-24 h-24 border border-lime-500/10 rounded-xl -rotate-12 animate-subtle-rotate" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
    </div>
  );
}

export default memo(FloatingElements);
