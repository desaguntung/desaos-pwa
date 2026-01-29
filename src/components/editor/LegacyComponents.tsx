import { useNode, Element } from "@craftjs/core";
import { Text } from "./nodes/Text";
import { DataRow } from "./nodes/DataRow";

export const OpeningText = ({ text }: { text?: string }) => (
  <>
    <div className="h-4"></div>
    <Text text={text || "Yang bertanda tangan di bawah ini Kepala Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], menerangkan dengan sebenarnya bahwa:"} fontSize="12" textAlign="justify" />
    <div className="h-2"></div>
  </>
);

export const ClosingText = ({ text }: { text?: string }) => (
  <>
    <div className="h-4"></div>
    <Text text={text || "Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya."} fontSize="12" textAlign="justify" />
    <div className="h-6"></div>
  </>
);

export const CommonPendudukData = () => (
  <div className="pl-4">
    <div className="flex flex-col gap-0">
      <Element is={DataRow} label="Nama Lengkap" variable="Nama" />
      <Element is={DataRow} label="NIK" variable="NIK" />
      <Element is={DataRow} label="Tempat/Tgl Lahir" variable="Tempat/Tgl Lahir" />
      <Element is={DataRow} label="Jenis Kelamin" variable="Jenis Kelamin" />
      <Element is={DataRow} label="Pekerjaan" variable="Pekerjaan" />
      <Element is={DataRow} label="Alamat" variable="Alamat" />
    </div>
  </div>
);
