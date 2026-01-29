"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  ArrowLeft,
  Calendar,
  FileText,
  Hash,
  User,
  Files
} from "lucide-react";
import { 
  SuratMasuk, 
  KlasifikasiSurat, 
  getKlasifikasiSurat, 
  createSuratMasuk, 
  updateSuratMasuk 
} from "@/lib/services/surat";
import Link from "next/link";

interface SuratMasukFormProps {
  initialData?: SuratMasuk;
  isEdit?: boolean;
}

export default function SuratMasukForm({ initialData, isEdit = false }: SuratMasukFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await updateSuratMasuk(initialData.id, formData);
      } else {
        await createSuratMasuk(formData);
      }
      router.push("/surat/masuk");
      router.refresh();
    } catch (error) {
      console.error("Error saving surat:", error);
      alert("Gagal menyimpan data surat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Informasi Surat
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kode Surat */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase">Kode Surat</label>
            <select
              name="kode_surat"
              value={formData.kode_surat}
              onChange={handleChange}
              className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            >
              <option value="">Pilih Kode Klasifikasi...</option>
              {klasifikasiList.map((k) => (
                <option key={k.id} value={k.kode}>
                  {k.kode} - {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Nomor Surat */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase">Nomor Surat</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                name="nomor_surat"
                value={formData.nomor_surat}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Contoh: 140/001/X/2023"
                required
              />
            </div>
          </div>

          {/* Tanggal Surat */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase">Tanggal Surat</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                name="tanggal_surat"
                value={formData.tanggal_surat}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Tanggal Penerimaan */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase">Tanggal Penerimaan</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                name="tanggal_penerimaan"
                value={formData.tanggal_penerimaan}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Pengirim */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-zinc-500 uppercase">Pengirim</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                name="pengirim"
                value={formData.pengirim}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Nama instansi atau perseorangan pengirim"
                required
              />
            </div>
          </div>

          {/* Isi Singkat */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-zinc-500 uppercase">Isi Singkat / Perihal</label>
            <textarea
              name="isi_singkat"
              value={formData.isi_singkat}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Ringkasan isi surat..."
              required
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/surat/masuk"
          className="px-4 py-2 text-xs font-medium text-secondary-text bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {loading ? "Menyimpan..." : "Simpan Surat"}
        </button>
      </div>
    </form>
  );
}
