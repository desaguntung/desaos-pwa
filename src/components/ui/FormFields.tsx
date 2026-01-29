import React, { useState, useEffect } from "react";
import { AlertCircle, ChevronRight } from "lucide-react";

export const SectionTitle = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-2 pb-2 mb-6 border-b border-border-color">
    <Icon className="w-4 h-4 text-secondary-text" />
    <h3 className="text-sm font-medium text-primary-text">{title}</h3>
  </div>
);

export const InputField = ({ label, required, className, ...props }: any) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-secondary-text uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`flex h-9 w-full rounded-md border border-border-color bg-card-bg px-3 py-1 text-sm text-primary-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  </div>
);

export const SelectField = ({ label, required, options, className, placeholder = "Pilih...", ...props }: any) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-secondary-text uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className={`flex h-9 w-full appearance-none items-center justify-between rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-primary-text shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
        defaultValue=""
        {...props}
      >
        <option value="" disabled className="bg-card-bg text-secondary-text">
          {placeholder}
        </option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-card-bg text-primary-text">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronRight className="absolute right-3 top-2.5 h-4 w-4 rotate-90 opacity-50 pointer-events-none text-primary-text" />
    </div>
  </div>
);

export const TextAreaField = ({ label, required, className, ...props }: any) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-secondary-text uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      className={`flex min-h-[60px] w-full rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-primary-text shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  </div>
);
