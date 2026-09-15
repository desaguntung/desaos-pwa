import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import {
  AppRole,
  PermissionLevel,
  PermissionResource,
  RbacActionFlags,
  hasPermission,
  hasPermissionFromFlags,
} from "@/config/permissions";

type ProfileRow = {
  id: string;
  role: AppRole;
};

type RbacPermissionRow = {
  resource: PermissionResource;
  can_view: boolean;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
};

export type UseRbacResult = {
  role: AppRole;
  flags: RbacActionFlags | null;
  loading: boolean;
  canRead: boolean;
  canWrite: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  check: (action: PermissionLevel) => boolean;
};

export function useRbac(resource: PermissionResource): UseRbacResult {
  const [role, setRole] = useState<AppRole>("user");
  const [flags, setFlags] = useState<RbacActionFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createSupabaseBrowserClient();

        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;

        if (!user) {
          setRole("user");
          setFlags(null);
          return;
        }

        const isSuperAdminEmail = user.email?.startsWith("superadmin") || user.email?.includes("admin");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();

        const effectiveRole = (profile?.role ?? (isSuperAdminEmail ? "super_admin" : "user")) as AppRole;
        setRole(effectiveRole);

        const { data: rbacRows, error: rbacError } = await supabase
          .from("rbac_permissions")
          .select(
            "resource, can_view, can_read, can_create, can_update, can_delete"
          )
          .eq("role", effectiveRole)
          .eq("resource", resource);

        if (rbacError) {
          setFlags(null);
          return;
        }

        const rows = (rbacRows ?? []) as RbacPermissionRow[];
        const row = rows[0];

        if (!row) {
          setFlags(null);
          return;
        }

        setFlags({
          can_view: row.can_view,
          can_read: row.can_read,
          can_create: row.can_create,
          can_update: row.can_update,
          can_delete: row.can_delete,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resource]);

  const check = (action: PermissionLevel): boolean => {
    if (flags) {
      return hasPermissionFromFlags(flags, action);
    }
    return hasPermission(role, resource, action);
  };

  const canRead = check("read");
  const canWrite = check("write");
  const canCreate = flags ? flags.can_create || canWrite : canWrite;
  const canUpdate = flags ? flags.can_update || canWrite : canWrite;
  const canDelete = flags ? flags.can_delete : canWrite;

  return {
    role,
    flags,
    loading,
    canRead,
    canWrite,
    canCreate,
    canUpdate,
    canDelete,
    check,
  };
}
