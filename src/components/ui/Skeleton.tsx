import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-zinc-200/60 dark:bg-zinc-800/60",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent",
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
