"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <div className="relative w-full overflow-hidden bg-zinc-50 py-20 md:py-28">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-col items-center gap-3">
               <Skeleton className="h-4 w-32 rounded-full bg-zinc-200" />
               <Skeleton className="h-10 w-64 rounded-xl bg-zinc-300 md:h-12 md:w-80" />
            </div>
            <div className="flex justify-center">
               <Skeleton className="h-4 w-48 rounded-md bg-zinc-200 md:w-96" />
            </div>
          </div>
        </div>
        
        {/* Background Pattern Skeleton */}
        <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-zinc-200 blur-3xl filter" />
            <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-zinc-200 blur-3xl filter" />
        </div>
      </div>
      
      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-zinc-200 p-8 md:p-12 space-y-6">
             {/* Content Text Skeleton */}
             <div className="space-y-4">
               <Skeleton className="h-4 w-full rounded bg-zinc-100" />
               <Skeleton className="h-4 w-[90%] rounded bg-zinc-100" />
               <Skeleton className="h-4 w-[95%] rounded bg-zinc-100" />
             </div>
             
             <div className="space-y-4 pt-4">
               <Skeleton className="h-4 w-[98%] rounded bg-zinc-100" />
               <Skeleton className="h-4 w-[85%] rounded bg-zinc-100" />
               <Skeleton className="h-4 w-full rounded bg-zinc-100" />
               <Skeleton className="h-4 w-[92%] rounded bg-zinc-100" />
             </div>

             <div className="pt-8 flex justify-center">
                <Skeleton className="h-64 w-full rounded-2xl bg-zinc-50" />
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
