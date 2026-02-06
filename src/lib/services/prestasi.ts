import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export interface Prestasi {
  id: string;
  judul: string;
  tingkat?: string;
  kategori?: string;
  tanggal: string;
  deskripsi?: string;
  foto_url?: string;
  created_at?: string;
}

export async function getPrestasiById(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prestasi_desa")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching prestasi by id:", error);
    throw error;
  }
  return data as Prestasi;
}

export async function getPrestasiList() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("prestasi_desa")
      .select("*")
      .order("tanggal", { ascending: false });
  
    if (error) {
      console.error("Error fetching prestasi list:", error);
      throw error;
    }
    return data as Prestasi[];
}

export async function deletePrestasi(id: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("prestasi_desa")
      .delete()
      .eq("id", id);
      
    if (error) {
      throw error;
    }
    return true;
}
