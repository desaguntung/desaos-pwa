 "use server"
 
 import { revalidatePath } from "next/cache"
 import { prisma } from "@/lib/prisma"
 
 export async function createLembaga(input: {
   nama: string
   singkatan?: string
   kategori?: string
   alamat?: string
   deskripsi?: string
   logo_url?: string
 }) {
  await (prisma as any).lembaga_desa.create({
     data: {
       nama: input.nama,
       singkatan: input.singkatan ?? null,
       kategori: input.kategori ?? null,
       alamat: input.alamat ?? null,
       deskripsi: input.deskripsi ?? null,
       logo_url: input.logo_url ?? null,
     },
   })
   revalidatePath("/lembaga-desa")
   revalidatePath("/admin/lembaga-desa")
 }
 
 export async function updateLembaga(input: {
   id: string
   nama: string
   singkatan?: string
   kategori?: string
   alamat?: string
   deskripsi?: string
   logo_url?: string
 }) {
  await (prisma as any).lembaga_desa.update({
     where: { id: input.id },
     data: {
       nama: input.nama,
       singkatan: input.singkatan ?? null,
       kategori: input.kategori ?? null,
       alamat: input.alamat ?? null,
       deskripsi: input.deskripsi ?? null,
       logo_url: input.logo_url ?? null,
       updated_at: new Date(),
     },
   })
   revalidatePath("/lembaga-desa")
   revalidatePath("/admin/lembaga-desa")
 }
 
 export async function deleteLembagaServer(id: string) {
  await (prisma as any).lembaga_desa.delete({
     where: { id },
   })
   revalidatePath("/lembaga-desa")
   revalidatePath("/admin/lembaga-desa")
 }
 
 export async function deleteLembagaFormAction(formData: FormData) {
   const id = String(formData.get("id") || "")
   if (!id) return
   await deleteLembagaServer(id)
 }
