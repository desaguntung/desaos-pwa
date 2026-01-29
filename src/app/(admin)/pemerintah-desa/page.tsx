"use client";

import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Users, 
  ChevronRight, 
  Info,
  Edit2,
  Trash2,
  Filter,
  UserPlus,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  PenTool,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { 
  getPamong, 
  createPamong, 
  updatePamong, 
  deletePamong,
  type Pamong 
} from '@/lib/services/surat';
import PamongFormModal from '@/components/PamongFormModal';
import { PageHeader } from "@/components/layout/PageHeader";

export default function PemerintahDesaPage() {
  const [pamongList, setPamongList] = useState<Pamong[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | null>(null); // null = all, 1 = active, 0 = inactive
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPamong, setSelectedPamong] = useState<Pamong | null>(null);

  useEffect(() => {
    fetchPamong();
  }, [filterStatus]);

  const fetchPamong = async () => {
    try {
      setLoading(true);
      console.log("Fetching pamong with status:", filterStatus);
      const data = await getPamong(filterStatus);
      console.log("Fetched pamong data:", data);
      setPamongList(data || []);
    } catch (error: any) {
      console.error("Error fetching pamong:", error);
      alert(`Gagal memuat data aparatur: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPamong(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pamong: Pamong) => {
    setSelectedPamong(pamong);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data aparatur ini?")) {
      try {
        await deletePamong(id);
        fetchPamong();
      } catch (error: any) {
        console.error("Error deleting pamong:", error);
        alert(`Gagal menghapus data aparatur: ${error.message || "Terjadi kesalahan"}`);
      }
    }
  };

  const handleSave = async (data: Partial<Pamong>) => {
    if (selectedPamong) {
      await updatePamong(selectedPamong.pamong_id, data);
    } else {
      await createPamong(data);
    }
    fetchPamong();
  };

  const filteredPamong = pamongList.filter(p => {
    const name = p.pamong_nama || p.penduduk?.nama || "";
    const nip = p.pamong_nip || "";
    const niap = p.pamong_niap || "";
    const term = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(term) ||
      nip.includes(searchTerm) ||
      niap.includes(searchTerm);
  });

  const activeCount = pamongList.filter(p => p.pamong_status === 1).length;
  const signerCount = pamongList.filter(p => p.pamong_ttd === 1 && p.pamong_status === 1).length;
  const nonSignerCount = activeCount - signerCount;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-body-bg">
      {/* Header */}
      <PageHeader 
        title="Pemerintah Desa" 
        subtitle="Info Desa / Pemerintah Desa"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-secondary-text bg-white border border-zinc-200 rounded-md px-3 py-1.5 hover:bg-zinc-50 transition-colors font-medium">
              <Download className="w-3.5 h-3.5"/>
              <span>Export PDF</span>
            </button>
            <button 
              onClick={handleAdd}
              className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5"/>
              <span>Tambah Aparatur</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-white border border-zinc-200 rounded-lg p-1">
            <button 
              onClick={() => setFilterStatus(null)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${filterStatus === null ? 'bg-zinc-50 text-primary-text border border-zinc-200 shadow-sm' : 'text-secondary-text hover:text-primary-text'}`}
            >
                <span>Semua Aparat</span>
                <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">{pamongList.length}</span>
            </button>
            <button 
              onClick={() => setFilterStatus(1)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 1 ? 'bg-zinc-50 text-primary-text border border-zinc-200 shadow-sm' : 'text-secondary-text hover:text-primary-text'}`}
            >
              Aktif
            </button>
            <button 
              onClick={() => setFilterStatus(0)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 0 ? 'bg-zinc-50 text-primary-text border border-zinc-200 shadow-sm' : 'text-secondary-text hover:text-primary-text'}`}
            >
              Tidak Aktif
            </button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -tranzinc-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                <input 
                type="text" 
                placeholder="Cari nama atau NIP..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary-text/20 transition-all" 
                />
            </div>
            <button className="p-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                <ArrowUpDown className="w-3.5 h-3.5 text-secondary-text" />
            </button>
          </div>
        </div>

        {/* Personnel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-12 text-center text-secondary-text text-sm">
               Memuat data aparatur desa...
             </div>
          ) : filteredPamong.length === 0 ? (
            <div className="col-span-full py-12 text-center text-secondary-text text-sm">
              Tidak ada data aparatur desa ditemukan.
            </div>
          ) : (
            filteredPamong.map((pamong, i) => {
            const displayName = pamong.pamong_nama || pamong.penduduk?.nama || "Tanpa Nama";
            const displayNip = pamong.pamong_nip || pamong.pamong_niap || pamong.penduduk?.nik || "-";

            return (
            <div key={pamong.pamong_id} className={`bg-white border ${pamong.pamong_status === 1 ? 'border-zinc-200' : 'border-dashed border-gray-300'} rounded-lg overflow-hidden transition-all group`}>
              <div className="p-5 flex items-start gap-4">
                <div className="relative">
                    <img 
                      src={pamong.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} 
                      alt={displayName} 
                      className={`w-14 h-14 rounded-lg object-cover border border-zinc-200 ${pamong.pamong_status !== 1 && 'grayscale'}`} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1">
                        {pamong.pamong_status === 1 ? (
                            <div className="bg-emerald-500 rounded-full border-2 border-white p-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            </div>
                        ) : (
                            <div className="bg-gray-400 rounded-full border-2 border-white p-0.5">
                                <XCircle className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-widest bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">Urutan #{i + 1}</span>
                    <button className="text-secondary-text hover:text-primary-text transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-primary-text mt-1 truncate">{displayName}</h4>
                  <p className="text-xs font-medium text-blue-600">{pamong.pamong_pangkat || "Perangkat Desa"}</p>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-secondary-text uppercase tracking-tighter">NIP / NIAP</p>
                    <p className="text-xs text-primary-text font-medium truncate">{displayNip}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-secondary-text uppercase tracking-tighter">Tanda Tangan</p>
                    <div className="flex items-center gap-1.5">
                        {pamong.pamong_ttd === 1 ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${pamong.pamong_ttd === 1 ? 'text-emerald-700' : 'text-secondary-text'}`}>
                            {pamong.pamong_ttd === 1 ? 'Otoritas' : 'No Access'}
                        </span>
                    </div>
                </div>
              </div>

              <div className="p-2 border-t border-zinc-200 flex gap-1">
                <button 
                  onClick={() => handleEdit(pamong)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-white rounded-md transition-all"
                >
                    <Edit2 className="w-3 h-3" />
                    <span>EDIT</span>
                </button>
                <div className="w-px h-4 bg-zinc-200 my-auto"></div>
                <button 
                  onClick={() => handleDelete(pamong.pamong_id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-secondary-text hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                >
                    <Trash2 className="w-3 h-3" />
                    <span>HAPUS</span>
                </button>
              </div>
            </div>
          );
        }))}

          {/* Add New Placeholder Card */}
          <button 
            onClick={handleAdd}
            className="border-2 border-dashed border-zinc-200 rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-gray-400 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-secondary-text" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-primary-text">Tambah Aparatur</p>
              <p className="text-xs text-secondary-text mt-1">Staf atau Perangkat Desa baru</p>
            </div>
          </button>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white border border-zinc-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider">Status Aparatur</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-secondary-text">Total Aparatur</span>
                        <span className="font-bold text-primary-text">{pamongList.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-4">
                        <span className="text-secondary-text">Aktif Menjabat</span>
                        <span className="font-bold text-primary-text">{activeCount}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${(activeCount / (pamongList.length || 1)) * 100}%` }}></div>
                    </div>
                </div>
            </section>

            <section className="bg-white border border-zinc-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                    <PenTool className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider">Otoritas TTD Surat</h3>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <p className="text-xs text-secondary-text leading-tight font-medium">
                            Aparat dengan otoritas tanda tangan akan muncul di daftar penandatangan cetak surat otomatis.
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="text-center">
                                <p className="text-lg font-bold text-primary-text">{signerCount}</p>
                                <p className="text-xs text-secondary-text font-bold uppercase">Pejabat</p>
                            </div>
                            <div className="w-px h-8 bg-zinc-200"></div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-secondary-text">{nonSignerCount}</p>
                                <p className="text-xs text-secondary-text font-bold uppercase">Non-TTD</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-24 h-24 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-center p-2 relative overflow-hidden group cursor-help">
                        <ImageIcon className="w-8 h-8 text-secondary-text opacity-30 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-x-0 bottom-0 bg-white/90 p-1 text-center border-t border-zinc-200">
                            <span className="text-xs font-bold text-secondary-text tracking-tighter">PREVIEW TTD</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
      <PamongFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedPamong}
      />
    </div>
  );
}


