/**
 * Indonesian NIK (Nomor Induk Kependudukan) Parser & Deconstruction
 * 
 * NIK Format (16 Digits):
 * - Digit 1-2: Kode Provinsi
 * - Digit 3-4: Kode Kabupaten / Kota
 * - Digit 5-6: Kode Kecamatan
 * - Digit 7-8: Tanggal Lahir (Pria: 01-31, Wanita: 41-71 = tanggal + 40)
 * - Digit 9-10: Bulan Lahir (01-12)
 * - Digit 11-12: Tahun Lahir (2 digit akhir)
 * - Digit 13-16: Nomor Urut Registrasi
 */

export interface ParsedNIKResult {
  isValid: boolean;
  nik: string;
  gender?: "LAKI-LAKI" | "PEREMPUAN";
  genderId?: 1 | 2;
  birthDate?: string; // Format: YYYY-MM-DD
  birthDateFormatted?: string; // Format: DD-MM-YYYY
  age?: number;
  provinceCode?: string;
  regencyCode?: string;
  districtCode?: string;
  error?: string;
}

export function parseIndonesianNIK(rawNik?: string | null): ParsedNIKResult {
  if (!rawNik) {
    return { isValid: false, nik: "", error: "NIK kosong" };
  }

  const cleanNik = rawNik.trim().replace(/\D/g, "");

  if (cleanNik.length !== 16) {
    return { 
      isValid: false, 
      nik: cleanNik, 
      error: "Panjang NIK harus tepat 16 digit numerik" 
    };
  }

  const provinceCode = cleanNik.substring(0, 2);
  const regencyCode = cleanNik.substring(0, 4);
  const districtCode = cleanNik.substring(0, 6);

  const rawDay = parseInt(cleanNik.substring(6, 8), 10);
  const month = parseInt(cleanNik.substring(8, 10), 10);
  const rawYear = parseInt(cleanNik.substring(10, 12), 10);

  // Determine Gender & Actual Day of Birth
  let isFemale = false;
  let actualDay = rawDay;

  if (rawDay > 40) {
    isFemale = true;
    actualDay = rawDay - 40;
  }

  // Validate Day & Month
  if (actualDay < 1 || actualDay > 31 || month < 1 || month > 12) {
    return {
      isValid: false,
      nik: cleanNik,
      error: "Tanggal atau bulan lahir pada NIK tidak valid"
    };
  }

  // Determine Full 4-digit Year
  // Assumption: Century inference based on realistic human age
  // If 2-digit year is <= (currentYear % 100), assume 2000s, else 1900s
  const currentYear = new Date().getFullYear();
  const currentCenturyPrefix = Math.floor(currentYear / 100) * 100;
  const currentTwoDigitYear = currentYear % 100;

  let fullYear: number;
  if (rawYear <= currentTwoDigitYear) {
    fullYear = currentCenturyPrefix + rawYear;
  } else {
    fullYear = (currentCenturyPrefix - 100) + rawYear;
  }

  const dayPad = String(actualDay).padStart(2, "0");
  const monthPad = String(month).padStart(2, "0");
  const birthDateIso = `${fullYear}-${monthPad}-${dayPad}`;
  const birthDateFormatted = `${dayPad}-${monthPad}-${fullYear}`;

  // Calculate Age
  const today = new Date();
  const birthObj = new Date(fullYear, month - 1, actualDay);
  let age = today.getFullYear() - birthObj.getFullYear();
  const monthDiff = today.getMonth() - birthObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthObj.getDate())) {
    age--;
  }

  return {
    isValid: true,
    nik: cleanNik,
    gender: isFemale ? "PEREMPUAN" : "LAKI-LAKI",
    genderId: isFemale ? 2 : 1,
    birthDate: birthDateIso,
    birthDateFormatted,
    age: Math.max(0, age),
    provinceCode,
    regencyCode,
    districtCode,
  };
}
