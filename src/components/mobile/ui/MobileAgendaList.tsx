import { Calendar, Clock, MapPin } from "lucide-react";

export default function MobileAgendaList() {
  const agendas = [
    { title: "Musyawarah Desa", date: "12 Okt", time: "09:00 WIB", location: "Balai Desa" },
    { title: "Posyandu Balita", date: "15 Okt", time: "08:00 WIB", location: "Puskesmas Pembantu" },
    { title: "Gotong Royong", date: "18 Okt", time: "07:00 WIB", location: "Dusun A" },
  ];

  return (
    <div className="px-5 space-y-3">
      {agendas.map((item, idx) => (
        <div key={idx} className="flex gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center justify-center w-14 h-14 bg-orange-50 rounded-xl text-orange-600 shrink-0">
            <span className="text-xs font-bold uppercase">{item.date.split(" ")[1]}</span>
            <span className="text-xl font-black">{item.date.split(" ")[0]}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{item.title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
