import { CloudSun, Search } from "lucide-react";

interface MobileBannerProps {
  sebutanDesa: string;
  namaDesa: string;
  currentDate: string;
}

export default function MobileBanner({ sebutanDesa, namaDesa, currentDate }: MobileBannerProps) {
  return (
    <div className="px-5 mt-4 mb-8">
      {/* Date Pill */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-slate-500 text-xs font-semibold tracking-wide uppercase">
          {currentDate}
        </p>
      </div>

      {/* Main Headline */}
      <div className="mb-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-[1.1]">
          Desa<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digital</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-1 tracking-tight">
          {sebutanDesa} {namaDesa}
        </p>
      </div>

      {/* Modern Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" strokeWidth={2} />
        </div>
        <input 
          type="text" 
          placeholder="Cari layanan atau informasi..." 
          className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-[24px] text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
        />
        <div className="absolute right-2 top-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs font-bold shadow-sm">
          ⌘K
        </div>
      </div>
    </div>
  );
}
