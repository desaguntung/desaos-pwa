 import Link from "next/link";
 import { Plus, Search, MoreHorizontal, Edit2, Trash2, MapPin, Download } from "lucide-react";
 import { PageHeader } from "@/components/layout/PageHeader";
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
 import { Button } from "@/components/ui/Button";
 import { Input } from "@/components/ui/Input";
 import { Card } from "@/components/ui/Card";
 import { prisma } from "@/lib/prisma";
 import { LembagaDesaTable, Lembaga } from "./LembagaDesaClient";
 
 export default async function LembagaDesaPage({
   searchParams,
 }: {
   searchParams?: Record<string, string | string[]>;
 }) {
   const pick = (v: string | string[] | undefined, fallback: string) =>
     Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
   const q = pick(searchParams?.q, "").trim();
   const page = Math.max(1, parseInt(pick(searchParams?.page, "1"), 10) || 1);
   const pageSize = Math.max(1, parseInt(pick(searchParams?.pageSize, "10"), 10) || 10);
 
   const where =
     q.length > 0
       ? {
           OR: [
             { nama: { contains: q, mode: "insensitive" as const } },
             { singkatan: { contains: q, mode: "insensitive" as const } },
           ],
         }
       : {};
 
   const [currentData, totalItems] = await Promise.all([
     prisma.lembaga_desa.findMany({
       where,
       orderBy: { nama: "asc" },
       skip: (page - 1) * pageSize,
       take: pageSize,
     }),
     prisma.lembaga_desa.count({ where }),
   ]);
 
   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
 
   return (
     <div className="flex h-full flex-col bg-body-bg space-y-6 p-6 md:p-8">
       <PageHeader title="Lembaga Desa" subtitle="Kelola data organisasi dan lembaga kemasyarakatan" />
 
       <Card className="p-4">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2 w-full md:w-auto flex-1">
             <div className="relative flex-1 max-w-sm">
               <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-secondary-text" />
               </div>
               <form className="flex" method="GET">
                 <Input
                   name="q"
                   defaultValue={q}
                   type="text"
                   className="pl-9 bg-card-bg border-border-color text-primary-text flex-1"
                   placeholder="Cari nama lembaga..."
                 />
                 <Button type="submit" variant="outline" className="ml-2">Cari</Button>
               </form>
             </div>
           </div>
 
           <div className="flex items-center gap-2 w-full md:w-auto justify-end">
             <Button variant="outline" size="icon" title="Export Data">
               <Download className="w-3.5 h-3.5 text-secondary-text" />
             </Button>
             <Link href="/lembaga-desa/tambah">
               <Button className="whitespace-nowrap">
                 <Plus className="w-3.5 h-3.5 mr-1.5" />
                 Tambah Lembaga
               </Button>
             </Link>
           </div>
         </div>
       </Card>
 
       {currentData.length === 0 && (
         <Card className="p-6 text-center">
           Belum ada data
         </Card>
       )}
 
       <LembagaDesaTable data={currentData as Lembaga[]} />
 
       <div className="sticky bottom-8 z-20 rounded-xl border border-border-color bg-card-bg">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full px-4 md:px-6">
           <span className="whitespace-nowrap pagination-summary">
             Menampilkan {Math.min((page - 1) * pageSize + 1, totalItems)}-{Math.min(page * pageSize, totalItems)} dari {totalItems} data
           </span>
           <div className="flex items-center space-x-2">
             <Link href={`/lembaga-desa?page=1&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
               <Button variant="outline" size="icon" className="h-8 w-8 p-0" aria-label="First page" disabled={page === 1}>
                 «
               </Button>
             </Link>
             <Link href={`/lembaga-desa?page=${Math.max(1, page - 1)}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
               <Button variant="outline" size="icon" className="h-8 w-8 p-0" aria-label="Previous page" disabled={page === 1}>
                 ‹
               </Button>
             </Link>
             <div className="flex items-center gap-1">
               {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
                 const computed = Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4)) + i;
                 return (
                   <Link key={computed} href={`/lembaga-desa?page=${computed}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
                     <Button variant={page === computed ? "primary" : "outline"} size="icon" className="h-8 w-8 p-0">
                       {computed}
                     </Button>
                   </Link>
                 );
               })}
             </div>
             <Link href={`/lembaga-desa?page=${Math.min(totalPages, page + 1)}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
               <Button variant="outline" size="icon" className="h-8 w-8 p-0" aria-label="Next page" disabled={page === totalPages}>
                 ›
               </Button>
             </Link>
             <Link href={`/lembaga-desa?page=${totalPages}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
               <Button variant="outline" size="icon" className="h-8 w-8 p-0" aria-label="Last page" disabled={page === totalPages}>
                 »
               </Button>
             </Link>
           </div>
         </div>
       </div>
     </div>
   );
 }
