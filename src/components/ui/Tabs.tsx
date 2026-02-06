import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || "")
  
  // Allow controlled or uncontrolled
  const currentTab = value !== undefined ? value : activeTab
  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div
      ref={ref}
      data-state={currentTab}
      className={cn("", className)}
      {...props}
    >
      <TabsContext.Provider value={{ value: currentTab, onValueChange: handleTabChange }}>
        {props.children}
      </TabsContext.Provider>
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-body-bg p-1 text-secondary-text",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isActive = context.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-card-bg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-card-bg text-primary-text shadow-sm"
          : "hover:bg-hover-bg hover:text-primary-text",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.value !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-card-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
