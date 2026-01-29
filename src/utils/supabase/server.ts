import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://btilxibhwkbfohsfzaps.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDA4NDUsImV4cCI6MjA4NDI3Njg0NX0.QeuS7L9M98FL8_d-INJU__duXHTDqq0OOKabHZQ0Lrc";

  return createClient(supabaseUrl, supabaseKey);
}

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
