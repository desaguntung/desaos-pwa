"use server";

import { createSupabaseAdminClient } from "@/utils/supabase/server";

export async function backfillWilayahAction(
  namaDesa: string,
  namaKecamatan: string,
  namaKabupaten: string,
  namaProvinsi: string
) {
  const supabase = createSupabaseAdminClient();

  // Update all residents with current Info Desa
  const { error } = await supabase
    .from("penduduk")
    .update({
      nama_desa: namaDesa,
      nama_kecamatan: namaKecamatan,
      nama_kabupaten: namaKabupaten,
      nama_provinsi: namaProvinsi,
    })
    .neq("id", 0); // Hack to update all rows since Supabase requires a WHERE clause usually, or I can just omit .neq if RLS allows, but usually explicit match is safer. Actually Supabase JS update without filter updates all rows if not blocked by RLS.
    // However, to be safe and explicit that we mean ALL, usually we might want to check something.
    // But since this is "DesaOS", all residents belong to this Desa.
    
    // Let's just remove the .is("nama_desa", null) constraint.
    // And to be safe against accidental mass updates if there were multiple desas (which there shouldn't be),
    // but here we assume single tenant/desa.


  if (error) {
    console.error("Error backfilling wilayah:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
