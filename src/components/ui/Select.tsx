"use client";

import * as React from "react";
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
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, setOpen } = React.useContext(SelectContext)!;
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium tracking-[-0.01em] text-[#171717] ring-offset-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-zinc-500 ml-2 shrink-0 dark:text-zinc-400" />
    </button>
  );
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, selectedLabel } = React.useContext(SelectContext)!;
  const showPlaceholder = !selectedLabel && !value;
  
  return (
    <span className={`block truncate ${showPlaceholder ? "text-zinc-400 dark:text-zinc-500 font-normal" : ""}`}>
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
      className={`absolute z-50 min-w-full w-auto whitespace-nowrap overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-lg animate-in fade-in-80 zoom-in-95 mt-1 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${alignClass} ${className}`}
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
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-[13px] outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 text-primary-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
};
