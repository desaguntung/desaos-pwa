"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createPrestasi(input: {
  judul: string
  tanggal?: string
  tingkat?: string
  deskripsi?: string
  foto_url?: string
}) {
  await prisma.prestasi_desa.create({
    data: {
      judul: input.judul,
      deskripsi: input.deskripsi ?? null,
      tingkat: input.tingkat ?? null,
      foto_url: input.foto_url ?? null,
      tanggal: input.tanggal ? new Date(input.tanggal) : null,
    },
  })
  revalidatePath("/prestasi-desa")
  revalidatePath("/admin/prestasi-desa")
}

export async function deletePrestasiServer(id: string) {
  await prisma.prestasi_desa.delete({
    where: { id },
  })
  revalidatePath("/prestasi-desa")
  revalidatePath("/admin/prestasi-desa")
}

export async function updatePrestasi(input: {
  id: string
  judul: string
  tanggal?: string
  tingkat?: string
  deskripsi?: string
  foto_url?: string
}) {
  await prisma.prestasi_desa.update({
    where: { id: input.id },
    data: {
      judul: input.judul,
      deskripsi: input.deskripsi ?? null,
      tingkat: input.tingkat ?? null,
      foto_url: input.foto_url ?? null,
      tanggal: input.tanggal ? new Date(input.tanggal) : null,
      updated_at: new Date(),
    },
  })
  revalidatePath("/prestasi-desa")
  revalidatePath("/admin/prestasi-desa")
}
 
export async function deletePrestasiFormAction(formData: FormData) {
  const id = String(formData.get("id") || "")
  if (!id) return
  await deletePrestasiServer(id)
}
