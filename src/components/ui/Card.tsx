import React from "react";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-border-color bg-card-bg text-primary-text ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-4 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-secondary-text ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-4 pt-0 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-4 pt-0 ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export interface CardImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

export const CardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ className = "", src, alt, fallback, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden bg-body-bg ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Card Image"}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-secondary-text">
          {fallback}
        </div>
      )}
      {children}
    </div>
  )
);
CardImage.displayName = "CardImage";
