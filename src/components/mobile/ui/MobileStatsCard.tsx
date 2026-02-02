"use client";

import { useState, useEffect } from "react";
import { Users, User, Home, TrendingUp, PieChart } from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

function Counter({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString('id-ID'));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

interface MobileStatsCardProps {
  populationCount: number;
  maleCount: number;
  femaleCount: number;
  kkCount: number;
}

export default function MobileStatsCard({ 
  populationCount, 
  maleCount, 
  femaleCount, 
  kkCount 
}: MobileStatsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate percentages
  const malePercent = populationCount > 0 ? Math.round((maleCount / populationCount) * 100) : 0;
  const femalePercent = populationCount > 0 ? Math.round((femaleCount / populationCount) * 100) : 0;

  const stats = [
    {
      id: "total",
      label: "Total Penduduk",
      value: populationCount,
      unit: "Jiwa",
      icon: Users,
      color: "emerald",
      gradient: "from-emerald-500 via-emerald-600 to-teal-600",
      shadow: "shadow-emerald-500/30",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      trend: "+2.4%",
      detail: "Terverifikasi",
      showBar: false,
      barValue: 0
    },
    {
      id: "male",
      label: "Laki-Laki",
      value: maleCount,
      unit: "Jiwa",
      icon: User,
      color: "blue",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/30",
      bg: "bg-blue-50",
      text: "text-blue-600",
      trend: `${malePercent}%`,
      detail: "dari total",
      showBar: true,
      barValue: malePercent
    },
    {
      id: "female",
      label: "Perempuan",
      value: femaleCount,
      unit: "Jiwa",
      icon: User,
      color: "pink",
      gradient: "from-pink-500 via-pink-600 to-rose-600",
      shadow: "shadow-pink-500/30",
      bg: "bg-pink-50",
      text: "text-pink-600",
      trend: `${femalePercent}%`,
      detail: "dari total",
      showBar: true,
      barValue: femalePercent
    },
    {
      id: "kk",
      label: "Kepala Keluarga",
      value: kkCount,
      unit: "KK",
      icon: Home,
      color: "amber",
      gradient: "from-amber-500 via-amber-600 to-orange-600",
      shadow: "shadow-amber-500/30",
      bg: "bg-amber-50",
      text: "text-amber-600",
      trend: "+0.5%",
      detail: "Bulan ini",
      showBar: false,
      barValue: 0
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [stats.length]);

  const currentStat = stats[currentIndex];

  return (
    <div className="px-5">
      <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] h-[170px] transform-gpu">
        
        {/* Giant Watermark Icon (Right Side) */}
        <div className="absolute -right-6 bottom-0 z-0 pointer-events-none opacity-5">
           <currentStat.icon className={cn(
             "w-48 h-48 transition-colors duration-1000",
             currentStat.text
           )} strokeWidth={1.5} />
        </div>

        {/* Dynamic Background Mesh */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
             <div className={cn(
               "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000 ease-in-out -mr-20 -mt-20",
               currentStat.bg.replace("50", "200")
             )} />
             <div className={cn(
               "absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px] transition-all duration-1000 ease-in-out -ml-10 -mb-10 opacity-60",
               currentStat.bg.replace("50", "300")
             )} />
        </div>

        {/* Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-50/50 z-20">
          <motion.div 
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className={cn("h-full", currentStat.bg.replace("50", "500"))}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStat.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 p-6 flex flex-col justify-between relative z-10"
          >
            {/* Top Section: Icon & Trend */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 relative overflow-hidden group",
                  currentStat.gradient,
                  currentStat.shadow
                )}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <currentStat.icon className="w-6 h-6 relative z-10" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {currentStat.label}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    {currentStat.detail}
                  </p>
                </div>
              </div>

              <div className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md bg-white/60 border border-slate-100 shadow-sm transition-colors duration-500",
                currentStat.text
              )}>
                {currentStat.id === 'total' || currentStat.id === 'kk' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <PieChart className="w-3.5 h-3.5" />
                )}
                <span>{currentStat.trend}</span>
              </div>
            </div>

            {/* Middle Section: Value */}
            <div className="flex items-baseline gap-2 mt-1">
              <motion.h3 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="text-4xl font-black text-slate-800 tracking-tighter"
              >
                <Counter value={currentStat.value} />
              </motion.h3>
              <span className="text-sm font-semibold text-slate-400 mb-1">
                {currentStat.unit}
              </span>
            </div>
            
            {/* Bottom Section: Bar & Dots */}
            <div className="flex flex-col gap-3">
              {/* Bar Container (Fixed Height to prevent jumping) */}
              <div className="h-2 w-full flex items-center">
                {currentStat.showBar ? (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentStat.barValue}%` }}
                      transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                      className={cn(
                        "h-full rounded-full relative overflow-hidden",
                        currentStat.bg.replace("50", "500")
                      )}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="h-2 w-full" /> /* Spacer */
                )}
              </div>

              {/* Dots */}
              <div className="flex gap-1.5">
                {stats.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      idx === currentIndex 
                        ? cn("w-6", currentStat.bg.replace("50", "500")) 
                        : "w-1.5 bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
