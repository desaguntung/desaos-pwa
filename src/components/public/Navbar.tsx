"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Define types for navigation items
interface SubMenuItem {
  label: string;
  href: string;
  isHeading?: boolean;
  isSmall?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  children?: {
    col1: {
      title: string;
      items: SubMenuItem[];
    };
    col2: {
      title: string;
      items: SubMenuItem[];
    };
    col3?: {
      title: string;
      items: SubMenuItem[];
    };
  };
}

const navItems: NavItem[] = [
  {
    label: "Profil",
    href: "#",
    children: {
      col1: {
        title: "Tentang Desa",
        items: [
          { label: "Sejarah Desa", href: "/profil/sejarah" },
          { label: "Visi & Misi", href: "/profil/visi-misi" },
          { label: "Struktur Organisasi", href: "/profil/struktur-organisasi" },
          { label: "Geografis Desa", href: "/profil/geografis" },
          { label: "Demografi", href: "/statistik/kependudukan" },
        ],
      },
      col2: {
        title: "Lainnya",
        items: [
          { label: "Peta Desa", href: "/profil/peta" },
          { label: "Prestasi Desa", href: "/profil/prestasi" },
        ],
      },
    },
  },
  {
    label: "Potensi",
    href: "#",
    children: {
      col1: {
        title: "Ekonomi",
        items: [
          { label: "Pertanian & Perkebunan", href: "#" },
          { label: "Peternakan & Perikanan", href: "#" },
          { label: "UMKM Desa", href: "#" },
        ],
      },
      col2: {
        title: "Wisata & Alam",
        items: [
          { label: "Destinasi Wisata", href: "#" },
          { label: "Sumber Daya Alam", href: "#" },
          { label: "Produk Unggulan", href: "#" },
        ],
      },
    },
  },
  {
    label: "Pemerintahan",
    href: "#",
    children: {
      col1: {
        title: "Lembaga",
        items: [
          { label: "Perangkat Desa", href: "#" },
          { label: "BPD (Badan Permusyawaratan Desa)", href: "#" },
          { label: "LPM (Lembaga Pemberdayaan Masyarakat)", href: "#" },
        ],
      },
      col2: {
        title: "Mitra",
        items: [
          { label: "PKK", href: "#" },
          { label: "Karang Taruna", href: "#" },
          { label: "Linmas", href: "#" },
          { label: "Posyandu", href: "#" },
        ],
      },
    },
  },
  {
    label: "Statistik",
    href: "/statistik/kependudukan",
    children: {
      col1: {
        title: "Kependudukan",
        items: [
          { label: "Statistik Penduduk", href: "/statistik/kependudukan" },
          { label: "Jenis Kelamin", href: "/statistik/kependudukan?category=jenis-kelamin" },
          { label: "Kategori Umur", href: "/statistik/kependudukan?category=kategori-umur" },
          { label: "Status Penduduk", href: "/statistik/kependudukan?category=status-penduduk" },
          { label: "Warga Negara", href: "/statistik/kependudukan?category=warga-negara" },
          { label: "Suku / Etnis", href: "/statistik/kependudukan?category=suku-etnis" },
        ],
      },
      col2: {
        title: "Sosial & Ekonomi",
        items: [
          { label: "Pendidikan Terakhir", href: "/statistik/kependudukan?category=pendidikan" },
          { label: "Pendidikan Ditempuh", href: "/statistik/kependudukan?category=pendidikan-sedang-ditempuh" },
          { label: "Pekerjaan", href: "/statistik/kependudukan?category=pekerjaan" },
          { label: "Status Perkawinan", href: "/statistik/kependudukan?category=status-perkawinan" },
          { label: "Agama", href: "/statistik/kependudukan?category=agama" },
          { label: "Hubungan Keluarga", href: "/statistik/kependudukan?category=hubungan-dalam-kk" },
          { label: "BPJS Ketenagakerjaan", href: "/statistik/kependudukan?category=bpjs-ketenagakerjaan" },
        ],
      },
      col3: {
        title: "Kesehatan & Admin",
        items: [
          { label: "Golongan Darah", href: "/statistik/kependudukan?category=golongan-darah" },
          { label: "Penyandang Cacat", href: "/statistik/kependudukan?category=penyandang-cacat" },
          { label: "Penyakit Menahun", href: "/statistik/kependudukan?category=penyakit-menahun" },
          { label: "Akseptor KB", href: "/statistik/kependudukan?category=akseptor-kb" },
          { label: "Status Kehamilan", href: "/statistik/kependudukan?category=status-kehamilan" },
          { label: "Penerima Bantuan", href: "/statistik/kependudukan?category=bantuan" },
          { label: "Asuransi Kesehatan", href: "/statistik/kependudukan?category=asuransi-kesehatan" },
          { label: "Identitas (KTP-el/KIA)", href: "/statistik/kependudukan?category=kepemilikan-ktp" },
          { label: "Akta Kelahiran", href: "/statistik/kependudukan?category=akta-kelahiran" },
        ],
      },
    },
  },
  {
    label: "Berita",
    href: "#",
    children: {
      col1: {
        title: "Informasi Terkini",
        items: [
          { label: "Berita Desa", href: "#" },
          { label: "Pengumuman", href: "#" },
          { label: "Agenda Kegiatan", href: "#" },
        ],
      },
      col2: {
        title: "Dokumentasi",
        items: [
          { label: "Galeri Foto", href: "#" },
          { label: "Galeri Video", href: "#" },
        ],
      },
    },
  },
  {
    label: "Pembangunan",
    href: "#",
    children: {
      col1: {
        title: "Perencanaan",
        items: [
          { label: "RPJM Desa", href: "#" },
          { label: "RKP Desa", href: "#" },
        ],
      },
      col2: {
        title: "Pelaksanaan",
        items: [
          { label: "Realisasi Anggaran", href: "#" },
          { label: "Progres Pembangunan", href: "#" },
          { label: "Transparansi Dana Desa", href: "#" },
        ],
      },
    },
  },
  {
    label: "Bansos",
    href: "#",
    children: {
      col1: {
        title: "Jenis Bantuan",
        items: [
          { label: "BLT Dana Desa", href: "#" },
          { label: "PKH (Program Keluarga Harapan)", href: "#" },
          { label: "BPNT (Bantuan Pangan Non Tunai)", href: "#" },
        ],
      },
      col2: {
        title: "Lainnya",
        items: [
          { label: "Bedah Rumah", href: "#" },
          { label: "Bantuan Kesehatan", href: "#" },
        ],
      },
    },
  },
  {
    label: "Akademi",
    href: "#",
    children: {
      col1: {
        title: "Edukasi Warga",
        items: [
          { label: "Pelatihan Masyarakat", href: "#" },
          { label: "Artikel Edukasi", href: "#" },
        ],
      },
      col2: {
        title: "Digital",
        items: [
          { label: "Perpustakaan Digital", href: "#" },
          { label: "Tutorial Layanan Desa", href: "#" },
        ],
      },
    },
  },
  {
    label: "Regulasi",
    href: "#",
    children: {
      col1: {
        title: "Produk Hukum",
        items: [
          { label: "Peraturan Desa", href: "#" },
          { label: "Peraturan Kepala Desa", href: "#" },
        ],
      },
      col2: {
        title: "Keputusan",
        items: [
          { label: "Keputusan Kepala Desa", href: "#" },
        ],
      },
    },
  },
  {
    label: "Kontak",
    href: "#",
    children: {
      col1: {
        title: "Hubungi Kami",
        items: [
          { label: "Kontak Pemerintah Desa", href: "#" },
          { label: "Pengaduan Masyarakat", href: "#" },
        ],
      },
      col2: {
        title: "Lokasi",
        items: [
          { label: "Peta Kantor Desa", href: "#" },
        ],
      },
    },
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<NavItem | null>(null);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleMouseEnter = (item: NavItem) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredItem(item.label);
    if (item.children) {
      setActiveDropdown(item);
    } else {
      setActiveDropdown(null);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setActiveDropdown(null);
    }, 100);
  };

  return (
    <nav
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-[9999] h-[48px] md:h-[44px] transition-colors duration-300",
        "bg-[#fafafc]"
      )}
      style={{ fontSize: "17px" }}
    >
      <div 
        className="mx-auto max-w-[1024px] h-full relative z-50"
        style={{
          paddingLeft: "max(22px, env(safe-area-inset-left))",
          paddingRight: "max(22px, env(safe-area-inset-right))"
        }}
      >
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-full text-[12px] font-normal tracking-wide text-[#1d1d1f]">
          <Link
            href="/"
            className="text-[#1d1d1f] hover:text-black transition-colors opacity-80 hover:opacity-100 px-2"
          >
            <span className="font-semibold text-lg">DesaOS</span>
          </Link>

          {navItems.map((item) => (
            <div
              key={item.label}
              onMouseEnter={() => handleMouseEnter(item)}
              className="h-full flex items-center"
            >
              <Link
                href={item.href}
                className={cn(
                  "px-3 transition-all duration-300",
                  hoveredItem === item.label ? "opacity-100 text-black" : "opacity-80 hover:opacity-100 hover:text-black"
                )}
              >
                {item.label}
              </Link>
            </div>
          ))}

          <div className="flex items-center gap-4">
            <button className="opacity-80 hover:opacity-100 hover:text-black transition-all px-2">
              <svg height="44" viewBox="0 0 15 44" width="15" xmlns="http://www.w3.org/2000/svg" className="fill-current w-3.5 h-[44px]">
                <path d="M14.298,27.202l-3.87-3.87c0.701-0.929,1.122-2.081,1.122-3.332c0-3.06-2.489-5.55-5.55-5.55c-3.06,0-5.55,2.49-5.55,5.55 c0,3.061,2.49,5.55,5.55,5.55c1.251,0,2.403-0.421,3.332-1.122l3.87,3.87c0.151,0.151,0.35,0.228,0.548,0.228 s0.396-0.076,0.548-0.228C14.601,27.995,14.601,27.505,14.298,27.202z M1.55,20c0-2.454,1.997-4.45,4.45-4.45 c2.454,0,4.45,1.997,4.45,4.45S8.454,24.45,6,24.45C3.546,24.45,1.55,22.454,1.55,20z" />
              </svg>
            </button>
            <button className="opacity-80 hover:opacity-100 hover:text-black transition-all px-2">
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Header */}
        <div className="flex md:hidden items-center justify-between h-full text-[#1d1d1f]">
           <Link href="/" className="z-50 relative">
             <span className="font-semibold text-lg">DesaOS</span>
           </Link>

           <div className="flex items-center gap-4 z-50 relative">
             <button className="opacity-80 hover:opacity-100">
               <svg height="44" viewBox="0 0 15 44" width="15" xmlns="http://www.w3.org/2000/svg" className="fill-current w-4 h-[44px]">
                 <path d="M14.298,27.202l-3.87-3.87c0.701-0.929,1.122-2.081,1.122-3.332c0-3.06-2.489-5.55-5.55-5.55c-3.06,0-5.55,2.49-5.55,5.55 c0,3.061,2.49,5.55,5.55,5.55c1.251,0,2.403-0.421,3.332-1.122l3.87,3.87c0.151,0.151,0.35,0.228,0.548,0.228 s0.396-0.076,0.548-0.228C14.601,27.995,14.601,27.505,14.298,27.202z M1.55,20c0-2.454,1.997-4.45,4.45-4.45 c2.454,0,4.45,1.997,4.45,4.45S8.454,24.45,6,24.45C3.546,24.45,1.55,22.454,1.55,20z" />
               </svg>
             </button>
             <button className="opacity-80 hover:opacity-100">
               <ShoppingBag className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setIsOpen(!isOpen)}
               className="opacity-80 hover:opacity-100 transition-transform duration-300"
             >
               {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
           </div>
        </div>
      </div>

      {/* Desktop Dropdown Menu */}
      <div 
        className={cn(
          "absolute top-[44px] left-0 w-full z-40 overflow-hidden transition-all duration-500 ease-in-out",
          "bg-[#fafafc]",
          activeDropdown ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="max-w-[1024px] mx-auto px-4 py-10">
          {activeDropdown?.children && (
            <div className="grid grid-cols-[auto_auto_auto] gap-x-20 animate-slide-down-fade">
              {/* Column 1 */}
              <div>
                <h3 className="text-[12px] text-[#86868b] font-normal mb-4">{activeDropdown.children.col1.title}</h3>
                <div className="flex flex-col gap-y-2">
                  {activeDropdown.children.col1.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "block hover:text-[#06c] transition-colors",
                        item.isSmall ? "text-[12px] font-normal text-[#1d1d1f] mt-1" : "text-[24px] font-semibold text-[#1d1d1f] leading-tight"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Column 2 */}
              <div className="border-l border-gray-200 pl-10">
                <h3 className="text-[12px] text-[#86868b] font-normal mb-4">{activeDropdown.children.col2.title}</h3>
                <div className="flex flex-col gap-y-3">
                  {activeDropdown.children.col2.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-[12px] font-normal text-[#1d1d1f] hover:text-[#06c] transition-colors block"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Column 3 */}
              {activeDropdown.children.col3 && (
                <div className="border-l border-gray-200 pl-10">
                  <h3 className="text-[12px] text-[#86868b] font-normal mb-4">{activeDropdown.children.col3.title}</h3>
                  <div className="flex flex-col gap-y-3">
                    {activeDropdown.children.col3.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="text-[12px] font-normal text-[#1d1d1f] hover:text-[#06c] transition-colors block"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay Backdrop */}
      <div
        className={cn(
          "fixed inset-0 top-[44px] bg-white/30 backdrop-blur-2xl z-30 transition-opacity duration-500",
          activeDropdown ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        aria-hidden="true"
        onMouseEnter={() => {
          setHoveredItem(null);
          setActiveDropdown(null);
        }}
      />

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-[#fafafc] z-40 md:hidden transition-all duration-500 ease-in-out pt-[48px]",
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-full"
        )}
      >
        <div className="px-10 py-4 flex flex-col gap-2">
          {/* Search Bar Mobile */}
          <div className="relative mb-6 animate-slide-down-fade duration-700 delay-100">
             <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 fill-current" viewBox="0 0 15 44" xmlns="http://www.w3.org/2000/svg">
               <path d="M14.298,27.202l-3.87-3.87c0.701-0.929,1.122-2.081,1.122-3.332c0-3.06-2.489-5.55-5.55-5.55c-3.06,0-5.55,2.49-5.55,5.55 c0,3.061,2.49,5.55,5.55,5.55c1.251,0,2.403-0.421,3.332-1.122l3.87,3.87c0.151,0.151,0.35,0.228,0.548,0.228 s0.396-0.076,0.548-0.228C14.601,27.995,14.601,27.505,14.298,27.202z M1.55,20c0-2.454,1.997-4.45,4.45-4.45 c2.454,0,4.45,1.997,4.45,4.45S8.454,24.45,6,24.45C3.546,24.45,1.55,22.454,1.55,20z" />
             </svg>
             <input 
               type="text" 
               placeholder="Cari di DesaOS" 
               className="w-full bg-[#e8e8ed] text-[#1d1d1f] rounded-[8px] pl-10 pr-4 py-2 text-[17px] leading-[1.23536] font-normal placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-300"
             />
          </div>

          <div className="flex flex-col border-t border-gray-200">
            {navItems.map((item, index) => (
              <div key={item.label} className="border-b border-gray-200">
                {item.children ? (
                  <button
                    onClick={() => setMobileExpandedItem(mobileExpandedItem === item.label ? null : item.label)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 text-[17px] font-normal text-[#1d1d1f] hover:text-black transition-colors",
                      "animate-slide-down-fade"
                    )}
                    style={{ animationDelay: `${150 + index * 50}ms` }}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300 text-zinc-500",
                        mobileExpandedItem === item.label ? "rotate-180" : ""
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block py-3 text-[17px] font-normal text-[#1d1d1f] hover:text-black transition-colors",
                      "animate-slide-down-fade"
                    )}
                    style={{ animationDelay: `${150 + index * 50}ms` }}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Mobile Submenu */}
                {item.children && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      mobileExpandedItem === item.label ? "max-h-[1000px] opacity-100 pb-4" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="flex flex-col gap-4 pl-4">
                      {/* Column 1 */}
                      <div>
                        <h4 className="text-[13px] font-medium text-zinc-500 mb-2">{item.children.col1.title}</h4>
                        <div className="flex flex-col gap-2 pl-2 border-l border-gray-200">
                          {item.children.col1.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className="text-[15px] text-[#1d1d1f] hover:text-[#06c] transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      {/* Column 2 */}
                      <div>
                        <h4 className="text-[13px] font-medium text-zinc-500 mb-2">{item.children.col2.title}</h4>
                        <div className="flex flex-col gap-2 pl-2 border-l border-gray-200">
                          {item.children.col2.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className="text-[15px] text-[#1d1d1f] hover:text-[#06c] transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Column 3 */}
                      {item.children.col3 && (
                        <div>
                          <h4 className="text-[13px] font-medium text-zinc-500 mb-2">{item.children.col3.title}</h4>
                          <div className="flex flex-col gap-2 pl-2 border-l border-gray-200">
                            {item.children.col3.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className="text-[15px] text-[#1d1d1f] hover:text-[#06c] transition-colors"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
