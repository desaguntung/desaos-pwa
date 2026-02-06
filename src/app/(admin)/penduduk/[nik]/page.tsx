"use client";

import { ArrowLeft, Edit, Trash2, MapPin, Calendar, User, Briefcase, Heart, BookOpen, Phone, Mail, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getResidentByNIK, Resident, deleteResident } from "@/lib/services/penduduk";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DetailPendudukPage() {
  const router = useRouter();
  const params = useParams();
  const nik = params.nik as string;
  
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const resource: PermissionResource = "penduduk";
  const { canUpdate, canDelete } = useRbac(resource);

  useEffect(() => {
    if (nik) {
      fetchResident();
    }
  }, [nik]);

  const fetchResident = async () => {
    try {
      setLoading(true);
      const decodedNik = decodeURIComponent(nik);
      const data = await getResidentByNIK(decodedNik);
      setResident(data);
    } catch (error) {
      console.error("Error fetching resident:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resident?.id) return;
    if (confirm("Apakah Anda yakin ingin menghapus data penduduk ini?")) {
      try {
        await deleteResident(resident.id);
        router.push("/penduduk");
      } catch (error) {
        console.error("Error deleting resident:", error);
        alert("Gagal menghapus data penduduk");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-body-bg">
        <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-sm text-secondary-text">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-screen bg-body-bg gap-4">
            <div className="w-16 h-16 bg-body-bg rounded-full flex items-center justify-center mb-2">
                <User className="w-8 h-8 text-secondary-text" />
            </div>
            <h2 className="text-lg font-semibold text-primary-text">Data Tidak Ditemukan</h2>
            <p className="text-sm text-secondary-text max-w-md text-center">
                Data penduduk dengan NIK {nik} tidak ditemukan atau telah dihapus.
            </p>
            <Link href="/penduduk" className="px-4 py-2 bg-card-bg border border-border-color rounded-md text-sm font-medium text-primary-text hover:bg-body-bg transition-colors mt-4">
                Kembali ke Daftar
            </Link>
        </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-color">
        <Icon className="w-4 h-4 text-secondary-text" />
        <h3 className="text-sm font-semibold text-primary-text uppercase tracking-wide">{title}</h3>
    </div>
  );

  const DetailItem = ({ label, value }: { label: string, value?: string | number | null }) => (
    <div className="group">
        <dt className="text-[11px] font-medium text-secondary-text uppercase tracking-wider mb-1">{label}</dt>
        <dd className="text-sm font-medium text-primary-text break-words">{value || "-"}</dd>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-body-bg">
      {/* Header */}
      <PageHeader
        title="Detail Penduduk"
        subtitle={`${resident.nik} • ${resident.status_penduduk || "Aktif"}`}
        showBackButton={true}
        backButtonHref="/penduduk"
        actions={
          <div className="flex items-center gap-2">
            {canUpdate && (
                <Link 
                    href={`/penduduk/edit/${resident.nik}`} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-text bg-card-bg border border-border-color rounded-md hover:bg-body-bg hover:text-primary-text transition-colors"
                >
                    <Edit className="w-3.5 h-3.5" /> 
                    <span>Edit</span>
                </Link>
            )}
             {canDelete && (
                <button 
                    onClick={handleDelete} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-card-bg border border-rose-200 dark:border-rose-900/30 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" /> 
                    <span>Hapus</span>
                </button>
            )}
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Top Card: Main Identity */}
            <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Photo Placeholder */}
                    <div className="w-24 h-24 bg-body-bg rounded-lg flex items-center justify-center shrink-0 border border-border-color">
                        {resident.foto_url ? (
                            <img src={resident.foto_url} alt={resident.nama} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <User className="w-10 h-10 text-secondary-text" />
                        )}
                    </div>
                    
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DetailItem label="Nama Lengkap" value={resident.nama} />
                            <DetailItem label="NIK" value={resident.nik} />
                            <DetailItem label="Nomor KK" value={resident.no_kk} />
                            <DetailItem label="Jenis Kelamin" value={resident.jenis_kelamin} />
                            <DetailItem label="Tempat Lahir" value={resident.tempat_lahir} />
                            <DetailItem label="Tanggal Lahir" value={resident.tanggal_lahir} />
                            <DetailItem label="Agama" value={resident.agama} />
                            <DetailItem label="Warga Negara" value={resident.kewarganegaraan} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status & Pendidikan */}
                <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6 h-full">
                    <SectionHeader icon={BookOpen} title="Status & Pendidikan" />
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <DetailItem label="Status Perkawinan" value={resident.status_kawin} />
                        <DetailItem label="Hubungan Keluarga" value={resident.hubungan_keluarga} />
                        <DetailItem label="Pendidikan Terakhir" value={resident.pendidikan_kk} />
                        <DetailItem label="Pekerjaan" value={resident.pekerjaan} />
                    </div>
                </div>

                {/* Alamat & Kontak */}
                <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6 h-full">
                    <SectionHeader icon={MapPin} title="Alamat & Kontak" />
                    <div className="space-y-4">
                        <DetailItem label="Alamat Saat Ini" value={resident.alamat_saat_ini} />
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="RT / RW" value={`${resident.rt || '-'} / ${resident.rw || '-'}`} />
                            <DetailItem label="Dusun" value={resident.dusun} />
                            <DetailItem label="Telepon" value={resident.telepon} />
                            <DetailItem label="Email" value={resident.email} />
                        </div>
                    </div>
                </div>

                {/* Data Orang Tua */}
                <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6 h-full">
                    <SectionHeader icon={User} title="Data Orang Tua" />
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <DetailItem label="NIK Ayah" value={resident.nik_ayah} />
                        <DetailItem label="Nama Ayah" value={resident.nama_ayah} />
                        <DetailItem label="NIK Ibu" value={resident.nik_ibu} />
                        <DetailItem label="Nama Ibu" value={resident.nama_ibu} />
                    </div>
                </div>

                {/* Data Tambahan */}
                <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6 h-full">
                    <SectionHeader icon={Activity} title="Data Kesehatan & Lainnya" />
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <DetailItem label="Golongan Darah" value={resident.golongan_darah} />
                        <DetailItem label="Cacat Fisik/Mental" value={resident.cacat_fisik_mental} />
                        <DetailItem label="Sakit Menahun" value={resident.sakit_menahun} />
                        <DetailItem label="Akseptor KB" value={resident.akseptor_kb} />
                        <DetailItem label="No. Paspor" value={resident.no_paspor} />
                        <DetailItem label="No. KITAP" value={resident.no_kitap} />
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6 mb-10">
                <SectionHeader icon={FileText} title="Dokumen Pendukung" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "Scan KTP", url: resident.scan_ktp_url },
                        { label: "Scan KK", url: resident.scan_kk_url },
                        { label: "Akta Lahir", url: resident.scan_akta_lahir_url },
                        { label: "Akta Nikah", url: resident.scan_akta_nikah_url },
                        { label: "Ijazah", url: resident.scan_ijazah_url },
                        { label: "Paspor", url: resident.scan_paspor_url },
                    ].map((doc, idx) => (
                        <div key={idx} className="p-3 border border-border-color rounded-lg bg-body-bg flex items-center justify-between">
                            <span className="text-xs font-medium text-secondary-text">{doc.label}</span>
                            {doc.url ? (
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    Lihat
                                </a>
                            ) : (
                                <span className="text-xs text-secondary-text italic opacity-70">Tidak ada</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
