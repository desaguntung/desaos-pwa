import { Element } from "@craftjs/core";
import { Page } from "@/components/editor/nodes/Page";
import { KopSurat } from "@/components/editor/nodes/KopSurat";
import { Text } from "@/components/editor/nodes/Text";
import { DataRow } from "@/components/editor/nodes/DataRow";
import { Signature } from "@/components/editor/nodes/Signature";
import { OpeningText, ClosingText, CommonPendudukData } from "@/components/editor/LegacyComponents";

export const loadTemplatePart7 = (type: string) => {
  if (type === "permohonan_akta") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_mohon_akta" is={Text} text="SURAT PERMOHONAN AKTA KELAHIRAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_mohon_akta" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini mengajukan permohonan penerbitan Akta Kelahiran untuk anak:" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Anak" variable="Nama Anak" useInput={true} inputPlaceholder="Nama Anak" />
              <Element is={DataRow} label="Tempat/Tgl Lahir" variable="TTL Anak" useInput={true} inputPlaceholder="TTL Anak" />
              <Element is={DataRow} label="Anak Ke" variable="Anak Ke" useInput={true} inputPlaceholder="Anak Ke" />
              <Element is={DataRow} label="Jenis Kelamin" variable="JK Anak" useInput={true} inputPlaceholder="L/P" />
              <Element is={DataRow} label="Nama Ayah" variable="Nama Ayah" useInput={true} inputPlaceholder="Nama Ayah" />
              <Element is={DataRow} label="Nama Ibu" variable="Nama Ibu" useInput={true} inputPlaceholder="Nama Ibu" />
            </div>
        </div>
        <CommonPendudukData />
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "cerai") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_mohon_cerai" is={Text} text="SURAT PERMOHONAN CERAI" fontSize="16" textAlign="center" bold={true} />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini:" />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Dengan ini mengajukan permohonan cerai terhadap suami/istri saya:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Pasangan" variable="Nama Pasangan" useInput={true} inputPlaceholder="Nama Suami/Istri" />
              <Element is={DataRow} label="Alasan" variable="Alasan Cerai" useInput={true} inputPlaceholder="Alasan Perceraian" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "duplikat_kelahiran") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_duplikat_lahir" is={Text} text="SURAT PERMOHONAN DUPLIKAT KELAHIRAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_duplikat_lahir" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Mengajukan permohonan duplikat Surat Keterangan Kelahiran dikarenakan:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Alasan" variable="Alasan Duplikat" useInput={true} inputPlaceholder="Hilang/Rusak/dll" />
              <Element is={DataRow} label="Keterangan" variable="Keterangan" useInput={true} inputPlaceholder="Keterangan Tambahan" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "duplikat_nikah") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_duplikat_nikah" is={Text} text="SURAT PERMOHONAN DUPLIKAT SURAT NIKAH" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_duplikat_nikah" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Mengajukan permohonan duplikat Surat Nikah dikarenakan:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Alasan" variable="Alasan Duplikat" useInput={true} inputPlaceholder="Hilang/Rusak/dll" />
              <Element is={DataRow} label="No. Nikah Lama" variable="No Nikah Lama" useInput={true} inputPlaceholder="Nomor Surat Nikah Lama (Jika ada)" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "permohonan_kk") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_mohon_kk" is={Text} text="SURAT PERMOHONAN KARTU KELUARGA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_mohon_kk" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Mengajukan permohonan pembuatan Kartu Keluarga (KK) baru dikarenakan:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Alasan" variable="Alasan Permohonan" useInput={true} inputPlaceholder="Baru/Pisah KK/Hilang/dll" />
              <Element is={DataRow} label="Anggota Keluarga" variable="Jumlah Anggota" useInput={true} inputPlaceholder="Jumlah Anggota Keluarga" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "perubahan_kk") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_ubah_kk" is={Text} text="SURAT PERMOHONAN PERUBAHAN KARTU KELUARGA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_ubah_kk" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Mengajukan permohonan perubahan data pada Kartu Keluarga (KK) dikarenakan:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Alasan Perubahan" variable="Alasan Perubahan" useInput={true} inputPlaceholder="Penambahan/Pengurangan Anggota/Perbaikan Data" />
              <Element is={DataRow} label="No. KK Lama" variable="No KK Lama" useInput={true} inputPlaceholder="Nomor KK Lama" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "pernyataan_akta") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_nyata_akta" is={Text} text="SURAT PERNYATAAN BELUM MEMILIKI AKTA" fontSize="16" textAlign="center" bold={true} />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini:" />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menyatakan dengan sebenar-benarnya bahwa saya sampai saat ini belum pernah memiliki Akta Kelahiran." fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <Text text="Demikian surat pernyataan ini saya buat untuk dapat dipergunakan sebagai persyaratan pembuatan Akta Kelahiran." fontSize="12" textAlign="justify" />
        <ClosingText text=" " />
        <Signature />
      </Element>
    );
  } else if (type === "domisili_usaha_non_warga") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_dom_usaha_nw" is={Text} text="SURAT KETERANGAN DOMISILI USAHA (NON WARGA)" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_dom_usaha_nw" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa yang bersangkutan (Bukan Warga Desa Ini) benar-benar memiliki usaha yang berdomisili di wilayah kami:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
            <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Usaha" variable="Nama Usaha" useInput={true} inputPlaceholder="Nama Usaha" />
              <Element is={DataRow} label="Jenis Usaha" variable="Jenis Usaha" useInput={true} inputPlaceholder="Bidang Usaha" />
              <Element is={DataRow} label="Alamat Usaha" variable="Alamat Usaha" useInput={true} inputPlaceholder="Alamat Lengkap Usaha" />
              <Element is={DataRow} label="Status Bangunan" variable="Status Bangunan" useInput={true} inputPlaceholder="Milik Sendiri/Sewa" />
            </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  }
  return null;
};
