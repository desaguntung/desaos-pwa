"use server";

import { createSupabaseServerClient } from "@/utils/supabase/server";

const PAGE_SIZE = 9;

export async function getArticles(page: number, search: string = "", category: string = "Semua") {
  const supabase = createSupabaseServerClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, category, published_at, views_count", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return { data: [], count: 0, error: error.message };
  }

  return { data, count, error: null };
}

export async function incrementArticleView(slug: string) {
  const supabase = createSupabaseServerClient();
  
  // We can't easily do atomic increment with simple update unless we use rpc or fetch-then-update.
  // Ideally, use an RPC function: create function increment_views(row_id uuid) ...
  // But for now, let's try to do it without RPC if possible to avoid migration complexity, 
  // OR just create the RPC if we are comfortable with SQL.
  
  // Actually, the best way for atomic update without RPC in Supabase/Postgres is unclear via JS client 
  // without a stored procedure.
  // However, for view counts, a little race condition is usually acceptable.
  
  // Let's try to fetch current views first.
  const { data } = await supabase.from('articles').select('id, views_count').eq('slug', slug).single();
  
  if (data) {
    const newCount = (data.views_count || 0) + 1;
    await supabase.from('articles').update({ views_count: newCount }).eq('id', data.id);
  }
}
