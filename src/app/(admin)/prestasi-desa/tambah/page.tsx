import { PrestasiForm } from "@/components/PrestasiForm";
import { createPrestasi } from "../actions";

export default function TambahPrestasiPage() {
  return (
    <PrestasiForm
      mode="create"
      title="Tambah Prestasi"
      subtitle="Tambahkan data prestasi atau penghargaan desa baru."
      backButtonHref="/prestasi-desa"
      onSubmit={createPrestasi}
    />
  );
}
