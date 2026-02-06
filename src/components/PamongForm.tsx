"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Settings, Search, Save, X } from "lucide-react";
import { toast } from "sonner";
import { createPamong, updatePamong, type Pamong } from "@/lib/services/surat";
import { Resident } from "@/lib/services/penduduk";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { InputField, SelectField, DatePickerField, SectionTitle } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import ResidentPickerModal from "@/components/ResidentPickerModal";

interface PamongFormProps {
  initialData?: Pamong | null;
  mode: "create" | "edit";
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

export default function PamongForm({
  initialData,
  mode = "create",
  title,
  subtitle,
  backButtonHref = "/pemerintah-desa",
}: PamongFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResidentPicker, setShowResidentPicker] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Pamong>>({
    pamong_nama: "",
    gelar_depan: "",
    gelar_belakang: "",
    pamong_nip: "",
    pamong_niap: "",
    pamong_pangkat: "",
    pamong_status: 1,
    pamong_ttd: 0,
    pamong_nosk: "",
    pamong_tglsk: "",
    jabatan_id: null,
    id_pend: undefined,
    pamong_ub: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Scroll Spy
  const [activeSection, setActiveSection] = useState("data-pribadi");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections = [
    { id: "data-pribadi", label: "Data Pribadi" },
    { id: "kepegawaian", label: "Kepegawaian" },
    { id: "pengaturan", label: "Pengaturan" },
  ];

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100; // Adjust for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for trigger point

      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const handleChange = (field: keyof Pamong, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResidentSelect = (resident: Resident) => {
    setFormData((prev) => ({
      ...prev,
      pamong_nama: resident.nama,
      pamong_nik: resident.nik,
      id_pend: resident.id,
    }));
    setShowResidentPicker(false);
    toast.success("Data penduduk berhasil dimuat");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Clean up data before sending
      const dataToSend: any = { ...formData };
      
      // Remove empty strings for optional date fields
      if (!dataToSend.pamong_tglsk) delete dataToSend.pamong_tglsk;
      if (!dataToSend.pamong_tglhenti) delete dataToSend.pamong_tglhenti;
      if (!dataToSend.pamong_tanggallahir) delete dataToSend.pamong_tanggallahir;
      if (!dataToSend.pamong_tgl_terdaftar) delete dataToSend.pamong_tgl_terdaftar;
      
      if (!dataToSend.jabatan_id) delete dataToSend.jabatan_id;
      if (!dataToSend.id_pend) delete dataToSend.id_pend;
      
      if (mode === "edit" && initialData?.pamong_id) {
        await updatePamong(initialData.pamong_id, dataToSend);
        toast.success("Data aparatur berhasil diperbarui");
      } else {
        await createPamong(dataToSend);
        toast.success("Aparatur baru berhasil ditambahkan");
      }
      
      router.push(backButtonHref);
      router.refresh();
    } catch (error: any) {
      console.error("Error saving pamong:", error);
      toast.error(`Gagal menyimpan data: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formActions = (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        onClick={() => router.push(backButtonHref)}
        disabled={isSubmitting}
        className="min-w-[100px]"
      >
        Batal
      </Button>
      <Button
        onClick={() => handleSubmit()}
        disabled={isSubmitting}
        className="bg-primary-text text-card-bg hover:bg-primary-text/90 min-w-[120px]"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </div>
  );

  return (
    <>
      <FormLayout
        title={title || (mode === "create" ? "Tambah Aparatur" : "Edit Aparatur")}
        subtitle={subtitle || (mode === "create" ? "Tambahkan data aparatur desa baru." : "Perbarui data aparatur desa.")}
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
          {/* Section 1: Data Pribadi */}
          <div
            id="data-pribadi"
            ref={(el) => { sectionRefs.current["data-pribadi"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <div className="flex items-center justify-between mb-6">
              <SectionTitle
                title="Data Pribadi"
                description="Informasi identitas dasar aparatur."
                icon={User}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResidentPicker(true)}
                className="text-xs h-8 gap-2 border-primary-text/20 text-primary-text hover:bg-primary-text/5"
              >
                <Search className="w-3.5 h-3.5" />
                Ambil dari Penduduk
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nama Lengkap"
                placeholder="Nama lengkap aparatur"
                value={formData.pamong_nama || ""}
                onChange={(e) => handleChange("pamong_nama", e.target.value)}
                required
                description="Wajib diisi sesuai KTP."
              />
              <InputField
                label="NIK"
                placeholder="Nomor Induk Kependudukan"
                value={formData.pamong_nik || ""}
                onChange={(e) => handleChange("pamong_nik", e.target.value)}
                description="16 digit angka."
              />
              <InputField
                label="Gelar Depan"
                placeholder="Contoh: Dr., Ir."
                value={formData.gelar_depan || ""}
                onChange={(e) => handleChange("gelar_depan", e.target.value)}
              />
              <InputField
                label="Gelar Belakang"
                placeholder="Contoh: S.Kom, M.Si"
                value={formData.gelar_belakang || ""}
                onChange={(e) => handleChange("gelar_belakang", e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Kepegawaian */}
          <div
            id="kepegawaian"
            ref={(el) => { sectionRefs.current["kepegawaian"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle
              title="Kepegawaian"
              description="Informasi jabatan dan nomor induk pegawai."
              icon={Briefcase}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="NIP"
                placeholder="Nomor Induk Pegawai"
                value={formData.pamong_nip || ""}
                onChange={(e) => handleChange("pamong_nip", e.target.value)}
              />
              <InputField
                label="NIAP"
                placeholder="Nomor Induk Aparatur Perangkat Desa"
                value={formData.pamong_niap || ""}
                onChange={(e) => handleChange("pamong_niap", e.target.value)}
              />
              <div className="col-span-1 md:col-span-2">
                <InputField
                  label="Jabatan / Pangkat"
                  placeholder="Contoh: Kepala Desa, Sekretaris Desa"
                  value={formData.pamong_pangkat || ""}
                  onChange={(e) => handleChange("pamong_pangkat", e.target.value)}
                  required
                />
              </div>
              <InputField
                label="Nomor SK Pengangkatan"
                placeholder="Nomor Surat Keputusan"
                value={formData.pamong_nosk || ""}
                onChange={(e) => handleChange("pamong_nosk", e.target.value)}
              />
              <DatePickerField
                label="Tanggal SK"
                value={formData.pamong_tglsk || ""}
                onChange={(e) => handleChange("pamong_tglsk", e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Pengaturan */}
          <div
            id="pengaturan"
            ref={(el) => { sectionRefs.current["pengaturan"] = el; }}
            className="bg-card-bg rounded-xl shadow-sm border border-border-color p-6 md:p-8 scroll-mt-24"
          >
            <SectionTitle
              title="Pengaturan"
              description="Status aktif dan hak akses aparatur."
              icon={Settings}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Status Keaktifan"
                options={[
                  { label: "Aktif", value: 1 },
                  { label: "Tidak Aktif", value: 0 },
                ]}
                value={formData.pamong_status}
                onChange={(value) => handleChange("pamong_status", Number(value))}
                description="Aparatur tidak aktif tidak muncul di pilihan tanda tangan."
              />
              <SelectField
                label="Otoritas Tanda Tangan"
                options={[
                  { label: "Ya, Berwenang", value: 1 },
                  { label: "Tidak", value: 0 },
                ]}
                value={formData.pamong_ttd}
                onChange={(value) => handleChange("pamong_ttd", Number(value))}
                description="Izinkan aparatur ini menandatangani surat resmi."
              />
            </div>
          </div>
        </div>
      </FormLayout>

      <ResidentPickerModal
        open={showResidentPicker}
        onClose={() => setShowResidentPicker(false)}
        onSelect={handleResidentSelect}
      />
    </>
  );
}
