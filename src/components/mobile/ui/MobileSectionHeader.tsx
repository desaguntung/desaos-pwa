import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MobileSectionHeaderProps {
  title: string;
  href?: string;
  actionLabel?: string;
}

export default function MobileSectionHeader({ title, href, actionLabel = "Lihat Semua" }: MobileSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 mb-3 mt-6">
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {href && (
        <Link href={href} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors">
          {actionLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
