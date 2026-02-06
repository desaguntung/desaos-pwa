import React, { useRef, useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "./Input";
import { cn } from "@/lib/utils";

export interface SearchOption {
  value: string;
  label: string;
  subLabel?: string;
  originalData?: any;
}

interface AsyncSearchSelectProps {
  label?: string;
  placeholder?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchOption[];
  onSelect: (option: SearchOption) => void;
  isLoading?: boolean;
  className?: string;
  error?: string;
}

export function AsyncSearchSelect({
  label,
  placeholder,
  description,
  value,
  onChange,
  options,
  onSelect,
  isLoading,
  className,
  error,
}: AsyncSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (option: SearchOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-primary-text">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(error && "border-red-500 focus-visible:ring-red-500")}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && (
          <div className="absolute top-2.5 right-3 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-secondary-text" />
          </div>
        )}
        
        {isOpen && options.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto bg-card-bg border border-border-color rounded-md">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full text-left px-3 py-2 text-xs hover:bg-body-bg transition-colors border-b border-border-color last:border-0"
                onClick={() => handleSelect(option)}
              >
                <div className="font-medium text-primary-text">
                  {option.label}
                </div>
                {option.subLabel && (
                  <div className="text-xs text-secondary-text mt-0.5">
                    {option.subLabel}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {description && <p className="text-xs text-secondary-text">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
