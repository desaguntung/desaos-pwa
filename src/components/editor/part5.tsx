import { Element } from "@craftjs/core";
import { Page } from "./nodes/Page";
import { KopSurat } from "./nodes/KopSurat";
import { Text } from "./nodes/Text";
import { DataRow } from "./nodes/DataRow";
import { Signature } from "./nodes/Signature";
import { OpeningText, ClosingText, CommonPendudukData } from "./LegacyComponents";

export const loadTemplatePart5 = (type: string) => {
  if (type === "janda") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_janda" is={Text} text="SURAT KETERANGAN JANDA/DUDA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_janda" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang berstatus Janda/Duda, dikarenakan suami/istri yang bersangkutan telah meninggal dunia/cerai pada:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Pasangan" variable="Nama Pasangan" useInput={true} inputPlaceholder="Nama Almarhum/Mantan" />
              <Element is={DataRow} label="Tanggal" variable="Tanggal Status" useInput={true} inputPlaceholder="Tgl Meninggal/Cerai" />
              <Element is={DataRow} label="Tempat" variable="Tempat Status" useInput={true} inputPlaceholder="Tempat Meninggal/Cerai" />
              <Element is={DataRow} label="Penyebab" variable="Status Janda/Duda" useInput={true} inputPlaceholder="Meninggal Dunia / Cerai Mati / Cerai Hidup" />
          </div>
        </div>
        <div className="h-2"></div>
        <Text text="Sampai saat ini yang bersangkutan belum menikah lagi." fontSize="12" textAlign="justify" />
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "lahir_mati") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_lahir_mati" is={Text} text="SURAT KETERANGAN LAHIR MATI" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_lahir_mati" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <Text text="Menerangkan bahwa telah lahir dalam keadaan meninggal dunia (Lahir Mati):" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Hari/Tanggal" variable="Tgl Lahir" useInput={true} inputPlaceholder="Hari, Tanggal Lahir" />
              <Element is={DataRow} label="Pukul" variable="Pukul Lahir" useInput={true} inputPlaceholder="Jam Lahir" />
              <Element is={DataRow} label="Tempat" variable="Tempat Lahir" useInput={true} inputPlaceholder="Tempat Lahir" />
              <Element is={DataRow} label="Jenis Kelamin" variable="JK Bayi" useInput={true} inputPlaceholder="L/P" />
              <Element is={DataRow} label="Penyebab" variable="Sebab" useInput={true} inputPlaceholder="Penyebab Kematian" />
            </div>
        </div>
        <div className="h-4"></div>
        <Text text="Anak dari ibu:" fontSize="12" textAlign="justify" />
        <CommonPendudukData />
        <div className="pl-4">
            <Element is={DataRow} label="Nama Suami" variable="Nama Suami" useInput={true} inputPlaceholder="Nama Suami" />
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "nikah" || type === "nikah_non_muslim") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_nikah" is={Text} text={type === "nikah" ? "SURAT KETERANGAN UNTUK NIKAH" : "SURAT KETERANGAN NIKAH (NON MUSLIM)"} fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_nikah" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang akan melangsungkan pernikahan dengan:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Calon" variable="Nama Calon" useInput={true} inputPlaceholder="Nama Calon Pasangan" />
              <Element is={DataRow} label="Bin/Binti" variable="Bin Calon" useInput={true} inputPlaceholder="Nama Ayah Calon" />
              <Element is={DataRow} label="Tempat/Tgl Lahir" variable="TTL Calon" useInput={true} inputPlaceholder="TTL Calon" />
              <Element is={DataRow} label="Warganegara" variable="Warganegara Calon" useInput={true} inputPlaceholder="WNI/WNA" />
              <Element is={DataRow} label="Agama" variable="Agama Calon" useInput={true} inputPlaceholder="Agama Calon" />
              <Element is={DataRow} label="Pekerjaan" variable="Pekerjaan Calon" useInput={true} inputPlaceholder="Pekerjaan Calon" />
              <Element is={DataRow} label="Alamat" variable="Alamat Calon" useInput={true} inputPlaceholder="Alamat Calon" />
              <Element is={DataRow} label="Status" variable="Status Calon" useInput={true} inputPlaceholder="Jejaka/Perawan/Duda/Janda" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "ket_penduduk") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_ket_penduduk" is={Text} text="SURAT KETERANGAN PENDUDUK" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_ket_penduduk" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], yang terdaftar dalam Kartu Keluarga (KK) dan memiliki Kartu Tanda Penduduk (KTP) dengan alamat tersebut di atas." fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan Surat" />
              <Element is={DataRow} label="Berlaku s/d" variable="Tgl Berlaku" useInput={true} inputPlaceholder="Tanggal Akhir Berlaku" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "pengantar") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_pengantar" is={Text} text="SURAT PENGANTAR" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_pengantar" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang berkelakuan baik. Surat pengantar ini diberikan untuk keperluan:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan Pengantar" />
              <Element is={DataRow} label="Tujuan" variable="Tujuan" useInput={true} inputPlaceholder="Tujuan Instansi" />
              <Element is={DataRow} label="Berlaku Dari" variable="Berlaku Dari" useInput={true} inputPlaceholder="Tanggal Mulai" />
              <Element is={DataRow} label="Berlaku Sampai" variable="Berlaku Sampai" useInput={true} inputPlaceholder="Tanggal Selesai" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "pergi_kawin") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_pergi_kawin" is={Text} text="SURAT KETERANGAN PERGI KAWIN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_pergi_kawin" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang akan melaksanakan pernikahan (Pergi Kawin) di luar daerah, yaitu:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Tujuan (Tempat)" variable="Tujuan Kawin" useInput={true} inputPlaceholder="Tempat Pernikahan" />
              <Element is={DataRow} label="Dengan Seorang" variable="Nama Calon" useInput={true} inputPlaceholder="Nama Calon Pasangan" />
              <Element is={DataRow} label="Alamat Calon" variable="Alamat Calon" useInput={true} inputPlaceholder="Alamat Calon" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  }
  return null;
};
