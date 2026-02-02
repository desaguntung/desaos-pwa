"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 font-sans">
      {/* Global Scrollbar Hide */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Hero Section Skeleton (Centered) */}
      <div className="bg-zinc-50 pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center border-b border-zinc-200">
         <Skeleton className="h-4 w-32 rounded-full bg-zinc-200 mb-4" />
         <Skeleton className="h-10 w-64 rounded-xl bg-zinc-300 mb-4" />
         <Skeleton className="h-4 w-48 rounded-md bg-zinc-200" />
      </div>

      <div className="-mt-12 px-4 relative z-10 space-y-6 max-w-5xl mx-auto">
         {/* Summary Cards Grid */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center gap-2">
                 <Skeleton className="h-8 w-16 rounded-lg bg-blue-100" />
                 <Skeleton className="h-3 w-24 rounded-md bg-zinc-100" />
              </div>
            ))}
         </div>

         {/* Charts Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart Card 1 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-6">
               <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-40 rounded-lg bg-zinc-200" />
                  <Skeleton className="h-8 w-8 rounded-full bg-zinc-100" />
               </div>
               {/* Bar Chart Skeleton */}
               <div className="flex items-end gap-2 h-48 pt-4">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton 
                      key={i} 
                      className="flex-1 rounded-t-lg bg-zinc-100" 
                      style={{ height: `${Math.random() * 80 + 20}%` }} 
                    />
                  ))}
               </div>
            </div>

            {/* Chart Card 2 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-6">
               <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-40 rounded-lg bg-zinc-200" />
                  <Skeleton className="h-8 w-8 rounded-full bg-zinc-100" />
               </div>
               {/* Pie Chart Skeleton (Circle) */}
               <div className="flex justify-center py-4">
                  <Skeleton className="h-40 w-40 rounded-full bg-zinc-100 border-8 border-white shadow-inner" />
               </div>
               <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded bg-zinc-50" />
                  <Skeleton className="h-3 w-2/3 rounded bg-zinc-50" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
