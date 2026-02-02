"use client";

import { 
  Save, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  User, 
  Hash, 
  Search,
  Check,
  FileText
} from 'lucide-react';

import React, { useEffect, useMemo, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI Components to match ResidentForm style
const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-[13px] font-medium text-zinc-700 mb-1.5 block", className)} {...props} />
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const SectionContainer = ({ 
  title, 
  icon: Icon,
  children 
}: { 
  title: string; 
  icon?: any; 
  children: React.ReactNode;
}) => (
  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-8 shadow-sm">
    <div className="mb-6 border-b border-zinc-200 pb-4 flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-zinc-500" />}
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
    </div>
    {children}
  </div>
);

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

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
    if (desaQuery.trim().length < 2 || !isDropdownOpen) {
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
  }, [desaQuery, supabase, isDropdownOpen]);

  const handleSelectDesa = (row: WilayahDesaRow) => {
    setSelectedDesa(row);
    setDesaQuery(row.nama_desa);
    setKodeDesa(row.kode_desa);
    setIsDropdownOpen(false);

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
    
    try {
      // Re-extract for localstorage info
      let k_kec = "", k_kab = "", k_prov = "";
      if (parts.length >= 4) {
         k_prov = parts[0]; k_kab = parts[1]; k_kec = parts[2];
      } else if (row.kode_desa.length >= 6 && !row.kode_desa.includes(".")) {
         k_prov = row.kode_desa.substring(0, 2);
         k_kab = row.kode_desa.substring(2, 4);
         k_kec = row.kode_desa.substring(4, 6);
      }

      const info = {
        kode_desa: row.kode_desa,
        nama_desa: row.nama_desa,
        nama_kecamatan: cleanedKecamatan,
        nama_kabupaten: cleanedKabupaten,
        nama_provinsi: cleanedProvinsi,
        kode_kecamatan: k_kec,
        kode_kabupaten: k_kab,
        kode_provinsi: k_prov,
      };
      localStorage.setItem("desaOS.infoDesa", JSON.stringify(info));
    } catch {}
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <PageHeader 
        title="Identitas Desa" 
        subtitle="Manajemen data identitas desa"
        actions={(
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-sm"
           >
             {saving ? (
               <>Menyimpan...</>
             ) : (
               <>
                 <Save className="w-4 h-4"/>
                 <span>Simpan</span>
               </>
             )}
           </button>
        )}
      />

      {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-zinc-50/30">
          <div className="max-w-5xl mx-auto w-full p-6 pb-20 space-y-8">
            
            {/* A. Data Desa */}
            <SectionContainer title="Data Desa" icon={Hash}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nama Desa</Label>
                  <div className="relative" ref={searchContainerRef}>
                    <Input
                      type="text"
                      placeholder="Ketik nama desa resmi..."
                      value={desaQuery}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDesaQuery(value);
                        setSelectedDesa(null);
                        setIsDropdownOpen(true);
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
                    />
                    {desaLoading && (
                      <div className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-500">
                        Memuat...
                      </div>
                    )}
                    {desaOptions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border border-zinc-200 rounded-md shadow-lg">
                        {desaOptions.map((row) => (
                          <button
                            key={row.kode_desa}
                            type="button"
                            className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 transition-colors"
                            onClick={() => handleSelectDesa(row)}
                          >
                            <div className="font-medium text-zinc-900">
                              {row.nama_desa} ({row.kode_desa})
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              {row.nama_kecamatan} - {row.nama_kabupaten} - {row.nama_provinsi}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Cari Nama atau Kode Desa (min. 2 huruf).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Kode Desa</Label>
                  <Input value={kodeDesa} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>

                <div className="space-y-2">
                  <Label>Kode Pos</Label>
                  <Input 
                    value={kodePos} 
                    onChange={(e) => setKodePos(e.target.value)} 
                    placeholder="Masukkan Kode Pos" 
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Alamat Kantor</Label>
                  <Textarea
                    value={alamatKantor}
                    onChange={(e) => setAlamatKantor(e.target.value)}
                    placeholder="Alamat jalan/lokasi fisik kantor desa"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kepala Desa</Label>
                  <Input value="" disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>

                <div className="space-y-2">
                  <Label>NIP Kepala Desa</Label>
                  <Input value="" disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
              </div>
            </SectionContainer>

            {/* Kontak Resmi */}
            <SectionContainer title="Kontak & Website Resmi" icon={Globe}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email Desa</Label>
                  <Input 
                    type="email"
                    value={emailDesa}
                    onChange={(e) => setEmailDesa(e.target.value)}
                    placeholder="contoh@desa.id"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telepon Desa</Label>
                  <Input 
                    value={teleponDesa}
                    onChange={(e) => setTeleponDesa(e.target.value)}
                    placeholder="08x-xxxx-xxxx"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website Desa</Label>
                  <Input 
                    value={websiteDesa}
                    onChange={(e) => setWebsiteDesa(e.target.value)}
                    placeholder="https://www.desa-nama.id"
                  />
                </div>
              </div>
            </SectionContainer>

            {/* B. Data Wilayah */}
            <SectionContainer title="Data Wilayah (Kecamatan/Kab/Prov)" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nama Kecamatan</Label>
                  <Input value={namaKecamatan} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label>Kode Kecamatan</Label>
                  <Input value={kodeKecamatan} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Camat</Label>
                  <Input 
                    value={namaKepalaCamat}
                    onChange={(e) => setNamaKepalaCamat(e.target.value)}
                    placeholder="Nama Lengkap Camat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIP Camat</Label>
                  <Input 
                    value={nipKepalaCamat}
                    onChange={(e) => setNipKepalaCamat(e.target.value)}
                    placeholder="NIP Camat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Kabupaten</Label>
                  <Input value={namaKabupaten} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label>Kode Kabupaten</Label>
                  <Input value={kodeKabupaten} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Provinsi</Label>
                  <Input value={namaProvinsi} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label>Kode Provinsi</Label>
                  <Input value={kodeProvinsi} disabled readOnly placeholder="Otomatis" className="bg-zinc-100 text-zinc-500" />
                </div>
              </div>
            </SectionContainer>

            <SectionContainer title="Profil Desa" icon={FileText}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="sejarah">Sejarah Desa</Label>
                  <Textarea
                    id="sejarah"
                    value={sejarah}
                    onChange={(e) => setSejarah(e.target.value)}
                    placeholder="Ceritakan sejarah desa..."
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="visi">Visi</Label>
                    <Textarea
                      id="visi"
                      value={visi}
                      onChange={(e) => setVisi(e.target.value)}
                      placeholder="Visi desa..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="misi">Misi</Label>
                    <Textarea
                      id="misi"
                      value={misi}
                      onChange={(e) => setMisi(e.target.value)}
                      placeholder="Misi desa..."
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
              </div>
            </SectionContainer>

            <SectionContainer title="Data Geografis" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Luas Wilayah</Label>
                  <Input 
                    value={luasWilayah}
                    onChange={(e) => setLuasWilayah(e.target.value)}
                    placeholder="Contoh: 1250 Ha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ketinggian (mdpl)</Label>
                  <Input 
                    value={ketinggian}
                    onChange={(e) => setKetinggian(e.target.value)}
                    placeholder="Contoh: 500 mdpl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Batas Utara</Label>
                  <Input 
                    value={batasUtara}
                    onChange={(e) => setBatasUtara(e.target.value)}
                    placeholder="Desa/Kecamatan..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batas Selatan</Label>
                  <Input 
                    value={batasSelatan}
                    onChange={(e) => setBatasSelatan(e.target.value)}
                    placeholder="Desa/Kecamatan..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batas Timur</Label>
                  <Input 
                    value={batasTimur}
                    onChange={(e) => setBatasTimur(e.target.value)}
                    placeholder="Desa/Kecamatan..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batas Barat</Label>
                  <Input 
                    value={batasBarat}
                    onChange={(e) => setBatasBarat(e.target.value)}
                    placeholder="Desa/Kecamatan..."
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Peta Wilayah (Embed HTML / URL Gambar)</Label>
                  <Textarea
                    value={petaWilayah}
                    onChange={(e) => setPetaWilayah(e.target.value)}
                    placeholder="Paste kode embed Google Maps iframe atau URL gambar peta..."
                    rows={3}
                  />
                  <p className="text-xs text-zinc-500">
                    Disarankan menggunakan Embed Map dari Google Maps.
                  </p>
                </div>
              </div>
            </SectionContainer>

          </div>
        </div>
      </div>
  );
}
