"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { 
  InputField, 
  SelectField, 
  TextAreaField, 
  DatePickerField,
  SectionTitle 
} from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Trophy, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";

interface PrestasiFormProps {
  mode: "create" | "edit";
  initialData?: any;
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
  onSubmit?: (payload: {
    id?: string;
    judul: string;
    deskripsi?: string;
    tanggal: string;
    tingkat?: string;
    foto_url?: string;
  }) => Promise<void>;
}

const TINGKAT_OPTIONS = [
  { label: "Desa", value: "Desa" },
  { label: "Kecamatan", value: "Kecamatan" },
  { label: "Kabupaten", value: "Kabupaten" },
  { label: "Provinsi", value: "Provinsi" },
  { label: "Nasional", value: "Nasional" },
  { label: "Internasional", value: "Internasional" },
];

export function PrestasiForm({
  mode,
  initialData,
  title,
  subtitle,
  backButtonHref = "/prestasi-desa",
  onSubmit,
}: PrestasiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("informasi-utama");
  const supabase = createSupabaseBrowserClient();

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    tanggal: new Date().toISOString().split("T")[0],
    tingkat: "",
    foto_url: "",
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
    { id: "informasi-utama", label: "Informasi Utama" },
    { id: "dokumentasi", label: "Dokumentasi" },
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
    const filePath = `prestasi/${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("public")
      .upload(filePath, file);
    if (uploadError) {
      toast.error("Gagal upload gambar: " + uploadError.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(filePath);
    handleChange("foto_url", publicUrl);
    setUploading(false);
    toast.success("Gambar berhasil diupload");

  };

  const handleSubmit = async () => {
    if (!formData.judul) {
      toast.error("Judul prestasi wajib diisi");
      return;
    }
    if (!formData.tanggal) {
      toast.error("Tanggal wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        id?: string;
        judul: string;
        deskripsi?: string;
        tanggal: string;
        tingkat?: string;
        foto_url?: string;
      } = {
        id: initialData?.id,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        tanggal: formData.tanggal,
        tingkat: formData.tingkat,
        foto_url: formData.foto_url,
      };

      if (!onSubmit) throw new Error("onSubmit tidak tersedia");
      await onSubmit(payload);
      toast.success(mode === "create" ? "Prestasi berhasil ditambahkan" : "Prestasi berhasil diperbarui");

      router.push("/prestasi-desa");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving prestasi:", error);
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
      title={title || (mode === "create" ? "Tambah Prestasi" : "Edit Prestasi")}
      subtitle={
        subtitle ||
        (mode === "create"
          ? "Tambahkan data prestasi atau penghargaan desa."
          : "Perbarui data prestasi desa.")
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
        {/* Section 1: Informasi Utama */}
        <div
          id="informasi-utama"
          ref={(el) => {
            sectionRefs.current["informasi-utama"] = el;
          }}
          className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
        >
          <SectionTitle
            title="Informasi Utama"
            description="Detail mengenai prestasi yang diraih."
            icon={Trophy}
            className="mb-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Judul Prestasi"
              placeholder="Contoh: Juara 1 Lomba Desa"
              value={formData.judul}
              onChange={(e) => handleChange("judul", e.target.value)}
              required
            />
            <SelectField
              label="Tingkat"
              placeholder="Pilih Tingkat"
              options={TINGKAT_OPTIONS}
              value={formData.tingkat}
              onChange={(value) => handleChange("tingkat", value)}
            />
            <DatePickerField
              label="Tanggal"
              value={formData.tanggal}
              onChange={(e) => handleChange("tanggal", e.target.value)}
              required
            />
             <div className="md:col-span-2">
              <TextAreaField
                label="Deskripsi"
                placeholder="Deskripsi singkat tentang pencapaian..."
                value={formData.deskripsi}
                onChange={(e) => handleChange("deskripsi", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dokumentasi */}
        <div
          id="dokumentasi"
          ref={(el) => {
            sectionRefs.current["dokumentasi"] = el;
          }}
          className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
        >
          <SectionTitle
            title="Dokumentasi"
            description="Foto atau bukti pendukung prestasi."
            icon={ImageIcon}
            className="mb-6"
          />

          <div className="space-y-4">
             <div className="space-y-3">
                {formData.foto_url && (
                  <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-border-color bg-body-bg">
                    <img src={formData.foto_url} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleChange("foto_url", "")}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2 max-w-xl">
                  <InputField 
                    label="URL Foto"
                    value={formData.foto_url} 
                    onChange={(e) => handleChange("foto_url", e.target.value)} 
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <div className="relative mt-7">
                    <input
                      type="file"
                      id="upload-foto-prestasi"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="shrink-0"
                      onClick={() => document.getElementById('upload-foto-prestasi')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-secondary-text">
                  Paste URL gambar atau upload dari perangkat (Max 2MB).
                </p>
              </div>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
