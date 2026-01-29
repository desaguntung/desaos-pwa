"use client";

import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area
} from "recharts";
import { cn } from "@/lib/utils";
import { 
  Briefcase, Heart, Activity, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

// --- Types ---

export interface StatsData {
  totalPopulation: number;
  totalFamilies: number;
  genderStats: { name: string; value: number; fill: string }[];
  ageStats: { range: string; male: number; female: number; total: number }[];
  educationStats: { name: string; value: number }[];
  jobStats: { name: string; value: number }[];
  religionStats: { name: string; value: number }[];
  bloodTypeStats: { name: string; value: number }[];
  maritalStats: { name: string; value: number }[];
  assistanceStats: { name: string; value: number }[];
  
  // New Stats
  ageCategoryStats: { name: string; value: number }[];
  educationOngoingStats: { name: string; value: number }[];
  familyRelationStats: { name: string; value: number }[];
  citizenshipStats: { name: string; value: number }[];
  residentStatusStats: { name: string; value: number }[];
  disabilityStats: { name: string; value: number }[];
  chronicDiseaseStats: { name: string; value: number }[];
  kbStats: { name: string; value: number }[];
  birthCertStats: { name: string; value: number }[];
  ktpStats: { name: string; value: number }[];
  insuranceStats: { name: string; value: number }[];
  ethnicityStats: { name: string; value: number }[];
  bpjsLaborStats: { name: string; value: number }[];
  pregnancyStats: { name: string; value: number }[];
  kiaStats: { name: string; value: number }[];
}

interface StatisticsViewProps {
  data: StatsData;
  villageName: string;
  category?: string;
}

// --- Colors & Theme ---
const THEME = {
  bg: "#f5f5f7",
  card: "#ffffff",
  textPrimary: "#1d1d1f",
  textSecondary: "#86868b",
  accent: "#0071e3",
  colors: [
    "#0071e3", // Blue
    "#5e5ce6", // Purple
    "#ff2d55", // Pink
    "#ff9f0a", // Orange
    "#34c759", // Green
    "#30b0c7", // Teal
    "#ffcc00", // Yellow
    "#8e8e93", // Gray
    "#5ac8fa", // Light Blue
    "#af52de", // Light Purple
    "#ff3b30", // Red
    "#ff9500", // Dark Orange
  ]
};

// --- Components ---

const AppleCard = ({ children, className, title, subtitle, icon: Icon, delay = 0 }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: any, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={cn(
      "bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out flex flex-col border border-white/50 backdrop-blur-xl", 
      className
    )}
  >
    {(title || Icon) && (
      <div className="mb-6 flex items-start justify-between">
        <div>
          {title && <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">{title}</h3>}
          {subtitle && <p className="text-[#86868b] text-[15px] font-medium mt-1 leading-snug">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    )}
    {children}
  </motion.div>
);

const MetricCard = ({ label, value, trend, trendLabel, color = "blue", delay }: any) => (
  <AppleCard className="min-h-[160px] justify-between" delay={delay}>
    <div className="flex justify-between items-start">
      <p className="text-[#86868b] font-medium text-sm uppercase tracking-wider">{label}</p>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-opacity-10", `bg-${color}-500`)}>
        <Activity className={cn("w-4 h-4", `text-${color}-600`)} />
      </div>
    </div>
    <div>
      <h4 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] tracking-tight">{value}</h4>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-4 h-4 text-[#34c759]" />
          <span className="text-sm font-medium text-[#34c759]">{trend}</span>
          <span className="text-sm text-[#86868b] ml-1">{trendLabel}</span>
        </div>
      )}
    </div>
  </AppleCard>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 text-sm">
        <p className="font-semibold text-[#1d1d1f] mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].stroke }} />
          <p className="text-[#86868b] font-medium">
            {payload[0].value.toLocaleString('id-ID')} <span className="text-xs">Jiwa</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// --- Views ---

const GeneralView = ({ data }: { data: StatsData }) => {
  const dependencyRatio = Math.round(((data.ageStats.find(a => a.range === "0-4")?.total || 0) + (data.ageStats.find(a => a.range === "60+")?.total || 0)) / data.totalPopulation * 100);
  const avgFamilySize = (data.totalPopulation / data.totalFamilies).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Penduduk" value={data.totalPopulation.toLocaleString('id-ID')} trend="+12%" trendLabel="vs tahun lalu" color="blue" delay={0.1} />
        <MetricCard label="Kepala Keluarga" value={data.totalFamilies.toLocaleString('id-ID')} trend={avgFamilySize} trendLabel="rata-rata jiwa/KK" color="purple" delay={0.2} />
        <MetricCard label="Proporsi Laki-laki" value={`${((data.genderStats[0].value / data.totalPopulation) * 100).toFixed(1)}%`} trendLabel="dari total penduduk" color="pink" delay={0.3} />
        <MetricCard label="Rasio Ketergantungan" value={`${dependencyRatio}%`} trendLabel="Non-produktif" color="orange" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Gender Chart */}
        <AppleCard className="md:col-span-1 min-h-[400px]" title="Komposisi Gender" subtitle="Perbandingan Laki-laki & Perempuan" delay={0.5}>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.genderStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  <Cell fill="#0071e3" />
                  <Cell fill="#ff2d55" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center">
                 <p className="text-3xl font-bold text-[#1d1d1f]">{data.totalPopulation.toLocaleString('id-ID')}</p>
                 <p className="text-sm text-[#86868b] font-medium uppercase tracking-wide">Total Jiwa</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
             {data.genderStats.map((g, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className={cn("w-3 h-3 rounded-full", i === 0 ? "bg-[#0071e3]" : "bg-[#ff2d55]")} />
                 <span className="text-sm font-medium text-[#1d1d1f]">{g.name}</span>
                 <span className="text-sm text-[#86868b]">({((g.value/data.totalPopulation)*100).toFixed(1)}%)</span>
               </div>
             ))}
          </div>
        </AppleCard>

        {/* Age Pyramid */}
        <AppleCard className="md:col-span-2 min-h-[400px]" title="Piramida Penduduk" subtitle="Distribusi penduduk berdasarkan kelompok umur" delay={0.6}>
           <div className="flex-1 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ageStats} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={2}>
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f5f5f7', radius: 8 }} content={<CustomTooltip />} />
                <Bar dataKey="male" name="Laki-laki" fill="#0071e3" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="female" name="Perempuan" fill="#ff2d55" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0071e3]"></span>
                <span className="text-sm text-[#86868b]">Laki-laki</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff2d55]"></span>
                <span className="text-sm text-[#86868b]">Perempuan</span>
              </div>
           </div>
        </AppleCard>
      </div>
    </div>
  );
};

const EducationView = ({ data }: { data: StatsData }) => {
  const higherEdu = data.educationStats.filter(e => e.name.includes("DIPLOMA") || e.name.includes("SARJANA") || e.name.includes("S1") || e.name.includes("S2")).reduce((acc, curr) => acc + curr.value, 0);
  
  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Wajib Belajar 9 Tahun" value={`${((data.educationStats.filter(e => !e.name.includes("TIDAK") && !e.name.includes("SD")).reduce((a,b) => a+b.value, 0) / data.totalPopulation) * 100).toFixed(1)}%`} trendLabel="Partisipasi" color="blue" />
          <MetricCard label="Pendidikan Tinggi" value={higherEdu.toLocaleString('id-ID')} trend={`${((higherEdu/data.totalPopulation)*100).toFixed(1)}%`} trendLabel="dari total populasi" color="purple" />
          <MetricCard label="Buta Huruf" value="< 1%" trendLabel="Estimasi" color="green" />
       </div>

       <AppleCard title="Jenjang Pendidikan" subtitle="Distribusi tingkat pendidikan terakhir">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
             <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.educationStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {data.educationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={THEME.colors[index % THEME.colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex flex-col justify-center space-y-4">
                {data.educationStats.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125 duration-300" style={{ backgroundColor: THEME.colors[i % THEME.colors.length] }} />
                      <span className="text-[#1d1d1f] font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value/data.totalPopulation)*100}%`, backgroundColor: THEME.colors[i % THEME.colors.length] }} />
                      </div>
                      <span className="text-[#86868b] font-semibold w-12 text-right">{item.value.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
       </AppleCard>
    </div>
  );
};

const JobView = ({ data }: { data: StatsData }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <MetricCard label="Angkatan Kerja" value={`${((data.ageStats.filter(a => { const age = parseInt(a.range); return age >= 15 && age <= 64 }).reduce((acc, curr) => acc + curr.total, 0) / data.totalPopulation) * 100).toFixed(0)}%`} trendLabel="Usia 15-64 Tahun" color="blue" />
       <MetricCard label="Dominasi Profesi" value={data.jobStats[0]?.name} trend={`${((data.jobStats[0]?.value/data.totalPopulation)*100).toFixed(1)}%`} trendLabel="dari total populasi" color="orange" />
       <MetricCard label="Tingkat Pengangguran" value={`${(((data.jobStats.find(j => j.name.includes("TIDAK"))?.value || 0) / data.totalPopulation)*100).toFixed(1)}%`} trendLabel="Belum/Tidak Bekerja" color="gray" />
    </div>

    <AppleCard title="Sebaran Profesi" subtitle="Ragam mata pencaharian penduduk">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {data.jobStats.map((job, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="flex items-center p-5 bg-[#f5f5f7] rounded-2xl hover:bg-[#ebebed] transition-colors group cursor-default"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-5 shrink-0 bg-white text-[#1d1d1f] shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-5 h-5 text-[#0071e3]" />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-[#1d1d1f] truncate text-base group-hover:text-[#0071e3] transition-colors">{job.name}</p>
              <div className="flex items-center gap-2 mt-1">
                 <div className="h-1.5 w-16 bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0071e3]" style={{ width: `${(job.value/data.totalPopulation)*100}%` }} />
                 </div>
                 <p className="text-xs text-[#86868b] font-medium">{job.value.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppleCard>
  </div>
);

const ReligionView = ({ data }: { data: StatsData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">
       <AppleCard title="Demografi Agama" subtitle="Komposisi pemeluk agama" className="h-full">
          <div className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.religionStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#86868b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#0071e3" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </AppleCard>
    </div>
    <div className="lg:col-span-1 space-y-4">
      {data.religionStats.map((item, i) => (
        <AppleCard key={i} className="flex-row items-center justify-between p-6" delay={i * 0.1}>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
                 <span className="font-bold text-lg">{item.name[0]}</span>
              </div>
              <div>
                 <h4 className="font-semibold text-[#1d1d1f]">{item.name}</h4>
                 <p className="text-xs text-[#86868b]">Pemeluk</p>
              </div>
           </div>
           <span className="text-xl font-bold text-[#1d1d1f]">{item.value.toLocaleString('id-ID')}</span>
        </AppleCard>
      ))}
    </div>
  </div>
);

const MaritalView = ({ data }: { data: StatsData }) => (
  <div className="grid grid-cols-1 gap-8">
     <AppleCard title="Status Perkawinan" subtitle="Gambaran status sipil penduduk" className="min-h-[500px]">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
         {data.maritalStats.map((item, i) => (
           <motion.div 
             key={i}
             whileHover={{ scale: 1.02 }}
             className="bg-[#f5f5f7] rounded-[32px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group"
           >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", i % 2 === 0 ? "bg-blue-500" : "bg-pink-500")} />
              
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 text-[#ff2d55] shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-8 h-8" fill={i === 0 ? "currentColor" : "none"} strokeWidth={1.5} />
              </div>
              <h4 className="text-4xl font-bold text-[#1d1d1f] mb-2 tracking-tight">{item.value.toLocaleString('id-ID')}</h4>
              <p className="text-[#86868b] font-medium text-lg">{item.name}</p>
              
              <div className="mt-6 w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", i % 2 === 0 ? "bg-[#0071e3]" : "bg-[#ff2d55]")} style={{ width: `${(item.value/data.totalPopulation)*100}%` }} />
              </div>
           </motion.div>
         ))}
       </div>
     </AppleCard>
  </div>
);

const AssistanceView = ({ data }: { data: StatsData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-8">
      <MetricCard label="Penerima Bantuan" value={data.assistanceStats[0]?.value.toLocaleString('id-ID')} trend={`${Math.min(100, (data.assistanceStats[0]?.value/data.totalFamilies)*100).toFixed(1)}%`} trendLabel="dari total KK" color="green" />
      <AppleCard title="Distribusi Bantuan" subtitle="Proporsi penerima manfaat">
        <div className="flex flex-col gap-6 mt-4">
           {data.assistanceStats.map((item, i) => (
             <div key={i} className="p-4 rounded-2xl bg-[#f5f5f7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={cn("w-3 h-3 rounded-full", i === 0 ? "bg-[#34c759]" : "bg-[#8e8e93]")} />
                   <span className="font-medium text-[#1d1d1f]">{item.name}</span>
                </div>
                <span className="font-bold text-[#1d1d1f]">{item.value.toLocaleString('id-ID')}</span>
             </div>
           ))}
        </div>
      </AppleCard>
    </div>
    
    <AppleCard className="flex items-center justify-center bg-[#1d1d1f] text-white">
      <div className="relative w-full max-w-[300px] aspect-square">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.assistanceStats}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill="#34c759" />
              <Cell fill="#333" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold tracking-tighter text-white">
            {data.assistanceStats[0]?.value ? Math.min(100, (data.assistanceStats[0].value / data.totalFamilies) * 100).toFixed(0) : 0}%
          </span>
          <span className="text-zinc-400 mt-2 font-medium">Cakupan Bantuan</span>
        </div>
      </div>
    </AppleCard>
  </div>
);

const GenericStatsView = ({ data, title, subtitle }: { data: { name: string; value: number }[], title: string, subtitle?: string }) => {
  const total = data?.reduce((acc, curr) => acc + curr.value, 0) || 0;

  return (
    <div className="grid grid-cols-1 gap-8">
      <AppleCard title={title} subtitle={subtitle || `Total Data: ${total.toLocaleString('id-ID')}`}>
         <div className="mt-6">
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                   <XAxis type="number" hide />
                   <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12}} />
                   <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                   <Bar dataKey="value" fill="#0071e3" radius={[0, 4, 4, 0]} barSize={32}>
                     {data?.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={THEME.colors[index % THEME.colors.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         {/* List View below chart */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {data?.map((item, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#f5f5f7]">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME.colors[i % THEME.colors.length] }} />
                     <span className="text-sm font-medium text-[#1d1d1f] truncate max-w-[120px]" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-bold text-[#1d1d1f]">{item.value.toLocaleString('id-ID')}</span>
               </div>
            ))}
         </div>
      </AppleCard>
    </div>
  )
}

// --- Main Component ---

export default function StatisticsView({ data, villageName, category }: StatisticsViewProps) {
  
  const renderContent = () => {
    switch (category) {
      case 'pendidikan': return <EducationView data={data} />;
      case 'pekerjaan': return <JobView data={data} />;
      case 'agama': return <ReligionView data={data} />;
      case 'perkawinan': return <MaritalView data={data} />;
      case 'bantuan': return <AssistanceView data={data} />;
      
      // New Categories
      case 'kategori-umur': return <GenericStatsView data={data.ageCategoryStats} title="Kategori Umur" subtitle="Sebaran penduduk berdasarkan kategori usia" />;
      case 'pendidikan-sedang-ditempuh': return <GenericStatsView data={data.educationOngoingStats} title="Pendidikan Sedang Ditempuh" subtitle="Data partisipasi sekolah saat ini" />;
      case 'hubungan-dalam-kk': return <GenericStatsView data={data.familyRelationStats} title="Hubungan Dalam KK" subtitle="Struktur hubungan dalam keluarga" />;
      case 'warga-negara': return <GenericStatsView data={data.citizenshipStats} title="Kewarganegaraan" subtitle="Status kewarganegaraan penduduk" />;
      case 'status-penduduk': return <GenericStatsView data={data.residentStatusStats} title="Status Penduduk" subtitle="Status kependudukan (Tetap, Kontrak, dll)" />;
      case 'golongan-darah': return <GenericStatsView data={data.bloodTypeStats} title="Golongan Darah" subtitle="Sebaran golongan darah penduduk" />;
      case 'penyandang-cacat': return <GenericStatsView data={data.disabilityStats} title="Penyandang Cacat" subtitle="Data penduduk berkebutuhan khusus" />;
      case 'penyakit-menahun': return <GenericStatsView data={data.chronicDiseaseStats} title="Penyakit Menahun" subtitle="Data riwayat penyakit menahun" />;
      case 'akseptor-kb': return <GenericStatsView data={data.kbStats} title="Akseptor KB" subtitle="Partisipasi Keluarga Berencana" />;
      case 'akta-kelahiran': return <GenericStatsView data={data.birthCertStats} title="Kepemilikan Akta Kelahiran" subtitle="Cakupan kepemilikan dokumen akta lahir" />;
      case 'kepemilikan-ktp': return <GenericStatsView data={data.ktpStats} title="Identitas Elektronik" subtitle="Kepemilikan KTP-el dan KIA" />;
      case 'asuransi-kesehatan': return <GenericStatsView data={data.insuranceStats} title="Asuransi Kesehatan" subtitle="Kepesertaan jaminan kesehatan" />;
      case 'suku-etnis': return <GenericStatsView data={data.ethnicityStats} title="Suku / Etnis" subtitle="Keberagaman suku dan etnis" />;
      case 'bpjs-ketenagakerjaan': return <GenericStatsView data={data.bpjsLaborStats} title="BPJS Ketenagakerjaan" subtitle="Kepesertaan jaminan sosial ketenagakerjaan" />;
      case 'status-kehamilan': return <GenericStatsView data={data.pregnancyStats} title="Status Kehamilan" subtitle="Data ibu hamil" />;
      case 'kepemilikan-kia': return <GenericStatsView data={data.kiaStats} title="Kepemilikan KIA" subtitle="Cakupan Kartu Identitas Anak" />;
      case 'kepemilikan-akta-kematian': return <GenericStatsView data={[]} title="Akta Kematian" subtitle="Data tidak tersedia untuk penduduk aktif" />;
      
      // Aliases
      case 'rentang-umur': return <GeneralView data={data} />; // Shows pyramid
      case 'jenis-kelamin': return <GeneralView data={data} />; // Shows gender pie
      case 'pendidikan-dalam-kk': return <EducationView data={data} />;
      case 'status-perkawinan': return <MaritalView data={data} />;

      default: return <GeneralView data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-32 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-12">
        <motion.div
          key={category || 'general'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
