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
          "block w-full rounded-lg border border-input bg-background",
          // Sizing - 48px height for good touch targets
          "h-12 px-4 py-3",
          // Typography - 16px prevents iOS zoom on focus
          "text-base text-foreground",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
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
