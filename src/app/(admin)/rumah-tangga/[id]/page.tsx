"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  User,
  Users as UsersIcon,
} from "lucide-react";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import { getRumahTanggaById, RumahTangga } from "@/lib/services/rumah_tangga";
import { Resident } from "@/lib/services/penduduk";
import { PageHeader } from "@/components/layout/PageHeader";

type DetailRumahTangga = RumahTangga & {
  anggota?: Resident[];
};

function DetailRumahTanggaPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const resource: PermissionResource = "rumah_tangga";
  const { canRead, canUpdate } = useRbac(resource);

  const [data, setData] = useState<DetailRumahTangga | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const id = params.id;
        const detail = await getRumahTanggaById(String(id));
        if (!detail) {
          setErrorMessage("Data rumah tangga tidak ditemukan.");
          return;
        }
        setData(detail as DetailRumahTangga);
      } catch (error) {
        console.error("Error memuat detail rumah tangga:", error);
        setErrorMessage("Gagal memuat detail rumah tangga.");
      } finally {
        setLoading(false);
      }
    };
    if (canRead) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [params.id, canRead]);

  if (!canRead) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="p-6">
          <p className="text-sm text-secondary-text">
            Anda tidak memiliki hak untuk melihat data rumah tangga.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="p-6">
          <p className="text-sm text-secondary-text">
            Memuat detail rumah tangga...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="p-6">
          <p className="text-sm text-secondary-text">
            {errorMessage || "Data rumah tangga tidak ditemukan."}
          </p>
        </div>
      </div>
    );
  }

  const anggota = data.anggota || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader
        title="Detail Rumah Tangga"
        subtitle="Lihat komposisi anggota dan informasi dasar Rumah Tangga."
        showBackButton={true}
        backButtonHref="/rumah-tangga"
        actions={
          <div className="flex items-center gap-2">
            {canUpdate && (
              <Link
                href={`/rumah-tangga/edit/${data.id}`}
                className="flex items-center gap-1.5 text-xs bg-primary-text text-body-bg rounded-md px-3 py-1.5 hover:opacity-90 transition-opacity font-medium"
              >
                <User className="w-3.5 h-3.5" />
                <span>Edit Rumah Tangga</span>
              </Link>
            )}
          </div>
        }
      />

      <div className="p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {errorMessage && (
          <div className="bg-error-bg border border-error-border text-error-text text-xs rounded-md px-3 py-2">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card-bg border border-border-color rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-secondary-text" />
              <p className="text-xs font-medium text-primary-text">
                Informasi Rumah Tangga
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-primary-text">
              <div>
                <p className="text-secondary-text">Nomor RTM</p>
                <p className="font-semibold">{data.no_rtm}</p>
              </div>
              <div>
                <p className="text-secondary-text">Tanggal Daftar</p>
                <p className="font-semibold">
                  {data.tgl_daftar || "-"}
                </p>
              </div>
              <div>
                <p className="text-secondary-text">Kepala Rumah Tangga</p>
                <p className="font-semibold">
                  {(data.kepala_rtm?.nama || "-").toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-secondary-text">NIK Kepala</p>
                <p className="">
                  {data.kepala_rtm?.nik || "-"}
                </p>
              </div>
              <div>
                <p className="text-secondary-text">Kelas Sosial</p>
                <p className="font-semibold">
                  {typeof data.kelas_sosial === "number"
                    ? data.kelas_sosial
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-secondary-text">Nomor BDT/DTKS</p>
                <p className="font-semibold">
                  {data.bdt || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-secondary-text">Alamat</p>
                <p className="font-semibold">
                  {data.alamat || "-"}
                </p>
              </div>
              <div>
                <p className="text-secondary-text">Dusun</p>
                <p className="font-semibold">
                  {data.dusun || "-"}
                </p>
              </div>
              <div>
                <p className="text-secondary-text">RW / RT</p>
                <p className="font-semibold">
                  {(data.rw || "-") + " / " + (data.rt || "-")}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-secondary-text">Keterangan</p>
                <p className="font-semibold">
                  {data.keterangan || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-border-color rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-secondary-text" />
              <div>
                <p className="text-xs font-medium text-primary-text">
                  Ringkasan Anggota
                </p>
                <p className="text-[10px] text-secondary-text">
                  Komposisi dasar rumah tangga.
                </p>
              </div>
            </div>
            <div className="space-y-1 text-[11px] text-primary-text">
              <p>
                <span className="text-secondary-text">Jumlah Anggota:</span>{" "}
                <span className="font-semibold">{anggota.length}</span>
              </p>
              <p>
                <span className="text-secondary-text">Status Bansos:</span>{" "}
                <span className="font-semibold">
                  {data.bdt ? "Penerima (BDT/DTKS terisi)" : "Bukan penerima"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden">
          <div className="border-b border-border-color px-4 py-3 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-secondary-text" />
            <div>
              <p className="text-xs font-medium text-primary-text">
                Daftar Anggota Rumah Tangga
              </p>
              <p className="text-[10px] text-secondary-text">
                Diturunkan dari data penduduk dan keluarga.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-body-bg border-b border-border-color">
                  <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-2 min-w-[40px] text-center">
                    No.
                  </th>
                  <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-2 min-w-[140px]">
                    NIK
                  </th>
                  <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-2 min-w-[160px]">
                    Nama
                  </th>
                  <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-2 min-w-[100px]">
                    JK
                  </th>
                  <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-2 min-w-[140px]">
                    Nomor KK
                  </th>
                  <th className="text-[10px] font-bold text-secondary-text uppercase tracking-wider px-4 py-2 min-w-[140px]">
                    Hubungan Keluarga
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color text-xs">
                {anggota.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-secondary-text text-[11px]"
                    >
                      Belum ada anggota untuk Rumah Tangga ini.
                    </td>
                  </tr>
                )}
                {anggota.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-4 py-2 text-center text-[11px] text-secondary-text">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-primary-text">
                      {item.nik}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-primary-text">
                      {item.nama.toUpperCase()}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-secondary-text">
                      {item.jenis_kelamin}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-primary-text">
                      {item.no_kk}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-primary-text">
                      {item.hubungan_keluarga}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailRumahTanggaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
          <div className="p-6">
            <p className="text-sm text-secondary-text">
              Memuat detail rumah tangga...
            </p>
          </div>
        </div>
      }
    >
      <DetailRumahTanggaPageInner />
    </Suspense>
  );
}


