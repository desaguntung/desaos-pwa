'use client';

import React from "react";
import { ProfileData } from "@/app/actions/profile";
import { AppleCard } from "@/components/ui/AppleCard";
import { 
  History, Target, Compass, Map as MapIcon, 
  User, Users, Maximize2, Mountain, MapPin, 
  Phone, Mail, Globe, Building2, Trophy, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import SmartMap from "@/components/public/SmartMap";

interface ProfileViewProps {
  data: ProfileData;
  category: string; // 'sejarah', 'visi-misi', 'struktur-organisasi', 'geografis', 'peta-desa', etc.
}

// --- Sub-Views ---

const SejarahView = ({ data }: { data: ProfileData }) => (
  <div className="space-y-6">
    <AppleCard title="Sejarah Desa" subtitle={`Asal usul ${data.identitas.sebutan_desa} ${data.identitas.nama_desa}`}>
      <div className="mt-4 prose prose-zinc prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
        {data.identitas.sejarah || "Data sejarah desa belum tersedia."}
      </div>
    </AppleCard>
  </div>
);

const VisiMisiView = ({ data }: { data: ProfileData }) => (
  <div className="space-y-6">
    {/* Visi */}
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-blue-600">
          <Target size={120} />
       </div>
       <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
             <Target size={24} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Visi</h3>
       </div>
       <div className="relative z-10 text-slate-600 leading-relaxed whitespace-pre-wrap">
          {data.identitas.visi || "Data visi belum tersedia."}
       </div>
    </div>

    {/* Misi */}
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-600">
          <Compass size={120} />
       </div>
       <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <Compass size={24} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Misi</h3>
       </div>
       <div className="relative z-10 text-slate-600 leading-relaxed whitespace-pre-wrap">
          {data.identitas.misi || "Data misi belum tersedia."}
       </div>
    </div>
  </div>
);

const StrukturView = ({ data }: { data: ProfileData }) => {
  const pamong = data.pamong || [];
  
  // Helpers
  const getName = (p: any) => p.pamong_nama || p.penduduk?.nama || "Tanpa Nama";
  const getJabatan = (p: any) => p.jabatan || p.pamong_pangkat || "-";
  
  // Sort
  const sortedList = [...pamong].sort((a, b) => {
    const jabatanA = getJabatan(a).toLowerCase();
    const jabatanB = getJabatan(b).toLowerCase();
    
    const rank = (j: string) => {
      if (j.includes("kepala desa") || j.includes("kuwu")) return 1;
      if (j.includes("sekretaris")) return 2;
      if (j.includes("kepala urusan") || j.includes("kaur")) return 3;
      if (j.includes("kepala seksi") || j.includes("kasi")) return 4;
      if (j.includes("kepala dusun") || j.includes("kadus")) return 5;
      return 10;
    };

    return rank(jabatanA) - rank(jabatanB);
  });

  const kepalaDesa = sortedList.find(p => getJabatan(p).toLowerCase().includes("kepala desa"));
  const others = sortedList.filter(p => p !== kepalaDesa);

  return (
    <div className="space-y-8">
       {/* Kepala Desa */}
       {kepalaDesa && (
         <div className="flex justify-center">
            <div className="bg-white rounded-[32px] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden w-full max-w-xs relative group">
               <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                  {kepalaDesa.foto ? (
                    <img src={kepalaDesa.foto} alt={getName(kepalaDesa)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User size={64} />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                     <h3 className="text-xl font-bold mb-1">{getName(kepalaDesa)}</h3>
                     <p className="text-blue-200 font-medium text-sm">{getJabatan(kepalaDesa)}</p>
                  </div>
               </div>
            </div>
         </div>
       )}

       {/* Others Grid */}
       {others.length > 0 && (
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {others.map((p, i) => (
              <motion.div 
                key={p.pamong_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all"
              >
                 <div className="w-20 h-20 rounded-full bg-slate-100 mb-3 overflow-hidden">
                    {p.foto ? (
                      <img src={p.foto} alt={getName(p)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User size={24} />
                      </div>
                    )}
                 </div>
                 <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{getName(p)}</h4>
                 <p className="text-xs text-blue-600 font-medium line-clamp-1">{getJabatan(p)}</p>
              </motion.div>
            ))}
         </div>
       )}
       
       {pamong.length === 0 && (
          <div className="text-center py-12 text-slate-400">
             <Users size={48} className="mx-auto mb-3 opacity-50" />
             <p>Belum ada data struktur organisasi.</p>
          </div>
       )}
    </div>
  );
};

const GeografisView = ({ data }: { data: ProfileData }) => {
  const boundaries = [
    { label: "Utara", value: data.identitas.batas_utara },
    { label: "Selatan", value: data.identitas.batas_selatan },
    { label: "Timur", value: data.identitas.batas_timur },
    { label: "Barat", value: data.identitas.batas_barat },
  ];

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <Maximize2 size={20} />
             </div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Luas Wilayah</p>
             <p className="text-lg font-bold text-slate-900">{data.identitas.luas_wilayah || "-"}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                <Mountain size={20} />
             </div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Ketinggian</p>
             <p className="text-lg font-bold text-slate-900">{data.identitas.ketinggian || "-"}</p>
          </div>
       </div>

       <AppleCard title="Batas Wilayah" subtitle="Perbatasan administratif desa">
          <div className="mt-4 space-y-3">
             {boundaries.map((b, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-medium text-slate-500">{b.label}</span>
                  <span className="text-sm font-bold text-slate-900">{b.value || "-"}</span>
               </div>
             ))}
          </div>
       </AppleCard>

       {(data.identitas.lat || data.identitas.lng) && (
          <div className="bg-blue-600 text-white rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <MapPin size={100} />
             </div>
             <h4 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
               <MapIcon size={20} />
               Koordinat Kantor
             </h4>
             <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                   <p className="text-blue-200 text-xs mb-1">Latitude</p>
                   <p className="font-mono font-bold">{data.identitas.lat || "-"}</p>
                </div>
                <div>
                   <p className="text-blue-200 text-xs mb-1">Longitude</p>
                   <p className="font-mono font-bold">{data.identitas.lng || "-"}</p>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

const PetaView = ({ data }: { data: ProfileData }) => {
  const manualMapContent = (
    data.identitas.peta_wilayah ? (
      data.identitas.peta_wilayah.startsWith("<iframe") ? (
         <div 
           className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
           dangerouslySetInnerHTML={{ __html: data.identitas.peta_wilayah }}
         />
      ) : (
         <img 
           src={data.identitas.peta_wilayah} 
           alt="Peta Wilayah" 
           className="w-full h-full object-cover"
         />
      )
    ) : (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-100">
         <MapIcon size={48} className="mb-4 opacity-50" />
         <p className="font-medium">Peta wilayah belum tersedia.</p>
      </div>
    )
  );

  return (
    <div className="bg-white rounded-[32px] p-2 shadow-sm border border-zinc-200">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <MapIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Peta Digital</h2>
          <p className="text-xs text-zinc-500">Desa {data.identitas.nama_desa}</p>
        </div>
      </div>
      
      <SmartMap 
         desa={data.identitas.nama_desa}
         kecamatan={data.identitas.nama_kecamatan}
         kabupaten={data.identitas.nama_kabupaten}
         provinsi={data.identitas.nama_provinsi}
         fallbackContent={manualMapContent}
      />
    </div>
  );
};

const KontakView = ({ data }: { data: ProfileData }) => (
  <div className="space-y-6">
     <AppleCard title="Kantor Desa" subtitle="Pusat pelayanan masyarakat">
        <div className="mt-4 space-y-4">
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                 <MapPin size={20} />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-900 mb-1">Alamat Kantor</p>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   {data.identitas.alamat_kantor || `Kantor Desa ${data.identitas.nama_desa}`}
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                 <Phone size={20} />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-900 mb-1">Telepon / WhatsApp</p>
                 <p className="text-sm text-slate-600">
                   {data.identitas.telepon_desa || "-"}
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                 <Mail size={20} />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-900 mb-1">Email Resmi</p>
                 <p className="text-sm text-slate-600">
                   {data.identitas.email_desa || "-"}
                 </p>
              </div>
           </div>
        </div>
     </AppleCard>

     <div className="bg-slate-900 text-white rounded-[32px] p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="relative z-10">
           <h3 className="text-xl font-bold mb-2">Jam Operasional</h3>
           <p className="text-slate-400 text-sm mb-6">Waktu pelayanan kantor desa</p>
           
           <div className="space-y-3 max-w-xs mx-auto">
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                 <span className="text-slate-300">Senin - Kamis</span>
                 <span className="font-bold">08:00 - 15:00</span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                 <span className="text-slate-300">Jumat</span>
                 <span className="font-bold">08:00 - 11:00</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="text-red-300">Sabtu - Minggu</span>
                 <span className="font-bold text-red-300">Tutup</span>
              </div>
           </div>
        </div>
     </div>
  </div>
);

const PrestasiView = ({ data }: { data: ProfileData }) => {
  const prestasi = data.prestasi || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (prestasi.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 bg-white rounded-[32px] border border-slate-100">
         <Trophy size={48} className="mx-auto mb-3 opacity-50" />
         <p>Belum ada data prestasi desa.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {prestasi.map((item, i) => (
         <motion.div
           key={item.id}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
         >
           <AppleCard className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300" noPadding>
             <div className="relative h-48 w-full bg-slate-100 border-b border-slate-100">
               {item.foto_url ? (
                 <img 
                   src={item.foto_url} 
                   alt={item.judul}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-50">
                   <Trophy className="w-12 h-12 text-slate-300" />
                 </div>
               )}
               {item.tingkat && (
                 <div className="absolute top-4 right-4">
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
                     {item.tingkat}
                   </span>
                 </div>
               )}
             </div>
             
             <div className="p-6 flex-1 flex flex-col">
               <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                 <Calendar className="w-3.5 h-3.5" />
                 <span>{formatDate(item.tanggal)}</span>
               </div>
               
               <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                 {item.judul}
               </h3>
               
               <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 mb-4 flex-1">
                 {item.deskripsi}
               </p>
             </div>
           </AppleCard>
         </motion.div>
       ))}
    </div>
  );
};

export default function ProfileView({ data, category }: ProfileViewProps) {
  switch (category) {
    case 'sejarah': return <SejarahView data={data} />;
    case 'visi-misi': return <VisiMisiView data={data} />;
    case 'struktur-organisasi': return <StrukturView data={data} />;
    case 'geografis': return <GeografisView data={data} />;
    case 'peta': return <PetaView data={data} />;
    case 'prestasi': return <PrestasiView data={data} />;
    case 'lokasi-kantor': return <KontakView data={data} />;
    case 'hubungi-kami': return <KontakView data={data} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
           <p className="text-slate-400 mb-2">Konten belum tersedia</p>
           <p className="font-bold text-slate-900">{category}</p>
        </div>
      );
  }
}