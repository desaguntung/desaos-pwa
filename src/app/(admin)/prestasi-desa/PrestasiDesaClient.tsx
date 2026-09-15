"use client";

import Link from "next/link";
import { MoreHorizontal, Calendar, Edit2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DataTable, Column, MobileConfig } from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { deletePrestasiFormAction } from "./actions";

export type Prestasi = {
  id: string;
  judul: string;
  tingkat?: string | null;
  tanggal: Date | string | null;
  deskripsi?: string | null;
  foto_url?: string | null;
};

export function PrestasiDesaTable({ data }: { data: Prestasi[] }) {
  const columns: Column<Prestasi>[] = [
    {
      header: "No",
      accessorKey: "id",
      className: "text-center w-12",
      cell: () => <span>-</span>,
    },
    {
      header: "Prestasi",
      accessorKey: "judul",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar src={row.foto_url} alt={row.judul} fallback={row.judul} size="md" shape="rounded" className="bg-body-bg" />
          </div>
          <div>
            <div className="font-medium text-primary-text">{row.judul}</div>
            <div className="text-xs text-secondary-text line-clamp-1 max-w-[200px]">{row.deskripsi || "-"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Tingkat",
      accessorKey: "tingkat",
      className: "text-center",
      cell: (row) => (
        <Badge variant="info" className="uppercase text-[10px] tracking-wider font-semibold">
          {row.tingkat || "Nasional"}
        </Badge>
      ),
    },
    {
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-secondary-text">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-sm">{formatDate(row.tanggal)}</span>
        </div>
      ),
    },
    {
      header: "Aksi",
      accessorKey: "id",
      className: "text-center w-16",
      cell: (row) => (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-secondary-text">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/prestasi-desa/edit/${row.id}`} className="flex items-center w-full">
                  <Edit2 className="w-3.5 h-3.5 mr-2 text-secondary-text" />
                  Edit Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={deletePrestasiFormAction}>
                <input type="hidden" name="id" value={row.id as string} />
                <button type="submit" className="w-full text-left px-2 py-1 text-error-text hover:bg-error-bg rounded flex items-center">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Hapus Data
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const mobileConfig: MobileConfig<Prestasi> = {
    titleKey: "judul",
    subtitleKey: (row) => <span>{row.tingkat || "Nasional"}</span>,
    statusKey: (row) => (
      <div className="flex items-center gap-1 text-xs text-secondary-text">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(row.tanggal)}</span>
      </div>
    ),
    action: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-secondary-text">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/prestasi-desa/edit/${row.id}`} className="flex items-center w-full">
              <Edit2 className="w-3.5 h-3.5 mr-2 text-secondary-text" />
              Edit Data
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={deletePrestasiFormAction}>
            <input type="hidden" name="id" value={row.id as string} />
            <button type="submit" className="w-full text-left px-2 py-1 text-error-text hover:bg-error-bg rounded flex items-center">
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Hapus Data
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  return <DataTable columns={columns} data={data} mobileConfig={mobileConfig} loading={false} />;
}
