"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "geist-icons";

interface SelectContextType {
  value: any;
  onValueChange: (value: any) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedLabel: React.ReactNode;
  setSelectedLabel: (label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

export const Select = ({
  value,
  onValueChange,
  children,
}: {
  value?: any;
  onValueChange: (value: any) => void;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<React.ReactNode>(null);

  // Close on outside click
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, selectedLabel, setSelectedLabel }}
    >
      <div ref={ref} className="relative block w-full text-left">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, setOpen } = React.useContext(SelectContext)!;
  return (
    <button
      type="button"
      onClick={(e) => {
        setOpen(!open);
        props.onClick?.(e);
      }}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm font-medium tracking-[-0.01em] text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-secondary-text ml-2 shrink-0" />
    </button>
  );
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, selectedLabel } = React.useContext(SelectContext)!;
  const showPlaceholder = !selectedLabel && !value;
  
  return (
    <span className={`block truncate ${showPlaceholder ? "text-secondary-text font-normal" : ""}`}>
      {selectedLabel || value || placeholder}
    </span>
  );
};

export const SelectContent = ({
  children,
  className = "",
  align = "start",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) => {
  const { open } = React.useContext(SelectContext)!;
  if (!open) return null;

  let alignClass = "left-0";
  if (align === "end") alignClass = "right-0";
  if (align === "center") alignClass = "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute z-50 min-w-full w-auto whitespace-nowrap overflow-hidden rounded-md border border-border-color bg-card-bg text-primary-text animate-in fade-in-80 zoom-in-95 mt-1 ${alignClass} ${className}`}
    >
      <div className="p-1 max-h-[200px] overflow-y-auto">{children}</div>
    </div>
  );
};

export const SelectItem = ({
  value,
  children,
  className = "",
}: {
  value: any;
  children: React.ReactNode;
  className?: string;
}) => {
  const { value: selectedValue, onValueChange, setOpen, setSelectedLabel } = React.useContext(
    SelectContext
  )!;
  const isSelected = selectedValue === value;

  // Update label if selected
  React.useEffect(() => {
    if (isSelected) {
      setSelectedLabel(children);
    }
  }, [isSelected, children, setSelectedLabel]);

  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-hover-bg focus:bg-hover-bg text-primary-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
};
