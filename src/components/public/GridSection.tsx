import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppleLogo } from "@/components/public/AppleLogo";

interface GridItemProps {
  title: string;
  subtitle: string;
  link: { label: string; href: string };
  secondaryLink?: { label: string; href: string };
  bgClass?: string;
  dark?: boolean; // If true, text is white
  layout?: "top" | "bottom"; // Text position
  imageColor?: string; // Placeholder for image
  logo?: React.ReactNode;
}

function GridItem({ 
  title, 
  subtitle, 
  link, 
  secondaryLink,
  bgClass = "bg-[#f5f5f7]", 
  dark = false,
  layout = "top",
  imageColor,
  logo
}: GridItemProps) {
  return (
    <div 
      className={cn(
        "relative w-full h-[500px] md:h-[580px] overflow-hidden flex flex-col group cursor-pointer transition-transform duration-500 hover:scale-[1.01]",
        layout === "top" ? "justify-start pt-[50px]" : "justify-end pb-[50px]",
        "items-center text-center",
        bgClass
      )}
    >
      <div className="z-10 px-6 max-w-[320px] md:max-w-[400px]">
        {logo ? (
          <div className="mb-2 flex justify-center">{logo}</div>
        ) : (
          <h4 className={cn("text-3xl md:text-4xl font-semibold mb-2 tracking-tight", dark ? "text-white" : "text-[--apple-text-dark]")}>
            {title}
          </h4>
        )}
        <p className={cn("text-lg md:text-xl mb-4 font-normal", dark ? "text-zinc-200" : "text-[--apple-text-dark]")}>
          {subtitle}
        </p>
        <div className="flex justify-center gap-6">
             <Link href={link.href} className={cn("apple-link", dark ? "text-white hover:text-zinc-200" : "text-[#0066cc] hover:underline")}>
                {link.label} <ChevronRight className="w-4 h-4" />
             </Link>
             {secondaryLink && (
               <Link href={secondaryLink.href} className={cn("apple-link", dark ? "text-white hover:text-zinc-200" : "text-[#0066cc] hover:underline")}>
                  {secondaryLink.label} <ChevronRight className="w-4 h-4" />
               </Link>
             )}
        </div>
      </div>
      
      {/* Visual Element Placeholder */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none z-0",
        layout === "top" ? "mt-32" : "mb-32"
      )}>
         <div className={cn(
           "w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-60", 
           imageColor || (dark ? "bg-blue-500" : "bg-zinc-300")
         )}></div>
      </div>
    </div>
  );
}

export default function GridSection() {
  return (
    <section className="px-4 py-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1440px] mx-auto">
        {/* Privasi */}
        <GridItem 
          title="Privasi"
          subtitle="Didesain di dalam semua yang kami lakukan."
          link={{ label: "Selengkapnya", href: "/id/privacy/" }}
          bgClass="bg-black"
          dark={true}
          layout="bottom"
          imageColor="bg-blue-500"
          logo={
            <div className="flex items-center justify-center gap-2 mb-2">
                <AppleLogo className="h-10 w-auto fill-white" />
                <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Privasi</span>
            </div>
          }
        />

        {/* iPad */}
        <GridItem 
          title="iPad"
          subtitle="Kini dengan kecepatan chip A16 dan dua kali lipat kemampuan penyimpanan awal."
          link={{ label: "Selengkapnya", href: "/id/ipad-11/" }}
          secondaryLink={{ label: "Beli", href: "/id/buy/?ipad" }}
          bgClass="bg-[#f5f5f7]"
          layout="top"
          imageColor="bg-blue-200"
        />

        {/* Apple Watch Ultra 3 */}
        <GridItem 
          title="Apple Watch Ultra 3"
          subtitle="Partner tangguh."
          link={{ label: "Selengkapnya", href: "/id/apple-watch-ultra-3/" }}
          secondaryLink={{ label: "Beli", href: "/id/buy/?watch" }}
          bgClass="bg-black"
          dark={true}
          layout="bottom"
          imageColor="bg-orange-500"
          logo={
             <div className="flex flex-col items-center mb-2">
                <AppleLogo className="h-8 w-auto fill-white mb-1" />
                <span className="text-xl md:text-2xl font-semibold tracking-tight text-white uppercase italic">WATCH</span>
                <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">ULTRA 3</span>
             </div>
          }
        />

        {/* AirPods Pro 3 */}
        <GridItem 
          title="AirPods Pro 3"
          subtitle="Peredam Kebisingan Aktif dalam telinga, terbaik di dunia."
          link={{ label: "Selengkapnya", href: "/id/airpods-pro/" }}
          secondaryLink={{ label: "Beli", href: "/id/buy/?airpods" }}
          bgClass="bg-black"
          dark={true}
          layout="top"
          imageColor="bg-purple-500"
        />

        {/* MacBook Pro M5 */}
        <GridItem 
          title="MacBook Pro 14”"
          subtitle="Bertenaga super berkat M5."
          link={{ label: "Selengkapnya", href: "/id/macbook-pro/" }}
          secondaryLink={{ label: "Beli", href: "/id/buy/?mac" }}
          bgClass="bg-[#f5f5f7]"
          layout="bottom"
          imageColor="bg-gray-300"
        />
      </div>
    </section>
  );
}
