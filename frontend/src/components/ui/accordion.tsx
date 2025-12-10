import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  openItems: Set<string>
  toggleItem: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)
const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined)

interface AccordionProps {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  className?: string
  children: React.ReactNode
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", defaultValue, className, children, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
      if (defaultValue) {
        return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
      }
      return new Set()
    })

    const toggleItem = React.useCallback((value: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(value)) {
          next.delete(value)
        } else {
          if (type === "single") {
            next.clear()
          }
          next.add(value)
        }
        return next
      })
    }, [type])

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div
          ref={ref}
          className={cn("border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-300", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps {
  className?: string
  children: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    if (!context) throw new Error("AccordionTrigger must be used within Accordion")

    const itemContext = React.useContext(AccordionItemContext)
    if (!itemContext) throw new Error("AccordionTrigger must be used within AccordionItem")

    const isOpen = context.openItems.has(itemContext.value)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-full items-center justify-between p-5 sm:p-6 text-left font-semibold text-slate-900 dark:text-white transition-all hover:bg-teal-50/50 dark:hover:bg-teal-950/30",
          isOpen && "[&>svg]:rotate-180 bg-teal-50/30 dark:bg-teal-950/20",
          className
        )}
        onClick={() => context.toggleItem(itemContext.value)}
        {...props}
      >
        {children}
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-200" />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps {
  className?: string
  children: React.ReactNode
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    if (!context) throw new Error("AccordionContent must be used within Accordion")

    const itemContext = React.useContext(AccordionItemContext)
    if (!itemContext) throw new Error("AccordionContent must be used within AccordionItem")

    const isOpen = context.openItems.has(itemContext.value)

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm text-slate-600 dark:text-slate-400 transition-all",
          className
        )}
        style={{
          maxHeight: isOpen ? "1000px" : "0",
          transition: "max-height 0.3s ease-out",
        }}
        {...props}
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
          {children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
