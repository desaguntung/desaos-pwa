"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { 
  InputField, 
  SectionTitle 
} from "@/components/ui/FormFields";
import { MapPin, User, Building2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident } from "@/lib/services/penduduk";
import ResidentPickerModal from "@/components/ResidentPickerModal";

interface DusunFormProps {
  initialData?: {
    id?: number;
    nama: string;
    kepala_nik: string | null;
    kepala_nama?: string | null; // For display purposes
    kantor_alamat: string | null;
  };
  mode?: "create" | "edit";
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

export default function DusunForm({
  initialData,
  mode = "create",
  title,
  subtitle,
  backButtonHref = "/wilayah-administratif",
}: DusunFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHeadPicker, setShowHeadPicker] = useState(false);

  // Form State
  const [nama, setNama] = useState(initialData?.nama || "");
  const [kantorAlamat, setKantorAlamat] = useState(initialData?.kantor_alamat || "");
  const [kepalaNik, setKepalaNik] = useState<string | null>(initialData?.kepala_nik || null);
  const [kepalaNama, setKepalaNama] = useState<string | null>(initialData?.kepala_nama || null);

  // Scroll Spy
  const [activeSection, setActiveSection] = useState("informasi-utama");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: "informasi-utama", label: "Informasi Utama" },
    { id: "kepala-dusun", label: "Kepala Dusun" },
  ];

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const handleHeadSelect = (resident: Resident) => {
    setKepalaNik(resident.nik);
    setKepalaNama(resident.nama);
    setShowHeadPicker(false);
  };

  const handleSubmit = async () => {
    if (!nama.trim()) {
      toast.error("Nama dusun wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        nama: nama.trim(),
        kepala_nik: kepalaNik,
        kantor_alamat: kantorAlamat.trim() || null,
      };

      let error;
      
      if (mode === "create") {
        const { error: insertError } = await supabase.from("wilayah_dusun").insert(payload);
        error = insertError;
      } else {
        if (!initialData?.id) throw new Error("ID Dusun tidak ditemukan untuk edit");
        const { error: updateError } = await supabase
          .from("wilayah_dusun")
          .update(payload)
          .eq("id", initialData.id);
        error = updateError;
      }

      if (error) throw error;

      toast.success(mode === "create" ? "Dusun berhasil ditambahkan" : "Dusun berhasil diperbarui");
      router.push(backButtonHref);
      router.refresh();
    } catch (error: any) {
      console.error("Error saving dusun:", error);
      toast.error(error.message || "Gagal menyimpan data dusun.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formActions = (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={() => router.push(backButtonHref)}
        disabled={isSubmitting}
        className="bg-card-bg text-primary-text border-border-color hover:bg-body-bg"
      >
        Batal
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !nama.trim()}
        className="bg-primary-text text-card-bg hover:bg-primary-text/90 min-w-[120px]"
      >
        {isSubmitting ? (mode === "create" ? "Menyimpan..." : "Memperbarui...") : "Simpan"}
      </Button>
    </div>
  );

  return (
    <>
      <FormLayout
        title={title || (mode === "create" ? "Tambah Dusun" : "Edit Dusun")}
        subtitle={subtitle || (mode === "create" ? "Tambahkan data wilayah dusun baru." : "Perbarui data wilayah dusun.")}
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
            ref={(el) => { sectionRefs.current["informasi-utama"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle
              title="Informasi Utama"
              description="Detail identitas wilayah dusun."
              icon={Building2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nama Dusun"
                placeholder="Contoh: Krajan"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                description="Nama wilayah dusun tanpa awalan 'Dusun'."
              />
              <InputField
                label="Alamat Kantor (Opsional)"
                placeholder="Contoh: Jl. Mawar No. 1"
                value={kantorAlamat}
                onChange={(e) => setKantorAlamat(e.target.value)}
                icon={<MapPin className="h-4 w-4 text-secondary-text" />}
              />
            </div>
          </div>

          {/* Section 2: Kepala Dusun */}
          <div
            id="kepala-dusun"
            ref={(el) => { sectionRefs.current["kepala-dusun"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle
              title="Kepala Dusun"
              description="Pejabat yang memimpin wilayah dusun ini."
              icon={User}
            />
            
            <div className="max-w-md">
              {kepalaNik ? (
                <div className="flex items-center justify-between p-4 border border-border-color rounded-xl bg-body-bg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-card-bg border border-border-color flex items-center justify-center text-sm font-bold text-primary-text shadow-sm">
                      {kepalaNama?.substring(0, 1) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-text">{kepalaNama}</p>
                      <p className="text-xs text-secondary-text font-mono">{kepalaNik}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setKepalaNik(null); setKepalaNama(null); }}
                    className="text-secondary-text hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowHeadPicker(true)}
                  className="group flex items-center gap-3 px-4 py-4 w-full border border-dashed border-border-color rounded-xl text-sm text-secondary-text hover:border-primary-text hover:bg-body-bg transition-all focus:outline-none focus:ring-2 focus:ring-primary-text/20"
                >
                  <div className="h-8 w-8 rounded-full bg-body-bg group-hover:bg-card-bg flex items-center justify-center border border-transparent group-hover:border-border-color transition-colors">
                    <Plus className="h-4 w-4 text-secondary-text group-hover:text-primary-text" />
                  </div>
                  <span className="group-hover:text-primary-text transition-colors">Pilih Kepala Dusun dari data penduduk...</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </FormLayout>

      <ResidentPickerModal
        open={showHeadPicker}
        onOpenChange={setShowHeadPicker}
        onSelect={handleHeadSelect}
      />
    </>
  );
}
