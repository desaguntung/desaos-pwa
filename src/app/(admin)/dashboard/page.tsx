"use client";

import { 
  Users, 
  FileText, 
  Landmark, 
  Mail,
  Printer,
  Loader2,
  Calendar,
  ArrowUpRight,
  Zap,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  Circle,
  Clock,
  Activity,
  MoreHorizontal,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets
} from 'lucide-react';
import { PageHeader } from "@/components/layout/PageHeader";
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getDashboardStats, DashboardStats, getVillageLocation } from '@/lib/services/dashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Page() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Initialize clock on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather with auto-refresh every 5 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const village = await getVillageLocation();
        const adm4 = village?.kode_desa || '31.71.01.1002';

        const res = await fetch(`/api/bmkg/weather?adm4=${adm4}&t=${new Date().getTime()}`); // Add timestamp to bypass cache
        const data = await res.json();
        if (res.ok) {
            setWeatherData(data);
        }
      } catch (e) {
        console.error("Weather fetch error", e);
      }
    };
    
    fetchWeather(); // Initial fetch
    
    const weatherInterval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(weatherInterval);
  }, []);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
      if (isRefresh) toast.success("Dashboard diperbarui");
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
      toast.error("Gagal memperbarui dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const currentDate = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-info-text" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-border-color p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-info-bg via-info-bg/50 to-card-bg opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary-text">
              Selamat Pagi, Admin
            </h1>
            <p className="text-secondary-text text-base">
              Berikut ringkasan aktivitas desa hari ini, {currentDate}
            </p>
          </div>
          
          {/* Weather Widget */}
          <div className="flex items-center gap-6 bg-card-bg/60 backdrop-blur-sm p-4 rounded-xl border border-info-border shadow-sm">
                  {weatherData ? (
                     <>
                         <div className="text-right">
                            <div className="flex items-center justify-end gap-3">
                               <span className="text-3xl font-bold text-primary-text tracking-tight">
                                  {weatherData.current?.temp?.value || '--'}°
                               </span>
                               <div className="w-12 h-12 flex items-center justify-center bg-card-bg/60 backdrop-blur-sm rounded-full shadow-sm">
                                   {weatherData.current?.weatherDesc?.toLowerCase().includes('hujan') ? (
                                      <CloudRain className="w-6 h-6 text-info-text" />
                                   ) : weatherData.current?.weatherDesc?.toLowerCase().includes('awan') ? (
                                      <Cloud className="w-6 h-6 text-secondary-text" />
                                   ) : (
                                      <Sun className="w-6 h-6 text-warning-text" />
                                   )}
                               </div>
                            </div>
                            <p className="text-sm font-medium text-secondary-text mt-1">
                               {weatherData.current?.weatherDesc || 'Cerah'} • {weatherData.location || 'Jakarta'}
                            </p>
                         </div>
                         <div className="hidden xl:flex gap-6 border-l border-info-border/60 pl-6">
                             <div className="flex flex-col items-center">
                                <Droplets className="w-4 h-4 text-info-text mb-1" />
                                <span className="text-sm font-bold text-primary-text">{weatherData.current?.humidity?.value || '--'}%</span>
                                <span className="text-micro text-secondary-text font-medium tracking-wider">HUMIDITY</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <Wind className="w-4 h-4 text-success-text mb-1" />
                                <span className="text-sm font-bold text-primary-text">{weatherData.current?.wind?.value || '0'}</span>
                                <span className="text-micro text-secondary-text font-medium tracking-wider">WIND (km/h)</span>
                             </div>
                         </div>
                     </>
                  ) : (
                     <div className="flex items-center gap-2 text-secondary-text">
                         <Loader2 className="w-5 h-5 animate-spin" />
                         <span className="text-sm">Memuat info cuaca...</span>
                     </div>
                  )}
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
            {/* Left Content (Stats & Actions) */}
            <div className={cn(
              "space-y-8",
              isAnalyticsVisible ? "lg:col-span-9" : "lg:col-span-12"
            )}>
              {/* Stats Grid */}
              <div className={cn(
                "grid grid-cols-1 gap-6 transition-all duration-300",
                isAnalyticsVisible 
                  ? "md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4" 
                  : "md:grid-cols-2 lg:grid-cols-4"
              )}>
                <StatCard 
                  label="Total Penduduk" 
                  value={stats?.totalPenduduk || 0} 
                  icon={Users}
                  color="text-info-text"
                  trend="+2.5%"
                  trendUp={true}
                />
                <StatCard 
                  label="Total Keluarga" 
                  value={stats?.totalKeluarga || 0} 
                  icon={Landmark}
                  color="text-accent"
                  trend="+0.8%"
                  trendUp={true}
                />
                <StatCard 
                  label="Surat Masuk" 
                  value={stats?.totalSuratMasuk || 0} 
                  icon={Mail}
                  color="text-info-text"
                  trend="Perlu Tindakan"
                  trendColor="text-warning-text bg-warning-bg"
                />
                <StatCard 
                  label="Surat Keluar" 
                  value={stats?.totalSuratKeluar || 0} 
                  icon={Printer}
                  color="text-success-text"
                  trend="Selesai"
                  trendColor="text-success-text bg-success-bg"
                />
              </div>

              {/* Quick Actions Carousel */}
              <div className="flex flex-col gap-6">
                 <QuickActionsCarousel 
                    actions={[
                      { href: "/surat/cetak", label: "Cetak Surat", icon: <Printer className="w-4 h-4" /> },
                      { href: "/penduduk", label: "Data Penduduk", icon: <Users className="w-4 h-4" /> },
                      { href: "/surat/masuk", label: "Surat Masuk", icon: <Mail className="w-4 h-4" /> },
                      { href: "/surat/keluar", label: "Surat Keluar", icon: <FileText className="w-4 h-4" /> },
                      { href: "/laporan", label: "Laporan", icon: <FileText className="w-4 h-4" /> },
                      { href: "/pengaturan", label: "Pengaturan", icon: <Users className="w-4 h-4" /> },
                      { href: "/identitas-desa", label: "Info Desa", icon: <Landmark className="w-4 h-4" /> },
                      { href: "/admin/statistik", label: "Statistik", icon: <ArrowUpRight className="w-4 h-4" /> },
                    ]}
                 />
              </div>
            </div>

            {/* Right Panel (Task List & Activity) */}
            {isAnalyticsVisible && (
              <div className="hidden lg:block lg:col-span-3 h-full border-l border-border-color bg-card-bg overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="p-6 space-y-6 h-full">
                   {/* Daftar Tugas */}
                   <div className="bg-card-bg border border-border-color rounded-xl p-6 flex flex-col h-[300px]">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success-text" />
                            <h3 className="text-xs font-medium text-secondary-text uppercase tracking-wider">Daftar Tugas</h3>
                         </div>
                         <button className="text-secondary-text hover:text-primary-text">
                            <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-1 space-y-0 scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                         {[
            { id: 1, text: "Verifikasi Data Penduduk Baru", done: false, tag: "Urgent", color: "text-error-text" },
            { id: 2, text: "Tanda tangan Surat Keterangan", done: false, tag: "Surat", color: "text-info-text" },
            { id: 3, text: "Update Profil Desa", done: true, tag: "Admin", color: "text-secondary-text" },
            { id: 4, text: "Cek Laporan Bulanan", done: false, tag: "Rutin", color: "text-warning-text" },
            { id: 5, text: "Backup Database", done: true, tag: "System", color: "text-secondary-text" },
          ].map((task) => (
            <div key={task.id} className="group flex items-center gap-3 py-3 border-b border-border-color last:border-0 cursor-pointer">
              <div className={cn(
                "flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                task.done ? "bg-success-text border-success-text" : "border-border-color group-hover:border-secondary-text"
              )}>
                                  {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                               </div>
                               <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                  <p className={cn(
                                     "text-xs font-medium truncate transition-colors",
                                     task.done ? "text-secondary-text line-through" : "text-primary-text group-hover:text-primary-text"
                                  )}>
                                     {task.text}
                                  </p>
                                  <span className={cn(
                                     "text-[10px] font-medium whitespace-nowrap",
                                     task.done ? "text-secondary-text" : task.color
                                  )}>
                                     {task.tag}
                                  </span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Aktifitas Terbaru */}
                   <div className="bg-card-bg border border-border-color rounded-xl p-6 flex flex-col h-[300px]">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-info-text" />
                            <h3 className="text-xs font-medium text-secondary-text uppercase tracking-wider">Aktifitas Terbaru</h3>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                         <div className="relative pl-4 border-l border-border-color space-y-6">
                            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                              stats.recentActivities.map((log, idx) => (
                               <div key={log.id || idx} className="relative group">
                                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-card-bg border-2 border-border-color group-hover:border-info-text transition-colors"></div>
                                  <div className="flex items-start gap-3">
                                     <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                        log.color
                                     )}>
                                        {log.avatar}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-xs text-secondary-text leading-relaxed">
                                           <span className="font-semibold text-primary-text">{log.user}</span> {log.action} <span className="font-medium text-primary-text">"{log.target}"</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                           <Clock className="w-3 h-3 text-secondary-text" />
                                           <span className="text-xs text-secondary-text font-medium">
                                             {formatDistanceToNow(new Date(log.time), { addSuffix: true, locale: id })}
                                           </span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-secondary-text text-xs">
                               Belum ada aktifitas terbaru
                            </div>
                          )}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
  </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color,
  trend, 
  trendUp, 
  trendColor 
}: { 
  label: string; 
  value: number | string; 
  icon: any; 
  color: string;
  trend?: string; 
  trendUp?: boolean;
  trendColor?: string;
}) {
  return (
    <div className="group bg-card-bg border border-border-color rounded-xl p-6 hover:border-secondary-text/50 transition-all duration-200 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-medium text-secondary-text uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-semibold text-primary-text tracking-tight">
                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
              </h3>
            </div>
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center gap-2">
             <span className={cn(
              "text-xs font-medium",
              trendColor ? trendColor.split(' ')[0] : (trendUp ? "text-success-text" : "text-error-text")
             )}>
               {trend}
             </span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionsCarousel({ actions }: { actions: { href: string; label: string; icon: React.ReactNode }[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const gradients = [
    "from-info-bg to-info-bg/50 border-info-border hover:border-info-border/80",
    "from-success-bg to-success-bg/50 border-success-border hover:border-success-border/80",
    "from-info-bg to-info-bg/50 border-info-border hover:border-info-border/80",
    "from-warning-bg to-warning-bg/50 border-warning-border hover:border-warning-border/80",
    "from-error-bg to-error-bg/50 border-error-border hover:border-error-border/80",
    "from-info-bg to-info-bg/50 border-info-border hover:border-info-border/80",
  ];

  return (
    <div className="relative group/carousel px-4">
      <button 
        onClick={() => scroll('left')}
        disabled={!showLeftArrow}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-card-bg/80 backdrop-blur-sm border border-border-color rounded-full shadow-sm text-secondary-text transition-all -ml-2",
          !showLeftArrow ? "opacity-30 cursor-not-allowed" : "hover:text-primary-text hover:scale-110"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-3 overflow-x-auto pb-2 -mb-2 scrollbar-hide scroll-smooth px-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {actions.map((action, idx) => (
          <Link 
            key={idx}
            href={action.href} 
            className={cn(
              "flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group min-w-[160px] bg-gradient-to-br hover:shadow-md",
              gradients[idx % gradients.length]
            )}
          >
            <div className="w-8 h-8 rounded-full bg-card-bg/60 flex items-center justify-center text-primary-text group-hover:scale-110 transition-transform shadow-sm">
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-primary-text group-hover:text-primary-text">{action.label}</span>
          </Link>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        disabled={!showRightArrow}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-card-bg/80 backdrop-blur-sm border border-border-color rounded-full shadow-sm text-secondary-text transition-all -mr-2",
          !showRightArrow ? "opacity-30 cursor-not-allowed" : "hover:text-primary-text hover:scale-110"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
