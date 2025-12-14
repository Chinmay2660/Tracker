import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          // Base styles
          "block w-full rounded-lg border border-slate-300 dark:border-slate-700",
          "bg-white dark:bg-slate-900",
          // Sizing - use min-height and padding for flexibility
          "min-h-[44px] px-3 py-2",
          // Typography
          "text-sm text-slate-900 dark:text-slate-100",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-colors",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
