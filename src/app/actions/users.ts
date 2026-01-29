"use server";

import { createSupabaseAdminClient } from "@/utils/supabase/server";
import { AppRole } from "@/config/permissions";

type CreateAdminUserPayload = {
  email: string;
  password: string;
  fullName: string;
  role: AppRole;
};

export async function createAdminOrStaffUser(payload: CreateAdminUserPayload) {
  const supabase = createSupabaseAdminClient();

  const { email, password, fullName, role } = payload;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw new Error("User tidak berhasil dibuat.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role,
    })
    .eq("id", user.id);

  if (profileError) {
    throw profileError;
  }

  return {
    id: user.id,
    email: user.email,
    role,
    full_name: fullName,
  };
}

export async function deleteUserById(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    throw error;
  }
}

