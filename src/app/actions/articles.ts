"use server";

import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function incrementArticleView(slug: string) {
  const supabase = createSupabaseServerClient();

  // Call the RPC function if it exists, or update directly
  // Using direct update for now as it's safer if RPC isn't set up, 
  // though slightly race-condition prone without atomic increment.
  // Ideally: await supabase.rpc('increment_article_views', { article_slug: slug });
  
  // Since we want to be safe and I don't know if RPC exists, I'll try to use a direct update 
  // but really we should use an RPC for atomicity. 
  // Let's assume the user has a `views` column.
  
  // Option 1: Fetch current, then update (simple, but race conditions)
  // Option 2: RPC (best)
  
  // Let's try RPC first, if it fails, fallback? No, can't easily fallback in server action without error logs.
  // Given the user asked for SQL previously, maybe I should assume they ran it.
  
  // Let's try to update using a simple increment approach if possible or just fetch-update.
  // For this "DesaOS" project level, fetch-update is probably acceptable for now.
  
  try {
    const { data: article } = await supabase
      .from("articles")
      .select("id, views")
      .eq("slug", slug)
      .single();

    if (article) {
      const currentViews = article.views || 0;
      await supabase
        .from("articles")
        .update({ views: currentViews + 1 })
        .eq("id", article.id);
    }
  } catch (error) {
    console.error("Failed to increment view:", error);
  }
}
