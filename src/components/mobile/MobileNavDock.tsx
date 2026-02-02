"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Newspaper, LayoutGrid, User, 
  Info, Map as MapIcon, Building2, FileText, ArrowRight, ArrowLeft,
  History, Target, Users, MapPin, BarChart3, Trophy,
  Sprout, Fish, Store, Camera,
  UserCog, Mail, MessageSquare, X, ChevronRight, CheckCircle2, Sparkles,
  PieChart, TrendingUp, HardHat, HeartHandshake, Gift, GraduationCap, BookOpen, Scale, Phone,
  Calendar, Flag, Briefcase, Heart, Shield, Activity, Accessibility, Stethoscope, Baby, CreditCard,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/Sheet";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { getStatistics, StatsData } from "@/app/actions/statistics";
import StatisticsView from "@/components/public/statistik/StatisticsView";

// Helper to generate generic guide if specific one missing
const getGuide = (title: string, type: string) => {
  return {
    heroTitle: `Akses ${title}`,
    heroDesc: `Layanan ${type} desa yang mudah, cepat, dan transparan untuk seluruh warga.`,
    steps: [
      { title: "Pilih Layanan", desc: "Pilih menu layanan yang sesuai dengan kebutuhan Anda saat ini." },
      { title: "Lengkapi Data", desc: "Isi formulir informasi yang dibutuhkan untuk pemrosesan." },
      { title: "Proses Verifikasi", desc: "Data Anda akan diverifikasi oleh petugas desa terkait." },
      { title: "Selesai", desc: "Layanan berhasil diproses dan dapat langsung digunakan." }
    ]
  };
};

// Menu Items for the Drawer with specific icons
const mobileNavItems = [
  {
    title: "Layanan",
    description: "Administrasi & pengaduan",
    color: "bg-orange-50 text-orange-600",
    gradient: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/20",
    items: [
      { 
        label: "Administrasi", 
        href: "#", 
        icon: FileText,
        guide: {
          heroTitle: "Layanan Administrasi",
          heroDesc: "Buat surat keterangan dan dokumen resmi desa secara online tanpa perlu antri lama.",
          steps: [
            { title: "Pilih Jenis Surat", desc: "Tentukan surat yang Anda butuhkan (SKTM, KTP, KK, dll)." },
            { title: "Isi Data Diri", desc: "Lengkapi formulir digital sesuai identitas KTP Anda." },
            { title: "Verifikasi Petugas", desc: "Admin desa akan memvalidasi data Anda dalam jam kerja." },
            { title: "Ambil Dokumen", desc: "Unduh softcopy atau ambil dokumen fisik di kantor desa." }
          ]
        }
      },
      { 
        label: "Surat Online", 
        href: "#", 
        icon: Mail,
        guide: {
          heroTitle: "Permohonan Surat",
          heroDesc: "Ajukan permohonan surat pengantar RT/RW hingga Kelurahan langsung dari HP.",
          steps: [
            { title: "Login Warga", desc: "Masuk menggunakan NIK dan PIN akun warga Anda." },
            { title: "Buat Permohonan", desc: "Klik 'Buat Surat' dan pilih kategori surat." },
            { title: "Monitor Status", desc: "Pantau status pengajuan lewat notifikasi aplikasi." },
            { title: "Selesai", desc: "Surat digital diterbitkan dengan Tanda Tangan Elektronik (TTE)." }
          ]
        }
      },
      { 
        label: "Pengaduan", 
        href: "#", 
        icon: MessageSquare,
        guide: {
          heroTitle: "Layanan Pengaduan",
          heroDesc: "Sampaikan aspirasi, saran, atau keluhan Anda untuk kemajuan desa kita bersama.",
          steps: [
            { title: "Tulis Laporan", desc: "Deskripsikan masalah atau saran Anda dengan jelas." },
            { title: "Sertakan Bukti", desc: "Lampirkan foto atau lokasi kejadian jika diperlukan." },
            { title: "Kirim Laporan", desc: "Laporan akan masuk ke sistem dashboard desa." },
            { title: "Tindak Lanjut", desc: "Pantau respons dan penyelesaian dari petugas desa." }
          ]
        }
      },
    ]
  },
  {
    title: "Pemerintahan",
    description: "Lembaga & perangkat desa",
    color: "bg-purple-50 text-purple-600",
    gradient: "from-purple-500 to-violet-600",
    shadow: "shadow-purple-500/20",
    items: [
      { label: "Perangkat Desa", href: "#", icon: UserCog },
      { label: "BPD", href: "#", icon: Building2 },
      { label: "LPM", href: "#", icon: Users },
      { label: "PKK", href: "#", icon: Users },
      { label: "Karang Taruna", href: "#", icon: Users },
    ]
  },
  {
    title: "Profil Desa",
    description: "Informasi dasar & identitas desa",
    color: "bg-blue-50 text-blue-600",
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    items: [
      { label: "Sejarah", href: "/profil/sejarah", icon: History },
      { label: "Visi & Misi", href: "/profil/visi-misi", icon: Target },
      { label: "Struktur Organisasi", href: "/profil/struktur-organisasi", icon: Users },
      { label: "Geografis", href: "/profil/geografis", icon: MapPin },
      { label: "Demografi", href: "/statistik/kependudukan", icon: BarChart3 },
      { label: "Peta Desa", href: "/profil/peta", icon: MapIcon },
      { label: "Prestasi", href: "/profil/prestasi", icon: Trophy },
    ]
  },
  {
    title: "Potensi",
    description: "Kekayaan alam & ekonomi desa",
    color: "bg-emerald-50 text-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    items: [
      { label: "Pertanian", href: "#", icon: Sprout },
      { label: "Peternakan", href: "#", icon: Fish },
      { label: "UMKM", href: "#", icon: Store },
      { label: "Wisata", href: "#", icon: Camera },
    ]
  },
  {
    title: "Statistik Kependudukan",
    description: "Data demografi penduduk",
    color: "bg-indigo-50 text-indigo-600",
    gradient: "from-indigo-500 to-blue-600",
    shadow: "shadow-indigo-500/20",
    items: [
      { label: "Statistik Penduduk", href: "/statistik/kependudukan", icon: BarChart3 },
      { label: "Jenis Kelamin", href: "/statistik/kependudukan?category=jenis-kelamin", icon: Users },
      { label: "Kategori Umur", href: "/statistik/kependudukan?category=kategori-umur", icon: Calendar },
      { label: "Status Penduduk", href: "/statistik/kependudukan?category=status-penduduk", icon: UserCog },
      { label: "Warga Negara", href: "/statistik/kependudukan?category=warga-negara", icon: Flag },
      { label: "Suku / Etnis", href: "/statistik/kependudukan?category=suku-etnis", icon: Users },
    ]
  },
  {
    title: "Sosial & Ekonomi",
    description: "Pendidikan & kesejahteraan",
    color: "bg-cyan-50 text-cyan-600",
    gradient: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20",
    items: [
      { label: "Pendidikan Terakhir", href: "/statistik/kependudukan?category=pendidikan", icon: GraduationCap },
      { label: "Pendidikan Ditempuh", href: "/statistik/kependudukan?category=pendidikan-sedang-ditempuh", icon: BookOpen },
      { label: "Pekerjaan", href: "/statistik/kependudukan?category=pekerjaan", icon: Briefcase },
      { label: "Status Perkawinan", href: "/statistik/kependudukan?category=status-perkawinan", icon: Heart },
      { label: "Agama", href: "/statistik/kependudukan?category=agama", icon: BookOpen },
      { label: "Hubungan Keluarga", href: "/statistik/kependudukan?category=hubungan-dalam-kk", icon: Users },
      { label: "BPJS Ketenagakerjaan", href: "/statistik/kependudukan?category=bpjs-ketenagakerjaan", icon: Shield },
    ]
  },
  {
    title: "Kesehatan & Admin",
    description: "Kesehatan & administrasi",
    color: "bg-rose-50 text-rose-600",
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20",
    items: [
      { label: "Golongan Darah", href: "/statistik/kependudukan?category=golongan-darah", icon: Activity },
      { label: "Penyandang Cacat", href: "/statistik/kependudukan?category=penyandang-cacat", icon: Accessibility },
      { label: "Penyakit Menahun", href: "/statistik/kependudukan?category=penyakit-menahun", icon: Stethoscope }, // Changed icon to match context better if needed, or keep Syringe
      { label: "Akseptor KB", href: "/statistik/kependudukan?category=akseptor-kb", icon: Baby },
      { label: "Status Kehamilan", href: "/statistik/kependudukan?category=status-kehamilan", icon: Baby },
      { label: "Penerima Bantuan", href: "/statistik/kependudukan?category=bantuan", icon: Gift },
      { label: "Asuransi Kesehatan", href: "/statistik/kependudukan?category=asuransi-kesehatan", icon: Shield },
      { label: "Identitas (KTP-el/KIA)", href: "/statistik/kependudukan?category=kepemilikan-ktp", icon: CreditCard },
      { label: "Akta Kelahiran", href: "/statistik/kependudukan?category=akta-kelahiran", icon: FileText },
    ]
  },
  {
    title: "Pembangunan",
    description: "Transparansi dana & progres",
    color: "bg-slate-50 text-slate-600",
    gradient: "from-slate-600 to-zinc-700",
    shadow: "shadow-slate-500/20",
    items: [
      { label: "RPJM Desa", href: "#", icon: FileText },
      { label: "RKP Desa", href: "#", icon: FileText },
      { label: "Realisasi Anggaran", href: "#", icon: PieChart },
      { label: "Progres Pembangunan", href: "#", icon: HardHat },
    ]
  },
  {
    title: "Bansos",
    description: "Informasi bantuan sosial",
    color: "bg-pink-50 text-pink-600",
    gradient: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-500/20",
    items: [
      { label: "BLT Dana Desa", href: "#", icon: Gift },
      { label: "PKH", href: "#", icon: HeartHandshake },
      { label: "BPNT", href: "#", icon: Store },
      { label: "Bedah Rumah", href: "#", icon: Home },
    ]
  },
  {
    title: "Akademi",
    description: "Edukasi & perpustakaan digital",
    color: "bg-teal-50 text-teal-600",
    gradient: "from-teal-500 to-emerald-600",
    shadow: "shadow-teal-500/20",
    items: [
      { label: "Pelatihan", href: "#", icon: Users },
      { label: "Artikel Edukasi", href: "#", icon: BookOpen },
      { label: "Perpustakaan Digital", href: "#", icon: BookOpen },
    ]
  },
  {
    title: "Regulasi",
    description: "Produk hukum & peraturan",
    color: "bg-amber-50 text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
    items: [
      { label: "Peraturan Desa", href: "#", icon: Scale },
      { label: "Peraturan Kades", href: "#", icon: Scale },
      { label: "Keputusan Kades", href: "#", icon: Scale },
    ]
  },
  {
    title: "Kontak",
    description: "Hubungi pemerintah desa",
    color: "bg-cyan-50 text-cyan-600",
    gradient: "from-cyan-500 to-sky-600",
    shadow: "shadow-cyan-500/20",
    items: [
      { label: "Hubungi Kami", href: "/profil/hubungi-kami", icon: Phone },
      { label: "Lokasi Kantor", href: "/profil/lokasi-kantor", icon: MapPin },
      { label: "Pengaduan Masyarakat", href: "#", icon: MessageSquare },
    ]
  },
];

export default function MobileNavDock() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null); // State for selected menu detail
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [showFullStats, setShowFullStats] = useState(false);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [villageName, setVillageName] = useState("");

  const handleShowStats = async () => {
    setShowFullStats(true);
    if (!statsData) {
      setLoadingStats(true);
      try {
        const { data, villageName: vName } = await getStatistics();
        if (data) setStatsData(data);
        if (vName) setVillageName(vName);
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setLoadingStats(false);
      }
    }
  };

  // Helper to generate content based on type (Guide vs Info)
  const getDetailContent = (item: any) => {
    // If specific guide exists, use it
    if (item.guide) return { type: 'guide', ...item.guide };

    // Default templates based on category
    const isLembaga = ["Perangkat Desa", "BPD", "LPM", "PKK", "Karang Taruna", "Struktur Organisasi"].includes(item.label);
    const isProfil = ["Sejarah", "Visi & Misi", "Geografis", "Demografi", "Peta Desa", "Prestasi"].includes(item.label);
    const isPotensi = ["Pertanian", "Peternakan", "UMKM", "Wisata"].includes(item.label);
    const isStatistik = [
      "Statistik Penduduk", "Jenis Kelamin", "Kategori Umur", "Status Penduduk", "Warga Negara", "Suku / Etnis",
      "Pendidikan Terakhir", "Pendidikan Ditempuh", "Pekerjaan", "Status Perkawinan", "Agama", "Hubungan Keluarga", "BPJS Ketenagakerjaan",
      "Golongan Darah", "Penyandang Cacat", "Penyakit Menahun", "Akseptor KB", "Status Kehamilan", "Penerima Bantuan", 
      "Asuransi Kesehatan", "Identitas (KTP-el/KIA)", "Akta Kelahiran"
    ].includes(item.label);
    const isPembangunan = ["RPJM Desa", "RKP Desa", "Realisasi Anggaran", "Progres Pembangunan"].includes(item.label);
    const isBansos = ["BLT Dana Desa", "PKH", "BPNT", "Bedah Rumah"].includes(item.label);
    const isAkademi = ["Pelatihan", "Artikel Edukasi", "Perpustakaan Digital"].includes(item.label);
    const isRegulasi = ["Peraturan Desa", "Peraturan Kades", "Keputusan Kades"].includes(item.label);
    const isKontak = ["Hubungi Kami", "Lokasi Kantor", "Pengaduan Masyarakat"].includes(item.label);

    if (isLembaga) {
      return {
        type: 'info',
        heroTitle: `Tentang ${item.label}`,
        heroDesc: `Informasi lengkap mengenai peran, fungsi, dan struktur ${item.label} dalam pemerintahan desa.`,
        info: [
          { title: "Definisi & Peran", desc: `Menjelaskan kedudukan dan tanggung jawab utama ${item.label} di desa.` },
          { title: "Tugas & Fungsi", desc: "Rincian tugas pokok yang diemban untuk kemajuan desa." },
          { title: "Struktur Anggota", desc: "Daftar nama dan jabatan pengurus yang menjabat saat ini." },
          { title: "Program Kerja", desc: "Agenda dan kegiatan rutin yang dilaksanakan." }
        ]
      };
    }

    if (isProfil) {
       return {
        type: 'info',
        heroTitle: item.label,
        heroDesc: `Pelajari lebih lanjut tentang ${item.label.toLowerCase()} dan identitas desa kita.`,
        info: [
          { title: "Deskripsi Umum", desc: `Gambaran umum mengenai ${item.label.toLowerCase()} desa.` },
          { title: "Data & Fakta", desc: "Informasi faktual dan data pendukung yang relevan." },
          { title: "Dokumentasi", desc: "Arsip foto atau dokumen terkait topik ini." }
        ]
      };
    }

    if (isPotensi) {
       return {
        type: 'info',
        heroTitle: `Potensi ${item.label}`,
        heroDesc: `Jelajahi kekayaan dan peluang pengembangan sektor ${item.label.toLowerCase()} desa.`,
        info: [
          { title: "Keunggulan Utama", desc: `Produk atau komoditas unggulan dari sektor ${item.label.toLowerCase()}.` },
          { title: "Lokasi Sebaran", desc: "Peta persebaran titik potensi di wilayah desa." },
          { title: "Peluang Investasi", desc: "Kesempatan kerjasama dan pengembangan usaha." }
        ]
      };
    }

    if (isStatistik) {
       return {
        type: 'info',
        heroTitle: item.label,
        heroDesc: `Data statistik ${item.label.toLowerCase()} terbaru di desa kami.`,
        info: [
          { title: "Ringkasan Data", desc: "Informasi rekapitulasi data terbaru tahun ini." },
          { title: "Grafik & Tren", desc: "Visualisasi perkembangan data dari waktu ke waktu." },
          { title: "Detail Kategori", desc: "Rincian data berdasarkan klasifikasi spesifik." }
        ]
      };
    }

    if (isPembangunan) {
       return {
        type: 'info',
        heroTitle: item.label,
        heroDesc: `Transparansi dan informasi ${item.label.toLowerCase()} desa.`,
        info: [
          { title: "Detail Dokumen", desc: "Informasi lengkap mengenai dokumen perencanaan/laporan." },
          { title: "Status Terkini", desc: "Update progres dan tahapan yang sedang berjalan." },
          { title: "Anggaran & Dana", desc: "Rincian alokasi dan penggunaan dana desa." }
        ]
      };
    }

    if (isBansos) {
       return {
        type: 'guide',
        heroTitle: `Program ${item.label}`,
        heroDesc: `Informasi penyaluran dan syarat penerima bantuan ${item.label}.`,
        steps: [
          { title: "Cek Persyaratan", desc: "Pastikan Anda memenuhi kriteria penerima bantuan." },
          { title: "Siapkan Berkas", desc: "Lengkapi dokumen administrasi (KTP, KK, SKTM)." },
          { title: "Verifikasi Data", desc: "Data akan diverifikasi melalui Musyawarah Desa." },
          { title: "Penyaluran", desc: "Bantuan disalurkan sesuai jadwal yang ditentukan." }
        ]
      };
    }

    if (isAkademi) {
       return {
        type: 'info',
        heroTitle: item.label,
        heroDesc: `Layanan ${item.label.toLowerCase()} untuk peningkatan kapasitas warga.`,
        info: [
          { title: "Tentang Program", desc: "Deskripsi singkat mengenai layanan edukasi ini." },
          { title: "Cara Akses", desc: "Panduan untuk mengakses materi atau mengikuti kegiatan." },
          { title: "Manfaat", desc: "Keuntungan yang didapat dengan mengikuti program ini." }
        ]
      };
    }

    if (isRegulasi) {
       return {
        type: 'info',
        heroTitle: item.label,
        heroDesc: `Arsip dokumen ${item.label.toLowerCase()} yang berlaku.`,
        info: [
          { title: "Daftar Peraturan", desc: "Kumpulan dokumen peraturan yang telah disahkan." },
          { title: "Status Hukum", desc: "Informasi keberlakuan dan status hukum dokumen." },
          { title: "Unduh Dokumen", desc: "Akses file lengkap peraturan untuk diunduh." }
        ]
      };
    }

    if (isKontak) {
       return {
        type: 'info',
        heroTitle: item.label,
        heroDesc: `Informasi ${item.label.toLowerCase()} untuk layanan masyarakat.`,
        info: [
          { title: "Alamat & Kontak", desc: "Detail lokasi dan nomor yang dapat dihubungi." },
          { title: "Jam Operasional", desc: "Jadwal pelayanan kantor desa untuk warga." },
          { title: "Kanal Resmi", desc: "Media sosial dan saluran komunikasi resmi desa." }
        ]
      };
    }

    // Default Service Guide
    return {
      type: 'guide',
      heroTitle: `Akses ${item.label}`,
      heroDesc: `Layanan ${item.label} desa yang mudah, cepat, dan transparan.`,
      steps: [
        { title: "Pilih Layanan", desc: "Pilih menu layanan yang sesuai dengan kebutuhan Anda saat ini." },
        { title: "Lengkapi Data", desc: "Isi formulir informasi yang dibutuhkan untuk pemrosesan." },
        { title: "Proses Verifikasi", desc: "Data Anda akan diverifikasi oleh petugas desa terkait." },
        { title: "Selesai", desc: "Layanan berhasil diproses dan dapat langsung digunakan." }
      ]
    };
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const diff = latest - previous;
    const isScrollingDown = diff > 0;
    const isScrollingUp = diff < 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Safety check: if content is too short (can't scroll much), never hide
    // Also if scrolling up or at the very top, show it
    // Increased threshold to 300 to handle cases where content is just slightly longer than viewport
    if (maxScroll < 300 || latest < 50 || isScrollingUp) {
      setHidden(false);
      return;
    }

    if (isScrollingDown && diff > 10 && latest > 50) {
      setHidden(true);
    }
  });

  const navLinks = [
    { id: "home", label: "Home", href: "/", icon: Home },
    { id: "news", label: "Berita", href: "/berita", icon: Newspaper },
    { id: "shop", label: "Shop", href: "/shop", icon: Store },
    { id: "profile", label: "Profil", href: "/profil", icon: User },
  ];

  const leftLinks = navLinks.slice(0, 2);
  const rightLinks = navLinks.slice(2, 4);

  return (
    <>
      {/* Bottom Gradient Overlay */}
      <motion.div 
        variants={{
          visible: { opacity: 1 },
          hidden: { opacity: 0 },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-40 dark:from-zinc-950 dark:via-zinc-950/80"
      />

      <motion.div 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: 100, opacity: 0 },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        {/* Floating Dock Container */}
        <div className="pointer-events-auto flex items-center gap-1 p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full ring-1 ring-black/5">
          
          {/* Left Links */}
          {leftLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.id}
                href={link.href}
                className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90"
              >
                <div className="relative flex flex-col items-center justify-center gap-1">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300", 
                      isActive ? "text-blue-600 scale-110" : "text-zinc-400 group-hover:text-zinc-600"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}

          {/* Center Action Button (Menu) */}
          <div className="mx-2">
            <Sheet open={isSheetOpen} onOpenChange={(open) => {
              setSheetOpen(open);
              if (!open) {
                setTimeout(() => {
                  setSelectedItem(null);
                  setShowFullStats(false);
                }, 300);
              }
            }}>
              <SheetTrigger asChild>
                <button className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 transition-transform active:scale-95">
                  <LayoutGrid className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-[32px] p-0 border-none bg-[#F5F5F7] overflow-hidden [&>button]:hidden">
                 <SheetTitle className="sr-only">
                    {selectedItem ? `Detail ${selectedItem.label}` : "Menu Desa"}
                 </SheetTitle>
                 <div className="h-full flex flex-col relative">
                    {/* Handle Bar - Draggable to close */}
                    <motion.div 
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset, velocity }) => {
                         if (offset.y > 50 || velocity.y > 500) {
                            setSheetOpen(false);
                         }
                      }}
                      className="flex justify-center pt-3 pb-6 z-50 absolute top-0 left-0 right-0 cursor-grab active:cursor-grabbing w-full touch-none"
                    >
                      <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                    </motion.div>

                    <AnimatePresence mode="wait" initial={false}>
                      {!selectedItem ? (
                        <motion.div 
                          key="grid"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="flex-1 flex flex-col h-full overflow-hidden"
                        >
                          {/* Main Header - Consistent Layout */}
                          <div className="px-6 py-4 pt-10 flex items-center justify-between border-b border-slate-100/50 bg-[#F5F5F7]/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Menu Desa</h2>
                            
                            <SheetClose className="p-2 -mr-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-400 focus:outline-none focus:ring-0">
                              <X className="w-6 h-6" />
                            </SheetClose>
                          </div>

                          {/* Scrollable Content */}
                          <div className="flex-1 overflow-y-auto px-6 pb-24">
                             <div className="grid grid-cols-1 gap-8 pt-4">
                               {mobileNavItems.map((section, idx) => (
                                 <div key={idx} className="space-y-4">
                                   {/* Section Header */}
                                   <div className="flex items-center gap-2">
                                     <div className={cn("w-1 h-5 rounded-full", section.color.split(" ")[0].replace("text-", "bg-"))} />
                                     <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                       {section.title}
                                     </h3>
                                   </div>
                                   
                                   {/* Cards Grid */}
                                   <div className="grid grid-cols-2 gap-3">
                                     {section.items.map((item, i) => {
                                       const Icon = item.icon;
                                       
                                       return (
                                         <button 
                                           key={i} 
                                           onClick={() => setSelectedItem(item)}
                                           className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 active:scale-95 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-left w-full overflow-hidden"
                                         >
                                            <div className={cn(
                                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                              `bg-gradient-to-br ${section.gradient} text-white`
                                            )}>
                                              <Icon className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                            
                                            <span className="text-xs font-bold text-slate-700 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                              {item.label}
                                            </span>
                                            
                                            {/* Shine Effect on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                                         </button>
                                       );
                                     })}
                                   </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        </motion.div>
                      ) : showFullStats ? (
                        <motion.div
                          key="stats"
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                          className="flex-1 flex flex-col h-full overflow-hidden bg-[#F2F2F7] z-20"
                        >
                          {/* Stats Header - Premium Apple Style */}
                          <div className="px-5 py-4 pt-6 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shrink-0 shadow-sm">
                             <div className="flex items-center gap-1 flex-1 min-w-0 mr-4">
                                <button 
                                  onClick={() => setShowFullStats(false)}
                                  className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-900 focus:outline-none focus:ring-0 active:scale-95"
                                >
                                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                                </button>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate ml-1">
                                  Detail {selectedItem?.label}
                                </h2>
                             </div>
                             
                             <SheetClose className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 focus:outline-none focus:ring-0">
                               <X className="w-6 h-6" />
                             </SheetClose>
                          </div>

                          {/* Stats Content */}
                          <div className="flex-1 overflow-y-auto bg-[#F2F2F7] p-5 pb-24">
                             {loadingStats ? (
                               <div className="flex flex-col items-center justify-center h-64 gap-4">
                                 <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
                                    <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute inset-0"></div>
                                 </div>
                                 <p className="text-sm text-slate-500 font-medium animate-pulse">Memuat data statistik...</p>
                               </div>
                             ) : statsData ? (
                                <StatisticsView 
                                  data={statsData} 
                                  villageName={villageName} 
                                  category={selectedItem?.href?.includes('category=') ? selectedItem.href.split('category=')[1] : undefined}
                                />
                             ) : (
                                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 mx-4">
                                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                                    <BarChart3 className="w-8 h-8 text-red-500" />
                                  </div>
                                  <h3 className="font-bold text-slate-900">Gagal Memuat Data</h3>
                                  <p className="text-slate-500 text-sm mb-2">Terjadi kesalahan saat mengambil data statistik terbaru.</p>
                                  <button 
                                    onClick={handleShowStats} 
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                  >
                                    Coba Lagi
                                  </button>
                                </div>
                             )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="detail"
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="flex-1 flex flex-col h-full overflow-hidden bg-white"
                        >
                          {/* Detail Header with blur - Consistent with Main Header */}
                          <div className="px-6 py-4 pt-10 flex items-center justify-between border-b border-slate-100/50 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                             <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                                <button 
                                  onClick={() => setSelectedItem(null)}
                                  className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700 focus:outline-none focus:ring-0"
                                >
                                  <ArrowLeft className="w-6 h-6" />
                                </button>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight truncate">Detail {selectedItem?.label}</h2>
                             </div>
                             
                             {/* Close Button inline with title */}
                             <SheetClose className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 focus:outline-none focus:ring-0">
                               <X className="w-6 h-6" />
                             </SheetClose>
                          </div>

                          {/* Detail Content */}
                          <div className="flex-1 overflow-y-auto bg-white">
                             {(() => {
                                const detail = getDetailContent(selectedItem);
                                const Icon = selectedItem.icon;
                                const section = mobileNavItems.find(s => s.items.includes(selectedItem)) || mobileNavItems[0];
                                const isInfo = detail.type === 'info';
                                
                                return (
                                  <div className="pb-40">
                                    {/* Modern Hero Section */}
                                    <div className="relative overflow-hidden">
                                      {/* Background Decoration */}
                                      <div className={cn(
                                        "absolute inset-0 opacity-10",
                                        `bg-gradient-to-br ${section.gradient}`
                                      )} />
                                      <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
                                      <div className="absolute -left-10 top-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />

                                      <div className="relative px-6 py-10 text-center">
                                        <motion.div 
                                          initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                          animate={{ scale: 1, opacity: 1, y: 0 }}
                                          transition={{ delay: 0.1 }}
                                          className={cn(
                                            "w-20 h-20 mx-auto rounded-2xl shadow-xl flex items-center justify-center mb-6 text-white transform rotate-3",
                                            `bg-gradient-to-br ${section.gradient}`
                                          )}
                                        >
                                          <Icon className="w-10 h-10" strokeWidth={1.5} />
                                        </motion.div>
                                        
                                        <motion.h1 
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.2 }}
                                          className="text-2xl font-black text-slate-900 mb-3 tracking-tight leading-tight"
                                        >
                                          {detail.heroTitle}
                                        </motion.h1>
                                        
                                        <motion.p 
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.3 }}
                                          className="text-slate-500 leading-relaxed max-w-xs mx-auto text-sm"
                                        >
                                          {detail.heroDesc}
                                        </motion.p>
                                      </div>
                                    </div>

                                    {/* Content Section - Adaptive (Steps or Info) */}
                                    <div className="px-6 py-6">
                                      <div className="bg-slate-50 rounded-3xl p-6 ring-1 ring-slate-900/5">
                                        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                                          {isInfo ? (
                                            <Info className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                                          ) : (
                                            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                                          )}
                                          {isInfo ? "Informasi Utama" : "Panduan Penggunaan"}
                                        </h3>
                                        
                                        <div className="space-y-0 relative">
                                          {/* Connecting Line (Only for Steps) */}
                                          {!isInfo && (
                                            <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200" />
                                          )}
                                          
                                          {(isInfo ? detail.info : detail.steps).map((item: any, idx: number) => (
                                            <motion.div 
                                              key={idx}
                                              initial={{ x: 20, opacity: 0 }}
                                              animate={{ x: 0, opacity: 1 }}
                                              transition={{ delay: 0.4 + (idx * 0.1) }}
                                              className={cn(
                                                "relative",
                                                isInfo ? "pb-4 last:pb-0" : "pl-14 pb-8 last:pb-0 group"
                                              )}
                                            >
                                              {!isInfo && (
                                                /* Step Number Bubble */
                                                <div className={cn(
                                                  "absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-slate-50 flex items-center justify-center font-bold text-sm z-10 transition-colors shadow-sm",
                                                  idx === 0 ? "bg-blue-600 text-white shadow-blue-200" : "bg-white text-slate-500 group-hover:border-blue-50 group-hover:text-blue-600"
                                                )}>
                                                  {idx + 1}
                                                </div>
                                              )}
                                              
                                              {/* Content */}
                                              <div className={cn(
                                                "bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all",
                                                !isInfo && "group-hover:border-blue-100 group-hover:shadow-md"
                                              )}>
                                                <h4 className="font-bold text-slate-800 mb-1 text-sm">{item.title}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                             })()}
                          </div>

                          {/* Bottom CTA with Glassmorphism */}
                          <div className="p-4 border-t border-slate-100/50 bg-white/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-40 pb-8">
                            {(() => {
                              const isStatistikItem = [
                                "Statistik Penduduk", "Jenis Kelamin", "Kategori Umur", "Status Penduduk", "Warga Negara", "Suku / Etnis",
                                "Pendidikan Terakhir", "Pendidikan Ditempuh", "Pekerjaan", "Status Perkawinan", "Agama", "Hubungan Keluarga", "BPJS Ketenagakerjaan",
                                "Golongan Darah", "Penyandang Cacat", "Penyakit Menahun", "Akseptor KB", "Status Kehamilan", "Penerima Bantuan", 
                                "Asuransi Kesehatan", "Identitas (KTP-el/KIA)", "Akta Kelahiran"
                              ].includes(selectedItem.label);

                              if (isStatistikItem) {
                                return (
                                  <button
                                    onClick={handleShowStats}
                                    className="flex items-center justify-center w-full py-4 transition-all text-white font-bold rounded-2xl shadow-xl text-sm tracking-wide active:scale-95 focus:outline-none focus:ring-0 bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                                  >
                                    Lihat Selengkapnya
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </button>
                                );
                              }

                              return (
                                <Link 
                                  href={selectedItem.href} 
                                  onClick={() => setSheetOpen(false)}
                                  className={cn(
                                    "flex items-center justify-center w-full py-4 transition-all text-white font-bold rounded-2xl shadow-xl text-sm tracking-wide active:scale-95 focus:outline-none focus:ring-0",
                                    selectedItem.label === "BPD" || selectedItem.label === "Perangkat Desa" 
                                      ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20" 
                                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                                  )}
                                >
                                  {selectedItem.label.includes("Layanan") || selectedItem.label === "Administrasi" ? "Buka Layanan" : "Lihat Selengkapnya"}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              );
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right Links */}
          {rightLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.id}
                href={link.href}
                className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90"
              >
                <div className="relative flex flex-col items-center justify-center gap-1">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300", 
                      isActive ? "text-blue-600 scale-110" : "text-zinc-400 group-hover:text-zinc-600"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}

        </div>
      </motion.div>
    </>
  );
}
