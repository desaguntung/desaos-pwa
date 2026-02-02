import { Element } from "@craftjs/core";
import { Page } from "@/components/editor/nodes/Page";
import { KopSurat } from "@/components/editor/nodes/KopSurat";
import { Text } from "@/components/editor/nodes/Text";
import { DataRow } from "@/components/editor/nodes/DataRow";
import { Signature } from "@/components/editor/nodes/Signature";
import { OpeningText, ClosingText, CommonPendudukData } from "@/components/editor/LegacyComponents";

export const loadTemplatePart6 = (type: string) => {
  if (type === "pindah") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_pindah" is={Text} text="SURAT KETERANGAN PINDAH PENDUDUK" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_pindah" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Adalah benar penduduk kami yang mengajukan permohonan pindah penduduk dengan rincian sebagai berikut:" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Alasan Pindah" variable="Alasan Pindah" useInput={true} inputPlaceholder="Alasan Pindah" />
              <Element is={DataRow} label="Pindah Ke" variable="Alamat Tujuan" useInput={true} inputPlaceholder="Alamat Lengkap Tujuan" />
              <Element is={DataRow} label="Desa/Kelurahan" variable="Desa Tujuan" useInput={true} inputPlaceholder="Desa Tujuan" />
              <Element is={DataRow} label="Kecamatan" variable="Kecamatan Tujuan" useInput={true} inputPlaceholder="Kecamatan Tujuan" />
              <Element is={DataRow} label="Kabupaten/Kota" variable="Kabupaten Tujuan" useInput={true} inputPlaceholder="Kab/Kota Tujuan" />
              <Element is={DataRow} label="Provinsi" variable="Provinsi Tujuan" useInput={true} inputPlaceholder="Provinsi Tujuan" />
              <Element is={DataRow} label="Jumlah Pengikut" variable="Pengikut" useInput={true} inputPlaceholder="Jumlah Pengikut" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "rujuk_cerai") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_rujuk_cerai" is={Text} text="SURAT KETERANGAN RUJUK / CERAI" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_rujuk_cerai" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa yang bersangkutan telah:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Status" variable="Status" useInput={true} inputPlaceholder="Rujuk / Cerai" />
              <Element is={DataRow} label="Nama Pasangan" variable="Nama Pasangan" useInput={true} inputPlaceholder="Nama Suami/Istri" />
              <Element is={DataRow} label="Tanggal" variable="Tanggal Kejadian" useInput={true} inputPlaceholder="Tanggal Rujuk/Cerai" />
              <Element is={DataRow} label="No. Akta/Surat" variable="No Akta" useInput={true} inputPlaceholder="Nomor Akta/Surat" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "wali_hakim") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_wali_hakim" is={Text} text="SURAT KETERANGAN WALI HAKIM" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_wali_hakim" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Menerangkan bahwa yang bersangkutan membutuhkan Wali Hakim untuk pernikahan dikarenakan:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Alasan" variable="Sebab Wali Hakim" useInput={true} inputPlaceholder="Tidak ada wali nasab / dll" />
              <Element is={DataRow} label="Untuk Pernikahan" variable="Nama Calon" useInput={true} inputPlaceholder="Nama Calon Suami" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "kuasa") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_kuasa" is={Text} text="SURAT KUASA" fontSize="16" textAlign="center" bold={true} />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini (Pemberi Kuasa):" />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Memberikan kuasa sepenuhnya kepada (Penerima Kuasa):" fontSize="12" textAlign="justify" />
        <div className="h-2"></div>
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Nama" variable="Nama Penerima" useInput={true} inputPlaceholder="Nama Penerima Kuasa" />
              <Element is={DataRow} label="NIK" variable="NIK Penerima" useInput={true} inputPlaceholder="NIK Penerima Kuasa" />
              <Element is={DataRow} label="Umur" variable="Umur Penerima" useInput={true} inputPlaceholder="Umur Penerima Kuasa" />
              <Element is={DataRow} label="Pekerjaan" variable="Pekerjaan Penerima" useInput={true} inputPlaceholder="Pekerjaan Penerima Kuasa" />
              <Element is={DataRow} label="Alamat" variable="Alamat Penerima" useInput={true} inputPlaceholder="Alamat Penerima Kuasa" />
          </div>
        </div>
        <div className="h-4"></div>
        <Text text="Untuk melakukan pengurusan/tindakan:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <Element is={DataRow} label="Keperluan" variable="Keperluan Kuasa" useInput={true} inputPlaceholder="Isi Kuasa" />
        </div>
        <ClosingText text="Demikian surat kuasa ini dibuat dengan sebenarnya tanpa ada paksaan dari pihak manapun." />
        <Signature />
      </Element>
    );
  } else if (type === "perjalanan_dinas") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_sppd" is={Text} text="SURAT PERINTAH PERJALANAN DINAS (SPPD)" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_sppd" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText text="Pejabat yang berwenang memberikan perintah:" />
        <div className="pl-4">
            <Element is={DataRow} label="Nama Pejabat" variable="Nama Pejabat" useInput={true} inputPlaceholder="Nama Pejabat" />
            <Element is={DataRow} label="Jabatan" variable="Jabatan Pejabat" useInput={true} inputPlaceholder="Jabatan" />
        </div>
        <div className="h-4"></div>
        <Text text="Memerintahkan kepada:" fontSize="12" textAlign="justify" />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Untuk melaksanakan perjalanan dinas dengan rincian:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Tujuan" variable="Tujuan Dinas" useInput={true} inputPlaceholder="Tempat Tujuan" />
              <Element is={DataRow} label="Keperluan" variable="Keperluan Dinas" useInput={true} inputPlaceholder="Maksud Perjalanan" />
              <Element is={DataRow} label="Lama Perjalanan" variable="Lama Dinas" useInput={true} inputPlaceholder="... Hari" />
              <Element is={DataRow} label="Tanggal Berangkat" variable="Tgl Berangkat" useInput={true} inputPlaceholder="Tgl Berangkat" />
              <Element is={DataRow} label="Tanggal Kembali" variable="Tgl Kembali" useInput={true} inputPlaceholder="Tgl Kembali" />
              <Element is={DataRow} label="Beban Anggaran" variable="Anggaran" useInput={true} inputPlaceholder="Sumber Dana" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "pas_lintas") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_pas_lintas" is={Text} text="SURAT PAS LINTAS" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_pas_lintas" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Diberikan izin pas lintas untuk membawa barang:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Jenis Barang" variable="Jenis Barang" useInput={true} inputPlaceholder="Jenis Barang" />
              <Element is={DataRow} label="Jumlah" variable="Jumlah Barang" useInput={true} inputPlaceholder="Jumlah" />
              <Element is={DataRow} label="Tujuan" variable="Tujuan Barang" useInput={true} inputPlaceholder="Tujuan Pengiriman" />
              <Element is={DataRow} label="Kendaraan" variable="Kendaraan Angkut" useInput={true} inputPlaceholder="Jenis/No Pol Kendaraan" />
          </div>
        </div>
        <ClosingText />
        <Signature />
      </Element>
    );
  } else if (type === "sporadik") {
    return (
      <Element is={Page} canvas>
        <KopSurat />
        <div className="h-4"></div>
        <Element id="judul_sporadik" is={Text} text="SURAT PERNYATAAN PENGUASAAN FISIK BIDANG TANAH (SPORADIK)" fontSize="16" textAlign="center" bold={true} />
        <Element id="nomor_sporadik" is={Text} text="Nomor : [format_nomor_surat]" fontSize="12" textAlign="center" />
        <div className="h-6"></div>
        <OpeningText text="Yang bertanda tangan di bawah ini:" />
        <CommonPendudukData />
        <div className="h-4"></div>
        <Text text="Dengan ini menyatakan dengan sesungguhnya bahwa saya menguasai sebidang tanah yang terletak di:" fontSize="12" textAlign="justify" />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Jalan/Blok" variable="Lokasi Tanah" useInput={true} inputPlaceholder="Lokasi Tanah" />
              <Element is={DataRow} label="RT/RW" variable="RT/RW Tanah" useInput={true} inputPlaceholder="RT/RW" />
              <Element is={DataRow} label="Desa" variable="Desa Tanah" useInput={true} inputPlaceholder="Desa" />
              <Element is={DataRow} label="Luas Tanah" variable="Luas Tanah" useInput={true} inputPlaceholder="Luas (m2)" />
              <Element is={DataRow} label="Status Tanah" variable="Status Tanah" useInput={true} inputPlaceholder="Status Tanah" />
              <Element is={DataRow} label="NIB" variable="NIB" useInput={true} inputPlaceholder="Nomor Induk Bidang (NIB)" />
          </div>
        </div>
        <div className="h-2"></div>
        <Text text="Batas-batas tanah:" fontSize="12" bold={true} />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Utara" variable="Batas Utara" useInput={true} inputPlaceholder="Batas Utara" />
              <Element is={DataRow} label="Timur" variable="Batas Timur" useInput={true} inputPlaceholder="Batas Timur" />
              <Element is={DataRow} label="Selatan" variable="Batas Selatan" useInput={true} inputPlaceholder="Batas Selatan" />
              <Element is={DataRow} label="Barat" variable="Batas Barat" useInput={true} inputPlaceholder="Batas Barat" />
          </div>
        </div>
        <div className="h-2"></div>
        <Text text="Saksi-saksi:" fontSize="12" bold={true} />
        <div className="pl-4">
          <div className="flex flex-col gap-0">
              <Element is={DataRow} label="Saksi 1" variable="Saksi 1" useInput={true} inputPlaceholder="Nama Saksi 1" />
              <Element is={DataRow} label="Saksi 2" variable="Saksi 2" useInput={true} inputPlaceholder="Nama Saksi 2" />
          </div>
        </div>
        <ClosingText text="Demikian surat pernyataan ini saya buat dengan sebenarnya dan penuh tanggung jawab." />
        <Signature />
      </Element>
    );
  }
  return null;
};
