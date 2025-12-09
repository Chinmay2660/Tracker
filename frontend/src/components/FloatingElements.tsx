import { memo } from 'react';

function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
    </div>
  );
}

export default memo(FloatingElements);

