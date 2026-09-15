"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { 
  InputField, 
  SelectField, 
  TextAreaField, 
  SectionTitle 
} from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Building2, Image as ImageIcon, Trash2, Loader2, MapPin } from "lucide-react";

interface LembagaFormProps {
  mode: "create" | "edit";
  initialData?: any;
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
  submitAction?: (payload: {
    id?: string;
    nama: string;
    singkatan?: string;
    kategori?: string;
    alamat?: string;
    deskripsi?: string;
    logo_url?: string;
  }) => Promise<void>;
}

const KATEGORI_OPTIONS = [
  { label: "Lembaga Pemberdayaan Masyarakat (LPM)", value: "LPM" },
  { label: "Pemberdayaan Kesejahteraan Keluarga (PKK)", value: "PKK" },
  { label: "Karang Taruna", value: "Karang Taruna" },
  { label: "Posyandu", value: "Posyandu" },
  { label: "Lembaga Adat", value: "Lembaga Adat" },
  { label: "Kelompok Tani", value: "Kelompok Tani" },
  { label: "BUMDes", value: "BUMDes" },
  { label: "Lainnya", value: "Lainnya" },
];

export function LembagaForm({
  mode,
  initialData,
  title,
  subtitle,
  backButtonHref = "/lembaga-desa",
  submitAction,
}: LembagaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("identitas");
  const supabase = createSupabaseBrowserClient();

  const [formData, setFormData] = useState({
    nama: "",
    singkatan: "",
    kategori: "",
    alamat: "",
    deskripsi: "",
    logo_url: "",
    ...initialData,
  });

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const sections = [
    { id: "identitas", title: "Identitas Lembaga" },
    { id: "profil", title: "Profil & Alamat" },
  ];

  // Intersection Observer for Scroll Spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `lembaga/${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("public")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Gagal upload logo: " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(filePath);

    handleChange("logo_url", publicUrl);
    setUploading(false);
    toast.success("Logo berhasil diupload");
  };

  const handleSubmit = async () => {
    if (!formData.nama) {
      toast.error("Nama lembaga wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        id?: string;
        nama: string;
        singkatan?: string;
        kategori?: string;
        alamat?: string;
        deskripsi?: string;
        logo_url?: string;
      } = {
        id: initialData?.id,
        nama: formData.nama,
        singkatan: formData.singkatan,
        kategori: formData.kategori,
        alamat: formData.alamat,
        deskripsi: formData.deskripsi,
        logo_url: formData.logo_url,
      };

      if (!submitAction) throw new Error("submitAction tidak tersedia");
      await submitAction(payload);
      toast.success(mode === "create" ? "Lembaga berhasil ditambahkan" : "Lembaga berhasil diperbarui");

      router.push("/lembaga-desa");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving lembaga:", error);
      toast.error("Gagal menyimpan data: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => router.push(backButtonHref)}
        disabled={isSubmitting}
      >
        Batal
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan Data"
        )}
      </Button>
    </div>
  );

  return (
    <FormLayout
      title={title || (mode === "create" ? "Tambah Lembaga" : "Edit Lembaga")}
      subtitle={
        subtitle ||
        (mode === "create"
          ? "Tambahkan data lembaga desa baru."
          : "Perbarui data lembaga desa.")
      }
      backButtonHref={backButtonHref}
      actions={formActions}
      sidebar={
        <FormSidebarNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      }
    >
      <div className="space-y-8 pb-24">
        {/* Section 1: Identitas Lembaga */}
        <div
          id="identitas"
          ref={(el) => {
            sectionRefs.current["identitas"] = el;
          }}
          className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
        >
          <SectionTitle
            title="Identitas Lembaga"
            description="Informasi dasar mengenai lembaga desa."
            icon={Building2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-xl border border-border-color bg-body-bg overflow-hidden flex items-center justify-center group">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-10 h-10 text-secondary-text opacity-30" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => document.getElementById('upload-logo')?.click()}
                            disabled={uploading}
                          >
                            Upload
                          </Button>
                          {formData.logo_url && (
                             <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleChange("logo_url", "")}
                            >
                              Hapus
                            </Button>
                          )}
                      </div>
                      <input
                        type="file"
                        id="upload-logo"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </div>
                    <p className="text-xs text-secondary-text mt-2 text-center">
                      Logo Lembaga
                    </p>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <InputField
                        label="Nama Lembaga"
                        placeholder="Contoh: Karang Taruna Bhakti Jaya"
                        value={formData.nama}
                        onChange={(e) => handleChange("nama", e.target.value)}
                        required
                        className="md:col-span-2"
                      />
                      <InputField
                        label="Singkatan"
                        placeholder="Contoh: KT-BJ"
                        value={formData.singkatan}
                        onChange={(e) => handleChange("singkatan", e.target.value)}
                      />
                      <SelectField
                        label="Kategori"
                        placeholder="Pilih Kategori"
                        options={KATEGORI_OPTIONS}
                        value={formData.kategori}
                        onChange={(value) => handleChange("kategori", value)}
                      />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Section 2: Profil & Alamat */}
        <div
          id="profil"
          ref={(el) => {
            sectionRefs.current["profil"] = el;
          }}
          className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
        >
          <SectionTitle
            title="Profil & Alamat"
            description="Detail alamat sekretariat dan deskripsi lembaga."
            icon={MapPin}
          />

          <div className="grid grid-cols-1 gap-6">
            <InputField
              label="Alamat Sekretariat"
              placeholder="Alamat lengkap kantor/sekretariat"
              value={formData.alamat}
              onChange={(e) => handleChange("alamat", e.target.value)}
            />
            <TextAreaField
              label="Deskripsi Singkat"
              placeholder="Jelaskan secara singkat tentang visi, misi, atau fokus lembaga..."
              value={formData.deskripsi}
              onChange={(e) => handleChange("deskripsi", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
