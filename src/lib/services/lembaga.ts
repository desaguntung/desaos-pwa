import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export interface Lembaga {
  id: string;
  nama: string;
  singkatan?: string;
  kategori?: string;
  alamat?: string;
  deskripsi?: string;
  logo_url?: string;
  created_at?: string;
}

export async function getLembagaById(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("lembaga_desa")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching lembaga by id:", error);
    throw error;
  }
  return data as Lembaga;
}

export async function getLembagaList() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("lembaga_desa")
      .select("*")
      .order("nama", { ascending: true });
  
    if (error) {
      console.error("Error fetching lembaga list:", error);
      throw error;
    }
    return data as Lembaga[];
}

export async function deleteLembaga(id: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("lembaga_desa")
      .delete()
      .eq("id", id);
      
    if (error) {
      throw error;
    }
    return true;
}
