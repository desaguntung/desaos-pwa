"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Calendar, 
  Tag,
  Globe,
  Check,
  X
} from "lucide-react";

// Components
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { 
  InputField, 
  SelectField, 
  DatePickerField, 
  TextAreaField, 
  SectionTitle 
} from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import ArticleEditor from "@/components/features/artikel/Editor";
import { addCategory } from "@/app/actions/categories";

// Types
export interface Article {
  id?: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  cover_image: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  excerpt?: string;
  author_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ArticleFormProps {
  initialData?: Partial<Article>;
  mode?: "create" | "edit";
  onSubmit?: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ArticleForm({
  initialData,
  mode = "create",
  onSubmit,
  isSubmitting: externalIsSubmitting = false
}: ArticleFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  // Form State
  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    slug: "",
    category: "",
    content: "",
    cover_image: "",
    status: "draft",
    published_at: new Date().toISOString(),
    ...initialData
  });

  const [activeSection, setActiveSection] = useState("konten-utama");
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false);
  
  // Category State
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isSubmitting = externalIsSubmitting || isInternalSubmitting;

  // Initialize data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchCategories();
    };
    init();
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (data) {
      setCategories(data.map(c => c.name));
    }
  };

  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      try {
        const result = await addCategory(newCategory);
        if (result.error) {
          toast.error("Gagal menambahkan kategori: " + result.error);
        } else {
          setCategories([...categories, newCategory]);
          setFormData(prev => ({ ...prev, category: newCategory }));
          setNewCategory("");
          setIsAddingCategory(false);
          toast.success("Kategori berhasil ditambahkan");
        }
      } catch (e) {
        toast.error("Terjadi kesalahan");
      }
    }
  };

  const handleChange = (field: keyof Article, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title in create mode
    if (mode === "create" && field === "title") {
      const slug = slugify(value) + '-' + Date.now().toString().slice(-4);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleSubmit = async (statusOverride?: "draft" | "published") => {
    if (!formData.title) {
      toast.error("Judul artikel wajib diisi");
      return;
    }
    
    if (!user) {
      toast.error("Anda harus login untuk menyimpan artikel");
      return;
    }

    setIsInternalSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        status: statusOverride || formData.status,
        author_id: formData.author_id || user.id,
        excerpt: formData.content?.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...',
        updated_at: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Default submission logic if no onSubmit prop
        const { error } = await supabase
          .from('articles')
          .upsert(payload);

        if (error) throw error;
        
        toast.success(`Artikel berhasil disimpan sebagai ${statusOverride || formData.status}`);
        router.push('/artikel/dinamis');
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error("Gagal menyimpan artikel: " + error.message);
    } finally {
      setIsInternalSubmitting(false);
    }
  };

  const sidebarSections = [
    { id: "konten-utama", title: "Konten Utama", icon: FileText },
    { id: "metadata", title: "Metadata & Kategori", icon: Tag },
    { id: "media", title: "Media & Cover", icon: ImageIcon },
    { id: "pengaturan", title: "Pengaturan & SEO", icon: Settings },
  ];

  return (
    <FormLayout
      title={mode === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
      subtitle={mode === "create" ? "Buat artikel baru untuk website desa" : "Perbarui konten artikel"}
      backButtonHref="/artikel/dinamis"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            Simpan Draft
          </Button>
          <Button 
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="bg-primary-text text-body-bg hover:bg-primary-text/90"
          >
            Terbitkan
          </Button>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Sidebar Navigation */}
        <FormSidebarNav 
          sections={sidebarSections} 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

        {/* Main Content */}
        <div className="flex-1 space-y-8 pb-20">
          
          {/* Section: Konten Utama */}
          <div id="konten-utama" className="scroll-mt-24 space-y-6">
            <SectionTitle icon={FileText} title="Konten Utama" description="Judul dan isi artikel" />
            
            <div className="bg-card-bg rounded-xl border border-border-color p-6 shadow-sm space-y-6">
              <InputField
                label="Judul Artikel"
                placeholder="Masukkan judul artikel yang menarik..."
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-primary-text">Konten Artikel</label>
                <div className="border border-border-color rounded-lg overflow-hidden">
                  <ArticleEditor 
                    content={formData.content || ""} 
                    onChange={(content) => handleChange("content", content)} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Metadata */}
          <div id="metadata" className="scroll-mt-24 space-y-6">
            <SectionTitle icon={Tag} title="Metadata & Kategori" description="Pengelompokan dan waktu tayang" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card-bg rounded-xl border border-border-color p-6 shadow-sm">
              <div className="space-y-4">
                <label className="text-sm font-medium text-secondary-text block">Kategori</label>
                {isAddingCategory ? (
                  <div className="flex items-center gap-2">
                    <InputField 
                      placeholder="Nama kategori baru..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" onClick={handleAddCategory}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsAddingCategory(false)}>
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SelectField
                      label=""
                      options={categories.map(c => ({ label: c, value: c }))}
                      value={formData.category}
                      onChange={(val) => handleChange("category", val)}
                      placeholder="Pilih Kategori"
                    />
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-xs text-primary-text"
                      onClick={() => setIsAddingCategory(true)}
                    >
                      + Tambah Kategori Baru
                    </Button>
                  </div>
                )}
              </div>

              <InputField
                label="Tanggal Publikasi"
                type="datetime-local"
                value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ""}
                onChange={(e) => handleChange("published_at", new Date(e.target.value).toISOString())}
              />
            </div>
          </div>

          {/* Section: Media */}
          <div id="media" className="scroll-mt-24 space-y-6">
            <SectionTitle icon={ImageIcon} title="Media & Cover" subtitle="Gambar utama artikel" />
            
            <div className="bg-card-bg rounded-xl border border-border-color p-6 shadow-sm">
               <div className="space-y-4">
                 <InputField
                   label="URL Gambar Cover"
                   placeholder="https://example.com/image.jpg"
                   value={formData.cover_image || ""}
                   onChange={(e) => handleChange("cover_image", e.target.value)}
                 />
                 
                 <div className="relative aspect-video bg-body-bg rounded-lg border border-border-color overflow-hidden flex items-center justify-center group cursor-pointer"
                      onClick={() => {
                        const url = prompt("Masukkan URL Gambar Cover:", formData.cover_image || "");
                        if (url) handleChange("cover_image", url);
                      }}
                 >
                   {formData.cover_image ? (
                     <>
                       <img src={formData.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                         Ganti Gambar
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center gap-2 text-secondary-text">
                       <ImageIcon className="w-8 h-8" />
                       <span className="text-sm">Klik untuk menambahkan URL gambar</span>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>

          {/* Section: Pengaturan */}
          <div id="pengaturan" className="scroll-mt-24 space-y-6">
            <SectionTitle icon={Settings} title="Pengaturan & SEO" description="Konfigurasi tambahan" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card-bg rounded-xl border border-border-color p-6 shadow-sm">
              <InputField
                label="Slug URL"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                description="URL ramah mesin pencari (otomatis dibuat dari judul)"
              />
              
              <SelectField
                label="Status Artikel"
                options={[
                  { label: "Draft (Konsep)", value: "draft" },
                  { label: "Published (Terbit)", value: "published" },
                  { label: "Archived (Arsip)", value: "archived" },
                ]}
                value={formData.status}
                onChange={(val) => handleChange("status", val)}
              />
            </div>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
