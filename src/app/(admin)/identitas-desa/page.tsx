"use client";

import { 
  MapPin, 
  Globe, 
  Hash, 
  FileText
} from 'lucide-react';

import React, { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { FormLayout } from "@/components/layout/FormLayout";
import { FormSidebarNav } from "@/components/layout/FormSidebarNav";
import { AsyncSearchSelect } from "@/components/ui/AsyncSearchSelect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, TextAreaField, SectionTitle } from "@/components/ui/FormFields";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WilayahDesaRow = {
  kode_desa: string;
  nama_desa: string;
  nama_kecamatan: string;
  nama_kabupaten: string;
  nama_provinsi: string;
};

export default function IdentitasDesaPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Form State
  const [desaQuery, setDesaQuery] = useState("");
  const [desaOptions, setDesaOptions] = useState<WilayahDesaRow[]>([]);
  const [desaLoading, setDesaLoading] = useState(false);
  const [selectedDesa, setSelectedDesa] = useState<WilayahDesaRow | null>(null);

  // Data State
  const [kodeDesa, setKodeDesa] = useState("");
  const [namaKecamatan, setNamaKecamatan] = useState("");
  const [namaKabupaten, setNamaKabupaten] = useState("");
  const [namaProvinsi, setNamaProvinsi] = useState("");
  const [kodeKecamatan, setKodeKecamatan] = useState("");
  const [kodeKabupaten, setKodeKabupaten] = useState("");
  const [kodeProvinsi, setKodeProvinsi] = useState("");
  
  const [kodePos, setKodePos] = useState("");
  const [alamatKantor, setAlamatKantor] = useState("");
  const [emailDesa, setEmailDesa] = useState("");
  const [teleponDesa, setTeleponDesa] = useState("");
  const [websiteDesa, setWebsiteDesa] = useState("");
  const [namaKepalaCamat, setNamaKepalaCamat] = useState("");
  const [nipKepalaCamat, setNipKepalaCamat] = useState("");
  
  // Profil Desa
  const [sejarah, setSejarah] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  
  // Geografis
  const [luasWilayah, setLuasWilayah] = useState("");
  const [batasUtara, setBatasUtara] = useState("");
  const [batasSelatan, setBatasSelatan] = useState("");
  const [batasTimur, setBatasTimur] = useState("");
  const [batasBarat, setBatasBarat] = useState("");
  const [ketinggian, setKetinggian] = useState("");
  const [petaWilayah, setPetaWilayah] = useState("");

  // Field tambahan
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [zoom, setZoom] = useState("");
  const [mapTipe, setMapTipe] = useState("");
  const [path, setPath] = useState("");
  const [warna, setWarna] = useState("");
  const [logo, setLogo] = useState("");
  const [kantorDesa, setKantorDesa] = useState("");

  const [saving, setSaving] = useState(false);

  // Scroll Spy
  const [activeSection, setActiveSection] = useState("data-desa");
  const sections = [
    { id: "data-desa", title: "Data Desa", icon: Hash },
    { id: "kontak-resmi", title: "Kontak & Website", icon: Globe },
    { id: "data-wilayah", title: "Data Wilayah", icon: MapPin },
    { id: "profil-desa", title: "Profil Desa", icon: FileText },
    { id: "data-geografis", title: "Data Geografis", icon: MapPin },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const container = document.getElementById("form-scroll-container");
    if (element && container) {
      const offset = 24;
      const elementPosition = element.getBoundingClientRect().top;
      const containerPosition = container.getBoundingClientRect().top;
      const offsetPosition = elementPosition - containerPosition + container.scrollTop - offset;
      container.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const container = document.getElementById("form-scroll-container");
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top - containerTop;
          const bottom = rect.bottom - containerTop;
          
          if (top <= 150 && bottom >= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sections]);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from("identitas_desa")
        .select("*")
        .limit(1)
        .single();
        
      if (data) {
        setDesaQuery(data.nama_desa);
        setKodeDesa(data.kode_desa);
        setNamaKecamatan(data.nama_kecamatan);
        setNamaKabupaten(data.nama_kabupaten);
        setNamaProvinsi(data.nama_provinsi);
        
        const extractTwo = (val: string) => {
          if (!val) return "";
          if (val.includes(".")) {
             const parts = val.split(".");
             return parts[parts.length - 1];
          }
          return val.length > 2 ? val.slice(-2) : val;
        };

        setKodeKecamatan(extractTwo(data.kode_kecamatan));
        setKodeKabupaten(extractTwo(data.kode_kabupaten));
        setKodeProvinsi(extractTwo(data.kode_provinsi));

        setKodePos(data.kode_pos || "");
        setAlamatKantor(data.alamat_kantor || "");
        setEmailDesa(data.email_desa || "");
        setTeleponDesa(data.telepon || "");
        setWebsiteDesa(data.website || "");
        setNamaKepalaCamat(data.nama_kepala_camat || "");
        setNipKepalaCamat(data.nip_kepala_camat || "");
        
        setSejarah(data.sejarah || "");
        setVisi(data.visi || "");
        setMisi(data.misi || "");

        setLuasWilayah(data.luas_wilayah || "");
        setBatasUtara(data.batas_utara || "");
        setBatasSelatan(data.batas_selatan || "");
        setBatasTimur(data.batas_timur || "");
        setBatasBarat(data.batas_barat || "");
        setKetinggian(data.ketinggian || "");
        setPetaWilayah(data.peta_wilayah || "");

        setLat(data.lat || "");
        setLng(data.lng || "");
        setZoom(data.zoom ? String(data.zoom) : "");
        setMapTipe(data.map_tipe || "");
        setPath(data.path || "");
        setWarna(data.warna || "");
        setLogo(data.logo || "");
        setKantorDesa(data.kantor_desa || "");
      }
    };
    loadData();
  }, [supabase]);

  const handleSave = async () => {
    if (!kodeDesa) {
      toast.error("Harap pilih desa terlebih dahulu!");
      return;
    }

    setSaving(true);
    const payload = {
      nama_desa: desaQuery,
      kode_desa: kodeDesa,
      nama_kecamatan: namaKecamatan,
      nama_kabupaten: namaKabupaten,
      nama_provinsi: namaProvinsi,
      kode_kecamatan: kodeKecamatan,
      kode_kabupaten: kodeKabupaten,
      kode_provinsi: kodeProvinsi,
      kode_pos: kodePos,
      alamat_kantor: alamatKantor,
      email_desa: emailDesa,
      telepon: teleponDesa,
      website: websiteDesa,
      nama_kepala_camat: namaKepalaCamat,
      nip_kepala_camat: nipKepalaCamat,
      lat: lat,
      lng: lng,
      zoom: zoom ? parseInt(zoom) : null,
      map_tipe: mapTipe,
      path: path,
      warna: warna,
      logo: logo,
      kantor_desa: kantorDesa,
      sejarah: sejarah,
      visi: visi,
      misi: misi,
      luas_wilayah: luasWilayah,
      batas_utara: batasUtara,
      batas_selatan: batasSelatan,
      batas_timur: batasTimur,
      batas_barat: batasBarat,
      ketinggian: ketinggian,
      peta_wilayah: petaWilayah,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: existing, error: fetchError } = await supabase.from("identitas_desa").select("id").limit(1).single();
      
      let error;
      if (existing) {
         const res = await supabase.from("identitas_desa").update(payload).eq("id", existing.id);
         error = res.error;
      } else {
         // Add created_at for new records if missing in DB default (safety)
         const insertPayload = { ...payload, created_at: new Date().toISOString() };
         const res = await supabase.from("identitas_desa").insert(insertPayload);
         error = res.error;
      }

      if (error) throw error;
      
      toast.success("Berhasil menyimpan data identitas desa");
    } catch (err: any) {
      console.error("Error saving identitas:", err);
      toast.error("Gagal menyimpan: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (desaQuery.trim().length < 2) {
      setDesaOptions([]);
      setDesaLoading(false);
      return;
    }
    let cancelled = false;
    setDesaLoading(true);
    const timeoutId = setTimeout(async () => {
      const term = desaQuery.trim();
      const { data, error } = await supabase
        .from("wilayah_desa")
        .select("kode_desa,nama_desa,nama_kecamatan,nama_kabupaten,nama_provinsi")
        .or(`nama_desa.ilike.%${term}%,kode_desa.ilike.%${term}%`)
        .limit(20);
      if (cancelled) return;
      if (error) {
        setDesaOptions([]);
      } else {
        setDesaOptions((data ?? []) as WilayahDesaRow[]);
      }
      setDesaLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [desaQuery, supabase]);

  const handleSelectDesa = (row: WilayahDesaRow) => {
    setSelectedDesa(row);
    setDesaQuery(row.nama_desa);
    setKodeDesa(row.kode_desa);

    const cleanedKecamatan = row.nama_kecamatan.replace(/^KECAMATAN\s+/i, "").replace(/^Kecamatan\s+/i, "");
    const cleanedKabupaten = row.nama_kabupaten.replace(/^(KABUPATEN|KOTA)\s+/i, "").replace(/^(Kabupaten|Kota)\s+/i, "");
    const cleanedProvinsi = row.nama_provinsi.replace(/^PROVINSI\s+/i, "").replace(/^Provinsi\s+/i, "");

    setNamaKecamatan(cleanedKecamatan);
    setNamaKabupaten(cleanedKabupaten);
    setNamaProvinsi(cleanedProvinsi);
    
    setDesaOptions([]);
    const parts = row.kode_desa.split(".");
    if (parts.length >= 4) {
      setKodeProvinsi(parts[0]);
      setKodeKabupaten(parts[1]); 
      setKodeKecamatan(parts[2]);
    } else if (row.kode_desa.length >= 6 && !row.kode_desa.includes(".")) {
       setKodeProvinsi(row.kode_desa.substring(0, 2));
       setKodeKabupaten(row.kode_desa.substring(2, 4));
       setKodeKecamatan(row.kode_desa.substring(4, 6));
    } else {
      setKodeProvinsi("");
      setKodeKabupaten("");
      setKodeKecamatan("");
    }
  };

  return (
    <FormLayout
      title="Identitas Desa"
      subtitle="Manajemen data identitas desa"
      sidebar={
        <FormSidebarNav
          sections={sections}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      }
      actions={
        <Button 
          onClick={handleSave}
          disabled={saving}
          variant="primary"
          className="min-w-[120px]"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      }
    >
      <div className="space-y-8 pb-24">
        
        {/* A. Data Desa */}
        <Card id="data-desa" className="rounded-xl p-6 md:p-8 scroll-mt-24">
          <SectionTitle title="Data Desa" description="Informasi dasar identitas desa." icon={Hash} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <AsyncSearchSelect
                label="Nama Desa"
                placeholder="Ketik nama desa resmi..."
                value={desaQuery}
                onChange={(value) => {
                  setDesaQuery(value);
                  setSelectedDesa(null);
                  if (!value.trim()) {
                    setKodeDesa("");
                    setNamaKecamatan("");
                    setNamaKabupaten("");
                    setNamaProvinsi("");
                    setKodeKecamatan("");
                    setKodeKabupaten("");
                    setKodeProvinsi("");
                  }
                }}
                options={desaOptions.map(row => ({
                  value: row.kode_desa,
                  label: row.nama_desa,
                  subLabel: `${row.nama_kecamatan} - ${row.nama_kabupaten} - ${row.nama_provinsi}`,
                  originalData: row
                }))}
                onSelect={(option) => handleSelectDesa(option.originalData)}
                isLoading={desaLoading}
                description="Cari Nama atau Kode Desa (min. 2 huruf)."
              />
            </div>

            <InputField
              label="Kode Desa"
              value={kodeDesa}
              disabled
              readOnly
              placeholder="Otomatis"
            />

            <InputField
              label="Kode Pos"
              value={kodePos}
              onChange={(e) => setKodePos(e.target.value)}
              placeholder="Masukkan Kode Pos"
            />

            <div className="md:col-span-2">
              <TextAreaField
                label="Alamat Kantor"
                value={alamatKantor}
                onChange={(e) => setAlamatKantor(e.target.value)}
                placeholder="Alamat jalan/lokasi fisik kantor desa"
                rows={2}
              />
            </div>

            <InputField
              label="Kepala Desa"
              value=""
              disabled
              readOnly
              placeholder="Otomatis"
            />

            <InputField
              label="NIP Kepala Desa"
              value=""
              disabled
              readOnly
              placeholder="Otomatis"
            />
          </div>
        </Card>

        {/* Kontak Resmi */}
        <Card id="kontak-resmi" className="rounded-xl p-6 md:p-8 scroll-mt-24">
          <SectionTitle title="Kontak & Website Resmi" description="Informasi kontak desa yang dapat dihubungi." icon={Globe} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              type="email"
              label="Email Desa"
              value={emailDesa}
              onChange={(e) => setEmailDesa(e.target.value)}
              placeholder="contoh@desa.id"
            />
            <InputField
              label="Telepon Desa"
              value={teleponDesa}
              onChange={(e) => setTeleponDesa(e.target.value)}
              placeholder="08x-xxxx-xxxx"
            />
            <div className="md:col-span-2">
              <InputField
                label="Website Desa"
                value={websiteDesa}
                onChange={(e) => setWebsiteDesa(e.target.value)}
                placeholder="https://www.desa-nama.id"
              />
            </div>
          </div>
        </Card>

        {/* B. Data Wilayah */}
        <Card id="data-wilayah" className="rounded-xl p-6 md:p-8 scroll-mt-24">
          <SectionTitle title="Data Wilayah" description="Informasi wilayah administratif desa." icon={MapPin} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nama Kecamatan"
              value={namaKecamatan}
              disabled
              readOnly
              placeholder="Otomatis"
            />
            <InputField
              label="Kode Kecamatan"
              value={kodeKecamatan}
              disabled
              readOnly
              placeholder="Otomatis"
            />
            <InputField
              label="Nama Camat"
              value={namaKepalaCamat}
              onChange={(e) => setNamaKepalaCamat(e.target.value)}
              placeholder="Nama Lengkap Camat"
            />
            <InputField
              label="NIP Camat"
              value={nipKepalaCamat}
              onChange={(e) => setNipKepalaCamat(e.target.value)}
              placeholder="NIP Camat"
            />
            <InputField
              label="Nama Kabupaten"
              value={namaKabupaten}
              disabled
              readOnly
              placeholder="Otomatis"
            />
            <InputField
              label="Kode Kabupaten"
              value={kodeKabupaten}
              disabled
              readOnly
              placeholder="Otomatis"
            />
            <InputField
              label="Nama Provinsi"
              value={namaProvinsi}
              disabled
              readOnly
              placeholder="Otomatis"
            />
            <InputField
              label="Kode Provinsi"
              value={kodeProvinsi}
              disabled
              readOnly
              placeholder="Otomatis"
            />
          </div>
        </Card>

        {/* Profil Desa */}
        <Card id="profil-desa" className="rounded-xl p-6 md:p-8 scroll-mt-24">
          <SectionTitle title="Profil Desa" description="Sejarah, Visi, dan Misi desa." icon={FileText} />
          <div className="space-y-6">
            <TextAreaField
              label="Sejarah Desa"
              value={sejarah}
              onChange={(e) => setSejarah(e.target.value)}
              placeholder="Ceritakan sejarah desa..."
              rows={8}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextAreaField
                label="Visi"
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                placeholder="Visi desa..."
                rows={6}
              />
              <TextAreaField
                label="Misi"
                value={misi}
                onChange={(e) => setMisi(e.target.value)}
                placeholder="Misi desa..."
                rows={6}
              />
            </div>
          </div>
        </Card>
        {/* Data Geografis */}
        <Card id="data-geografis" className="rounded-xl p-6 md:p-8 scroll-mt-24">
          <SectionTitle title="Data Geografis" description="Informasi geografis dan batas wilayah." icon={MapPin} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Luas Wilayah"
              value={luasWilayah}
              onChange={(e) => setLuasWilayah(e.target.value)}
              placeholder="Contoh: 1250 Ha"
            />
            <InputField
              label="Ketinggian (mdpl)"
              value={ketinggian}
              onChange={(e) => setKetinggian(e.target.value)}
              placeholder="Contoh: 500 mdpl"
            />
            
            <InputField
              label="Batas Utara"
              value={batasUtara}
              onChange={(e) => setBatasUtara(e.target.value)}
              placeholder="Desa/Kecamatan..."
            />
            <InputField
              label="Batas Selatan"
              value={batasSelatan}
              onChange={(e) => setBatasSelatan(e.target.value)}
              placeholder="Desa/Kecamatan..."
            />
            <InputField
              label="Batas Timur"
              value={batasTimur}
              onChange={(e) => setBatasTimur(e.target.value)}
              placeholder="Desa/Kecamatan..."
            />
            <InputField
              label="Batas Barat"
              value={batasBarat}
              onChange={(e) => setBatasBarat(e.target.value)}
              placeholder="Desa/Kecamatan..."
            />
            
            <div className="md:col-span-2">
              <TextAreaField
                label="Peta Wilayah (Embed HTML / URL Gambar)"
                value={petaWilayah}
                onChange={(e) => setPetaWilayah(e.target.value)}
                placeholder="Paste kode embed Google Maps iframe atau URL gambar peta..."
                rows={3}
                description="Disarankan menggunakan Embed Map dari Google Maps."
              />
            </div>
          </div>
        </Card>
      </div>
    </FormLayout>
  );
}
