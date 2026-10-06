import { memo, ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
    shimmerColor?: string;
    href?: string;
}
function ShimmerButton({ children, className, shimmerColor = 'rgba(255, 255, 255, 0.3)', href, ...props }: ShimmerButtonProps) {
    const classes = cn('relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all', 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600', 'text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30', 'hover:scale-[1.02] active:scale-[0.98]', className);
    const inner = (<>
      
      <div className="absolute inset-0" style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            animation: 'shine 3s ease-in-out infinite',
        }}/>
      
      <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 blur-xl"/>
      
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>);
    if (href) {
        const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
        return (<a href={href} className={classes} {...anchorProps}>{inner}</a>);
    }
    return (<button className={classes} {...props}>{inner}</button>);
}
export default memo(ShimmerButton);
