"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Trophy, Calendar, MapPin, Image as ImageIcon, Loader2, Save, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/Sheet";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DataTable } from "@/components/ui/DataTable";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

// Helper to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const TINGKAT_OPTIONS = [
  "Desa",
  "Kecamatan",
  "Kabupaten",
  "Provinsi",
  "Nasional",
  "Internasional",
];

export default function PrestasiDesaPage() {
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  // Form State
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from("prestasi_desa")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Gagal memuat data prestasi");
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setJudul("");
    setDeskripsi("");
    setTanggal(new Date().toISOString().split('T')[0]);
    setTingkat("");
    setFotoUrl("");
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const handleEdit = (row: any) => {
    setJudul(row.judul);
    setDeskripsi(row.deskripsi || "");
    setTanggal(row.tanggal);
    setTingkat(row.tingkat || "");
    setFotoUrl(row.foto_url || "");
    setCurrentId(row.id);
    setIsEditing(true);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus prestasi ini?")) return;

    const { error } = await supabase.from("prestasi_desa").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus: " + error.message);
    } else {
      toast.success("Prestasi berhasil dihapus");
      fetchData();
    }
  };

  const handleSave = async () => {
    if (!judul) {
      toast.error("Judul wajib diisi");
      return;
    }
    if (!tanggal) {
      toast.error("Tanggal wajib diisi");
      return;
    }

    setIsSaving(true);
    const payload = {
      judul,
      deskripsi,
      tanggal,
      tingkat,
      foto_url: fotoUrl,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (isEditing && currentId) {
      const res = await supabase
        .from("prestasi_desa")
        .update(payload)
        .eq("id", currentId);
      error = res.error;
    } else {
      const res = await supabase.from("prestasi_desa").insert(payload);
      error = res.error;
    }

    setIsSaving(false);
    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } else {
      toast.success(isEditing ? "Perubahan disimpan" : "Prestasi baru ditambahkan");
      setIsSheetOpen(false);
      fetchData();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `prestasi/${fileName}`;

    setUploading(true);
    // Assume 'public' bucket exists and has public access
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Gagal upload gambar: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    setFotoUrl(publicUrl);
    setUploading(false);
    toast.success("Gambar berhasil diupload");
  };

  const filteredData = data.filter(item => 
    item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tingkat && item.tingkat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      header: "Prestasi",
      accessorKey: "judul",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-200">
            {row.foto_url ? (
              <img src={row.foto_url} alt={row.judul} className="w-full h-full object-cover" />
            ) : (
              <Trophy className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-zinc-900">{row.judul}</div>
            <div className="text-xs text-zinc-500 line-clamp-1">{row.deskripsi}</div>
          </div>
        </div>
      )
    },
    {
      header: "Tingkat",
      accessorKey: "tingkat",
      cell: (row: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {row.tingkat || "-"}
        </span>
      )
    },
    {
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: (row: any) => (
        <div className="flex items-center gap-2 text-zinc-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(row.tanggal)}</span>
        </div>
      )
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "w-[100px]",
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      <PageHeader 
        title="Prestasi Desa" 
        subtitle="Manajemen data penghargaan dan prestasi desa"
        actions={
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Prestasi
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Cari prestasi..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredData} 
              keyField="id"
              mobileConfig={{
                titleKey: "judul",
                subtitleKey: "tingkat",
                statusKey: (row) => formatDate(row.tanggal),
                imageKey: "foto_url"
              }}
            />
          )}
        </div>
      </div>

      {/* Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Edit Prestasi" : "Tambah Prestasi Baru"}</SheetTitle>
            <SheetDescription>
              Isi formulir berikut untuk {isEditing ? "memperbarui" : "menambahkan"} data prestasi desa.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label>Judul Prestasi</Label>
              <Input 
                value={judul} 
                onChange={(e) => setJudul(e.target.value)} 
                placeholder="Contoh: Juara 1 Lomba Desa Tingkat Provinsi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input 
                  type="date" 
                  value={tanggal} 
                  onChange={(e) => setTanggal(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Tingkat</Label>
                <Select value={tingkat} onValueChange={setTingkat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    {TINGKAT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Foto Dokumentasi</Label>
              <div className="space-y-3">
                {fotoUrl && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setFotoUrl("")}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input 
                    value={fotoUrl} 
                    onChange={(e) => setFotoUrl(e.target.value)} 
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="upload-foto"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="shrink-0"
                      onClick={() => document.getElementById('upload-foto')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  Paste URL gambar atau upload dari perangkat (Max 2MB).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                value={deskripsi} 
                onChange={(e) => setDeskripsi(e.target.value)} 
                placeholder="Deskripsi singkat tentang pencapaian..."
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
