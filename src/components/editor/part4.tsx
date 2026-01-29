import { Element } from "@craftjs/core";
import { Page } from "./nodes/Page";
import { KopSurat } from "./nodes/KopSurat";
import { Text } from "./nodes/Text";
import { DataRow } from "./nodes/DataRow";
import { Signature } from "./nodes/Signature";
import { OpeningText, ClosingText, CommonPendudukData } from "./LegacyComponents";

export const loadTemplatePart4 = (type: string) => {
  if (type === "kehilangan") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_kehilangan" is={Text} text="SURAT KETERANGAN KEHILANGAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_kehilangan" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa orang tersebut di atas telah melaporkan kehilangan barang/surat berharga berupa:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Barang Hilang" variable="Barang Hilang" useInput={true} inputPlaceholder="Nama Barang/Surat" />
              <Element is={DataRow} label="Ciri-ciri" variable="Ciri-ciri" useInput={true} inputPlaceholder="Ciri-ciri Barang" />
              <Element is={DataRow} label="Lokasi Hilang" variable="Lokasi Hilang" useInput={true} inputPlaceholder="Tempat Kejadian" />
              <Element is={DataRow} label="Tanggal Hilang" variable="Tanggal Hilang" useInput={true} inputPlaceholder="Tanggal Kejadian" />
              <Element is={DataRow} label="Keterangan" variable="Keterangan" useInput={true} inputPlaceholder="Keterangan Tambahan" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "kelahiran") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_kelahiran" is={Text} text="SURAT KETERANGAN KELAHIRAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_kelahiran" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini menerangkan bahwa telah lahir seorang anak:" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Hari/Tanggal" variable="Tgl Lahir Anak" useInput={true} inputPlaceholder="Hari, Tanggal Lahir" />
              <Element is={DataRow} label="Pukul" variable="Pukul Lahir" useInput={true} inputPlaceholder="Jam Lahir" />
              <Element is={DataRow} label="Tempat Lahir" variable="Tempat Lahir Anak" useInput={true} inputPlaceholder="Tempat Lahir" />
              <Element is={DataRow} label="Jenis Kelamin" variable="JK Anak" useInput={true} inputPlaceholder="Laki-laki/Perempuan" />
              <Element is={DataRow} label="Nama Anak" variable="Nama Anak" useInput={true} inputPlaceholder="Nama Lengkap Anak" />
              <Element is={DataRow} label="Anak Ke" variable="Anak Ke" useInput={true} inputPlaceholder="Anak ke-..." />
          </div>
        </div>
        <div className="h-4"></div>
        <Text text="Dari pasangan suami istri:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Ayah" variable="Nama Ayah" useInput={true} inputPlaceholder="Nama Ayah" />
              <Element is={DataRow} label="Nama Ibu" variable="Nama Ibu" useInput={true} inputPlaceholder="Nama Ibu" />
              <Element is={DataRow} label="Alamat" variable="Alamat Ortu" useInput={true} inputPlaceholder="Alamat Orang Tua" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "kematian") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_kematian" is={Text} text="SURAT KETERANGAN KEMATIAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_kematian" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <Text text="Menerangkan bahwa:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama" variable="Nama Meninggal" useInput={true} inputPlaceholder="Nama Almarhum/ah" />
              <Element is={DataRow} label="NIK" variable="NIK Meninggal" useInput={true} inputPlaceholder="NIK Almarhum/ah" />
              <Element is={DataRow} label="Jenis Kelamin" variable="JK Meninggal" useInput={true} inputPlaceholder="L/P" />
              <Element is={DataRow} label="Alamat" variable="Alamat Meninggal" useInput={true} inputPlaceholder="Alamat Terakhir" />
            </div>
        </div>
        <div className="h-4"></div>
        <Text text="Telah meninggal dunia pada:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Hari/Tanggal" variable="Tgl Meninggal" useInput={true} inputPlaceholder="Hari, Tanggal Wafat" />
              <Element is={DataRow} label="Pukul" variable="Pukul Meninggal" useInput={true} inputPlaceholder="Jam Wafat" />
              <Element is={DataRow} label="Tempat" variable="Tempat Meninggal" useInput={true} inputPlaceholder="Tempat Meninggal" />
              <Element is={DataRow} label="Penyebab" variable="Sebab Meninggal" useInput={true} inputPlaceholder="Sakit/Kecelakaan/dll" />
            </div>
        </div>
        <div className="h-4"></div>
        <Text text="Surat ini dibuat berdasarkan laporan dari:" fontSize="12" textAlign="justify" />
        <CommonPendudukData />
        <div className="pl-4">
            <Element is={DataRow} label="Hubungan" variable="Hubungan Pelapor" useInput={true} inputPlaceholder="Hubungan dengan Almarhum" />
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "kendaraan") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_kendaraan" is={Text} text="SURAT KETERANGAN KEPEMILIKAN KENDARAAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_kendaraan" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa orang tersebut di atas adalah benar pemilik kendaraan bermotor dengan identitas sebagai berikut:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Merk/Type" variable="Merk" useInput={true} inputPlaceholder="Merk dan Tipe" />
              <Element is={DataRow} label="Tahun Pembuatan" variable="Tahun" useInput={true} inputPlaceholder="Tahun Pembuatan" />
              <Element is={DataRow} label="Warna" variable="Warna" useInput={true} inputPlaceholder="Warna Kendaraan" />
              <Element is={DataRow} label="No. Polisi" variable="No Polisi" useInput={true} inputPlaceholder="Nomor Polisi" />
              <Element is={DataRow} label="No. Rangka" variable="No Rangka" useInput={true} inputPlaceholder="Nomor Rangka" />
              <Element is={DataRow} label="No. Mesin" variable="No Mesin" useInput={true} inputPlaceholder="Nomor Mesin" />
              <Element is={DataRow} label="Atas Nama" variable="Atas Nama" useInput={true} inputPlaceholder="Nama di BPKB/STNK" />
              <Element is={DataRow} label="Alamat Pemilik" variable="Alamat Pemilik" useInput={true} inputPlaceholder="Alamat di BPKB/STNK" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "kepemilikan_tanah") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_tanah" is={Text} text="SURAT KETERANGAN KEPEMILIKAN TANAH" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_tanah" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa orang tersebut di atas benar-benar memiliki sebidang tanah dengan rincian sebagai berikut:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Lokasi Tanah" variable="Lokasi Tanah" useInput={true} inputPlaceholder="Lokasi/Blok" />
              <Element is={DataRow} label="Luas Tanah" variable="Luas Tanah" useInput={true} inputPlaceholder="Luas (m2/hektar)" />
              <Element is={DataRow} label="Bukti Kepemilikan" variable="Bukti" useInput={true} inputPlaceholder="No. Sertifikat/Letter C/SPPT" />
              <div className="h-2"></div>
              <Text text="Batas-batas:" fontSize="12" bold={true} />
              <Element is={DataRow} label="Utara" variable="Batas Utara" useInput={true} inputPlaceholder="Batas Utara" />
              <Element is={DataRow} label="Timur" variable="Batas Timur" useInput={true} inputPlaceholder="Batas Timur" />
              <Element is={DataRow} label="Selatan" variable="Batas Selatan" useInput={true} inputPlaceholder="Batas Selatan" />
              <Element is={DataRow} label="Barat" variable="Batas Barat" useInput={true} inputPlaceholder="Batas Barat" />
              <div className="h-2"></div>
              <Element is={DataRow} label="Asal Usul" variable="Asal Usul" useInput={true} inputPlaceholder="Warisan/Jual Beli/Hibah" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "ktp_dalam_proses") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_ktp_proses" is={Text} text="SURAT KETERANGAN KTP DALAM PROSES" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_ktp_proses" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Benar bahwa orang tersebut di atas adalah penduduk kami dan saat ini Kartu Tanda Penduduk (KTP) yang bersangkutan masih dalam proses pembuatan/pencetakan di Dinas Kependudukan dan Pencatatan Sipil." fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan Surat" />
          </div>
        </div>
        <div className="h-2"></div>
        <Text text="Surat keterangan ini berlaku sebagai pengganti KTP sementara selama KTP asli belum terbit." fontSize="12" textAlign="justify" />
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "kurang_mampu") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_sktm" is={Text} text="SURAT KETERANGAN KURANG MAMPU (SKTM)" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_sktm" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang menurut pengamatan kami tergolong keluarga KURANG MAMPU (Pra Sejahtera). Surat ini dibuat untuk keperluan:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Contoh: Persyaratan Beasiswa / Berobat" />
          </div>
        </div>
        <div className="h-4"></div>
        <Text text="Daftar Anggota Keluarga:" fontSize="12" bold={true} />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="1. Nama" variable="Anggota 1" useInput={true} inputPlaceholder="Nama Anggota Keluarga" />
              <Element is={DataRow} label="   NIK" variable="NIK Anggota 1" useInput={true} inputPlaceholder="NIK" />
              <Element is={DataRow} label="   Hubungan" variable="Hubungan 1" useInput={true} inputPlaceholder="Suami/Istri/Anak" />
              <div className="h-2"></div>
              <Element is={DataRow} label="2. Nama" variable="Anggota 2" useInput={true} inputPlaceholder="Nama Anggota Keluarga" />
              <Element is={DataRow} label="   NIK" variable="NIK Anggota 2" useInput={true} inputPlaceholder="NIK" />
              <Element is={DataRow} label="   Hubungan" variable="Hubungan 2" useInput={true} inputPlaceholder="Suami/Istri/Anak" />
              <div className="h-2"></div>
              <Element is={DataRow} label="3. Nama" variable="Anggota 3" useInput={true} inputPlaceholder="Nama Anggota Keluarga" />
              <Element is={DataRow} label="   NIK" variable="NIK Anggota 3" useInput={true} inputPlaceholder="NIK" />
              <Element is={DataRow} label="   Hubungan" variable="Hubungan 3" useInput={true} inputPlaceholder="Suami/Istri/Anak" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  }
  return null;
};
