"use server";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateFormatTemplate(id: string, json: string) {
  const supabase = createSupabaseServerClient();
  
  const { error } = await supabase
    .from("tweb_surat_format")
    .update({ template: json })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/surat/pengaturan/format/edit/${id}`);
}
