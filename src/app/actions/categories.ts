"use server";

import { createSessionServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createSessionServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}

export async function addCategory(name: string) {
  const supabase = await createSessionServerClient();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    console.error("Error adding category:", error);
    return { error: error.message };
  }

  revalidatePath("/artikel/dinamis/tambah");
  revalidatePath("/artikel/dinamis/edit/[id]");
  revalidatePath("/berita");

  return { data };
}
