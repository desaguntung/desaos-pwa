import { Bell, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MobileHeaderProps {
  logo?: string;
  appName?: string;
}

export default function MobileHeader({ logo, appName = "DesaOS" }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-slate-200/50 px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {logo ? (
          <Image src={logo} alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
        )}
        <h1 className="font-bold text-lg text-slate-800 tracking-tight">{appName}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>
        <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5" strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </div>
  );
}
