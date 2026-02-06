"use client";

import { useEffect, useState } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import { AppRole, PermissionResource, RbacActionFlags } from "@/config/permissions";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { InputField } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

type ProfileRow = {
  id: string;
  role: AppRole;
};

type ResourceMeta = {
  key: PermissionResource;
  label: string;
  description: string;
};

type RoleRow = {
  key: string;
  name: string;
  description: string | null;
};

type PermissionRow = {
  role: string;
  resource: string;
  can_view: boolean;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
};

const RESOURCES: ResourceMeta[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Ringkasan dan statistik utama.",
  },
  {
    key: "users",
    label: "Pengguna",
    description: "Manajemen akun dan role pengguna.",
  },
  {
    key: "penduduk",
    label: "Penduduk",
    description: "Data penduduk dan detail individu.",
  },
  {
    key: "keluarga",
    label: "Keluarga",
    description: "Data keluarga dan kartu keluarga.",
  },
  {
    key: "rumah_tangga",
    label: "Rumah Tangga",
    description: "Data rumah tangga dan anggota.",
  },
  {
    key: "wilayah",
    label: "Wilayah",
    description: "Identitas dan wilayah administratif desa.",
  },
  {
    key: "pemerintah_desa",
    label: "Pemerintah Desa",
    description: "Struktur pemerintah desa.",
  },
  {
    key: "lembaga_desa",
    label: "Lembaga Desa",
    description: "Lembaga desa dan kelembagaan.",
  },
  {
    key: "surat_pengaturan",
    label: "Pengaturan Surat",
    description: "Template dan pengaturan layanan surat.",
  },
  {
    key: "surat_cetak",
    label: "Cetak Surat",
    description: "Pembuatan dan pencetakan surat.",
  },
  {
    key: "settings",
    label: "Pengaturan",
    description: "Pengaturan sistem dan konfigurasi.",
  },
];

export default function ManagementRolePage() {
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, RbacActionFlags>>
  >({});
  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const fetchRole = async () => {
      try {
        setLoading(true);
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) {
          setCurrentRole(null);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();

        if (profile) {
          setCurrentRole(profile.role);
        } else {
          setCurrentRole("user");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchMatrix = async () => {
      try {
        setLoadingMatrix(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const { data: rolesData, error: rolesError } = await supabase
          .from("rbac_roles")
          .select("key, name, description")
          .order("name", { ascending: true });

        if (rolesError) {
          throw rolesError;
        }

        const roleRows = (rolesData ?? []) as RoleRow[];

        const sortedRoles = [...roleRows].sort((a, b) => {
          const order: Record<string, number> = {
            super_admin: 0,
            staff: 1,
            user: 2,
          };
          const aOrder = order[a.key] ?? 99;
          const bOrder = order[b.key] ?? 99;
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
          return a.name.localeCompare(b.name);
        });

        const { data: permsData, error: permsError } = await supabase
          .from("rbac_permissions")
          .select(
            "role, resource, can_view, can_read, can_create, can_update, can_delete"
          );

        if (permsError) {
          throw permsError;
        }

        const permsRows = (permsData ?? []) as PermissionRow[];

        const merged: Record<string, Record<string, RbacActionFlags>> = {};

        sortedRoles.forEach((role) => {
          if (!merged[role.key]) {
            merged[role.key] = {};
          }
        });

        RESOURCES.forEach((resource) => {
          sortedRoles.forEach((role) => {
            const existing = permsRows.find(
              (row) => row.role === role.key && row.resource === resource.key
            );
            const flags: RbacActionFlags = existing
              ? {
                  can_view: existing.can_view,
                  can_read: existing.can_read,
                  can_create: existing.can_create,
                  can_update: existing.can_update,
                  can_delete: existing.can_delete,
                }
              : {
                  can_view: false,
                  can_read: false,
                  can_create: false,
                  can_update: false,
                  can_delete: false,
                };

            if (!merged[role.key]) {
              merged[role.key] = {};
            }
            merged[role.key][resource.key] = flags;
          });
        });

        setRoles(sortedRoles);
        setPermissions(merged);
      } catch {
        setErrorMessage("Gagal memuat data role dan hak akses.");
      } finally {
        setLoadingMatrix(false);
      }
    };

    fetchRole();
    fetchMatrix();
  }, []);

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault();
    const key = newRoleKey.trim();
    const name = newRoleName.trim();
    const description = newRoleDescription.trim();
    if (!key || !name) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      const { data, error } = await supabase
        .from("rbac_roles")
        .insert({
          key,
          name,
          description: description || null,
        })
        .select("key, name, description")
        .maybeSingle<RoleRow>();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Role baru tidak berhasil dibuat.");
      }

      setRoles((prev) => [...prev, data]);

      setPermissions((prev) => {
        const next = { ...prev };
        if (!next[data.key]) {
          next[data.key] = {};
        }
        RESOURCES.forEach((resource) => {
          if (!next[data.key][resource.key]) {
            next[data.key][resource.key] = {
              can_view: false,
              can_read: false,
              can_create: false,
              can_update: false,
              can_delete: false,
            };
          }
        });
        return next;
      });

      setNewRoleKey("");
      setNewRoleName("");
      setNewRoleDescription("");
      setSuccessMessage("Role baru berhasil ditambahkan.");
    } catch (err) {
      const anyError = err as { message?: string };
      const message =
        typeof anyError?.message === "string" && anyError.message.trim().length > 0
          ? anyError.message
          : "Gagal menambah role baru.";
      setErrorMessage(message);
    }
  };

  const handleDeleteRole = async (roleKey: string) => {
    if (!window.confirm(`Yakin ingin menghapus role "${roleKey}"?`)) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      const { error: permsError } = await supabase
        .from("rbac_permissions")
        .delete()
        .eq("role", roleKey);

      if (permsError) {
        throw permsError;
      }

      const { error: rolesError } = await supabase
        .from("rbac_roles")
        .delete()
        .eq("key", roleKey);

      if (rolesError) {
        throw rolesError;
      }

      setRoles((prev) => prev.filter((role) => role.key !== roleKey));
      setPermissions((prev) => {
        const next = { ...prev };
        delete next[roleKey];
        return next;
      });

      setSuccessMessage("Role berhasil dihapus.");
    } catch (err) {
      const anyError = err as { message?: string };
      const message =
        typeof anyError?.message === "string" && anyError.message.trim().length > 0
          ? anyError.message
          : "Gagal menghapus role.";
      setErrorMessage(message);
    }
  };

  const handleTogglePermission = async (
    roleKey: string,
    resourceKey: PermissionResource,
    field: keyof RbacActionFlags
  ) => {
    const supabase = createSupabaseBrowserClient();

    const current =
      permissions[roleKey]?.[resourceKey] ?? ({
        can_view: false,
        can_read: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      } as RbacActionFlags);

    const nextValue = !current[field];
    const nextFlags: RbacActionFlags = {
      ...current,
      [field]: nextValue,
    };

    setPermissions((prev) => {
      const next = { ...prev };
      if (!next[roleKey]) {
        next[roleKey] = {};
      }
      next[roleKey][resourceKey] = nextFlags;
      return next;
    });

    try {
      setSavingMatrix(true);
      setErrorMessage(null);

      const payload = {
        role: roleKey,
        resource: resourceKey,
        ...nextFlags,
      };

      const { error } = await supabase
        .from("rbac_permissions")
        .upsert(payload, { onConflict: "role,resource" });

      if (error) {
        throw error;
      }
    } catch (err) {
      const anyError = err as { message?: string };
      const message =
        typeof anyError?.message === "string" && anyError.message.trim().length > 0
          ? anyError.message
          : "Gagal menyimpan perubahan hak akses.";
      setErrorMessage(message);

      setPermissions((prev) => {
        const next = { ...prev };
        if (!next[roleKey]) {
          next[roleKey] = {};
        }
        next[roleKey][resourceKey] = current;
        return next;
      });
    } finally {
      setSavingMatrix(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="px-6 py-4">
          <p className="text-xs text-secondary-text">Memuat konfigurasi role...</p>
        </div>
      </div>
    );
  }

  if (currentRole !== "super_admin") {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="px-6 py-4">
          <p className="text-xs text-secondary-text">
            Hanya Super Admin yang dapat mengakses halaman Management Role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader
        title="Management Role"
        subtitle="Pengaturan / Pengguna / Management Role"
      />

      <div className="p-6 max-w-5xl mx-auto w-full pb-12">
        {/* Alert Box */}
        <div className="bg-warning-bg border border-warning-border rounded-lg p-4 mb-6 flex gap-3 items-start">
          <Info className="w-5 h-5 text-warning-text mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-warning-text mb-1">Konfigurasi Hak Akses Role</p>
            <p className="text-sm text-warning-text leading-relaxed">
              Halaman ini menampilkan dan mengatur hak akses untuk setiap role pada setiap menu
              (resource). Anda dapat menambahkan role baru dan mengatur hak Lihat, Baca, Tulis, Ubah, dan
              Hapus untuk setiap role pada setiap resource.
            </p>
          </div>
        </div>

        {/* Main Card Wrapper */}
        <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6">

          {errorMessage && (
            <div className="mb-6 text-sm text-error-text bg-error-bg border border-error-border rounded-md px-4 py-3">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 text-sm text-success-text bg-success-bg border border-success-border rounded-md px-4 py-3">
              {successMessage}
            </div>
          )}

          {/* Component B: Role Table */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Role yang Tersedia</h3>
            
            <div className="space-y-4">
              {roles.length === 0 ? (
                <p className="text-sm text-secondary-text italic">
                  Belum ada role yang terdaftar. Tambahkan role pertama Anda menggunakan formulir di bawah.
                </p>
              ) : (
                <div className="border border-border-color rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-card-bg/95 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color">
                          Key
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color">
                          Nama
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color">
                          Deskripsi
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color bg-card-bg">
                      {roles.map((role) => (
                        <tr key={role.key} className="hover:bg-body-bg transition-colors">
                          <td className="px-4 py-3 text-sm text-primary-text font-medium">{role.key}</td>
                          <td className="px-4 py-3 text-sm text-secondary-text">{role.name.toUpperCase()}</td>
                          <td className="px-4 py-3 text-sm text-secondary-text">
                            {role.description ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {role.key === "super_admin" ? (
                              <span className="text-xs text-secondary-text/50 italic">
                                Tidak dapat dihapus
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteRole(role.key)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-error-text hover:text-error-text hover:bg-error-bg rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer Form */}
              <form onSubmit={handleCreateRole} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col">
                  <InputField
                    placeholder="Key role, mis. kader_posyandu"
                    value={newRoleKey}
                    onChange={(e) => setNewRoleKey(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <InputField
                    placeholder="Nama role"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <InputField
                      placeholder="Deskripsi (opsional)"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Component C: Permission Matrix */}
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-4">Resource & Hak Akses</h3>
            
            <div className="border border-border-color rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {loadingMatrix && (
                  <div className="px-6 py-4 text-sm text-secondary-text bg-body-bg border-b border-border-color">
                    Memuat matriks hak akses...
                  </div>
                )}
                <table className="w-full text-left border-collapse">
                  <thead className="bg-card-bg/95 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color w-1/4">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color w-1/4">
                        Deskripsi
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-secondary-text uppercase tracking-wider border-b border-border-color w-1/2">
                        Role & Hak Akses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card-bg">
                    {RESOURCES.map((resource) => (
                      <tr key={resource.key} className="border-b-4 border-body-bg last:border-0">
                        <td className="px-6 py-4 text-sm font-medium text-primary-text align-top">
                          {resource.label}
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary-text align-top leading-relaxed">
                          {resource.description}
                        </td>
                        <td className="px-0 py-0 align-top">
                          <div className="divide-y divide-border-color">
                            {/* Matrix Header for this Resource */}
                            <div className="grid grid-cols-6 items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                              {["Lihat", "Baca", "Tulis", "Ubah", "Hapus"].map((label) => (
                                <div key={label} className="text-[10px] font-semibold text-gray-400 text-center uppercase tracking-wider">
                                  {label}
                                </div>
                              ))}
                              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pl-2">
                                Role
                              </div>
                            </div>
                            
                            {/* Role Rows */}
                            {roles.map((role) => {
                              const flags =
                                permissions[role.key]?.[resource.key] ??
                                ({
                                  can_view: false,
                                  can_read: false,
                                  can_create: false,
                                  can_update: false,
                                  can_delete: false,
                                } as RbacActionFlags);

                              return (
                                <div
                                  key={role.key}
                                  className="grid grid-cols-6 items-center px-4 py-3 hover:bg-primary-text/5 transition-colors"
                                >
                                  {["can_view", "can_read", "can_create", "can_update", "can_delete"].map((perm) => (
                                    <div key={perm} className="flex items-center justify-center">
                                    <Checkbox
                                      checked={flags[perm as keyof RbacActionFlags]}
                                      onChange={() =>
                                        handleTogglePermission(
                                          role.key,
                                          resource.key,
                                          perm as keyof RbacActionFlags
                                        )
                                      }
                                      disabled={savingMatrix}
                                    />
                                  </div>
                                  ))}
                                  <div className="text-xs font-medium text-primary-text pl-2 truncate">
                                    {role.name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
