"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-body-bg dark:bg-zinc-950 font-sans pb-32">
       {/* Hero Image Skeleton */}
       <div className="relative w-full h-[45vh] md:h-[60vh] bg-gray-200 dark:bg-zinc-800 overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full bg-gray-300 dark:bg-zinc-700" />
       </div>

       {/* Floating Title Card Skeleton */}
       <div className="relative -mt-24 mx-5 z-10 md:max-w-4xl md:mx-auto">
          <div className="bg-card-bg/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 border border-border-color/60 dark:border-zinc-800">
             <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20" />
                <div className="flex items-center gap-1.5">
                   <Skeleton className="h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-zinc-800" />
                   <Skeleton className="h-3 w-24 rounded bg-gray-100 dark:bg-zinc-800" />
                </div>
             </div>

             <div className="space-y-3 mb-5">
               <Skeleton className="h-8 w-full rounded-lg bg-gray-800/10 dark:bg-white/10" />
               <Skeleton className="h-8 w-3/4 rounded-lg bg-gray-800/10 dark:bg-white/10" />
             </div>

             <div className="flex items-center gap-3 pt-5 border-t border-border-color dark:border-zinc-800">
                <Skeleton className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-800" />
                <div className="flex flex-col gap-1.5">
                   <Skeleton className="h-3 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
                   <Skeleton className="h-2.5 w-32 rounded bg-gray-100 dark:bg-zinc-800" />
                </div>
             </div>
          </div>
       </div>

       {/* Content Skeleton */}
       <div className="px-6 pt-8 md:max-w-4xl md:mx-auto space-y-6">
           <div className="space-y-4">
              <Skeleton className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-[95%] rounded bg-gray-200 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-[98%] rounded bg-gray-200 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-[90%] rounded bg-gray-200 dark:bg-zinc-800" />
           </div>

           <Skeleton className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-zinc-800 my-8" />

           <div className="space-y-4">
              <Skeleton className="h-4 w-[96%] rounded bg-gray-200 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-[92%] rounded bg-gray-200 dark:bg-zinc-800" />
           </div>
       </div>
    </div>
  );
}
