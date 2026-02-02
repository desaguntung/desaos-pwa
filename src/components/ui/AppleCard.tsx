"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppleCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: any;
  delay?: number;
  noPadding?: boolean;
}

export const AppleCard = ({ 
  children, 
  className, 
  title, 
  subtitle, 
  icon: Icon, 
  delay = 0,
  noPadding = false
}: AppleCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={cn(
      "bg-white rounded-[24px] md:rounded-[32px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out flex flex-col border border-white/50 backdrop-blur-xl", 
      !noPadding && "p-6 md:p-8",
      className
    )}
  >
    {(title || Icon) && (
      <div className="mb-6 flex items-start justify-between">
        <div>
          {title && <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">{title}</h3>}
          {subtitle && <p className="text-[#86868b] text-[15px] font-medium mt-1 leading-snug">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    )}
    {children}
  </motion.div>
);
