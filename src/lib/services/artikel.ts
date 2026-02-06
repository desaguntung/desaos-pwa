import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Article } from "@/components/ArticleForm";

export async function getArticleById(id: string): Promise<{ data: Article | null; error: any }> {
  const supabase = createSupabaseBrowserClient();
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching article:", error);
    return { data: null, error };
  }
}
