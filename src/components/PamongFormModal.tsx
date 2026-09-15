"use client";

import { useState, useEffect } from "react";
import { X, User, Save, Search, Briefcase, FileText, Settings, UserCheck } from "lucide-react";
import { Pamong } from "@/lib/services/surat";
import { Resident } from "@/lib/services/penduduk";
import ResidentPickerModal from "./ResidentPickerModal";
import { toast } from "sonner";

interface PamongFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Pamong>) => Promise<void>;
  initialData?: Pamong | null;
}

export default function PamongFormModal({
  open,
  onClose,
  onSave,
  initialData,
}: PamongFormModalProps) {
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
  
  const [activeTab, setActiveTab] = useState<"pribadi" | "jabatan" | "lainnya">("pribadi");
  const [loading, setLoading] = useState(false);
  const [showResidentPicker, setShowResidentPicker] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Reset form for new entry
        setFormData({
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
      }
      setActiveTab("pribadi");
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up data before sending
      const dataToSend: any = { ...formData };
      
      // Remove empty strings for optional date fields to prevent DB errors
      if (!dataToSend.pamong_tglsk) delete dataToSend.pamong_tglsk;
      if (!dataToSend.pamong_tglhenti) delete dataToSend.pamong_tglhenti;
      if (!dataToSend.pamong_tanggallahir) delete dataToSend.pamong_tanggallahir;
      if (!dataToSend.pamong_tgl_terdaftar) delete dataToSend.pamong_tgl_terdaftar;
      
      // Ensure null/empty strings are handled correctly if needed by backend
      if (!dataToSend.jabatan_id) delete dataToSend.jabatan_id;
      if (!dataToSend.id_pend) delete dataToSend.id_pend;
      
      await onSave(dataToSend);
      toast.success("Data aparatur desa berhasil disimpan");
      onClose();
    } catch (error: any) {
      console.error("Error saving pamong:", error);
      toast.error(`Gagal menyimpan data aparatur: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResidentSelect = (resident: Resident) => {
    setFormData((prev) => ({
      ...prev,
      pamong_nama: resident.nama,
      pamong_nik: resident.nik,
      id_pend: resident.id, 
      // Assuming we might want to fill other fields if available in resident data
    }));
    setShowResidentPicker(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <div>
            <h3 className="text-xl font-bold text-zinc-800">
              {initialData ? "Edit Aparatur Desa" : "Tambah Aparatur Desa"}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {initialData ? "Perbarui informasi aparatur desa." : "Tambahkan aparatur desa baru ke dalam sistem."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          <button
            type="button"
            onClick={() => setActiveTab("pribadi")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pribadi"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              Data Pribadi
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("jabatan")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "jabatan"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-4 h-4" />
              Kepegawaian
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lainnya")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "lainnya"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              Pengaturan
            </div>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="pamong-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tab: Data Pribadi */}
            {activeTab === "pribadi" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Resident Picker */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                      Sumber Data
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResidentPicker(true)}
                      className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 hover:shadow transition-all"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Ambil dari Data Penduduk
                    </button>
                  </div>
                  <p className="text-xs text-blue-600/70">
                    Otomatis mengisi nama dan NIK jika data penduduk sudah ada.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={formData.pamong_nama || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, pamong_nama: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                        placeholder="Nama lengkap aparatur"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      NIK
                    </label>
                    <input
                      type="text"
                      value={formData.pamong_nik || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, pamong_nik: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                      placeholder="Nomor Induk Kependudukan"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Gelar Depan
                    </label>
                    <input
                      type="text"
                      value={formData.gelar_depan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, gelar_depan: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                      placeholder="Contoh: Dr., Ir."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Gelar Belakang
                    </label>
                    <input
                      type="text"
                      value={formData.gelar_belakang || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, gelar_belakang: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                      placeholder="Contoh: S.Kom, M.Si"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Kepegawaian */}
            {activeTab === "jabatan" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={formData.pamong_nip || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, pamong_nip: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                      placeholder="Nomor Induk Pegawai"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      NIAP
                    </label>
                    <input
                      type="text"
                      value={formData.pamong_niap || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, pamong_niap: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                      placeholder="NIAP"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Jabatan / Pangkat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={formData.pamong_pangkat || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, pamong_pangkat: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                        placeholder="Contoh: Kepala Desa, Sekretaris Desa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Nomor SK Pengangkatan
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.pamong_nosk || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, pamong_nosk: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                        placeholder="Nomor SK"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Tanggal SK
                    </label>
                    <input
                      type="date"
                      value={formData.pamong_tglsk || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, pamong_tglsk: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-zinc-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Pengaturan */}
            {activeTab === "lainnya" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-800">Status Keaktifan</h4>
                      <p className="text-xs text-zinc-500 max-w-[80%]">
                        Menentukan apakah aparatur ini aktif menjabat. Aparatur tidak aktif tidak akan muncul di pilihan tanda tangan surat.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pamong_status: 1 })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.pamong_status === 1
                            ? "bg-green-100 text-green-700 border border-green-200 shadow-sm"
                            : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        Aktif
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pamong_status: 0 })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.pamong_status === 0
                            ? "bg-red-100 text-red-700 border border-red-200 shadow-sm"
                            : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        Tidak Aktif
                      </button>
                    </div>
                  </div>
                  
                  <hr className="border-zinc-200/50" />

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-800">Otoritas Tanda Tangan</h4>
                      <p className="text-xs text-zinc-500 max-w-[80%]">
                        Izinkan aparatur ini untuk menandatangani surat resmi desa.
                      </p>
                    </div>
                     <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pamong_ttd: 1 })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.pamong_ttd === 1
                            ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                            : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        Ya, Berwenang
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pamong_ttd: 0 })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.pamong_ttd === 0
                            ? "bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-sm"
                            : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200/50 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="pamong-form"
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nested Resident Picker Modal */}
      <ResidentPickerModal
        open={showResidentPicker}
        onClose={() => setShowResidentPicker(false)}
        onSelect={handleResidentSelect}
      />
    </div>
  );
}
