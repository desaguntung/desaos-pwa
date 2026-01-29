"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://btilxibhwkbfohsfzaps.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDA4NDUsImV4cCI6MjA4NDI3Njg0NX0.QeuS7L9M98FL8_d-INJU__duXHTDqq0OOKabHZQ0Lrc";

  return createBrowserClient(supabaseUrl, supabaseKey);
}

