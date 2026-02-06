"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

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

  const finalSrc = error || !src 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallback || alt)}&background=random`
    : src;

  return (
    <img 
      src={finalSrc}
      alt={alt}
      className={cn(
        "object-cover border border-border-color",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      onError={() => setError(true)}
    />
  );
}
