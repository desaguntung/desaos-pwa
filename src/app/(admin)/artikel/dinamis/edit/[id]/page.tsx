"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Send, Image as ImageIcon, X, Sparkles, Check, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import ArticleEditor from "@/components/features/artikel/Editor";
import AIChatSidebar from "@/components/features/ai/AIChatSidebar";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

import { addCategory } from "@/app/actions/categories";

export default function EditArtikelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createSupabaseBrowserClient();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Category management state
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (data) {
      setCategories(data.map(c => c.name));
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setTitle(data.title || "");
          setCategory(data.category || "");
          setContent(data.content || "");
          setCoverImage(data.cover_image || "");
          setStatus(data.status || "draft");
          
          if (data.published_at) {
            // Format for datetime-local input: YYYY-MM-DDThh:mm
            const date = new Date(data.published_at);
            const formatted = date.toISOString().slice(0, 16);
            setPublishedAt(formatted);
          }
          
          // Note: categories are already fetched separately
        }
      } catch (error: any) {
        console.error('Error fetching article:', error);
        toast.error("Gagal memuat artikel");
        router.push('/artikel/dinamis');
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchArticle();
    }
  }, [id, categories.length]);

  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      setIsSubmitting(true);
      try {
        const result = await addCategory(newCategory);
        if (result.error) {
          toast.error("Gagal menambahkan kategori: " + result.error);
        } else {
          setCategories([...categories, newCategory]);
          setCategory(newCategory);
          setNewCategory("");
          setIsAddingCategory(false);
          toast.success("Kategori berhasil ditambahkan");
        }
      } catch (e) {
        toast.error("Terjadi kesalahan");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSave = async (newStatus: 'draft' | 'published') => {
    if (!title) {
      toast.error("Judul artikel wajib diisi");
      return;
    }
    
    if (!user) {
      toast.error("Anda harus login untuk menyimpan artikel");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const publishDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
      
      const payload: any = {
        title,
        category,
        content,
        cover_image: coverImage,
        status: newStatus,
        excerpt: content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...',
        updated_at: new Date().toISOString(),
      };

      // Only update published_at if explicitly set or if publishing for the first time
      if (publishedAt || (newStatus === 'published' && status === 'draft')) {
        payload.published_at = publishDate;
      }

      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Artikel berhasil diperbarui sebagai ${newStatus}`);
      router.push('/artikel/dinamis');
    } catch (error: any) {
      console.error('Error updating article:', error);
      toast.error("Gagal memperbarui artikel: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyDraft = (newTitle: string, newContent: string, newCover?: string) => {
    setTitle(newTitle);
    setContent(newContent);
    if (newCover) setCoverImage(newCover);
  };

  const handleInsertImage = (imageUrl: string) => {
    const imageHtml = `<img src="${imageUrl}" alt="Content Image" class="rounded-lg my-4 w-full" />`;
    setContent(prev => prev + imageHtml);
    toast.success("Gambar disisipkan ke konten");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-body-bg">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-body-bg relative">
      {/* Header */}
      <PageHeader
        title="Edit Artikel"
        subtitle="Perbarui konten artikel anda"
        showBackButton={true}
        backButtonHref="/artikel/dinamis"
        actions={
          <>
            <Button
              variant={isAiSidebarOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Asisten AI
            </Button>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSave('draft')}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Draft
            </Button>
            <Button 
              className="bg-zinc-900 hover:bg-zinc-800 text-white" 
              size="sm"
              onClick={() => handleSave('published')}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {status === 'published' ? 'Perbarui' : 'Terbitkan'}
            </Button>
          </>
        }
      />

      {/* Main Content & Sidebar Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto p-8 lg:p-12 space-y-8">
            
            {/* Metadata Section */}
            <div className="space-y-6">
                 <Input 
                   id="title" 
                   placeholder="Judul Artikel..." 
                   className="text-2xl font-bold h-auto py-3 px-4 bg-white border border-zinc-200 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-300 placeholder:text-zinc-300 shadow-sm"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                 />

                 <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Kategori:</span>
                      {isAddingCategory ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Baru..."
                            className="h-6 w-32 text-xs"
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddCategory}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsAddingCategory(false)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="h-8 border-none bg-zinc-50 hover:bg-zinc-100 w-auto gap-2 px-3 rounded-full font-medium text-zinc-700">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            <div className="p-1 border-t border-zinc-100">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full justify-start h-7 text-xs font-normal"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsAddingCategory(true);
                                }}
                              >
                                + Tambah Kategori
                              </Button>
                            </div>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="w-px h-4 bg-zinc-200" />

                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Tanggal:</span>
                      <Input 
                        type="datetime-local" 
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="h-8 w-auto text-xs bg-zinc-50 border-none rounded-full px-3 text-zinc-700 font-medium"
                      />
                    </div>
                 </div>

                 <div 
                    onClick={() => {
                      const url = prompt("Masukkan URL Gambar Cover:");
                      if (url) setCoverImage(url);
                    }}
                    className="group relative aspect-video bg-zinc-50 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                 >
                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                          Ganti Cover
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-zinc-300 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-zinc-400 font-medium">Tambahkan Cover</span>
                      </>
                    )}
                 </div>
            </div>

            {/* Editor Section */}
            <div className="min-h-[500px] border border-zinc-200 rounded-md p-6 bg-white shadow-sm">
              <ArticleEditor content={content} onChange={setContent} />
            </div>

          </div>
        </div>

        {/* Chat Sidebar */}
        {isAiSidebarOpen && (
          <AIChatSidebar 
            isOpen={true} 
            onClose={() => setIsAiSidebarOpen(false)} 
            onApplyDraft={handleApplyDraft}
            onInsertImage={handleInsertImage}
            currentContent={content}
          />
        )}
      </div>
    </div>
  );
}
