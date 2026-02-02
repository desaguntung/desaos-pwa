"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Users,
  Landmark,
  BarChart,
  Settings,
  MessageSquare,
  Files,
  Book,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { AppRole, PermissionResource } from "@/config/permissions";
import { useRbac } from "@/useRbac";
import { cn } from "@/lib/utils";

type MenuItem = {
  icon: typeof Home;
  label: string;
  href?: string;
  resource: PermissionResource | null;
  subMenu?: {
    label: string;
    href: string;
    resource: PermissionResource | null;
  }[];
};

const menuItems: MenuItem[] = [
  {
    icon: Home,
    label: "Info Desa",
    href: "/identitas-desa",
    resource: "wilayah",
    subMenu: [
      { label: "Identitas Desa", href: "/identitas-desa", resource: "wilayah" },
      { label: "Wilayah Administratif", href: "/wilayah-administratif", resource: "wilayah" },
      { label: "Pemerintah Desa", href: "/pemerintah-desa", resource: "pemerintah_desa" },
      { label: "Lembaga Desa", href: "/lembaga-desa", resource: "lembaga_desa" },
      { label: "Prestasi Desa", href: "/prestasi-desa", resource: "wilayah" },
      { label: "Status Desa", href: "#", resource: "wilayah" },
    ],
  },
  {
    icon: Users,
    label: "Kependudukan",
    href: "/penduduk",
    resource: "penduduk",
    subMenu: [
      { label: "Penduduk", href: "/penduduk", resource: "penduduk" },
      { label: "Keluarga", href: "/keluarga", resource: "keluarga" },
      { label: "Rumah Tangga", href: "/rumah-tangga", resource: "rumah_tangga" },
      { label: "Kelompok", href: "#", resource: "penduduk" },
      { label: "Data Suplemen", href: "#", resource: "penduduk" },
      { label: "Calon Pemilih", href: "#", resource: "penduduk" },
    ],
  },
  {
    icon: BarChart,
    label: "Statistik",
    href: "/admin/statistik",
    resource: "dashboard",
    subMenu: [
      { label: "Statistik Kependudukan", href: "/admin/statistik/kependudukan", resource: "penduduk" },
    ],
  },
  {
    icon: Newspaper,
    label: "Layanan Surat",
    href: "/surat/masuk",
    resource: "surat_cetak",
    subMenu: [
      { label: "Verifikasi Surat", href: "/surat/verifikasi", resource: "surat_cetak" },
      { label: "Surat Masuk", href: "/surat/masuk", resource: "surat_cetak" },
      { label: "Surat Keluar", href: "/surat/keluar", resource: "surat_cetak" },
      { label: "Permohonan Surat", href: "/surat/permohonan", resource: "surat_cetak" },
      { label: "Cetak Surat", href: "/surat/cetak", resource: "surat_cetak" },
      { label: "Pengaturan Surat", href: "/surat/pengaturan", resource: "surat_pengaturan" },
      { label: "Arsip Layanan", href: "/surat/arsip", resource: "surat_cetak" },
    ],
  },
  { icon: Book, label: "Buku Administrasi Desa", href: "#", resource: "dashboard" },
  { icon: Landmark, label: "Keuangan", href: "#", resource: "dashboard" },
  { icon: Files, label: "Arsip Desa", href: "#", resource: "dashboard" },
  { icon: MessageSquare, label: "Pengaduan", href: "#", resource: "dashboard" },
  {
    icon: Newspaper,
    label: "Artikel",
    href: "/artikel/dinamis",
    resource: "dashboard",
    subMenu: [
      { label: "Artikel Dinamis", href: "/artikel/dinamis", resource: "dashboard" },
      { label: "Artikel Statis", href: "/artikel/statis", resource: "dashboard" },
    ],
  },
  {
    icon: Settings,
    label: "Pengaturan",
    href: "/pengaturan-pengguna",
    resource: "settings",
    subMenu: [
      {
        label: "API & Integrasi",
        href: "/pengaturan/api",
        resource: "settings",
      },
      {
        label: "Aplikasi",
        href: "/surat/pengaturan/aplikasi",
        resource: "settings",
      },
      {
        label: "Kelola Pengguna",
        href: "/pengaturan-pengguna",
        resource: "users",
      },
      {
        label: "Management Role",
        href: "/pengaturan-role",
        resource: "settings",
      },
    ],
  },
];

export default function Sidebar() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoadingRole(true);
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) {
          setCurrentRole(null);
          setUserName(null);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setCurrentRole(profile.role as AppRole);
          setUserName((profile.full_name as string | null) ?? user.email ?? null);
        } else {
          setCurrentRole("user");
          setUserName(user.email ?? null);
        }
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, []);

  // Auto-open submenu based on active route
  useEffect(() => {
    if (pathname) {
      menuItems.forEach((item, index) => {
        if (item.subMenu && item.subMenu.some(sub => pathname.startsWith(sub.href))) {
          setOpenSubMenu(index);
        }
      });
    }
  }, [pathname]);


  const handleMenuClick = (index: number) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof document !== "undefined") {
      document.cookie = "desaos-auth=; Max-Age=0; Path=/; SameSite=Lax";
    }
    setCurrentRole(null);
    setUserName(null);
    router.replace("/login");
    router.refresh();
  };

  const rbacDashboard = useRbac("dashboard");
  const rbacWilayah = useRbac("wilayah");
  const rbacPemerintahDesa = useRbac("pemerintah_desa");
  const rbacLembagaDesa = useRbac("lembaga_desa");
  const rbacPenduduk = useRbac("penduduk");
  const rbacKeluarga = useRbac("keluarga");
  const rbacRumahTangga = useRbac("rumah_tangga");
  const rbacSuratPengaturan = useRbac("surat_pengaturan");
  const rbacSuratCetak = useRbac("surat_cetak");
  const rbacSettings = useRbac("settings");

  const canAccess = (resource: PermissionResource | null): boolean => {
    if (!resource) {
      return true;
    }
    switch (resource) {
      case "dashboard":
        return rbacDashboard.canRead;
      case "wilayah":
        return rbacWilayah.canRead;
      case "pemerintah_desa":
        return rbacPemerintahDesa.canRead;
      case "lembaga_desa":
        return rbacLembagaDesa.canRead;
      case "penduduk":
        return rbacPenduduk.canRead;
      case "keluarga":
        return rbacKeluarga.canRead;
      case "rumah_tangga":
        return rbacRumahTangga.canRead;
      case "surat_pengaturan":
        return rbacSuratPengaturan.canRead;
      case "surat_cetak":
        return rbacSuratCetak.canRead;
      case "settings":
        return rbacSettings.canRead;
      default:
        return true;
    }
  };

  const visibleMenuItems = menuItems
    .map((item) => {
      if (item.subMenu && item.subMenu.length > 0) {
        const visibleSub = item.subMenu.filter((sub) => {
          if (!sub.resource) {
            return true;
          }
          return canAccess(sub.resource);
        });
        if (visibleSub.length === 0) {
          if (item.resource && !canAccess(item.resource)) {
            return null;
          }
          return { ...item, subMenu: [] };
        }
        return { ...item, subMenu: visibleSub };
      }

      if (item.resource && !canAccess(item.resource)) {
        return null;
      }

      return item;
    })
    .filter(Boolean) as MenuItem[];

  return (
    <aside className="h-full bg-sidebar-bg flex flex-col border-r border-gray-200">
      <div className="p-4 flex items-center gap-3 border-b border-border-color h-16 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-text rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-sidebar-bg font-bold text-sm">D</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-primary-text">DesaOS Admin</h1>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-100 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {visibleMenuItems.map((item, index) => {
          const isActive = item.href ? pathname === item.href || pathname?.startsWith(item.href + '/') : false;
          const isSubActive = item.subMenu?.some(sub => pathname === sub.href || pathname?.startsWith(sub.href));
          const isOpen = openSubMenu === index;

          return (
            <div key={index} className="space-y-0.5">
              {item.subMenu && item.subMenu.length > 0 ? (
                <button
                  onClick={() => handleMenuClick(index)}
                  className={cn(
                    "flex items-center justify-between w-full text-sm font-medium px-3 py-2 mx-2 rounded-md transition-all group",
                    isOpen || isSubActive 
                      ? "bg-gray-100 text-gray-900 font-semibold" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className={cn(
                      "w-4 h-4 mr-3 transition-colors",
                      isOpen || isSubActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"
                    )} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      isOpen ? "rotate-180 text-gray-900" : "text-gray-400 group-hover:text-gray-900"
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className={cn(
                    "flex items-center justify-between w-full text-sm font-medium px-3 py-2 mx-2 rounded-md transition-all group",
                    isActive 
                      ? "bg-gray-100 text-gray-900 font-semibold" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className={cn(
                      "w-4 h-4 mr-3 transition-colors",
                      isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"
                    )} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )}

              {item.subMenu && item.subMenu.length > 0 && isOpen && (
                <div className="ml-4 pl-3 border-l border-gray-200 space-y-0.5 my-1">
                  {item.subMenu.map((sub, subIdx) => {
                     const isChildActive = pathname === sub.href;
                     return (
                      <Link
                        key={subIdx}
                        href={sub.href}
                        className={cn(
                          "block px-3 py-2 mx-2 text-sm rounded-md transition-colors",
                          isChildActive
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-sidebar-bg mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 mb-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 text-gray-500">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">
              {loadingRole ? "Memuat..." : userName ?? "Pengguna"}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {loadingRole
                ? "..."
                : currentRole === "super_admin"
                ? "Super Admin"
                : (currentRole || "Guest").replace("_", " ")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center w-full text-gray-500 text-sm font-medium hover:text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 mr-2.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
