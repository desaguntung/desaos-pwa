"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PortalSectionHeaderProps {
  title: string;
  href?: string;
  color?: string;
}

export default function PortalSectionHeader({ title, href }: PortalSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d2d2d7]/50 dark:border-zinc-800">
      <h2 className="text-[24px] md:text-[28px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
        {title}
      </h2>
      {href && (
        <Link 
            href={href} 
            className="flex items-center gap-1 text-[15px] font-medium text-[#06c] hover:underline transition-all"
        >
            Lihat Semua <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
