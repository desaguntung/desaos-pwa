"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  User, 
  Loader2, 
  LayoutGrid, 
  List, 
  Edit, 
  Trash2, 
  ImageIcon,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardImage
} from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  
  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, []); 
  
  useEffect(() => {
    fetchArticles();
    setCurrentPage(1); // Reset page on filter change
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

      // Fetch authors manually
      const authorIds = Array.from(new Set(articlesData.map(a => a.author_id).filter(Boolean)));
      
      let profilesMap: Record<string, any> = {};
      
      if (authorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', authorIds);
          
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p;
          });
        }
      }

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
      fetchArticles();
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Gagal menghapus artikel: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side pagination logic
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return articles.slice(start, start + itemsPerPage);
  }, [articles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(articles.length / itemsPerPage);

  // DataTable Columns
  const columns = [
    {
      header: "Judul",
      accessorKey: "title",
      cell: (row: any) => (
        <div className="flex items-center gap-4">
          {row.cover_image ? (
            <img 
              src={row.cover_image} 
              alt={row.title} 
              className="w-10 h-10 rounded-lg object-cover border border-border-color flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-body-bg flex items-center justify-center text-secondary-text flex-shrink-0 border border-border-color">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <span className="font-medium text-primary-text line-clamp-2">
            {row.title}
          </span>
        </div>
      )
    },
    {
      header: "Kategori",
      accessorKey: "category",
      className: "hidden md:table-cell text-center",
      cell: (row: any) => (
        <div className="text-center">
          <span className="text-sm text-secondary-text">{row.category}</span>
        </div>
      )
    },
    {
      header: "Penulis",
      accessorKey: "author",
      className: "hidden lg:table-cell text-center",
      cell: (row: any) => (
        <div className="text-center">
          <span className="text-sm text-secondary-text">{getAuthorName(row)}</span>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      className: "text-center",
      cell: (row: any) => (
        <div className="flex justify-center">
          <Badge variant={row.status === 'published' ? 'success' : 'warning'}>
            {row.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
      )
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center",
      cell: (row: any) => (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/artikel/dinamis/edit/${row.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-body-bg">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => confirmDelete(row)}
            className="h-8 w-8 hover:bg-error-bg hover:text-error-text"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artikel Dinamis"
        subtitle="Kelola berita, pengumuman, dan artikel blog desa."
        actions={
          <Link href="/artikel/dinamis/tambah">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Tulis Artikel Baru
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-72">
             <Input 
               placeholder="Cari judul artikel..." 
               startIcon={<Search className="h-4 w-4" />}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2 text-secondary-text">
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

            <div className="h-8 w-px bg-border-color mx-2 hidden md:block" />

            <div className="flex items-center bg-card-bg p-1 rounded-lg border border-border-color">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-7 w-7"
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-7 w-7"
                title="List View"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-secondary-text" />
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <EmptyState
              icon={<FileText />}
              title="Belum ada artikel"
              description="Belum ada artikel yang ditemukan untuk kriteria pencarian Anda."
            />
          ) : (
            <>
              {viewMode === 'list' ? (
                <DataTable
                  columns={columns}
                  data={paginatedArticles}
                  keyField="id"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((article) => (
                    <Card 
                      key={article.id} 
                      className="group flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardImage 
                        src={article.cover_image} 
                        alt={article.title}
                        className="aspect-video"
                        fallback={<ImageIcon className="w-10 h-10" />}
                      >
                         <div className="absolute top-3 left-3">
                            <Badge 
                              variant={article.status === 'published' ? 'success' : 'warning'}
                              className="backdrop-blur-sm bg-card-bg/90 border-0"
                            >
                              {article.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                         </div>
                      </CardImage>

                      <CardContent className="flex flex-col flex-1 p-5">
                        <div className="flex items-center gap-2 text-xs text-secondary-text mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.published_at || article.created_at)}</span>
                          <span>•</span>
                          <span>{article.category}</span>
                        </div>
                        
                        <CardTitle className="text-base font-semibold text-primary-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </CardTitle>
                        
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-color w-full">
                          <div className="flex items-center gap-2 text-xs text-secondary-text">
                             <User className="w-3.5 h-3.5" />
                             <span className="line-clamp-1 max-w-[120px]">{getAuthorName(article)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Link href={`/artikel/dinamis/edit/${article.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-body-bg">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => confirmDelete(article)}
                              className="h-8 w-8 hover:bg-error-bg hover:text-error-text"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Sticky Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={articles.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                sticky={true}
              />
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Artikel?"
        description={
          <span>
            Apakah Anda yakin ingin menghapus artikel <span className="font-medium text-primary-text">"{articleToDelete?.title}"</span>? 
            Tindakan ini tidak dapat dibatalkan.
          </span>
        }
        confirmLabel="Hapus Artikel"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
