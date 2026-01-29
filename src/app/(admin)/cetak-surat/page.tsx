"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Users as UsersIcon,
  Info,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
  Eye,
  ChevronDown,
  FileText,
  Hash,
  BookOpen,
  User,
  Award,
  Code,
  QrCode,
  Star,
  ToggleRight,
  ClipboardList,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Signature,
  Printer,
  Archive,
  ListChecks,
  History,
  BarChart2,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import Link from "next/link";
import { getFormatSurat, FormatSurat } from "@/lib/services/surat";
import { getResidents, Resident } from "@/lib/services/penduduk";

const CetakSuratPage: React.FC = () => {
  // Data State
  const [letterTypes, setLetterTypes] = useState<FormatSurat[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selection State
  const [selectedLetterType, setSelectedLetterType] = useState<FormatSurat | null>(null);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isNonWarga, setIsNonWarga] = useState(false);

  // Search State
  const [letterSearchTerm, setLetterSearchTerm] = useState("");
  const [residentSearchTerm, setResidentSearchTerm] = useState("");
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  
  const residentSearchRef = useRef<HTMLDivElement>(null);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [formats, residentsData] = await Promise.all([
          getFormatSurat(),
          getResidents()
        ]);
        setLetterTypes(formats);
        setResidents(residentsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Filter Residents Effect
  useEffect(() => {
    if (residentSearchTerm && !selectedResident) {
      const term = residentSearchTerm.toLowerCase();
      const filtered = residents.filter(r => 
        r.nama.toLowerCase().includes(term) || 
        r.nik.includes(term)
      ).slice(0, 10); // Limit to 10 results for performance
      setFilteredResidents(filtered);
      setShowResidentDropdown(true);
    } else {
      setShowResidentDropdown(false);
    }
  }, [residentSearchTerm, residents, selectedResident]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (residentSearchRef.current && !residentSearchRef.current.contains(event.target as Node)) {
        setShowResidentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setResidentSearchTerm(`${resident.nama} - ${resident.nik}`);
    setShowResidentDropdown(false);
  };

  const handleClearResident = () => {
    setSelectedResident(null);
    setResidentSearchTerm("");
  };

  const filteredLetterTypes = letterTypes.filter(type => 
    type.nama.toLowerCase().includes(letterSearchTerm.toLowerCase()) ||
    (type.kode_surat && type.kode_surat.toLowerCase().includes(letterSearchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-body-bg/80 backdrop-blur-md border-b border-zinc-200 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-primary-text">Cetak Surat</h2>
            <div className="h-4 w-px bg-zinc-200"></div>
            <div className="flex items-center gap-1 text-xs text-secondary-text">
              <span>Layanan Surat</span>
              <span className="text-zinc-200">/</span>
              <span className="text-primary-text font-medium">Cetak Surat</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Panduan button removed */}
          </div>
        </div>
      </header>

      <div className="p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {/* Banner Info */}
        <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4 flex gap-3 items-start">
            <Info className="w-4 h-4 text-purple-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-purple-900">Pusat Layanan Administrasi Surat</p>
              <p className="text-xs text-purple-800 leading-relaxed">
                Halaman ini memungkinkan Anda untuk membuat berbagai jenis surat keterangan dan pengantar secara otomatis
                dengan mengambil data dari database kependudukan atau menginput manual untuk non-warga.
              </p>
            </div>
          </div>

        {/* Fungsi Utama Section */}
        <section className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium text-primary-text flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600"/> Fungsi Utama</h2>
          <p className="text-xs text-secondary-text leading-relaxed">
            Halaman ini adalah pusat layanan administrasi untuk warga. Berfungsi untuk membuat surat keterangan,
            surat pengantar, dan berbagai jenis surat resmi lainnya dengan mengambil data otomatis dari
            database kependudukan.
          </p>
        </section>

        {/* Langkah-Langkah Pencetakan Surat Section */}
        <section className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium text-primary-text flex items-center gap-2"><ClipboardList className="w-4 h-4 text-emerald-600"/> Langkah-Langkah Pencetakan Surat</h2>

          {/* A. Pilih Jenis Surat */}
          <div className="pb-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">A</span>
              Pilih Jenis Surat
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                  <input
                    type="text"
                    placeholder="Cari jenis surat..."
                    value={letterSearchTerm}
                    onChange={(e) => setLetterSearchTerm(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary-text/20 transition-all"
                  />
              </div>
            </div>
            
            {loadingData ? (
               <div className="flex items-center justify-center py-8">
                 <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                 <span className="ml-2 text-xs text-secondary-text">Memuat jenis surat...</span>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {filteredLetterTypes.length > 0 ? (
                  filteredLetterTypes.map((type) => (
                    <label 
                      key={type.id} 
                      className={`flex items-center p-2 border rounded-md transition-colors cursor-pointer text-xs ${
                        selectedLetterType?.id === type.id 
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                          : 'bg-white border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="letterType" 
                        className="mr-2 accent-blue-600"
                        checked={selectedLetterType?.id === type.id}
                        onChange={() => setSelectedLetterType(type)}
                      />
                      <span className={`${selectedLetterType?.id === type.id ? 'text-blue-700 font-medium' : 'text-secondary-text'}`}>
                        {type.nama}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="col-span-full text-center py-4 text-xs text-zinc-400">
                    Tidak ada jenis surat yang ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* B. Input Data Pemohon */}
          <div className="pb-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">B</span>
              Input Data Pemohon
            </h3>
            
            <div className="flex flex-col gap-3">
              {/* Toggle Warga / Non Warga */}
              <label htmlFor="nonWarga" className="flex items-center text-xs text-secondary-text cursor-pointer w-fit">
                <input 
                  type="checkbox" 
                  id="nonWarga" 
                  className="mr-2 accent-blue-600" 
                  checked={isNonWarga}
                  onChange={(e) => {
                    setIsNonWarga(e.target.checked);
                    if (e.target.checked) {
                      handleClearResident();
                    }
                  }}
                />
                Penduduk Non-Warga (Input Manual)
              </label>

              {/* Resident Search (Shown if Warga) */}
              {!isNonWarga && (
                <div className="relative" ref={residentSearchRef}>
                  <div className="relative">
                      <UsersIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                      <input
                        type="text"
                        placeholder={selectedResident ? "Penduduk terpilih..." : "Cari Nama / NIK penduduk..."}
                        value={residentSearchTerm}
                        onChange={(e) => setResidentSearchTerm(e.target.value)}
                        onFocus={() => {
                          if (residentSearchTerm) setShowResidentDropdown(true);
                        }}
                        className={`w-full bg-white border rounded-md pl-8 pr-8 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary-text/20 transition-all ${
                          selectedResident ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-zinc-200'
                        }`}
                      />
                      {selectedResident && (
                        <button 
                          onClick={handleClearResident}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                  
                  {/* Dropdown Results */}
                  {showResidentDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {loadingData ? (
                        <div className="p-3 text-center text-xs text-zinc-400">
                          Memuat data...
                        </div>
                      ) : filteredResidents.length > 0 ? (
                        filteredResidents.map((resident) => (
                          <div
                            key={resident.id || resident.nik}
                            onClick={() => handleResidentSelect(resident)}
                            className="p-2 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0"
                          >
                            <p className="text-xs font-medium text-primary-text">{resident.nama}</p>
                            <p className="text-[10px] text-secondary-text">NIK: {resident.nik} | {resident.alamat_saat_ini || "Alamat tidak tersedia"}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-zinc-400">
                          Tidak ada penduduk ditemukan.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Input Fields (Shown if Non Warga OR if selected resident data needs editing - optional) */}
              {(isNonWarga) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input type="text" placeholder="Nama Lengkap" className="p-2 border border-zinc-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500" />
                  <input type="text" placeholder="NIK (KTP)" className="p-2 border border-zinc-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500" />
                  <input type="text" placeholder="Tempat Lahir" className="p-2 border border-zinc-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500" />
                  <input type="date" placeholder="Tanggal Lahir" className="p-2 border border-zinc-200 rounded-md text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500" />
                  <select className="p-2 border border-zinc-200 rounded-md text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  <input type="text" placeholder="Agama" className="p-2 border border-zinc-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500" />
                  <input type="text" placeholder="Pekerjaan" className="p-2 border border-zinc-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500" />
                  <textarea placeholder="Alamat Lengkap" rows={3} className="md:col-span-2 p-2 border border-zinc-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
              )}
            </div>
          </div>

          {/* C. Mengisi Formulir Data Surat */}
          <div className="pb-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">C</span>
              Mengisi Formulir Data Surat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="nomorSurat" className="block text-xs font-medium text-gray-700 mb-1">Nomor Surat</label>
                <input type="text" id="nomorSurat" placeholder="Nomor Surat" className="p-2 border border-zinc-200 rounded-md w-full text-xs focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="keperluanTujuan" className="block text-xs font-medium text-gray-700 mb-1">Keperluan / Tujuan</label>
                <textarea id="keperluanTujuan" placeholder="Alasan pembuatan surat (Contoh: Melamar Pekerjaan)" rows={2} className="p-2 border border-zinc-200 rounded-md w-full text-xs focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="keteranganLain" className="block text-xs font-medium text-gray-700 mb-1">Keterangan Lain</label>
                <textarea id="keteranganLain" placeholder="Data tambahan sesuai jenis surat (Contoh: Tanggal kejadian, Nama instansi tujuan, dsb)" rows={2} className="p-2 border border-zinc-200 rounded-md w-full text-xs focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div>
                <label htmlFor="berlakuMulai" className="block text-xs font-medium text-gray-700 mb-1">Berlaku Mulai</label>
                <input type="date" id="berlakuMulai" className="p-2 border border-zinc-200 rounded-md w-full text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="berlakuSampai" className="block text-xs font-medium text-gray-700 mb-1">Berlaku Sampai</label>
                <input type="date" id="berlakuSampai" className="p-2 border border-zinc-200 rounded-md w-full text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* D. Pemilihan Penandatangan */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">D</span>
              Pemilihan Penandatangan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="stafSekretariat" className="block text-xs font-medium text-gray-700 mb-1">Staf Sekretariat</label>
                <select id="stafSekretariat" className="p-2 border border-zinc-200 rounded-md w-full text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Pilih Staf</option>
                  <option value="staf1">Staf 1</option>
                  <option value="staf2">Staf 2</option>
                </select>
              </div>
              <div>
                <label htmlFor="pejabatPenandatangan" className="block text-xs font-medium text-gray-700 mb-1">Pejabat Penandatangan</label>
                <select id="pejabatPenandatangan" className="p-2 border border-zinc-200 rounded-md w-full text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Pilih Pejabat</option>
                  <option value="kepalaDesa">Kepala Desa</option>
                  <option value="sekretaris">Sekretaris</option>
                </select>
              </div>
              <div>
                <label htmlFor="jabatanAtasNama" className="block text-xs font-medium text-gray-700 mb-1">Jabatan Atas Nama</label>
                <select id="jabatanAtasNama" className="p-2 border border-zinc-200 rounded-md w-full text-xs text-secondary-text focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Pilih Jabatan</option>
                  <option value="anKepalaDesa">A.n. Kepala Desa</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Output & Pengarsipan Section */}
        <section className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium text-primary-text flex items-center gap-2"><Printer className="w-4 h-4 text-purple-600"/> Output & Pengarsipan</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-grow flex items-center justify-center gap-1.5 text-xs bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 transition-colors font-medium">
              <Download className="w-3.5 h-3.5"/>
              <span>Unduh RTF/DOCX</span>
            </button>
            <button className="flex-grow flex items-center justify-center gap-1.5 text-xs bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors font-medium">
              <Download className="w-3.5 h-3.5"/>
              <span>Unduh PDF</span>
            </button>
            <button className="flex-grow flex items-center justify-center gap-1.5 text-xs bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors font-medium">
              <Archive className="w-3.5 h-3.5"/>
              <span>Arsip Surat</span>
            </button>
          </div>
        </section>

        {/* Fitur Pendukung Section */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-primary-text flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-600"/> Fitur Pendukung</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="border border-zinc-200 rounded-md p-3 flex flex-col items-center justify-center bg-zinc-50 hover:bg-white transition-colors cursor-pointer">
              <ListChecks className="w-5 h-5 text-blue-600 mb-2"/>
              <p className="text-xs text-primary-text font-medium">Syarat Surat</p>
            </div>
            <div className="border border-zinc-200 rounded-md p-3 flex flex-col items-center justify-center bg-zinc-50 hover:bg-white transition-colors cursor-pointer">
              <History className="w-5 h-5 text-green-600 mb-2"/>
              <p className="text-xs text-primary-text font-medium">Rekam Jejak</p>
            </div>
            <div className="border border-zinc-200 rounded-md p-3 flex flex-col items-center justify-center bg-zinc-50 hover:bg-white transition-colors cursor-pointer">
              <BarChart2 className="w-5 h-5 text-red-600 mb-2"/>
              <p className="text-xs text-primary-text font-medium">Statistik Surat</p>
            </div>
          </div>
        </section>

        {/* Catatan Penting Section */}
        <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-yellow-900">Catatan Penting</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-yellow-800 leading-relaxed">
              <li><strong>Kelengkapan Data:</strong> Jika data alamat atau pekerjaan penduduk kosong pada surat, silakan lengkapi dulu di modul [Penduduk].</li>
              <li><strong>Penomoran Otomatis:</strong> Pastikan nomor surat terakhir sudah disesuaikan agar tidak terjadi duplikasi nomor dengan surat fisik.</li>
              <li><strong>Tandatangan Digital:</strong> Jika fitur diaktifkan, QR Code validasi akan muncul secara otomatis pada hasil cetakan surat.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CetakSuratPage;


