import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident, getResidents, updateResident, mapResidentFromDb } from "./penduduk";

export interface Keluarga {
  nomorKK: string;
  headName: string;
  headNik: string;
  addressLine: string;
  dusun: string;
  dusunRwRt: string;
  totalMembers: number;
  status: string;
  statusVariant: "success" | "error" | "info" | "default";
  members: Resident[]; // Keep members sorted for detail/official KK view
}

/**
 * Standard Indonesian Dukcapil Family Hierarchy Rank:
 * 1. KEPALA KELUARGA
 * 2. SUAMI
 * 3. ISTRI
 * 4. ANAK (sorted by birth date ascending - oldest child first)
 * 5. MENANTU
 * 6. CUCU (sorted by birth date ascending)
 * 7. ORANG TUA / AYAH / IBU
 * 8. MERTUA
 * 9. FAMILI LAIN
 * 10. PEMBANTU
 * 11. LAINNYA
 */
export const getHubunganKeluargaRank = (hubungan?: string, hubunganId?: number | string): number => {
  if (hubunganId) {
    const num = Number(hubunganId);
    if (!isNaN(num) && num >= 1 && num <= 11) return num;
  }
  const h = (hubungan || "").trim().toUpperCase();
  if (h.includes("KEPALA")) return 1;
  if (h === "SUAMI") return 2;
  if (h === "ISTRI") return 3;
  if (h === "ANAK") return 4;
  if (h === "MENANTU") return 5;
  if (h === "CUCU") return 6;
  if (h.includes("ORANG TUA") || h === "AYAH" || h === "IBU") return 7;
  if (h.includes("MERTUA")) return 8;
  if (h.includes("FAMILI")) return 9;
  if (h.includes("PEMBANTU")) return 10;
  return 11;
};

export const sortFamilyMembers = (members: Resident[]): Resident[] => {
  return [...members].sort((a, b) => {
    const rankA = getHubunganKeluargaRank(a.hubungan_keluarga, (a as any).hubungan_keluarga_id);
    const rankB = getHubunganKeluargaRank(b.hubungan_keluarga, (b as any).hubungan_keluarga_id);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // If both are Anak or Cucu, sort by birth date (oldest child first)
    if (a.tanggal_lahir && b.tanggal_lahir) {
      const timeA = new Date(a.tanggal_lahir).getTime();
      const timeB = new Date(b.tanggal_lahir).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeA - timeB;
      }
    }

    // Secondary fallback: NIK or Name
    return (a.nama || "").localeCompare(b.nama || "");
  });
};

export async function getFamilyByNoKK(noKK: string): Promise<Keluarga | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("penduduk")
    .select("*")
    .eq("no_kk", noKK);

  if (error) {
    console.error("Error fetching family by No. KK:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const mappedMembers = data.map(mapResidentFromDb);
  const sortedMembers = sortFamilyMembers(mappedMembers);

  const head =
    sortedMembers.find(
      (m) =>
        (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA" ||
        (m as any).hubungan_keluarga_id === 1
    ) ?? sortedMembers[0];

  const headName = head.nama ?? "";
  const headNik = head.nik ?? "";

  const dusun = head.dusun || "";
  const rw = head.rw || "";
  const rt = head.rt || "";
  const wilayahParts: string[] = [];
  if (dusun) wilayahParts.push(`Dusun ${dusun}`);
  if (rw) wilayahParts.push(`RW ${rw}`);
  if (rt) wilayahParts.push(`RT ${rt}`);
  const dusunRwRt = wilayahParts.length > 0 ? wilayahParts.join(" / ") : "";

  const addressLine =
    head.alamat_saat_ini ||
    head.alamat_rt ||
    head.alamat_sebelumnya ||
    "";

  const statusPenduduk = head.status_penduduk || "Aktif";
  let statusVariant: "success" | "error" | "info" | "default" = "success";
  if (statusPenduduk === "Meninggal") {
    statusVariant = "error";
  } else if (statusPenduduk === "Pindah") {
    statusVariant = "info";
  }

  return {
    nomorKK: noKK,
    headName,
    headNik,
    addressLine,
    dusun,
    dusunRwRt,
    totalMembers: sortedMembers.length,
    status: statusPenduduk,
    statusVariant,
    members: sortedMembers,
  };
}

export async function getKeluargaList(): Promise<Keluarga[]> {
  const residents = await getResidents();
  
  const groups = new Map<string, Resident[]>();
  for (const person of residents) {
    const kk = person.no_kk?.trim();
    if (!kk) {
      continue;
    }
    const existing = groups.get(kk);
    if (existing) {
      existing.push(person);
    } else {
      groups.set(kk, [person]);
    }
  }

  const result: Keluarga[] = [];
  groups.forEach((members, kk) => {
    const sortedMembers = sortFamilyMembers(members);
    const head =
      sortedMembers.find(
        (m) =>
          (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA" ||
          (m as any).hubungan_keluarga_id === 1
      ) ?? sortedMembers[0];

    const headName = head.nama ?? "";
    const headNik = head.nik ?? "";

    const dusun = head.dusun || "";
    const rw = head.rw || "";
    const rt = head.rt || "";
    const wilayahParts: string[] = [];
    if (dusun) {
      wilayahParts.push(`Dusun ${dusun}`);
    }
    if (rw) {
      wilayahParts.push(`RW ${rw}`);
    }
    if (rt) {
      wilayahParts.push(`RT ${rt}`);
    }
    const dusunRwRt =
      wilayahParts.length > 0 ? wilayahParts.join(" / ") : "";

    const addressLine =
      head.alamat_saat_ini ||
      head.alamat_rt ||
      head.alamat_sebelumnya ||
      "";

    const statusPenduduk = head.status_penduduk || "Aktif";
    let statusVariant: "success" | "error" | "info" | "default" = "success";
    if (statusPenduduk === "Meninggal") {
      statusVariant = "error";
    } else if (statusPenduduk === "Pindah") {
      statusVariant = "info";
    }

    result.push({
      nomorKK: kk,
      headName,
      headNik,
      addressLine,
      dusun,
      dusunRwRt,
      totalMembers: sortedMembers.length,
      status: statusPenduduk,
      statusVariant,
      members: sortedMembers,
    });
  });

  return result;
}

export async function deleteKeluarga(nomorKk: string, residents: Resident[]) {
  const members = residents.filter((resident) => {
    const kk = resident.no_kk?.trim();
    return kk && kk === nomorKk;
  });
  
  const updates = members.map(async (resident) => {
    if (!resident.id && !resident.nik) {
      return;
    }
    const targetId = resident.id ? String(resident.id) : resident.nik;
    // Remove KK number and relationship
    await updateResident(targetId, {
      no_kk: "",
      hubungan_keluarga: "",
    });
  });
  
  await Promise.all(updates);
  return true;
}

