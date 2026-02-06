import { PrestasiForm } from "@/components/PrestasiForm";
import { prisma } from "@/lib/prisma";
import { updatePrestasi } from "../../actions";

export default async function EditPrestasiPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const data = await prisma.prestasi_desa.findUnique({
    where: { id },
  });
  if (!data) {
    return null;
  }
  const initialData = {
    id: data.id,
    judul: data.judul,
    deskripsi: data.deskripsi || "",
    tanggal: data.tanggal ? new Date(data.tanggal).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    tingkat: data.tingkat || "",
    foto_url: data.foto_url || "",
  };
  return (
    <PrestasiForm
      mode="edit"
      initialData={initialData}
      title="Edit Prestasi"
      subtitle="Perbarui data prestasi desa."
      backButtonHref="/prestasi-desa"
      onSubmit={async (payload) => {
        await updatePrestasi({
          id,
          judul: payload.judul,
          tanggal: payload.tanggal,
          tingkat: payload.tingkat,
          deskripsi: payload.deskripsi,
          foto_url: payload.foto_url,
        });
      }}
    />
  );
}
