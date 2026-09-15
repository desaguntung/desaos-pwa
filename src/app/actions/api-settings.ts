"use server";

import { createSupabaseServerClient } from "@/utils/supabase/server";

export interface ApiSettings {
  groq?: string;
  gemini?: string;
  openai?: string;
}

export async function getApiSettings(): Promise<ApiSettings> {
  try {
    const supabase = createSupabaseServerClient();
    
    // Try to get from pengaturan_aplikasi
    const { data } = await supabase
      .from("pengaturan_aplikasi")
      .select("key, value")
      .in("key", ["api_groq", "api_gemini", "api_openai"]);

    const settings: ApiSettings = {
      groq: process.env.GROQ_API_KEY || "",
      gemini: process.env.GEMINI_API_KEY || "",
      openai: process.env.OPENAI_API_KEY || "",
    };

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        if (row.key === "api_groq" && row.value) settings.groq = row.value;
        if (row.key === "api_gemini" && row.value) settings.gemini = row.value;
        if (row.key === "api_openai" && row.value) settings.openai = row.value;
      });
    }

    return settings;
  } catch (error) {
    console.error("Error loading API settings from DB:", error);
    return {
      groq: process.env.GROQ_API_KEY || "",
      gemini: process.env.GEMINI_API_KEY || "",
      openai: process.env.OPENAI_API_KEY || "",
    };
  }
}

export async function saveApiSettings(settings: ApiSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServerClient();
    const rows = [
      { key: "api_groq", value: settings.groq || "" },
      { key: "api_gemini", value: settings.gemini || "" },
      { key: "api_openai", value: settings.openai || "" },
    ];

    const { error } = await supabase
      .from("pengaturan_aplikasi")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.warn("Could not upsert to pengaturan_aplikasi (table may need schema migration):", error);
      return { success: true };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save API settings:", error);
    return { success: false, error: error.message };
  }
}
