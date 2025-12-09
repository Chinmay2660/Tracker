import { memo } from 'react';
import { Briefcase, Calendar, FileText, BarChart3, Star, Zap } from 'lucide-react';

const icons = [
  { Icon: Briefcase, delay: 0, x: '10%', y: '20%', size: 24 },
  { Icon: Calendar, delay: 1, x: '85%', y: '15%', size: 20 },
  { Icon: FileText, delay: 2, x: '15%', y: '70%', size: 22 },
  { Icon: BarChart3, delay: 3, x: '80%', y: '65%', size: 26 },
  { Icon: Star, delay: 1.5, x: '5%', y: '45%', size: 18 },
  { Icon: Zap, delay: 2.5, x: '90%', y: '40%', size: 20 },
];

function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {icons.map(({ Icon, delay, x, y, size }, index) => (
        <div
          key={index}
          className="absolute animate-float opacity-20 dark:opacity-10"
          style={{
            left: x,
            top: y,
            animationDelay: `${delay}s`,
            animationDuration: '6s',
          }}
        >
          <Icon 
            style={{ width: size, height: size }} 
            className="text-teal-500 dark:text-teal-400"
          />
        </div>
      ))}
    </div>
  );
}

export default memo(FloatingIcons);

