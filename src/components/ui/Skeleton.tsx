/* eslint-disable */
"use client";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-md",
        className
      )}
      {...props}
    >
        <style jsx global>{`
            @keyframes shimmer {
                100% {
                    transform: translateX(100%);
                }
            }
        `}</style>
    </div>
  );
}

export { Skeleton };
