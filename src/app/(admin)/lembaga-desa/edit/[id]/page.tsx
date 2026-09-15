 import { LembagaForm } from "@/components/LembagaForm";
 import { prisma } from "@/lib/prisma";
 import { updateLembaga } from "../../actions";
 
 export default async function EditLembagaPage({
   params,
 }: {
   params: { id: string };
 }) {
   const id = params.id;
  const data = await (prisma as any).lembaga_desa.findUnique({
     where: { id },
   });
   if (!data) {
     return null;
   }
   const initialData = {
     id: data.id,
     nama: data.nama,
     singkatan: data.singkatan || "",
     kategori: data.kategori || "",
     alamat: data.alamat || "",
     deskripsi: data.deskripsi || "",
     logo_url: data.logo_url || "",
   };
  async function submitAction(payload: {
    nama: string
    singkatan?: string
    kategori?: string
    alamat?: string
    deskripsi?: string
    logo_url?: string
  }) {
    "use server"
    await updateLembaga({
      id,
      nama: payload.nama,
      singkatan: payload.singkatan,
      kategori: payload.kategori,
      alamat: payload.alamat,
      deskripsi: payload.deskripsi,
      logo_url: payload.logo_url,
    })
  }
   return (
     <LembagaForm
       mode="edit"
       initialData={initialData}
       title="Edit Lembaga"
       subtitle="Perbarui data lembaga desa."
       backButtonHref="/lembaga-desa"
      submitAction={submitAction}
     />
   );
 }
