"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Official = {
  name: string;
  role?: string;
  imageSrc: string;
  href: string;
};

function OfficialCard({ item }: { item: Official }) {
  return (
    <div className="flex flex-col w-[240px] md:w-[280px]">
      <div className="relative rounded-2xl overflow-hidden bg-zinc-200">
        <img
          src={item.imageSrc}
          alt={item.name}
          className="w-full h-[160px] md:h-[180px] object-cover"
        />
        <Link
          href={item.href}
          className="absolute left-3 bottom-3 bg-lime-300 text-black text-[11px] font-medium tracking-wide px-2 py-1 rounded-md"
        >
          Selengkapnya
        </Link>
      </div>
      <div className="mt-2">
        <p className="text-xs font-light tracking-wide text-[#424245]">{item.name}</p>
        {item.role && (
          <p className="text-[10px] font-light tracking-wide text-[#6e6e73]">{item.role}</p>
        )}
      </div>
    </div>
  );
}

export default function OfficialsSection() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const suppressUntilRef = useRef(0);
  const posRef = useRef(0);
  const hoveredRef = useRef(false);
  const playingRef = useRef(true);
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  const items: Official[] = [
    {
      name: "Kepala Desa",
      role: "Aparatur Pemerintah Desa",
      imageSrc: "https://placehold.co/600x400/ffffff/cccccc?text=Kepala+Desa",
      href: "/pemerintah-desa/kepala-desa",
    },
    {
      name: "Sekretaris Desa",
      role: "Aparatur Pemerintah Desa",
      imageSrc: "https://placehold.co/600x400/ffffff/cccccc?text=Sekretaris+Desa",
      href: "/pemerintah-desa/sekretaris-desa",
    },
    {
      name: "Kaur Umum",
      role: "Aparatur Pemerintah Desa",
      imageSrc: "https://placehold.co/600x400/ffffff/cccccc?text=Kaur+Umum",
      href: "/pemerintah-desa/kaur-umum",
    },
    {
      name: "Kaur Keuangan",
      role: "Aparatur Pemerintah Desa",
      imageSrc: "https://placehold.co/600x400/ffffff/cccccc?text=Kaur+Keuangan",
      href: "/pemerintah-desa/kaur-keuangan",
    },
    {
      name: "Kasi Pemerintahan",
      role: "Aparatur Pemerintah Desa",
      imageSrc: "https://placehold.co/600x400/ffffff/cccccc?text=Kasi+Pemerintahan",
      href: "/pemerintah-desa/kasi-pemerintahan",
    },
  ];

  const loopItems = [...items, ...items, ...items, ...items];
  const navJump = (amount: number) => {
    const el = trackRef.current;
    if (!el) return;
    suppressUntilRef.current = performance.now() + 800;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = 0;
    let currentSpeed = 0.5; // Start slightly slower
    
    // Initialize position
    posRef.current = el.scrollLeft;

    const loop = (t: number) => {
      const dtRaw = last ? t - last : 16;
      const dt = Math.min(50, dtRaw); // Cap dt to avoid huge jumps on lag
      last = t;

      if (playingRef.current) {
        // If user is manually interacting (suppressed), sync posRef and skip auto-scroll
        if (t < suppressUntilRef.current) {
          posRef.current = el.scrollLeft;
          raf = requestAnimationFrame(loop);
          return;
        } 

        // Smoothly interpolate speed
        // Normal speed: 0.8 (optimal flow), Hover speed: 0.4 (slow but smooth, avoiding sub-pixel stutter)
        const targetSpeed = hoveredRef.current ? 0.4 : 0.8;
        currentSpeed = currentSpeed + (targetSpeed - currentSpeed) * 0.08;

        // Apply movement (normalized to ~60fps frame time of 16.67ms)
        const move = currentSpeed * (dt / 16.67);
        posRef.current += move;

        // Calculate width of one set of items to handle infinite loop
        // We measure the first child and gap to be precise
        if (el.children.length > 0) {
          const firstChild = el.children[0] as HTMLElement;
          // Get gap from computed style
          const style = window.getComputedStyle(el);
          const gap = parseFloat(style.columnGap || style.gap || "0");
          const itemWidth = firstChild.offsetWidth;
          
          // Total width of one original set (items + gaps)
          // Note: items.length is the original count (5)
          const singleSetWidth = items.length * (itemWidth + gap);

          // If we've scrolled past the first set, jump back seamlessly
          if (posRef.current >= singleSetWidth) {
            posRef.current -= singleSetWidth;
          }
        }

        el.scrollLeft = posRef.current;
      } else {
        posRef.current = el.scrollLeft;
      }
      
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [items.length]); // Re-run if items count changes

  return (
    <section className={cn("w-full bg-[#fbfbfd] py-6 md:py-10")}>
      <div
        className="mx-auto max-w-[1024px]"
        style={{
          paddingLeft: "max(22px, env(safe-area-inset-left))",
          paddingRight: "max(22px, env(safe-area-inset-right))",
        }}
      >
        <div className="bg-[#f5f5f7] rounded-3xl px-0 md:px-0 py-6 md:py-8">
          <div className="flex items-center justify-between px-4 md:px-6 mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#424245]">
              Aparatur Pemerintah Desa
            </h2>
            <button
              aria-label={playing ? "Pause" : "Play"}
              className="bg-[#f0f9ff] text-[#424245] rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          <div
            className="relative group pb-2"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              ref={trackRef}
              className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar"
              onScroll={(e) => {
                // Only update posRef from scroll event if we are NOT auto-scrolling 
                // (e.g. user swipe/wheel). But since we write to scrollLeft every frame,
                // this event fires constantly. We trust our posRef during animation.
                // We mainly need this for when animation is paused or suppressed.
                if (!playingRef.current || performance.now() < suppressUntilRef.current) {
                   posRef.current = (e.currentTarget as HTMLDivElement).scrollLeft;
                }
              }}
            >
              {loopItems.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="snap-start">
                  <div className="group/item flex flex-col w-[240px] md:w-[280px]">
                    <div className="relative rounded-2xl overflow-hidden bg-zinc-200">
                      <img
                        src={item.imageSrc}
                        alt={item.name}
                        className="w-full h-[160px] md:h-[180px] object-cover"
                      />
                      <Link
                        href={item.href}
                        className="absolute left-3 bottom-3 bg-lime-300 text-black text-[11px] font-medium tracking-wide px-2 py-1 rounded-md opacity-0 transition-opacity duration-200 group-hover/item:opacity-100 active:opacity-100 focus-visible:opacity-100"
                      >
                        Selengkapnya
                      </Link>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-light tracking-wide text-[#424245]">{item.name}</p>
                      {item.role && (
                        <p className="text-[10px] font-light tracking-wide text-[#6e6e73]">{item.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              aria-label="Sebelumnya"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-100/60 backdrop-blur-sm border border-zinc-300 text-[#424245] rounded-full w-12 h-12 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => navJump(-340)}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <button
              aria-label="Berikutnya"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-100/60 backdrop-blur-sm border border-zinc-300 text-[#424245] rounded-full w-12 h-12 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => navJump(340)}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
