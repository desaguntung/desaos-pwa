"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, CloudCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function AmbientSystemStatus({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 border",
        isOnline
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 animate-pulse",
        className
      )}
      title={
        isOnline
          ? "Sistem terhubung ke server cloud desa (Online & Terbuka)"
          : "Koneksi internet terputus. Mode Offline aktif — draf Anda aman tersimpan di komputer lokal."
      }
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isOnline ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      <span className="hidden sm:inline">
        {isOnline ? "Tersinkron" : "Mode Offline"}
      </span>
    </div>
  );
}
