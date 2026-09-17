"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext<{
  name?: string
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
    name?: string
  }
>(({ className, value, onValueChange, name, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ name, value, onValueChange }}>
      <div className={cn("grid gap-2", className)} role="radiogroup" ref={ref} {...props} />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  const isChecked = context.value === value

  return (
    <div className="relative flex items-center justify-center">
      <input
        type="radio"
        className={cn(
          "peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-border-color transition-all hover:border-primary-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "checked:border-primary-text checked:bg-primary-text",
          className
        )}
        name={context.name}
        value={value}
        checked={isChecked}
        onChange={() => context.onValueChange?.(value)}
        ref={ref}
        {...props}
      />
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-body-bg opacity-0 peer-checked:opacity-100">
        <svg
          width="6"
          height="6"
          viewBox="0 0 6 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="3" cy="3" r="3" fill="currentColor" />
        </svg>
      </span>
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
