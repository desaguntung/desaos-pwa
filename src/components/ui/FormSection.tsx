import React from "react";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./FormFields";

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, icon, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card-bg rounded-xl border border-border-color p-6 md:p-8 scroll-mt-24",
          className
        )}
        {...props}
      >
        <SectionTitle title={title} description={description} icon={icon} />
        {children}
      </div>
    );
  }
);
FormSection.displayName = "FormSection";
