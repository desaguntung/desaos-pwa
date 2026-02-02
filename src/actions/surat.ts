"use server";

import { createSessionServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateFormatTemplate(id: string, json: string) {
  const supabase = await createSessionServerClient();
  
  const { error } = await supabase
    .from("surat_formats")
    .update({ template: json })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/surat/pengaturan/format/edit/${id}`);
}
