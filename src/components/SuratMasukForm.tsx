"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText,
  Save
} from "lucide-react";
import { 
  SuratMasuk, 
  KlasifikasiSurat, 
  getKlasifikasiSurat, 
  createSuratMasuk, 
  updateSuratMasuk 
} from "@/lib/services/surat";
import { Button } from "@/components/ui/Button";

// Standard Components
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { 
  InputField, 
  SelectField, 
  DatePickerField, 
  TextAreaField,
  SectionTitle
} from "@/components/ui/FormFields";
import { toast } from "sonner";

interface SuratMasukFormProps {
  initialData?: SuratMasuk;
  mode?: "create" | "edit";
  title?: string;
  subtitle?: string;
  backButtonHref?: string;
}

export default function SuratMasukForm({ 
  initialData, 
  mode = "create",
  title,
  subtitle,
  backButtonHref = "/surat/masuk"
}: SuratMasukFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>([]);
  
  const [formData, setFormData] = useState<SuratMasuk>(
    initialData || {
      nomor_urut: 0,
      tanggal_penerimaan: new Date().toISOString().split('T')[0],
      nomor_surat: "",
      kode_surat: "",
      tanggal_surat: new Date().toISOString().split('T')[0],
      pengirim: "",
      isi_singkat: "",
      isi_disposisi: "",
      berkas_scan: "",
      lokasi_arsip: ""
    }
  );

  useEffect(() => {
    fetchKlasifikasi();
  }, []);

  const fetchKlasifikasi = async () => {
    try {
      const data = await getKlasifikasiSurat();
      setKlasifikasiList(data || []);
    } catch (error) {
      console.error("Error fetching klasifikasi:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValueChange = (name: keyof SuratMasuk, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    try {
      if (mode === "edit" && initialData?.id) {
        await updateSuratMasuk(initialData.id, formData);
        toast.success("Surat masuk berhasil diperbarui");
      } else {
        await createSuratMasuk(formData);
        toast.success("Surat masuk berhasil ditambahkan");
      }
      router.push("/surat/masuk");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving surat:", error);
      toast.error(error.message || "Gagal menyimpan data surat");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll Spy
  const [activeSection, setActiveSection] = useState("informasi-surat");
  const sections = [
    { id: "informasi-surat", label: "Informasi Surat" }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
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
      <Button 
        type="submit" 
        onClick={() => handleSubmit()}
        disabled={isSubmitting} 
        className="min-w-[120px]"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Data"}
      </Button>
    </div>
  );

  return (
    <FormLayout
      title={title || (mode === "create" ? "Tambah Surat Masuk" : "Edit Surat Masuk")}
      subtitle={subtitle || (mode === "create" ? "Catat surat masuk baru" : "Perbarui data surat masuk")}
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
        <div 
          id="informasi-surat"
          className="bg-card-bg rounded-xl border border-border-color p-6 md:p-8 space-y-8 scroll-mt-24"
        >
        <div className="space-y-6">
          <SectionTitle 
            title="Informasi Surat" 
            description="Detail data surat masuk" 
            icon={FileText} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField 
              label="Kode Surat"
              value={formData.kode_surat}
              onValueChange={(val) => handleValueChange("kode_surat", val)}
              options={klasifikasiList.map(k => ({ 
                label: `${k.kode} - ${k.nama}`, 
                value: k.kode 
              }))}
            />

            <InputField 
              label="Nomor Surat"
              name="nomor_surat"
              value={formData.nomor_surat}
              onChange={handleChange}
              placeholder="Contoh: 140/001/X/2023"
              required
            />

            <DatePickerField 
              label="Tanggal Surat"
              name="tanggal_surat"
              value={formData.tanggal_surat}
              onChange={handleChange}
              required
            />

            <DatePickerField 
              label="Tanggal Penerimaan"
              name="tanggal_penerimaan"
              value={formData.tanggal_penerimaan}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <InputField 
                label="Pengirim"
                name="pengirim"
                value={formData.pengirim}
                onChange={handleChange}
                placeholder="Nama instansi atau perseorangan pengirim"
                required
              />
            </div>

            <div className="md:col-span-2">
              <TextAreaField 
                label="Isi Singkat / Perihal"
                name="isi_singkat"
                value={formData.isi_singkat}
                onChange={handleChange}
                placeholder="Ringkasan isi surat..."
                required
              />
            </div>
            
            <div className="md:col-span-2">
               <TextAreaField 
                label="Isi Disposisi (Opsional)"
                name="isi_disposisi"
                value={formData.isi_disposisi || ""}
                onChange={handleChange}
                placeholder="Instruksi disposisi..."
              />
            </div>
            
            <InputField 
              label="Lokasi Arsip (Opsional)"
              name="lokasi_arsip"
              value={formData.lokasi_arsip || ""}
              onChange={handleChange}
              placeholder="Lemari/Rak/Binder"
            />
          </div>
        </div>
      </div>
      </div>
    </FormLayout>
  );
}
