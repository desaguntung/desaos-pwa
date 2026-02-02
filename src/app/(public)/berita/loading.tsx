"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white pb-24 font-sans relative">
      {/* Global Scrollbar Hide */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header Skeleton */}
      <div className="bg-white pt-6 pb-2 px-4 sticky top-0 z-40 border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-32 rounded-lg bg-slate-200" />
            <Skeleton className="h-3 w-40 rounded-md bg-slate-100" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl mb-3">
          {[...Array(3)].map((_, i) => (
             <Skeleton key={i} className="flex-1 h-10 rounded-lg bg-white/50" />
          ))}
        </div>
      </div>

      <div className="px-4 py-4 min-h-[60vh] space-y-6">
          {/* Category Filter Skeleton */}
          <div className="flex gap-2 overflow-hidden">
             {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full bg-slate-100 shrink-0" />
             ))}
          </div>

          {/* Featured News Skeleton */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100">
             <Skeleton className="absolute inset-0 w-full h-full bg-slate-200" />
             <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <Skeleton className="h-5 w-24 rounded-md bg-white/30" />
                <Skeleton className="h-6 w-full rounded-md bg-white/40" />
                <Skeleton className="h-6 w-2/3 rounded-md bg-white/40" />
             </div>
          </div>

          {/* List View Skeleton */}
          <div className="space-y-4">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="flex gap-4 p-1">
                 {/* Thumbnail */}
                 <Skeleton className="h-[75px] w-[100px] rounded-xl bg-slate-200 shrink-0" />
                 
                 {/* Content */}
                 <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2">
                   <div className="flex items-center gap-2">
                      <Skeleton className="h-2.5 w-12 rounded bg-blue-50" />
                      <Skeleton className="h-2.5 w-12 rounded bg-slate-100" />
                   </div>
                   <div className="space-y-1">
                      <Skeleton className="h-3.5 w-full rounded bg-slate-200" />
                      <Skeleton className="h-3.5 w-3/4 rounded bg-slate-200" />
                   </div>
                   <div className="flex justify-between items-center mt-1">
                      <Skeleton className="h-2.5 w-16 rounded bg-slate-100" />
                      <Skeleton className="h-3 w-3 rounded-full bg-slate-100" />
                   </div>
                 </div>
               </div>
             ))}
          </div>
      </div>
    </div>
  );
}
