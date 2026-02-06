"use client";

import { useEffect, useState, useRef } from "react";
import { Info, Plus, Trash2, Users, UserPlus } from "lucide-react";
import { AppRole } from "@/config/permissions";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { createAdminOrStaffUser, deleteUserById } from "@/app/actions/users";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { InputField, SelectField, SectionTitle } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "sonner";

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

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [users, setUsers] = useState<UserWithProfile[]>([]);

  // Scroll Spy
  const [activeSection, setActiveSection] = useState("tambah-user");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: "tambah-user", label: "Tambah Pengguna", icon: UserPlus },
    ...(currentRole === "super_admin" ? [{ id: "daftar-user", label: "Daftar Pengguna", icon: Users }] : []),
  ];

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

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
        toast.error("Gagal memuat data pengguna.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);

      const created = await createAdminOrStaffUser({
        email,
        password,
        fullName,
        role,
      });

      toast.success(`User ${created.full_name} (${created.email}) berhasil dibuat.`);

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
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, nextRole: AppRole) => {
    try {
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
      toast.success("Role pengguna berhasil diperbarui.");
    } catch (error) {
      toast.error("Gagal mengubah role pengguna.");
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
      await deleteUserById(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("Pengguna berhasil dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus pengguna.");
    }
  };

  return (
    <FormLayout
      title="Pengaturan Pengguna"
      subtitle="Kelola pengguna dan hak akses aplikasi."
      sidebar={
        <FormSidebarNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      }
    >
      <div className="space-y-8 pb-24">
        {/* Section 1: Tambah Pengguna */}
        <div
          id="tambah-user"
          ref={(el) => { sectionRefs.current["tambah-user"] = el; }}
          className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
        >
          <SectionTitle
            title="Tambah Pengguna Baru"
            description="Buat akun admin atau staff baru."
            icon={UserPlus}
          />
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 items-start mb-6">
            <Info className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-900">Informasi</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Gunakan form ini untuk membuat akun admin atau staff pertama tanpa harus masuk
                ke dashboard Supabase. Setelah akun admin dibuat dan berhasil login, Anda bisa
                mengelola pengguna dari tabel di bawah.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nama Lengkap"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mis. Super Admin"
              />
              <InputField
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@desa.id"
              />
              <InputField
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
              <SelectField
                label="Role"
                value={role}
                onValueChange={(val) => setRole(val as AppRole)}
                options={[
                  { value: "super_admin", label: "Super Admin" },
                  { value: "staff", label: "Staff" },
                  { value: "user", label: "User" },
                ]}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-auto bg-primary-text text-card-bg hover:bg-primary-text/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {submitting ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            </div>
          </form>
        </div>

        {/* Section 2: Daftar Pengguna (Only for Super Admin) */}
        {currentRole === "super_admin" && (
          <div
            id="daftar-user"
            ref={(el) => { sectionRefs.current["daftar-user"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle
              title="Manajemen Pengguna"
              description="Daftar semua pengguna yang terdaftar dalam sistem."
              icon={Users}
            />

            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start mb-6">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-900">
                  Hak Akses Super Admin
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Sebagai <span className="font-semibold">super_admin</span>, Anda dapat melihat daftar
                  semua pengguna, mengubah role, dan menghapus pengguna.
                </p>
              </div>
            </div>

            {loadingUsers ? (
              <p className="text-xs text-secondary-text text-center py-8">Memuat data pengguna...</p>
            ) : (
              <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-body-bg border-b border-border-color">
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
                        <th className="text-xs font-bold text-secondary-text uppercase tracking-wider px-4 py-3 text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color text-sm">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-body-bg transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-primary-text">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-xs text-secondary-text">
                            {(user.full_name || "").toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <Select
                              value={user.role}
                              onValueChange={(val) => handleChangeRole(user.id, val as AppRole)}
                            >
                              <SelectTrigger className="h-7 text-[11px] w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-secondary-text">
                            {new Date(user.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-rose-600 border border-border-color rounded-md bg-card-bg hover:bg-rose-50 hover:border-rose-200 transition-colors"
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
    </FormLayout>
  );
}


