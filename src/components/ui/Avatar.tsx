"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  className?: string;
}

export function Avatar({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  shape = 'circle',
  className = '' 
}: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-12 w-12 text-lg',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const initials = (fallback || alt || "")
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src && !error) {
    return (
      <img 
        src={src}
        alt={alt}
        className={cn(
          "object-cover border border-border-color shrink-0",
          sizeClasses[size],
          shapeClasses[shape],
          className
        )}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-semibold border border-border-color shrink-0 select-none uppercase tracking-wider",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      aria-label={alt}
    >
      {initials ? initials : <User className="w-4 h-4 opacity-70" />}
    </div>
  );
}

