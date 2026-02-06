"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import ArticleForm, { Article } from "@/components/ArticleForm";
import { getArticleById } from "@/lib/services/artikel";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function EditArtikelPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createSupabaseBrowserClient();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      const { data, error } = await getArticleById(id);

      if (error) {
        toast.error("Gagal memuat data artikel");
        router.push("/artikel/dinamis");
        return;
      }

      if (!data) {
        toast.error("Artikel tidak ditemukan");
        router.push("/artikel/dinamis");
        return;
      }

      setArticle(data);
      setLoading(false);
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
        const { error } = await supabase
          .from('articles')
          .update(data)
          .eq('id', id);

        if (error) throw error;
        
        toast.success(`Artikel berhasil diperbarui`);
        router.push('/artikel/dinamis');
    } catch (error: any) {
        console.error('Error updating article:', error);
        toast.error("Gagal memperbarui artikel: " + error.message);
        throw error; // Re-throw to let Form handle state if needed
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-body-bg">
        <Loader2 className="w-8 h-8 animate-spin text-secondary-text" />
      </div>
    );
  }

  return (
    <ArticleForm 
        mode="edit" 
        initialData={article || undefined} 
        onSubmit={handleSubmit}
    />
  );
}
