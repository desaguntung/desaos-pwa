import { LembagaForm } from "@/components/LembagaForm";
import { createLembaga } from "../actions";

export default function TambahLembagaPage() {
  return (
    <LembagaForm
      mode="create"
      title="Tambah Lembaga"
      subtitle="Tambahkan data lembaga desa baru ke dalam sistem."
      backButtonHref="/lembaga-desa"
      submitAction={createLembaga}
    />
  );
}
