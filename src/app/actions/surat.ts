"use server";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSuratFormat(id: string, template: string) {
  const supabase = createSupabaseServerClient();
  
  const { error } = await supabase
    .from("tweb_surat_format")
    .update({ template })
    .eq("id", id);

  if (error) {
    console.error("Error updating surat format:", error);
    throw new Error("Failed to update surat format");
  }

  revalidatePath("/surat/pengaturan/format");
  revalidatePath(`/surat/pengaturan/format/edit/${id}`);
  
  return { success: true };
}
