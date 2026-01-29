export type AppRole = "super_admin" | "staff" | "user";

export type PermissionLevel = "none" | "read" | "write";

export type PermissionResource =
  | "dashboard"
  | "users"
  | "penduduk"
  | "keluarga"
  | "rumah_tangga"
  | "wilayah"
  | "pemerintah_desa"
  | "lembaga_desa"
  | "surat_pengaturan"
  | "surat_cetak"
  | "settings";

export type RbacActionFlags = {
  can_view: boolean;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
};

export const ROLE_PERMISSIONS: Record<AppRole, Partial<Record<PermissionResource, PermissionLevel>>> = {
  super_admin: {
    dashboard: "write",
    users: "write",
    penduduk: "write",
    keluarga: "write",
    rumah_tangga: "write",
    wilayah: "write",
    pemerintah_desa: "write",
    lembaga_desa: "write",
    surat_pengaturan: "write",
    surat_cetak: "write",
    settings: "write",
  },
  staff: {
    dashboard: "write",
    users: "none",
    penduduk: "write",
    keluarga: "write",
    rumah_tangga: "write",
    wilayah: "write",
    pemerintah_desa: "read",
    lembaga_desa: "read",
    surat_pengaturan: "write",
    surat_cetak: "write",
    settings: "read",
  },
  user: {
    dashboard: "read",
    users: "none",
    penduduk: "read",
    keluarga: "read",
    rumah_tangga: "read",
    wilayah: "read",
    pemerintah_desa: "read",
    lembaga_desa: "read",
    surat_pengaturan: "none",
    surat_cetak: "none",
    settings: "none",
  },
};

export function hasPermissionFromFlags(
  flags: RbacActionFlags | null | undefined,
  action: PermissionLevel
): boolean {
  if (!flags) {
    return false;
  }

  if (action === "none") {
    return false;
  }

  const canRead = flags.can_view || flags.can_read;
  const canWrite = flags.can_create || flags.can_update || flags.can_delete;

  if (action === "read") {
    return canRead;
  }

  if (action === "write") {
    return canWrite;
  }

  return false;
}

export function hasPermission(role: AppRole, resource: PermissionResource, action: PermissionLevel): boolean {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) {
    return false;
  }
  const level = roleConfig[resource] ?? "none";
  if (level === "none") {
    return false;
  }
  if (level === "read") {
    return action === "read";
  }
  return true;
}
