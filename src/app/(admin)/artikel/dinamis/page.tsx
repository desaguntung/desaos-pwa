"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, FileText, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function ArtikelDinamisPage() {
  const supabase = createSupabaseBrowserClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter, searchTerm]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // 1. Fetch articles without join first to avoid relation issues
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryFilter !== "Semua") {
        query = query.eq('category', categoryFilter);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data: articlesData, error: articlesError } = await query;

      if (articlesError) throw articlesError;
      
      if (!articlesData || articlesData.length === 0) {
        setArticles([]);
        return;
      }

      // 2. Fetch authors manually from profiles
      const authorIds = Array.from(new Set(articlesData.map(a => a.author_id).filter(Boolean)));
      
      let profilesMap: Record<string, any> = {};
      
      if (authorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email') // Adjust fields based on your profiles table
          .in('id', authorIds);
          
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p;
          });
        }
      }

      // 3. Merge data
      const mergedArticles = articlesData.map(article => ({
        ...article,
        author: profilesMap[article.author_id] || { 
          full_name: 'Admin', 
          email: 'admin@desa.id' 
        }
      }));

      setArticles(mergedArticles);
    } catch (error: any) {
      console.error('Error fetching articles:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const getAuthorName = (article: any) => {
    return article.author?.full_name || 
           article.author?.email?.split('@')[0] || 
           "Admin Desa";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-body-bg">
      {/* Header */}
      <PageHeader
        title="Artikel Dinamis"
        subtitle="Kelola berita, pengumuman, dan artikel blog desa."
        actions={
          <Link href="/artikel/dinamis/tambah">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tulis Artikel Baru
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
           <Input 
             placeholder="Cari judul artikel..." 
             className="pl-9"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2 text-zinc-500">
                <Filter className="w-4 h-4" />
                <span>{categoryFilter === "Semua" ? "Semua Kategori" : categoryFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Kategori</SelectItem>
              <SelectItem value="Berita Desa">Berita Desa</SelectItem>
              <SelectItem value="Pengumuman">Pengumuman</SelectItem>
              <SelectItem value="Kesehatan">Kesehatan</SelectItem>
              <SelectItem value="Pembangunan">Pembangunan</SelectItem>
              <SelectItem value="Kegiatan">Kegiatan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="h-40 bg-zinc-100 relative flex items-center justify-center overflow-hidden">
                   {article.cover_image ? (
                     <img 
                       src={article.cover_image} 
                       alt={article.title} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                   ) : (
                     <FileText className="w-12 h-12 text-zinc-300" />
                   )}
                   
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 shadow-sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                   </div>
                   <div className="absolute bottom-3 left-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        article.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {article.status}
                      </span>
                   </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-blue-600 font-medium mb-2">{article.category}</div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-2 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{getAuthorName(article)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at || article.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {articles.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-500">
                 <FileText className="w-12 h-12 mb-4 text-zinc-300" />
                 <p>Belum ada artikel yang dibuat.</p>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
