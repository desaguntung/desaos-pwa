"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { AppRole } from "@/config/permissions";
import { createAdminOrStaffUser, deleteUserById } from "@/app/actions/users";
import { Info, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

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

export default function AdminUsersPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("staff");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role");

        if (profileError) {
          throw profileError;
        }

        const profiles = (profileData ?? []) as ProfileRow[];

        const { data: authData, error: authError } = await supabase
          .from("auth_users_view")
          .select("id, email, created_at");

        if (authError) {
          throw authError;
        }

        const authUsers = (authData ?? []) as UserRow[];

        const {
          data: meProfile,
          error: meError,
        } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .maybeSingle();

        if (meError) {
          throw meError;
        }

        const role = (meProfile?.role ?? null) as AppRole | null;
        setCurrentRole(role);

        if (role !== "super_admin") {
          router.replace("/");
          return;
        }

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
        setErrorMessage("Gagal memuat data user.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleChangeRole = async (userId: string, role: AppRole) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (error) {
        throw error;
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role } : user
        )
      );
    } catch (error) {
      setErrorMessage("Gagal mengubah role user.");
    }
  };

  const handleSubmitNewUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setErrorMessage(null);
      setIsAdding(true);

      const created = await createAdminOrStaffUser({
        email: newUserEmail,
        password: newUserPassword,
        fullName: newUserFullName,
        role: newUserRole,
      });

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

      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserRole("staff");
    } catch (error) {
      setErrorMessage("Gagal menambah user baru.");
    } finally {
      setIsAdding(false);
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
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      setErrorMessage("Gagal menghapus user.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="px-6 py-4">
          <p className="text-xs text-secondary-text">Memuat data user...</p>
        </div>
      </div>
    );
  }

  if (currentRole !== "super_admin") {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-body-bg">
      <PageHeader 
        title="Manajemen User" 
        subtitle="Admin / Users"
        actions={
          <button
            type="button"
            onClick={handleSubmitNewUser}
            disabled={isAdding}
            className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? "Menyimpan..." : "Tambah Admin Baru"}</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6 pb-12">
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-900">Kontrol Hak Akses Admin</p>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Hanya role <span className="font-semibold">super_admin</span> yang dapat mengelola user dan mengatur peran
              (role) di sistem ini.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmitNewUser}
          className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-[11px] font-bold text-secondary-text uppercase tracking-widest">
            Tambah Admin/Staff Baru
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Nama Lengkap"
              value={newUserFullName}
              onChange={(e) => setNewUserFullName(e.target.value)}
              className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as AppRole)}
              className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs"
            >
              <option value="super_admin">Super Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAdding}
              className="px-3 py-1.5 text-xs bg-primary-text text-white rounded-md border border-zinc-200 font-medium"
            >
              {isAdding ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {errorMessage}
          </div>
        )}

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
                  <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
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
      </div>
    </div>
  );
}


