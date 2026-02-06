import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { CalendarIcon, Clock } from "lucide-react";

interface BaseFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  description?: string;
}

interface InputFieldProps extends BaseFieldProps, React.InputHTMLAttributes<HTMLInputElement> {}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, required, error, className, description, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-primary-text">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input
        ref={ref}
        className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
        {...props}
      />
      {description && <p className="text-xs text-secondary-text">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
InputField.displayName = "InputField";

interface TextAreaFieldProps extends BaseFieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, required, error, className, description, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-primary-text">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Textarea
        ref={ref}
        className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
        {...props}
      />
      {description && <p className="text-xs text-secondary-text">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
TextAreaField.displayName = "TextAreaField";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export const SelectField = ({
  label,
  required,
  error,
  className,
  description,
  value,
  onValueChange,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled,
}: SelectFieldProps) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-medium text-primary-text">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <Select value={value} onValueChange={onChange || onValueChange || (() => {})}>
      <SelectTrigger disabled={disabled} className={cn(error && "border-red-500 focus:ring-red-500", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {description && <p className="text-xs text-secondary-text">{description}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const DatePickerField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, required, error, className, description, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-primary-text">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Input
          type="date"
          ref={ref}
          className={cn(
            "pl-10 text-left uppercase [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            !props.value && "text-secondary-text",
            "[&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-secondary-text pointer-events-none" />
      </div>
      {description && <p className="text-xs text-secondary-text">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
DatePickerField.displayName = "DatePickerField";

export const SectionTitle = ({ title, icon: Icon, description }: { title: string; icon?: any; description?: string }) => (
  <div className="pb-4 mb-6 border-b border-border-color">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="w-4 h-4 text-accent" />}
      <h3 className="text-lg font-semibold text-primary-text">{title}</h3>
    </div>
    {description && <p className="text-sm text-secondary-text">{description}</p>}
  </div>
);
