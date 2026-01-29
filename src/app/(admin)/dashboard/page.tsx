import { Users, FileText, BarChart, Landmark, Search, PlusCircle, Filter, MoreHorizontal } from 'lucide-react';
import { PageHeader } from "@/components/layout/PageHeader";

export default function Page() {
  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview / Main"
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -tranzinc-y-1/2 w-3.5 h-3.5 text-secondary-text" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1 text-xs w-48 focus:outline-hidden focus:ring-1 focus:ring-zinc-200 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-700 dark:placeholder:text-zinc-500" 
              />
            </div>
            <button className="flex items-center gap-1.5 text-xs text-secondary-text bg-white border border-zinc-200 rounded-md px-2.5 py-1 hover:bg-zinc-50 transition-colors font-medium dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-300">
              <Filter className="w-3 h-3"/>
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs bg-primary-text text-white rounded-md px-2.5 py-1 hover:opacity-90 transition-opacity font-medium dark:text-zinc-900">
              <PlusCircle className="w-3 h-3"/>
              <span>New Request</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-(--breakpoint-2xl) w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Penduduk', value: '1,234', icon: Users, trend: '+2.1%' },
            { label: 'Surat Terlayani', value: '56', icon: FileText, trend: '+12%' },
            { label: 'Anggaran Desa', value: 'Rp 1.5M', icon: BarChart, trend: '0.0%' },
            { label: 'Aset Desa', value: '12', icon: Landmark, trend: '+1' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-lg p-4 hover:border-gray-300 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-secondary-text uppercase tracking-wider">{stat.label}</p>
              <stat.icon className="w-3.5 h-3.5 text-secondary-text" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-xl font-bold text-primary-text tracking-tight">{stat.value}</p>
              <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-secondary-text'}`}>
                {stat.trend}
              </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-200 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-primary-text uppercase tracking-wider">Recent Letter Requests</h3>
            <button className="text-secondary-text hover:text-primary-text transition-colors">
                <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-800">
                  <th className="text-xs font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5">Requester</th>
                  <th className="text-xs font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5">Letter Type</th>
                  <th className="text-xs font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5">Date</th>
                  <th className="text-xs font-semibold text-secondary-text uppercase tracking-wider px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {[
                  { name: 'Ahmad Syaifullah', type: 'Surat Keterangan Usaha', date: 'Jul 29, 2024', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
                  { name: 'Siti Aminah', type: 'Surat Keterangan Tidak Mampu', date: 'Jul 28, 2024', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
                  { name: 'Budi Santoso', type: 'Surat Domisili', date: 'Jul 27, 2024', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
                  { name: 'Dewi Lestari', type: 'Surat Kematian', date: 'Jul 26, 2024', status: 'Rejected', statusColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-primary-text">{row.name}</td>
                    <td className="px-4 py-3 text-xs text-secondary-text">{row.type}</td>
                    <td className="px-4 py-3 text-xs text-secondary-text">{row.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <button className="text-xs font-medium text-secondary-text hover:text-primary-text transition-colors">
              View all requests →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


