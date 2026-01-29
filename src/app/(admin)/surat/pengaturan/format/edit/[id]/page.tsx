import { createSupabaseServerClient } from "@/utils/supabase/server";
import EditFormatClient from "./client";

export default async function FormatEditorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createSupabaseServerClient();
  const { id } = await params;
  
  // Fetch existing template and details
  const { data: format } = await supabase
    .from("tweb_surat_format")
    .select("template, nama, url_surat")
    .eq("id", id)
    .single();

  return (
    <EditFormatClient 
      initialJson={format?.template || undefined} 
      letterType={format?.url_surat || "unknown"} 
      letterName={format?.nama || "Surat"} 
      id={id} 
    />
  );
}
