import { createSupabaseServerClient, createSupabaseAdminClient } from "@/utils/supabase/server";
import StatisticsView, { StatsData } from "@/components/public/statistik/StatisticsView";
import HeroSection from "@/components/public/HeroSection";

export const metadata = {
  title: "Statistik Kependudukan - DesaOS",
  description: "Data statistik kependudukan publik yang transparan dan akuntabel.",
};

// Helper to calculate age
function getAge(dateString: string) {
  if (!dateString) return 0;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;

  // Use Admin Client to bypass RLS for public statistics (Server-side only)
  // We only send aggregated data to the client, so this is safe.
  let supabase;
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.");
    return (
        <div className="min-h-screen bg-white">
            <div className="pt-32 px-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Konfigurasi Server Belum Lengkap</h1>
                <p className="text-zinc-600 mt-2 max-w-lg mx-auto">
                  Server membutuhkan <code>SUPABASE_SERVICE_ROLE_KEY</code> untuk memproses data statistik secara publik.
                </p>
                <div className="mt-6 bg-zinc-50 p-4 rounded-lg max-w-lg mx-auto text-left border border-zinc-200">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Solusi:</p>
                    <ol className="list-decimal list-inside text-sm text-zinc-700 space-y-2">
                        <li>Buka file <code>.env.local</code> di project root.</li>
                        <li>Tambahkan variable: <code>SUPABASE_SERVICE_ROLE_KEY=eyJh...</code></li>
                        <li>Restart server development.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
  }

  try {
    supabase = createSupabaseAdminClient();
  } catch (e) {
    console.error("Failed to create admin client:", e);
    // Fallback usually fails for RLS, but just in case
    supabase = createSupabaseServerClient();
  }

  // 1. Fetch Identity
  const { data: identitas } = await supabase
    .from("identitas_desa")
    .select("nama_desa, sebutan_desa")
    .limit(1)
    .single();

  const villageName = `${identitas?.sebutan_desa || "Desa"} ${identitas?.nama_desa || "Digital"}`;

  // 2. Fetch Residents (Active only) - Batch fetching to bypass 1000 row limit
  // Note: For large datasets, we should use database functions (RPC) for aggregation.
  // We fetch in batches of 1000 to ensure we get all data regardless of API limits.
  let residents: any[] = [];
  let fetchError = null;
  
  try {
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("penduduk")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        residents = [...residents, ...data];
        if (data.length < pageSize) hasMore = false;
        else page++;
      } else {
        hasMore = false;
      }

      // Safety limit to prevent timeout
      if (residents.length > 50000) break;
    }
  } catch (err: any) {
    fetchError = err;
  }
  
  if (fetchError) {
    console.error("Error fetching stats:", JSON.stringify(fetchError, null, 2));
    // Return empty state or error UI
    return (
        <div className="min-h-screen bg-white">
            <div className="pt-32 px-6 text-center">
                <h1 className="text-2xl font-bold text-zinc-900">Gagal memuat data statistik.</h1>
                <p className="text-zinc-500 mt-2">Silakan coba lagi nanti.</p>
                {process.env.NODE_ENV === 'development' && (
                  <pre className="mt-4 text-xs text-red-500 bg-red-50 p-4 rounded text-left overflow-auto max-w-lg mx-auto">
                    {JSON.stringify(fetchError, null, 2)}
                  </pre>
                )}
            </div>
        </div>
    );
  }

  // Filter active residents (Case insensitive check)
  const cleanResidents = (residents || []).filter(r => {
    const status = (r.status_penduduk || "").toUpperCase();
    return status !== "MENINGGAL" && status !== "PINDAH";
  });
  const totalPopulation = cleanResidents.length;
  
  // Calculate Families (Unique KK)
  const uniqueKK = new Set(cleanResidents.map(r => r.no_kk).filter(Boolean));
  const totalFamilies = uniqueKK.size;

  // --- Aggregation Logic ---

  // 1. Gender
  let male = 0;
  let female = 0;
  cleanResidents.forEach(r => {
    const gender = r.jenis_kelamin?.toUpperCase();
    if (gender === "L" || gender === "LAKI-LAKI") male++;
    else if (gender === "P" || gender === "PEREMPUAN") female++;
  });
  
  const genderStats = [
    { name: "Laki-laki", value: male, fill: "#0071e3" },
    { name: "Perempuan", value: female, fill: "#ff2d55" },
  ];

  // 2. Age Distribution (Population Pyramid-ish)
  const ageRanges = [
    { range: "0-4", min: 0, max: 4, male: 0, female: 0, total: 0 },
    { range: "5-9", min: 5, max: 9, male: 0, female: 0, total: 0 },
    { range: "10-14", min: 10, max: 14, male: 0, female: 0, total: 0 },
    { range: "15-19", min: 15, max: 19, male: 0, female: 0, total: 0 },
    { range: "20-24", min: 20, max: 24, male: 0, female: 0, total: 0 },
    { range: "25-29", min: 25, max: 29, male: 0, female: 0, total: 0 },
    { range: "30-34", min: 30, max: 34, male: 0, female: 0, total: 0 },
    { range: "35-39", min: 35, max: 39, male: 0, female: 0, total: 0 },
    { range: "40-44", min: 40, max: 44, male: 0, female: 0, total: 0 },
    { range: "45-49", min: 45, max: 49, male: 0, female: 0, total: 0 },
    { range: "50-54", min: 50, max: 54, male: 0, female: 0, total: 0 },
    { range: "55-59", min: 55, max: 59, male: 0, female: 0, total: 0 },
    { range: "60+", min: 60, max: 999, male: 0, female: 0, total: 0 },
  ];

  cleanResidents.forEach(r => {
    const age = getAge(r.tanggal_lahir);
    const gender = r.jenis_kelamin?.toUpperCase();
    const isMale = gender === "L" || gender === "LAKI-LAKI";

    const bucket = ageRanges.find(b => age >= b.min && age <= b.max);
    if (bucket) {
      if (isMale) bucket.male++;
      else bucket.female++;
      bucket.total++;
    }
  });

  const ageStats = ageRanges.map(b => ({
      range: b.range,
      male: b.male,
      female: b.female,
      total: b.total
  }));

  // 3. Education
  const eduMap = new Map<string, number>();
  cleanResidents.forEach(r => {
    // @ts-ignore - Dynamic property access
    const edu = r.pendidikan_kk || "TIDAK / BELUM SEKOLAH";
    eduMap.set(edu, (eduMap.get(edu) || 0) + 1);
  });
  const educationStats = Array.from(eduMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 4. Jobs
  const jobMap = new Map<string, number>();
  cleanResidents.forEach(r => {
    const job = r.pekerjaan || "BELUM/TIDAK BEKERJA";
    jobMap.set(job, (jobMap.get(job) || 0) + 1);
  });
  const jobStats = Array.from(jobMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 5. Religion
  const relMap = new Map<string, number>();
  cleanResidents.forEach(r => {
    const rel = r.agama || "LAINNYA";
    relMap.set(rel, (relMap.get(rel) || 0) + 1);
  });
  const religionStats = Array.from(relMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 6. Blood Type
  const bloodMap = new Map<string, number>();
  cleanResidents.forEach(r => {
    const bt = r.golongan_darah || "TIDAK TAHU";
    // Normalize "-" to "TIDAK TAHU" if needed, but keeping raw is fine usually
    const label = bt === "-" ? "TIDAK TAHU" : bt;
    bloodMap.set(label, (bloodMap.get(label) || 0) + 1);
  });
  const bloodTypeStats = Array.from(bloodMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 7. Marital Status
  const maritalMap = new Map<string, number>();
  cleanResidents.forEach(r => {
    // @ts-ignore
    const status = r.status_kawin || "BELUM KAWIN";
    maritalMap.set(status, (maritalMap.get(status) || 0) + 1);
  });
  const maritalStats = Array.from(maritalMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 8. Assistance (BDT)
  const { count: bdtCount } = await supabase
    .from('rumah_tangga')
    .select('*', { count: 'exact', head: true })
    .not('bdt', 'is', null)
    .neq('bdt', '');

  const assistanceStats = [
    { name: "Penerima Bantuan (BDT/DTKS)", value: bdtCount || 0 },
    { name: "Non-Bansos", value: Math.max(0, totalFamilies - (bdtCount || 0)) }
  ];

  // Helper for aggregation
  const aggregateByField = (data: any[], field: string, defaultVal: string = "TIDAK TAHU") => {
    const map = new Map<string, number>();
    data.forEach(item => {
      let val = item[field];
      if (val === null || val === undefined || val === "" || val === "-") val = defaultVal;
      if (typeof val === 'string') val = val.toUpperCase();
      map.set(val, (map.get(val) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // 9. Age Category (Kategori Umur)
  const ageCatMap = new Map<string, number>();
  cleanResidents.forEach(r => {
      const age = getAge(r.tanggal_lahir);
      let cat = "MANULA (>65 THN)";
      if (age <= 5) cat = "BALITA (0-5 THN)";
      else if (age <= 11) cat = "KANAK-KANAK (6-11 THN)";
      else if (age <= 16) cat = "REMAJA AWAL (12-16 THN)";
      else if (age <= 25) cat = "REMAJA AKHIR (17-25 THN)";
      else if (age <= 35) cat = "DEWASA AWAL (26-35 THN)";
      else if (age <= 45) cat = "DEWASA AKHIR (36-45 THN)";
      else if (age <= 55) cat = "LANSIA AWAL (46-55 THN)";
      else if (age <= 65) cat = "LANSIA AKHIR (56-65 THN)";
      
      ageCatMap.set(cat, (ageCatMap.get(cat) || 0) + 1);
  });
  const ageCategoryStats = Array.from(ageCatMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  // 10. Education Ongoing
  const educationOngoingStats = aggregateByField(cleanResidents, "pendidikan_saat_ini", "TIDAK/BELUM SEKOLAH");

  // 11. Family Relation
  const familyRelationStats = aggregateByField(cleanResidents, "hubungan_keluarga", "LAINNYA");

  // 12. Citizenship
  const citizenshipStats = aggregateByField(cleanResidents, "kewarganegaraan", "WNI");

  // 13. Resident Status
  const residentStatusStats = aggregateByField(cleanResidents, "status_penduduk", "TETAP");

  // 14. Disability
  const disabilityStats = aggregateByField(cleanResidents, "cacat_fisik_mental", "TIDAK ADA");

  // 15. Chronic Disease
  const chronicDiseaseStats = aggregateByField(cleanResidents, "sakit_menahun", "TIDAK ADA");

  // 16. KB
  const kbStats = aggregateByField(cleanResidents, "akseptor_kb", "BUKAN AKSEPTOR KB");

  // 17. Birth Cert
  let hasBirthCert = 0;
  cleanResidents.forEach(r => {
      if (r.akta_kelahiran_nomor && r.akta_kelahiran_nomor.length > 3) hasBirthCert++;
  });
  const birthCertStats = [
      { name: "MEMILIKI AKTA", value: hasBirthCert },
      { name: "TIDAK MEMILIKI", value: Math.max(0, totalPopulation - hasBirthCert) }
  ];

  // 18. KTP / Identity
  const ktpStats = aggregateByField(cleanResidents, "identitas_elektronik", "BELUM MEMILIKI");

  // 19. Insurance
  const insuranceStats = aggregateByField(cleanResidents, "kepesertaan_asuransi", "TIDAK MEMILIKI");

  // 20. Ethnicity
  const ethnicityStats = aggregateByField(cleanResidents, "suku_etnis", "TIDAK TAHU");

  // 21. BPJS Labor
  let hasBpjsLabor = 0;
  cleanResidents.forEach(r => {
      if (r.nomor_bpjs_ketenagakerjaan && r.nomor_bpjs_ketenagakerjaan.length > 3) hasBpjsLabor++;
  });
  const bpjsLaborStats = [
      { name: "PESERTA", value: hasBpjsLabor },
      { name: "BUKAN PESERTA", value: Math.max(0, totalPopulation - hasBpjsLabor) }
  ];

  // 22. Pregnancy
  const pregnancyStats = aggregateByField(cleanResidents, "status_kehamilan", "TIDAK HAMIL");

  // 23. KIA
  let hasKia = 0;
  cleanResidents.forEach(r => {
      if (r.identitas_elektronik === 'KIA') hasKia++;
  });
  const children = cleanResidents.filter(r => getAge(r.tanggal_lahir) < 17).length;
  const kiaStats = [
      { name: "MEMILIKI KIA", value: hasKia },
      { name: "BELUM MEMILIKI", value: Math.max(0, children - hasKia) }
  ];

  const statsData: StatsData = {
    totalPopulation,
    totalFamilies,
    genderStats,
    ageStats,
    educationStats,
    jobStats,
    religionStats,
    bloodTypeStats,
    maritalStats,
    assistanceStats,
    ageCategoryStats,
    educationOngoingStats,
    familyRelationStats,
    citizenshipStats,
    residentStatusStats,
    disabilityStats,
    chronicDiseaseStats,
    kbStats,
    birthCertStats,
    ktpStats,
    insuranceStats,
    ethnicityStats,
    bpjsLaborStats,
    pregnancyStats,
    kiaStats
  };

  return (
    <>
      <HeroSection 
        title="Data Statistik"
        subtitle={villageName}
        description="Data kependudukan yang transparan dan akuntabel."
        size="medium"
        variant="centered"
        bgClass="bg-zinc-50"
      />
      <div className="min-h-screen bg-[#f5f5f7]">
        <div className="-mt-10 relative z-20 pt-8">
           <StatisticsView data={statsData} villageName={villageName} category={category} />
        </div>
      </div>
    </>
  );
}
