import { useEffect, useRef, memo } from 'react';

interface AnimatedGradientBackgroundProps {
  className?: string;
}

function AnimatedGradientBackground({ className = '' }: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const animate = () => {
      time += 0.002; // Slower animation
      
      // Single subtle animated gradient with limited movement
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time) * 30, // Reduced movement (30 instead of 100)
        canvas.height * 0.3 + Math.cos(time) * 30,
        0,
        canvas.width * 0.3 + Math.sin(time) * 30,
        canvas.height * 0.3 + Math.cos(time) * 30,
        canvas.width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(20, 184, 166, 0.08)'); // Reduced opacity (0.08 instead of 0.15)
      gradient1.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
      gradient1.addColorStop(1, 'transparent');

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.8) * 40, // Slower, more limited movement
        canvas.height * 0.7 + Math.sin(time * 0.8) * 40,
        0,
        canvas.width * 0.7 + Math.cos(time * 0.8) * 40,
        canvas.height * 0.7 + Math.sin(time * 0.8) * 40,
        canvas.width * 0.7
      );
      gradient2.addColorStop(0, 'rgba(16, 185, 129, 0.06)'); // Reduced opacity
      gradient2.addColorStop(1, 'transparent');

      // Clear and draw gradients
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

export default memo(AnimatedGradientBackground);

