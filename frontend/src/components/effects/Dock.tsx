import { memo, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface DockItem {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

interface DockProps {
  items: DockItem[];
  className?: string;
}

function Dock({ items, className }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.1;
    return 1;
  };

  const getY = (index: number) => {
    if (hoveredIndex === null) return 0;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return -12;
    if (distance === 1) return -6;
    if (distance === 2) return -2;
    return 0;
  };

  return (
    <div
      className={cn(
        'flex items-end gap-1 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-lg',
        className
      )}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {items.map((item, index) => (
        <div key={index} className="relative group">
          <button
            onClick={item.onClick}
            onMouseEnter={() => setHoveredIndex(index)}
            className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 ease-out hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400"
            style={{
              transform: `scale(${getScale(index)}) translateY(${getY(index)}px)`,
            }}
          >
            {item.icon}
          </button>
          {/* Tooltip */}
          <div
            className={cn(
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-md whitespace-nowrap transition-all duration-200',
              hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            )}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(Dock);

