"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  bgClass?: string;
  textClass?: string;
  size?: "large" | "medium";
  variant?: "centered" | "bottom" | "split"; 
  imagePlaceholderColor?: string;
  imageSrc?: string;
  logo?: React.ReactNode; // Optional logo component/image
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  bgClass = "bg-[#f5f5f7]",
  textClass = "text-[--apple-text-dark]",
  size = "large",
  variant = "centered",
  imagePlaceholderColor = "from-zinc-200/50 to-transparent",
  imageSrc,
  logo,
  titleClassName,
  subtitleClassName,
}: HeroSectionProps) {
  
  const isDark = textClass.includes("white");

  return (
    <section 
      className={cn(
        "unit-wrapper relative w-full overflow-hidden flex flex-col items-center",
        size === "large" ? "min-h-[560px] md:h-[580px]" : "min-h-[500px] md:h-[500px]",
        bgClass,
        textClass
      )}
    >
      <a 
        href={primaryAction?.href || "#"} 
        className="unit-link absolute inset-0 z-0 bg-[#fff]"
        aria-label={title}
      >
        &nbsp;
      </a>

      <div 
        className="mx-auto max-w-[1024px] w-full h-full relative z-10 flex flex-col md:flex-row"
        style={{
          paddingLeft: "max(22px, env(safe-area-inset-left))",
          paddingRight: "max(22px, env(safe-area-inset-right))"
        }}
      >
        <div 
            className={cn(
            "unit-copy-wrapper z-20 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both pointer-events-none pt-16 md:pt-0",
            variant === "split" ? "w-full md:w-[45%] items-center md:items-start text-center md:text-left order-1" : "w-full items-center text-center mx-auto max-w-[800px]",
            variant === "bottom" && "justify-end pb-[50px] md:pb-[60px]"
            )}
        >
            {logo ? (
            <div className={cn("headline mb-4 flex", variant === "split" ? "justify-center md:justify-start" : "justify-center")}>{logo}</div>
            ) : (
            <h2 className={cn("headline font-semibold mb-1", size === "large" ? "text-4xl md:text-6xl lg:text-[56px] tracking-tight" : "text-3xl md:text-5xl tracking-tight", titleClassName)}>
                {title}
            </h2>
            )}

            {subtitle && (
            <h3 className={cn("subhead font-normal mb-3", size === "large" ? "text-xl md:text-[28px]" : "text-xl md:text-[24px]", subtitleClassName)}>
                {subtitle}
            </h3>
            )}
            
            {description && (
            <p className={cn(
                "subhead text-[17px] md:text-[21px] font-normal opacity-80 leading-relaxed mb-6",
                variant === "split" ? "max-w-[400px] mx-auto md:mx-0" : "max-w-[600px] mx-auto"
            )}>
                {description}
            </p>
            )}

            <div className={cn("cta-links flex items-center gap-4 mt-6 pointer-events-auto", variant === "split" ? "justify-center md:justify-start" : "justify-center")}>
            {primaryAction && (
                <Link 
                  href={primaryAction.href} 
                  className="inline-flex h-11 md:h-[52px] items-center justify-center rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-8 md:px-10 text-[15px] md:text-[17px] font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                {primaryAction.label}
                </Link>
            )}
            {secondaryAction && (
                <Link 
                    href={secondaryAction.href} 
                    className={cn(
                      "group inline-flex items-center gap-1 text-[17px] md:text-[21px] font-normal transition-colors", 
                      isDark ? "text-white hover:text-zinc-200" : "text-[#0071e3] hover:text-[#0077ed] hover:underline"
                    )}
                >
                {secondaryAction.label} <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
            )}
            </div>
        </div>

        {/* Visual Element (Device Placeholder) */}
        <div 
            className={cn(
            "unit-image-wrapper pointer-events-none z-10 flex items-end justify-center",
            variant === "split" ? "relative w-full md:w-[55%] h-full order-2 md:items-center md:justify-end" : "absolute inset-0 w-full h-full"
            )}
        >
            {imageSrc ? (
                <img 
                src={imageSrc} 
                alt={title} 
                className={cn(
                    "unit-image transition-transform duration-500 hover:scale-105",
                    variant === "split" ? "w-[85%] md:w-auto h-auto md:h-[80%] object-contain object-bottom md:object-center mt-10 md:mt-0" : "w-full h-full object-cover"
                )} 
                />
            ) : (
                <figure className={cn(
                "unit-image w-full h-full md:w-[80%] md:h-[80%] rounded-[30px] blur-3xl opacity-60", 
                imagePlaceholderColor
                )}></figure>
            )}
        </div>
      </div>
    </section>
  );
}
