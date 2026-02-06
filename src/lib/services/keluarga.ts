import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident, getResidents, updateResident } from "./penduduk";

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
  members: Resident[]; // Keep members for detail view if needed
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
    const head =
      members.find(
        (m) =>
          (m.hubungan_keluarga || "").toUpperCase() === "KEPALA KELUARGA",
      ) ?? members[0];

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
      totalMembers: members.length,
      status: statusPenduduk,
      statusVariant,
      members,
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
    if (!resident.id) {
      return;
    }
    // Remove KK number and relationship
    await updateResident(String(resident.id), {
      no_kk: "",
      hubungan_keluarga: "",
    });
  });
  
  await Promise.all(updates);
  return true;
}
