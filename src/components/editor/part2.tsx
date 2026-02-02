import { Element } from "@craftjs/core";
import { Page } from "@/components/editor/nodes/Page";
import { KopSurat } from "@/components/editor/nodes/KopSurat";
import { Text } from "@/components/editor/nodes/Text";
import { DataRow } from "@/components/editor/nodes/DataRow";
import { Signature } from "@/components/editor/nodes/Signature";
import { OpeningText, ClosingText, CommonPendudukData } from "@/components/editor/LegacyComponents";

export const loadTemplatePart2 = (type: string) => {
  if (type === "ket_usaha") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_usaha" is={Text} text="SURAT KETERANGAN USAHA" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_usaha" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], yang bersangkutan benar-benar memiliki usaha:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama Usaha" variable="Nama Usaha" useInput={true} inputPlaceholder="Nama Usaha" />
              <Element is={DataRow} label="Jenis Usaha" variable="Jenis Usaha" useInput={true} inputPlaceholder="Jenis Usaha" />
              <Element is={DataRow} label="Alamat Usaha" variable="Alamat Usaha" useInput={true} inputPlaceholder="Alamat Usaha" />
              <Element is={DataRow} label="Mulai Usaha" variable="Mulai Usaha" useInput={true} inputPlaceholder="Tahun Mulai" />
              <Element is={DataRow} label="Berlaku Dari" variable="Berlaku Dari" useInput={true} inputPlaceholder="Tanggal Mulai Berlaku" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "domisili") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_domisili" is={Text} text="SURAT KETERANGAN DOMISILI" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_domisili" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk yang berdomisili di alamat tersebut di atas." fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Sejak Tanggal" variable="Sejak Tanggal" useInput={true} inputPlaceholder="Sejak Tanggal" />
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "penghasilan" || type === "penghasilan_orangtua" || type === "penghasilan_ayah" || type === "penghasilan_ibu") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_penghasilan" is={Text} text="SURAT KETERANGAN PENGHASILAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_penghasilan" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa orang tersebut di atas memiliki penghasilan rata-rata per bulan sebesar:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Penghasilan" variable="Penghasilan" useInput={true} inputPlaceholder="Rp. ..." />
              <Element is={DataRow} label="Sumber Penghasilan" variable="Sumber Penghasilan" useInput={true} inputPlaceholder="Sumber..." />
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Untuk keperluan..." />
          </div>
        </div>
        {type.includes("orangtua") && (
          <>
            <div className="h-4"></div>
            <Text text="Surat keterangan ini dibuat untuk melengkapi persyaratan administrasi anak/tanggungan:" fontSize="12" textAlign="justify" />
            <div className="h-2"></div>
            <div className="pl-4">
              <div className="flex flex-col gap-0">
                <Element is={DataRow} label="Nama Anak" variable="Nama Anak" useInput={true} inputPlaceholder="Nama Anak" />
                <Element is={DataRow} label="Tempat/Tgl Lahir" variable="Tgl Lahir Anak" useInput={true} inputPlaceholder="Tempat/Tgl Lahir Anak" />
                <Element is={DataRow} label="Sekolah/Univ" variable="Sekolah Anak" useInput={true} inputPlaceholder="Nama Sekolah/Universitas" />
              </div>
            </div>
          </>
        )}
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "bio_penduduk") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_bio" is={Text} text="BIODATA PENDUDUK" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_bio" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <CommonPendudukData />
        <div className="h-4"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Agama" variable="Agama" />
              <Element is={DataRow} label="Status Perkawinan" variable="Status Perkawinan" />
              <Element is={DataRow} label="Pendidikan Terakhir" variable="Pendidikan" />
              <Element is={DataRow} label="Golongan Darah" variable="Golongan Darah" />
              <Element is={DataRow} label="Nama Ayah" variable="Nama Ayah" />
              <Element is={DataRow} label="Nama Ibu" variable="Nama Ibu" />
          </div>
        </div>
        <Signature />
      </Element>
    );
  } else if (type === "beda_identitas_kis") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_beda_kis" is={Text} text="SURAT KETERANGAN BEDA IDENTITAS KIS" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_beda_kis" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa nama tersebut di atas adalah orang yang sama dengan nama yang tertera pada Kartu Indonesia Sehat (KIS) dengan nomor:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nomor KIS" variable="Nomor KIS" useInput={true} inputPlaceholder="Nomor KIS" />
              <Element is={DataRow} label="Nama pada KIS" variable="Nama pada KIS" useInput={true} inputPlaceholder="Nama di KIS" />
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "jalan") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_jalan" is={Text} text="SURAT KETERANGAN BEPERGIAN / JALAN" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_jalan" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk Desa [nama_desa] yang akan melakukan perjalanan ke:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Tujuan" variable="Tujuan" useInput={true} inputPlaceholder="Kota/Kab Tujuan" />
              <Element is={DataRow} label="Keperluan" variable="Keperluan" useInput={true} inputPlaceholder="Keperluan Perjalanan" />
              <Element is={DataRow} label="Berangkat Tgl" variable="Berangkat Tgl" useInput={true} inputPlaceholder="Tanggal Berangkat" />
              <Element is={DataRow} label="Berlaku Dari" variable="Berlaku Dari" useInput={true} inputPlaceholder="Mulai Berlaku" />
              <Element is={DataRow} label="Kendaraan" variable="Kendaraan" useInput={true} inputPlaceholder="Jenis Kendaraan" />
              <Element is={DataRow} label="Pengikut" variable="Pengikut" useInput={true} inputPlaceholder="Jumlah Pengikut" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  }
  return null;
};
