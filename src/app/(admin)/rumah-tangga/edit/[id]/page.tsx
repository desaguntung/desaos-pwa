"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  UserPlus,
  Home,
  Trash2,
} from "lucide-react";
import { useRbac } from "@/useRbac";
import { PermissionResource } from "@/config/permissions";
import {
  addMemberToRumahTangga,
  getRumahTanggaById,
  RumahTangga,
  updateRumahTangga,
  removeMemberFromRumahTangga,
} from "@/lib/services/rumah_tangga";
import { getResidents, Resident } from "@/lib/services/penduduk";
import { PageHeader } from "@/components/layout/PageHeader";

type SelectedMember = {
  resident: Resident;
};

function EditRumahTanggaPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const resource: PermissionResource = "rumah_tangga";
  const { canUpdate } = useRbac(resource);

  const [rumahTangga, setRumahTangga] = useState<RumahTangga | null>(null);
  const [candidates, setCandidates] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedHead, setSelectedHead] = useState<Resident | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [originalMemberIds, setOriginalMemberIds] = useState<string[]>([]);

  const [nomorRTM, setNomorRTM] = useState("");
  const [tglDaftar, setTglDaftar] = useState("");
  const [kelasSosial, setKelasSosial] = useState("");
  const [bdt, setBdt] = useState("");
  const [alamat, setAlamat] = useState("");
  const [dusun, setDusun] = useState("");
  const [rw, setRw] = useState("");
  const [rt, setRt] = useState("");
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const id = params.id;
        const detail = await getRumahTanggaById(String(id));
        const residentsWithoutRt = await getResidents({ rumahTanggaId: null });

        if (!detail) {
          setErrorMessage("Data rumah tangga tidak ditemukan.");
          return;
        }

        setRumahTangga(detail);
        setCandidates(residentsWithoutRt);

        setNomorRTM(detail.no_rtm);
        setTglDaftar(detail.tgl_daftar || "");
        setKelasSosial(
          typeof detail.kelas_sosial === "number"
            ? String(detail.kelas_sosial)
            : "",
        );
        setBdt(detail.bdt || "");
        setAlamat(detail.alamat || "");
        setDusun(detail.dusun || "");
        setRw(detail.rw || "");
        setRt(detail.rt || "");
        setKeterangan(detail.keterangan || "");

        const anggota = detail.anggota || [];
        const head = detail.kepala_rtm || null;
        setSelectedHead(head);

        const combinedMembers: Resident[] = [];
        if (head) {
          combinedMembers.push(head);
        }
        anggota.forEach((item) => {
          const exists = combinedMembers.some(
            (member) => member.id && item.id && member.id === item.id,
          );
          if (!exists) {
            combinedMembers.push(item);
          }
        });

        setSelectedMembers(
          combinedMembers.map((resident) => ({
            resident,
          })),
        );

        const originalIds = combinedMembers
          .map((resident) => (resident.id ? String(resident.id) : null))
          .filter((id): id is string => Boolean(id));
        setOriginalMemberIds(originalIds);
      } catch (error) {
        console.error("Error memuat detail rumah tangga:", error);
        setErrorMessage("Gagal memuat detail rumah tangga.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const availableMembers = useMemo(() => {
    const selectedIds = new Set(
      selectedMembers
        .map((item) => item.resident.id)
        .filter((id): id is string => Boolean(id)),
    );
    return candidates.filter((resident) => {
      if (!resident.id) {
        return false;
      }
      if (selectedIds.has(String(resident.id))) {
        return false;
      }
      if (selectedHead && resident.id === selectedHead.id) {
        return false;
      }
      return true;
    });
  }, [candidates, selectedMembers, selectedHead]);

  const handleChangeHead = (residentId: string) => {
    const allMembers = selectedMembers.map((item) => item.resident);
    const candidate = allMembers.find(
      (resident) => resident.id && String(resident.id) === residentId,
    );
    if (!candidate) {
      return;
    }
    setSelectedHead(candidate);
  };

  const handleAddMember = (residentId: string) => {
    const resident = candidates.find(
      (item) => item.id && String(item.id) === residentId,
    );
    if (!resident) {
      return;
    }
    setSelectedMembers((prev) => {
      const exists = prev.some(
        (item) => item.resident.id && resident.id && item.resident.id === resident.id,
      );
      if (exists) {
        return prev;
      }
      return [...prev, { resident }];
    });
  };

  const handleRemoveMember = (residentId: string) => {
    setSelectedMembers((prev) =>
      prev.filter(
        (item) =>
          !(item.resident.id && item.resident.id === residentId),
      ),
    );
    if (selectedHead && selectedHead.id === residentId) {
      setSelectedHead(null);
    }
  };

  const handleSave = async () => {
    if (!rumahTangga) {
      return;
    }
    if (!canUpdate) {
      setErrorMessage("Anda tidak memiliki hak untuk mengubah data rumah tangga.");
      return;
    }
    if (!selectedHead || !selectedHead.id) {
      setErrorMessage("Pilih Kepala Rumah Tangga terlebih dahulu.");
      return;
    }
    const noRtm = nomorRTM.trim();
    if (!noRtm) {
      setErrorMessage("Nomor Rumah Tangga wajib diisi.");
      return;
    }
    if (selectedMembers.length === 0) {
      setErrorMessage("Tambahkan minimal satu anggota rumah tangga.");
      return;
    }
    setErrorMessage(null);

    try {
      setSaving(true);

      const payload: Partial<RumahTangga> = {
        no_rtm: noRtm,
        kepala_rtm_id: selectedHead.id,
        tgl_daftar: tglDaftar || new Date().toISOString().slice(0, 10),
        kelas_sosial: kelasSosial ? Number(kelasSosial) : undefined,
        bdt: bdt || undefined,
        alamat: alamat || undefined,
        dusun: dusun || undefined,
        rw: rw || undefined,
        rt: rt || undefined,
        keterangan: keterangan || undefined,
      };

      const updated = await updateRumahTangga(rumahTangga.id, payload);

      const newMemberIds = selectedMembers
        .map((item) => (item.resident.id ? String(item.resident.id) : null))
        .filter((id): id is string => Boolean(id));

      const removedIds = originalMemberIds.filter(
        (id) => !newMemberIds.includes(id),
      );

      const addUpdates = newMemberIds.map((id) =>
        addMemberToRumahTangga(updated.id, id),
      );
      const removeUpdates = removedIds.map((id) =>
        removeMemberFromRumahTangga(id),
      );

      await Promise.all([...addUpdates, ...removeUpdates]);

      router.push("/rumah-tangga");
    } catch (error) {
      console.error("Error memperbarui data rumah tangga:", error);
      setErrorMessage("Gagal menyimpan perubahan rumah tangga.");
    } finally {
      setSaving(false);
    }
  };

  if (!canUpdate) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="p-6">
          <p className="text-sm text-secondary-text">
            Anda tidak memiliki hak untuk mengubah data rumah tangga.
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

  if (!rumahTangga) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="p-6">
          <p className="text-sm text-secondary-text">
            Data rumah tangga tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader
        title="Edit Rumah Tangga"
        subtitle="Sesuaikan informasi dan anggota Rumah Tangga."
        showBackButton={true}
        backButtonHref="/rumah-tangga"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs bg-zinc-900 text-white rounded-md px-3 py-2 hover:bg-zinc-800 disabled:opacity-60 transition-colors font-medium h-9"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-full mx-auto w-full space-y-6 pb-12">
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md px-3 py-2">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3 flex items-center gap-2 bg-zinc-50/50">
              <UsersIcon className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs font-medium text-zinc-900">
                  Anggota Rumah Tangga
                </p>
                <p className="text-[11px] text-zinc-500">
                  Atur Kepala Rumah Tangga dan anggota.
                </p>
              </div>
            </div>
            <div className="p-4 space-y-5">
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-zinc-500">
                  Kepala Rumah Tangga
                </p>
                {selectedHead ? (
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5">
                    <div>
                      <p className="text-xs font-medium text-zinc-900">
                        {selectedHead.nama}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        NIK {selectedHead.nik}
                      </p>
                    </div>
                    <select
                      className="bg-white border border-zinc-200 rounded-md px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                      value={selectedHead.id ? String(selectedHead.id) : ""}
                      onChange={(event) =>
                        handleChangeHead(event.target.value)
                      }
                    >
                      {selectedMembers.map((item) =>
                        item.resident.id ? (
                          <option
                            key={item.resident.id}
                            value={String(item.resident.id)}
                          >
                            {item.resident.nik} - {item.resident.nama}
                          </option>
                        ) : null,
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic px-3 py-2.5 border border-dashed border-zinc-200 rounded-md bg-zinc-50/50">
                    Belum ada Kepala Rumah Tangga dipilih.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium text-zinc-500">
                  Daftar Anggota
                </p>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-200">
                        <th className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2.5 min-w-[140px]">
                          NIK
                        </th>
                        <th className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2.5 min-w-[140px]">
                          Nama
                        </th>
                        <th className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2.5 min-w-[60px] text-center">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs">
                      {selectedMembers.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-6 text-center text-zinc-500 text-xs italic"
                          >
                            Belum ada anggota rumah tangga.
                          </td>
                        </tr>
                      )}
                      {selectedMembers.map((item) =>
                        item.resident.id ? (
                          <tr key={item.resident.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-3 py-2.5 text-xs text-zinc-600 font-mono">
                            {item.resident.nik}
                          </td>
                            <td className="px-3 py-2.5 text-xs text-zinc-900 font-medium">
                              {item.resident.nama.toUpperCase()}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveMember(String(item.resident.id))
                                }
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ) : null,
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium text-zinc-500">
                  Tambah Anggota Dari Penduduk Tanpa Rumah Tangga
                </p>
                <select
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  defaultValue=""
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      return;
                    }
                    handleAddMember(value);
                    event.target.value = "";
                  }}
                >
                  <option value="">Pilih penduduk...</option>
                  {availableMembers.map((resident) =>
                    resident.id ? (
                      <option key={resident.id} value={String(resident.id)}>
                        {resident.nik} - {resident.nama.toUpperCase()}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3 flex items-center gap-2 bg-zinc-50/50">
              <Home className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs font-medium text-zinc-900">
                  Detail Rumah Tangga
                </p>
                <p className="text-[11px] text-zinc-500">
                  Perbarui informasi dasar Rumah Tangga.
                </p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    Nomor Rumah Tangga (RTM)
                  </label>
                  <input
                    type="text"
                    value={nomorRTM}
                    onChange={(event) => setNomorRTM(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Masukkan nomor RTM..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    Tanggal Daftar RTM
                  </label>
                  <input
                    type="date"
                    value={tglDaftar}
                    onChange={(event) => setTglDaftar(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    Kelas Sosial
                  </label>
                  <input
                    type="number"
                    value={kelasSosial}
                    onChange={(event) => setKelasSosial(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Contoh: 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    Nomor BDT/DTKS
                  </label>
                  <input
                    type="text"
                    value={bdt}
                    onChange={(event) => setBdt(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Masukkan nomor BDT/DTKS..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-500">
                  Alamat Rumah Tangga
                </label>
                <textarea
                  value={alamat}
                  onChange={(event) => setAlamat(event.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all min-h-[60px] placeholder:text-zinc-400"
                  placeholder="Masukkan alamat lengkap..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    Dusun
                  </label>
                  <input
                    type="text"
                    value={dusun}
                    onChange={(event) => setDusun(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Nama dusun..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    RW
                  </label>
                  <input
                    type="text"
                    value={rw}
                    onChange={(event) => setRw(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-500">
                    RT
                  </label>
                  <input
                    type="text"
                    value={rt}
                    onChange={(event) => setRt(event.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-500">
                  Keterangan Tambahan
                </label>
                <textarea
                  value={keterangan}
                  onChange={(event) => setKeterangan(event.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all min-h-[60px] placeholder:text-zinc-400"
                  placeholder="Tambahkan keterangan jika ada..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditRumahTanggaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
          <div className="p-6">
            <p className="text-sm text-secondary-text">
              Memuat halaman edit rumah tangga...
            </p>
          </div>
        </div>
      }
    >
      <EditRumahTanggaPageInner />
    </Suspense>
  );
}


