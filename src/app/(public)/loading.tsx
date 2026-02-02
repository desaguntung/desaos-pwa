"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 font-sans relative">
      {/* Global Scrollbar Hide */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header Skeleton (Home Style) */}
      <div className="bg-white/80 backdrop-blur-md pt-6 pb-2 px-6 sticky top-0 z-40 border-b border-slate-200/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
             <div className="space-y-1.5">
               <Skeleton className="h-3 w-20 rounded-md bg-slate-200" />
               <Skeleton className="h-4 w-32 rounded-md bg-slate-300" />
             </div>
          </div>
          <div className="flex gap-2">
             <Skeleton className="h-9 w-9 rounded-full bg-slate-100" />
             <Skeleton className="h-9 w-9 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-8">
        
        {/* Banner Section (Carousel) */}
        <div className="space-y-3">
           <Skeleton className="aspect-[16/9] w-full rounded-[32px] shadow-sm bg-slate-200" />
           <div className="flex justify-center gap-1.5">
              <Skeleton className="h-1.5 w-4 rounded-full bg-slate-300" />
              <Skeleton className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              <Skeleton className="h-1.5 w-1.5 rounded-full bg-slate-200" />
           </div>
        </div>

        {/* Quick Menu (Grid Icons) */}
        <div>
           <div className="grid grid-cols-4 gap-y-6 gap-x-4">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="flex flex-col items-center gap-2.5">
                 <Skeleton className="h-[52px] w-[52px] rounded-[20px] bg-white shadow-sm border border-slate-100" />
                 <Skeleton className="h-2 w-12 rounded-md bg-slate-200" />
               </div>
             ))}
           </div>
        </div>

        {/* Info / Widget Section */}
        <div className="grid grid-cols-2 gap-4">
           <Skeleton className="h-32 rounded-[24px] bg-blue-50/50 border border-blue-100" />
           <Skeleton className="h-32 rounded-[24px] bg-orange-50/50 border border-orange-100" />
        </div>

        {/* Latest News List */}
        <div className="space-y-4 pt-2">
           <div className="flex justify-between items-center px-1">
              <Skeleton className="h-5 w-32 rounded-lg bg-slate-200" />
              <Skeleton className="h-4 w-16 rounded-lg bg-slate-100" />
           </div>
           
           {[...Array(3)].map((_, i) => (
             <div key={i} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
               <Skeleton className="h-20 w-20 rounded-xl bg-slate-200 shrink-0" />
               <div className="flex-1 space-y-2 py-1">
                 <Skeleton className="h-3 w-16 rounded bg-blue-50" />
                 <Skeleton className="h-4 w-full rounded bg-slate-200" />
                 <div className="flex items-center gap-2 mt-auto">
                    <Skeleton className="h-3 w-3 rounded-full bg-slate-100" />
                    <Skeleton className="h-2 w-20 rounded bg-slate-100" />
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
