"use client";

import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Building2, 
  Info,
  Filter,
  MapPin,
  Eye,
  Printer
} from 'lucide-react';
import { PageHeader } from "@/components/layout/PageHeader";

export default function LembagaDesaPage() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-body-bg">
      {/* Header */}
      <PageHeader
        title="Lembaga Desa"
        subtitle="Info Desa / Lembaga Desa"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-secondary-text bg-white border border-zinc-200 rounded-md px-3 py-1.5 hover:bg-zinc-50 transition-colors font-medium">
              <Filter className="w-3.5 h-3.5"/>
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium shadow-sm">
              <Plus className="w-3.5 h-3.5"/>
              <span>Tambah Lembaga</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari lembaga..." 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" 
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-xs text-secondary-text uppercase font-bold">Total Lembaga</p>
                <p className="text-lg font-bold text-primary-text">8</p>
            </div>
            <div className="w-px h-8 bg-zinc-200"></div>
            <div className="text-right">
                <p className="text-xs text-secondary-text uppercase font-bold">Anggota Aktif</p>
                <p className="text-lg font-bold text-primary-text">125</p>
            </div>
          </div>
        </div>

        {/* Lembaga List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Karang Taruna Bhakti Jaya', abbr: 'KT-BJ', type: 'Lembaga Kepemudaan',
              address: 'Jl. Pemuda No. 10', members: 45, officers: 10,
              logo: 'https://via.placeholder.com/40/007bff/ffffff?text=KT',
            },
            {
              name: 'Pemberdayaan Kesejahteraan Keluarga', abbr: 'PKK', type: 'Lembaga Kewanitaan',
              address: 'Balai Desa', members: 60, officers: 15,
              logo: 'https://via.placeholder.com/40/28a745/ffffff?text=PKK',
            },
            {
              name: 'Lembaga Pemberdayaan Masyarakat', abbr: 'LPM', type: 'Lembaga Kemasyarakatan',
              address: 'Kantor Sekretariat', members: 20, officers: 5,
              logo: 'https://via.placeholder.com/40/ffc107/ffffff?text=LPM',
            },
            {
              name: 'Kelompok Tani Subur Makmur', abbr: 'KTSM', type: 'Kelompok Usaha Tani',
              address: 'Area Persawahan', members: 30, officers: 3,
              logo: 'https://via.placeholder.com/40/17a2b8/ffffff?text=KT',
            },
            {
              name: 'Badan Permusyawaratan Desa', abbr: 'BPD', type: 'Lembaga Adat',
              address: 'Balai Desa', members: 9, officers: 9,
              logo: 'https://via.placeholder.com/40/6f42c1/ffffff?text=BPD',
            },
          ].map((lembaga, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-lg overflow-hidden transition-all group">
              <div className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden">
                  {lembaga.logo ? (
                    <img src={lembaga.logo} alt={lembaga.abbr} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-secondary-text opacity-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-widest bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">{lembaga.type}</span>
                    <button className="text-secondary-text hover:text-primary-text transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-primary-text mt-1 truncate">{lembaga.name} <span className="text-xs text-secondary-text font-medium ml-1">({lembaga.abbr})</span></h4>
                  <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3"/>
                    <span>{lembaga.address}</span>
                  </p>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-secondary-text uppercase tracking-tighter">Pengurus</p>
                    <p className="text-sm text-primary-text font-medium">{lembaga.officers} Orang</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-secondary-text uppercase tracking-tighter">Anggota</p>
                    <p className="text-sm text-primary-text font-medium">{lembaga.members} Orang</p>
                </div>
              </div>

              <div className="p-2 border-t border-zinc-200 flex gap-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-white rounded-md transition-all">
                    <Eye className="w-3 h-3" />
                    <span>DETAIL</span>
                </button>
                <div className="w-px h-4 bg-zinc-200 my-auto"></div>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-secondary-text hover:text-primary-text hover:bg-white rounded-md transition-all">
                    <Printer className="w-3 h-3" />
                    <span>CETAK DAFTAR</span>
                </button>
              </div>
            </div>
          ))}
          
          {/* Add New Placeholder Card */}
          <button className="border-2 border-dashed border-zinc-200 rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-gray-400 transition-all group">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-secondary-text" />
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-primary-text">Tambah Lembaga</p>
                <p className="text-xs text-secondary-text mt-1">Organisasi kemasyarakatan baru</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
