import fs from "fs/promises";
import path from "path";
import { createSupabaseAdminClient } from "@/utils/supabase/server";

type ParsedValue = string | null;

type WilayahRow = {
  kode: string;
  nama: string;
};

type WilayahDesaInsertRow = {
  kode_desa: string;
  nama_desa: string;
  nama_kecamatan: string;
  nama_kabupaten: string;
  nama_provinsi: string;
};

function splitValuesIntoRows(valuesPart: string): string[] {
  let text = valuesPart.trim();
  if (text.endsWith(";")) {
    text = text.slice(0, -1);
  }
  const rows: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;
    if (inString && ch === "\\" && i + 1 < text.length && text[i + 1] === "'") {
      current += "'";
      i += 1;
      continue;
    }
    if (ch === "'") {
      if (inString && i + 1 < text.length && text[i + 1] === "'") {
        current += "'";
        i += 1;
        continue;
      }
      inString = !inString;
      current += ch;
      continue;
    }
    if (!inString) {
      if (ch === "(") {
        depth += 1;
      } else if (ch === ")") {
        depth -= 1;
      } else if (ch === "," && depth === 0) {
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          rows.push(trimmed);
        }
        current = "";
        continue;
      }
    }
    current += ch;
  }
  const trimmed = current.trim();
  if (trimmed.length > 0) {
    rows.push(trimmed);
  }
  return rows;
}

function parseValuesRow(rowText: string): ParsedValue[] {
  let text = rowText.trim();
  if (text.endsWith(";")) {
    text = text.slice(0, -1);
  }
  if (text.startsWith("(") && text.endsWith(")")) {
    text = text.slice(1, -1);
  }
  const values: string[] = [];
  let current = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;
    if (inString && ch === "\\" && i + 1 < text.length && text[i + 1] === "'") {
      current += "'";
      i += 1;
      continue;
    }
    if (ch === "'") {
      if (inString && i + 1 < text.length && text[i + 1] === "'") {
        current += "'";
        i += 1;
        continue;
      }
      inString = !inString;
      continue;
    }
    if (ch === "," && !inString) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.length > 0) {
    values.push(current.trim());
  }
  return values.map((raw) => {
    const trimmed = raw.trim();
    if (trimmed.toUpperCase() === "NULL") {
      return null;
    }
    return trimmed;
  });
}

function extractWilayah(sql: string): WilayahRow[] {
  const lines = sql.split(/\r?\n/);
  const result: WilayahRow[] = [];
  let insideInsert = false;
  let inValues = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!insideInsert) {
      if (line.startsWith("INSERT INTO wilayah")) {
        insideInsert = true;
      }
      continue;
    }
    if (!inValues) {
      if (line.toUpperCase().startsWith("VALUES")) {
        inValues = true;
      } else if (!line || line.startsWith("--")) {
        insideInsert = false;
      }
      continue;
    }
    if (!line.startsWith("(")) {
      inValues = false;
      insideInsert = false;
      continue;
    }
    const rowTexts = splitValuesIntoRows(line);
    for (const rowText of rowTexts) {
      const values = parseValuesRow(rowText);
      const kodeRaw = values[0];
      const namaRaw = values[1];
      if (kodeRaw == null || namaRaw == null) {
        continue;
      }
      result.push({
        kode: String(kodeRaw),
        nama: String(namaRaw),
      });
    }
    if (line.endsWith(";")) {
      inValues = false;
      insideInsert = false;
    }
  }
  return result;
}

function buildDesaRows(rows: WilayahRow[]): WilayahDesaInsertRow[] {
  const nameByCode = new Map<string, string>();
  for (const row of rows) {
    nameByCode.set(row.kode, row.nama);
  }
  const desaByKode = new Map<string, WilayahDesaInsertRow>();
  for (const row of rows) {
    const parts = row.kode.split(".");
    if (parts.length !== 4) {
      continue;
    }
    const kodeDesa = row.kode;
    const namaDesa = row.nama;
    const provCode = parts[0];
    const kabCode = `${parts[0]}.${parts[1]}`;
    const kecCode = `${parts[0]}.${parts[1]}.${parts[2]}`;
    const namaProvinsi = nameByCode.get(provCode) ?? "";
    const namaKabupaten = nameByCode.get(kabCode) ?? "";
    const namaKecamatan = nameByCode.get(kecCode) ?? "";
    if (!desaByKode.has(kodeDesa)) {
      desaByKode.set(kodeDesa, {
        kode_desa: kodeDesa,
        nama_desa: namaDesa,
        nama_kecamatan: namaKecamatan,
        nama_kabupaten: namaKabupaten,
        nama_provinsi: namaProvinsi,
      });
    }
  }
  return Array.from(desaByKode.values());
}

import { PageHeader } from "@/components/layout/PageHeader";

export default async function ImportWilayahPage() {
  const filePath = path.join(process.cwd(), "wilayah.sql");
  let totalWilayah = 0;
  let totalDesa = 0;
  let errorMessage: string | null = null;
  let successMessage = "";
  try {
    const sql = await fs.readFile(filePath, "utf8");
    const wilayahRows = extractWilayah(sql);
    totalWilayah = wilayahRows.length;
    const desaRows = buildDesaRows(wilayahRows);
    totalDesa = desaRows.length;
    const supabase = createSupabaseAdminClient();
    await supabase.from("wilayah_desa").delete().gte("kode_desa", "");
    const insertResult = await supabase
      .from("wilayah_desa")
      .insert(desaRows);
    if (insertResult.error) {
      throw insertResult.error;
    }
    const countResult = await supabase
      .from("wilayah_desa")
      .select("kode_desa", { count: "exact", head: true });
    if (countResult.error) {
      throw countResult.error;
    }
    const insertedCount = countResult.count ?? 0;
    if (insertedCount !== desaRows.length) {
      throw new Error(
        `Verifikasi jumlah gagal: ${insertedCount} dari ${desaRows.length} baris`
      );
    }
    successMessage =
      "Impor wilayah selesai. Data desa telah dimasukkan ke tabel wilayah_desa.";
  } catch (error) {
    const unknownError = error as { message?: unknown } | string | null;
    let messageText = "Terjadi kesalahan tidak diketahui.";
    if (
      unknownError &&
      typeof unknownError === "object" &&
      typeof unknownError.message === "string"
    ) {
      messageText = unknownError.message;
    } else if (typeof unknownError === "string") {
      messageText = unknownError;
    }
    errorMessage = messageText;
  }
  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Impor Data Wilayah" 
        subtitle="Utility / Import Wilayah"
      />
      <div className="px-6 py-4">
        <div className="text-xs text-secondary-text mb-3">
          <p>
            Halaman ini membaca file wilayah.sql di root proyek dan mengimpor
            data ke tabel wilayah_desa di Supabase.
          </p>
          <p>
            Buka halaman ini saat menjalankan aplikasi secara lokal untuk
            menjalankan proses impor.
          </p>
        </div>
        <div className="text-xs text-primary-text mb-2">
          <p>Total baris wilayah terdeteksi: {totalWilayah}</p>
          <p>Total desa terdeteksi: {totalDesa}</p>
        </div>
        {errorMessage ? (
          <div className="text-xs text-error-text bg-error-bg border border-error-border rounded-md px-3 py-2">
            <p className="font-medium mb-1">Impor wilayah gagal</p>
            <pre className="whitespace-pre-wrap break-all">{errorMessage}</pre>
          </div>
        ) : (
          <div className="text-xs text-success-text bg-success-bg border border-success-border rounded-md px-3 py-2">
            <p className="font-medium mb-1">Impor wilayah selesai</p>
            <p>{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
