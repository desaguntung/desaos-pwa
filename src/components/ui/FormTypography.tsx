import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

/**
 * Standard Form Header Style
 * Font: Sans Serif
 * Size: 20px
 * Weight: 400 (Normal)
 * Line Height: 32px
 */
export const FormHeader = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 
      className={cn(
        "font-sans text-[20px] font-normal leading-[32px] text-zinc-900",
        className
      )}
      style={{
        fontFamily: 'var(--font-sans)'
      }}
      {...props}
    >
      {children}
    </h1>
  );
};

/**
 * Standard Form Description/Terms Style
 * Size: 13px
 * Color: hsla(0, 0%, 40%, 1)
 */
export const FormDescription = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p 
      className={cn(
        "text-[13px] text-[hsla(0,0%,40%,1)] Text--terms",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};
