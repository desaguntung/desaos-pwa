"use client";

import { useEffect, useState } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import { AppRole } from "@/config/permissions";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { createAdminOrStaffUser, deleteUserById } from "@/app/actions/users";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
};

type UserRow = {
  id: string;
  email: string | null;
  created_at: string;
};

type UserWithProfile = {
  id: string;
  email: string;
  role: AppRole;
  full_name: string;
  created_at: string;
};

export default function PengaturanPenggunaPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("staff");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [users, setUsers] = useState<UserWithProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setErrorMessage(null);

        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData.user;

        if (authUser) {
          const {
            data: meProfile,
            error: meError,
          } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authUser.id)
            .maybeSingle();

          if (meError) {
            throw meError;
          }

          setCurrentRole((meProfile?.role as AppRole) ?? null);
        } else {
          setCurrentRole(null);
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role");

        if (profileError) {
          throw profileError;
        }

        const profiles = (profileData ?? []) as ProfileRow[];

        const { data: authUsersData, error: authUsersError } = await supabase
          .from("auth_users_view")
          .select("id, email, created_at");

        if (authUsersError) {
          throw authUsersError;
        }

        const authUsers = (authUsersData ?? []) as UserRow[];

        const merged: UserWithProfile[] = authUsers.map((user) => {
          const profile = profiles.find((p) => p.id === user.id);
          return {
            id: user.id,
            email: user.email ?? "",
            created_at: user.created_at,
            full_name: profile?.full_name ?? user.email ?? "",
            role: profile?.role ?? "user",
          };
        });

        setUsers(merged);
      } catch (error) {
        setErrorMessage("Gagal memuat data pengguna.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setSubmitting(true);

      const created = await createAdminOrStaffUser({
        email,
        password,
        fullName,
        role,
      });

      setSuccessMessage(
        `User ${created.full_name} (${created.email}) dengan role ${created.role} berhasil dibuat. Silakan login di halaman Login.`
      );

      setEmail("");
      setPassword("");
      setFullName("");
      setRole("staff");

      setUsers((prev) => [
        ...prev,
        {
          id: created.id,
          email: created.email ?? "",
          role: created.role,
          full_name: created.full_name,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const anyError = err as { message?: string };
      const message =
        typeof anyError?.message === "string" && anyError.message.trim().length > 0
          ? anyError.message
          : "Gagal membuat user baru.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, nextRole: AppRole) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", userId);
      if (error) {
        throw error;
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: nextRole,
              }
            : user
        )
      );
    } catch (error) {
      setErrorMessage("Gagal mengubah role pengguna.");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus user dengan email ${email}?`
    );
    if (!confirmDelete) {
      return;
    }
    try {
      setErrorMessage(null);
      await deleteUserById(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      setErrorMessage("Gagal menghapus pengguna.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <header className="sticky top-0 bg-body-bg/80 backdrop-blur-md border-b border-zinc-200 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-primary-text">Pengaturan Pengguna</h2>
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-1 text-xs text-secondary-text">
              <span>Pengaturan</span>
              <span className="text-zinc-200">/</span>
              <span className="text-primary-text font-medium">Pengguna & Role</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-12">
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 items-start">
          <Info className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-900">Pengaturan Awal Pengguna</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Gunakan halaman ini untuk membuat akun admin atau staff pertama tanpa harus masuk
              ke dashboard Supabase. Setelah akun admin dibuat dan berhasil login, Anda bisa
              mengelola pengguna dari halaman ini atau halaman manajemen user.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4"
        >
          <p className="text-[11px] font-bold text-secondary-text uppercase tracking-widest">
            Tambah Pengguna Baru
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-secondary-text">Nama Lengkap</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
                placeholder="Mis. Super Admin"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-secondary-text">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
                placeholder="superadmin@desa.id"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-secondary-text">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-secondary-text">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
              >
                <option value="super_admin">Super Admin</option>
                <option value="staff">Staff</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? "Menyimpan..." : "Simpan Pengguna"}</span>
            </button>
          </div>
        </form>

        {currentRole === "super_admin" && (
          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-900">
                  Manajemen Pengguna dan Role
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Sebagai{" "}
                  <span className="font-semibold">super_admin</span> Anda dapat melihat daftar
                  semua pengguna, mengubah role, dan menghapus pengguna.
                </p>
              </div>
            </div>

            {loadingUsers ? (
              <p className="text-xs text-secondary-text">Memuat data pengguna...</p>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-3">
                          Email
                        </th>
                        <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-3">
                          Nama
                        </th>
                        <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-3">
                          Role
                        </th>
                        <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-3">
                          Dibuat
                        </th>
                        <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-3 text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-sm">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-zinc-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-primary-text">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-xs text-secondary-text">
                            {(user.full_name || "").toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleChangeRole(user.id, e.target.value as AppRole)
                              }
                              className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-[11px]"
                            >
                              <option value="super_admin">Super Admin</option>
                              <option value="staff">Staff</option>
                              <option value="user">User</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-secondary-text">
                            {new Date(user.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] text-rose-600 border border-zinc-200 rounded-md bg-white"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


