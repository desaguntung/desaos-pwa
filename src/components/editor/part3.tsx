import { Element } from "@craftjs/core";
import { Page } from "@/components/editor/nodes/Page";
import { KopSurat } from "@/components/editor/nodes/KopSurat";
import { Text } from "@/components/editor/nodes/Text";
import { DataRow } from "@/components/editor/nodes/DataRow";
import { Signature } from "@/components/editor/nodes/Signature";
import { OpeningText, ClosingText, CommonPendudukData } from "@/components/editor/LegacyComponents";

export const loadTemplatePart3 = (type: string) => {
  if (type === "izin_orangtua") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_izin_ortu" is={Text} text="SURAT KETERANGAN IZIN ORANG TUA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_izin_ortu" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini, selaku orang tua/suami/istri dari:" />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Memberikan izin kepada anak/suami/istri kami tersebut untuk:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan" />
                <Element is={DataRow} label="Tujuan" variable="Tujuan" useInput={true} inputPlaceholder="Tujuan" />
                <Element is={DataRow} label="Lama Waktu" variable="Lama Waktu" useInput={true} inputPlaceholder="Lama Waktu" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "keramaian") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_keramaian" is={Text} text="SURAT PENGANTAR IZIN KERAMAIAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_keramaian" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang bermaksud mengadakan acara keramaian:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Nama Acara" variable="Nama Acara" useInput={true} inputPlaceholder="Nama Acara" />
                <Element is={DataRow} label="Hari/Tanggal" variable="Hari/Tanggal" useInput={true} inputPlaceholder="Hari dan Tanggal Acara" />
                <Element is={DataRow} label="Waktu" variable="Waktu" useInput={true} inputPlaceholder="Waktu Acara" />
                <Element is={DataRow} label="Tempat" variable="Tempat" useInput={true} inputPlaceholder="Tempat Acara" />
                <Element is={DataRow} label="Hiburan" variable="Hiburan" useInput={true} inputPlaceholder="Jenis Hiburan" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "beda_nama") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_beda_nama" is={Text} text="SURAT KETERANGAN BEDA NAMA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_beda_nama" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa nama tersebut di atas adalah orang yang sama, namun terdapat perbedaan penulisan nama pada dokumen:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Dokumen 1" variable="Dokumen 1" useInput={true} inputPlaceholder="Nama Dokumen (mis: KTP)" />
                <Element is={DataRow} label="Tertulis" variable="Tertulis 1" useInput={true} inputPlaceholder="Nama Tertulis" />
                <div className="h-2"></div>
                <Element is={DataRow} label="Dokumen 2" variable="Dokumen 2" useInput={true} inputPlaceholder="Nama Dokumen (mis: Ijazah)" />
                <Element is={DataRow} label="Tertulis" variable="Tertulis 2" useInput={true} inputPlaceholder="Nama Tertulis" />
                <div className="h-2"></div>
                <Element is={DataRow} label="Keterangan" variable="Keterangan" useInput={true} inputPlaceholder="Keterangan Tambahan" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "catatan_kriminal") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_skck" is={Text} text="SURAT PENGANTAR SKCK" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_skck" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang berkelakuan baik dan tidak pernah terlibat tindak pidana/kriminal. Surat ini dibuat untuk keperluan:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Pengurusan SKCK di Polsek/Polres" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "domisili_usaha") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_dom_usaha" is={Text} text="SURAT KETERANGAN DOMISILI USAHA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_dom_usaha" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa yang bersangkutan benar-benar memiliki usaha yang berdomisili di wilayah kami:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Nama Usaha" variable="Nama Usaha" useInput={true} inputPlaceholder="Nama Usaha" />
                <Element is={DataRow} label="Jenis Usaha" variable="Jenis Usaha" useInput={true} inputPlaceholder="Bidang Usaha" />
                <Element is={DataRow} label="Alamat Usaha" variable="Alamat Usaha" useInput={true} inputPlaceholder="Alamat Lengkap Usaha" />
                <Element is={DataRow} label="Status Bangunan" variable="Status Bangunan" useInput={true} inputPlaceholder="Milik Sendiri/Sewa" />
                <Element is={DataRow} label="Luas Bangunan" variable="Luas Bangunan" useInput={true} inputPlaceholder="Luas Tempat Usaha" />
                <Element is={DataRow} label="Jumlah Karyawan" variable="Jumlah Karyawan" useInput={true} inputPlaceholder="Jumlah Karyawan" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "jamkesos") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_jamkesos" is={Text} text="SURAT KETERANGAN JAMKESOS" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_jamkesos" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang tergolong keluarga kurang mampu dan layak mendapatkan Jaminan Kesehatan Sosial (Jamkesos). Surat ini dibuat untuk keperluan:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan Pengajuan Jamkesos" />
                <Element is={DataRow} label="No. Kartu Keluarga" variable="No KK" useInput={true} inputPlaceholder="Nomor KK" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "jual_beli") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_jual_beli" is={Text} text="SURAT KETERANGAN JUAL BELI" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_jual_beli" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa telah terjadi transaksi jual beli antara Pihak Pertama (Penjual) dan Pihak Kedua (Pembeli) atas objek:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Objek Jual Beli" variable="Objek" useInput={true} inputPlaceholder="Tanah/Bangunan/Hewan/dll" />
                <Element is={DataRow} label="Lokasi/Ciri" variable="Lokasi" useInput={true} inputPlaceholder="Lokasi atau Ciri-ciri" />
                <Element is={DataRow} label="Harga" variable="Harga" useInput={true} inputPlaceholder="Harga Transaksi" />
                <Element is={DataRow} label="Tanggal Transaksi" variable="Tanggal" useInput={true} inputPlaceholder="Tanggal Transaksi" />
            </div>
        </div>
        <div className="h-4"></div>
        <Text text="Identitas Pembeli (Pihak Kedua):" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Nama Pembeli" variable="Nama Pembeli" useInput={true} inputPlaceholder="Nama Pembeli" />
                <Element is={DataRow} label="NIK Pembeli" variable="NIK Pembeli" useInput={true} inputPlaceholder="NIK Pembeli" />
                <Element is={DataRow} label="Alamat Pembeli" variable="Alamat Pembeli" useInput={true} inputPlaceholder="Alamat Pembeli" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  }
  return null;
};
