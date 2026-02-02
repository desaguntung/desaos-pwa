"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Calendar, 
  User, 
  Loader2, 
  LayoutGrid, 
  List, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  X,
  ImageIcon
} from "lucide-react";
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
import { toast } from "sonner";

export default function ArtikelDinamisPage() {
  const supabase = createSupabaseBrowserClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  // New state for view mode and delete
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter, searchTerm]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name').order('name');
    if (data) {
      setCategories(data.map(c => c.name));
    }
  };

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

  const confirmDelete = (article: any) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('articles').delete().eq('id', articleToDelete.id);
      if (error) throw error;
      toast.success("Artikel berhasil dihapus");
      fetchArticles(); // Refresh list
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Gagal menghapus artikel: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reusable Toolbar Component
  const Toolbar = () => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      <div className="relative w-full md:w-72">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
         <Input 
           placeholder="Cari judul artikel..." 
           className="pl-9 bg-white border-gray-200"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{categoryFilter === "Semua" ? "Semua Kategori" : categoryFilter}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />

        <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
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

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* View Content */}
            {viewMode === 'list' ? (
              // List View Wrapper
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <Toolbar />
                
                {articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Belum ada artikel yang ditemukan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-left w-[40%]">Judul</th>
                          <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-[15%] hidden md:table-cell">Kategori</th>
                          <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-[15%] hidden lg:table-cell">Penulis</th>
                          <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-[15%]">Status</th>
                          <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-center w-[15%]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {articles.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 align-middle">
                              <div className="flex items-center gap-4">
                                {article.cover_image ? (
                                  <img 
                                    src={article.cover_image} 
                                    alt={article.title} 
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {article.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle text-center hidden md:table-cell">
                              <span className="text-sm text-gray-600">{article.category}</span>
                            </td>
                            <td className="px-4 py-3 align-middle text-center hidden lg:table-cell">
                              <span className="text-sm text-gray-600">{getAuthorName(article)}</span>
                            </td>
                            <td className="px-4 py-3 align-middle text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                article.status === 'published'
                                  ? 'bg-green-50 text-green-700 border-green-100'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                              }`}>
                                {article.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/artikel/dinamis/edit/${article.id}`}>
                                  <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button 
                                  onClick={() => confirmDelete(article)}
                                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              // Grid View Wrapper
              <>
                <Toolbar />
                
                {articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <FileText className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Belum ada artikel yang ditemukan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <div 
                        key={article.id} 
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group"
                      >
                        {/* Image Area */}
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                           {article.cover_image ? (
                             <img 
                               src={article.cover_image} 
                               alt={article.title} 
                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">
                               <ImageIcon className="w-10 h-10" />
                             </div>
                           )}
                           
                           {/* Badge Overlay */}
                           <div className="absolute top-3 left-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                                article.status === 'published'
                                  ? 'bg-white/90 text-green-700'
                                  : 'bg-white/90 text-yellow-700'
                              }`}>
                                {article.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                           </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>{formatDate(article.published_at || article.created_at)}</span>
                            <span>•</span>
                            <span>{article.category}</span>
                          </div>
                          
                          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                          
                          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                               <User className="w-3.5 h-3.5" />
                               <span className="line-clamp-1 max-w-[120px]">{getAuthorName(article)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Link href={`/artikel/dinamis/edit/${article.id}`}>
                                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </Link>
                              <button 
                                onClick={() => confirmDelete(article)}
                                className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Hapus Artikel?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus artikel <span className="font-medium text-gray-900">"{articleToDelete?.title}"</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus Artikel"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
