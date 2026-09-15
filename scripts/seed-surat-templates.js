const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to construct CraftJS JSON AST
function buildCraftTemplate(options) {
  const {
    title,
    extraDataRows = [],
    keteranganText = "Adalah benar penduduk yang berdomisili di alamat tersebut di atas.",
    customNodes = [],
    hasLandSketch = false
  } = options;

  const nodes = {};
  const pageChildren = [];

  // 1. Root Container
  nodes["ROOT"] = {
    type: { resolvedName: "Container" },
    isCanvas: true,
    props: {
      width: "100%",
      height: "auto",
      background: "transparent",
      padding: "0",
      flexDirection: "column",
      alignItems: "center"
    },
    displayName: "Container",
    custom: {},
    parent: null,
    nodes: ["page_1"],
    linkedNodes: {}
  };

  // 2. Page
  nodes["page_1"] = {
    type: { resolvedName: "Page" },
    isCanvas: true,
    props: {},
    displayName: "Page",
    custom: {},
    parent: "ROOT",
    nodes: pageChildren,
    linkedNodes: {}
  };

  // Kop Surat
  nodes["kop_1"] = {
    type: { resolvedName: "KopSurat" },
    isCanvas: false,
    props: {},
    displayName: "KopSurat",
    custom: {},
    parent: "page_1",
    nodes: [],
    linkedNodes: {}
  };
  pageChildren.push("kop_1");

  // Title
  nodes["title_1"] = {
    type: { resolvedName: "Text" },
    isCanvas: false,
    props: {
      text: title,
      fontSize: "16",
      textAlign: "center",
      fontWeight: "bold",
      textDecoration: "underline",
      marginTop: "16"
    },
    displayName: "Text",
    custom: {},
    parent: "page_1",
    nodes: [],
    linkedNodes: {}
  };
  pageChildren.push("title_1");

  // Nomor Surat
  nodes["nomor_1"] = {
    type: { resolvedName: "Text" },
    isCanvas: false,
    props: {
      text: "Nomor : [format_nomor_surat]",
      fontSize: "12",
      textAlign: "center",
      marginTop: "4",
      marginBottom: "16"
    },
    displayName: "Text",
    custom: {},
    parent: "page_1",
    nodes: [],
    linkedNodes: {}
  };
  pageChildren.push("nomor_1");

  // Opening Text
  nodes["open_1"] = {
    type: { resolvedName: "Text" },
    isCanvas: false,
    props: {
      text: "Yang bertanda tangan di bawah ini Kepala Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], menerangkan dengan sebenarnya bahwa:",
      fontSize: "12",
      textAlign: "justify",
      marginBottom: "8"
    },
    displayName: "Text",
    custom: {},
    parent: "page_1",
    nodes: [],
    linkedNodes: {}
  };
  pageChildren.push("open_1");

  // Standard Resident Data Rows
  const standardFields = [
    { label: "Nama Lengkap", variable: "penduduk.nama" },
    { label: "NIK", variable: "penduduk.nik" },
    { label: "Tempat / Tgl Lahir", variable: "penduduk.ttl" },
    { label: "Jenis Kelamin", variable: "penduduk.sex" },
    { label: "Agama", variable: "penduduk.agama" },
    { label: "Pekerjaan", variable: "penduduk.pekerjaan" },
    { label: "Alamat Lengkap", variable: "penduduk.alamat" }
  ];

  standardFields.forEach((f, idx) => {
    const id = `row_std_${idx + 1}`;
    nodes[id] = {
      type: { resolvedName: "DataRow" },
      isCanvas: false,
      props: {
        label: f.label,
        variable: f.variable,
        useInput: false,
        fontSize: "12",
        labelWidth: "160"
      },
      displayName: "DataRow",
      custom: {},
      parent: "page_1",
      nodes: [],
      linkedNodes: {}
    };
    pageChildren.push(id);
  });

  // Keterangan Text
  if (keteranganText) {
    nodes["ket_text"] = {
      type: { resolvedName: "Text" },
      isCanvas: false,
      props: {
        text: keteranganText,
        fontSize: "12",
        textAlign: "justify",
        marginTop: "8",
        marginBottom: "8"
      },
      displayName: "Text",
      custom: {},
      parent: "page_1",
      nodes: [],
      linkedNodes: {}
    };
    pageChildren.push("ket_text");
  }

  // Extra Data Rows (Specific to this letter type)
  extraDataRows.forEach((f, idx) => {
    const id = `row_extra_${idx + 1}`;
    nodes[id] = {
      type: { resolvedName: "DataRow" },
      isCanvas: false,
      props: {
        label: f.label,
        variable: f.key,
        useInput: f.useInput !== false,
        inputPlaceholder: f.placeholder || f.label,
        fontSize: "12",
        labelWidth: "160"
      },
      displayName: "DataRow",
      custom: {},
      parent: "page_1",
      nodes: [],
      linkedNodes: {}
    };
    pageChildren.push(id);
  });

  // Land sketch if needed
  if (hasLandSketch) {
    nodes["sketch_1"] = {
      type: { resolvedName: "LandSketch" },
      isCanvas: false,
      props: {},
      displayName: "LandSketch",
      custom: {},
      parent: "page_1",
      nodes: [],
      linkedNodes: {}
    };
    pageChildren.push("sketch_1");

    nodes["boundaries_1"] = {
      type: { resolvedName: "LandBoundaries" },
      isCanvas: false,
      props: {},
      displayName: "LandBoundaries",
      custom: {},
      parent: "page_1",
      nodes: [],
      linkedNodes: {}
    };
    pageChildren.push("boundaries_1");
  }

  // Closing Text
  nodes["close_1"] = {
    type: { resolvedName: "Text" },
    isCanvas: false,
    props: {
      text: "Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.",
      fontSize: "12",
      textAlign: "justify",
      marginTop: "12",
      marginBottom: "16"
    },
    displayName: "Text",
    custom: {},
    parent: "page_1",
    nodes: [],
    linkedNodes: {}
  };
  pageChildren.push("close_1");

  // Signature
  nodes["sig_1"] = {
    type: { resolvedName: "Signature" },
    isCanvas: false,
    props: {
      placeDate: "[nama_des], [tgl_surat]",
      rightTitle: "[penandatangan]",
      rightName: "pamong.nama",
      rightNip: "pamong.nip",
      showNip: true,
      showLeftSignature: false,
      marginTop: "24"
    },
    displayName: "Signature",
    custom: {},
    parent: "page_1",
    nodes: [],
    linkedNodes: {}
  };
  pageChildren.push("sig_1");

  return JSON.stringify(nodes);
}

// Map of all 46 formats with their specific titles, extra fields, and form_isian schemas
const TEMPLATES_MAP = {
  surat_ket_usaha: {
    title: "SURAT KETERANGAN USAHA",
    keteranganText: "Adalah benar warga Desa [nama_desa] yang bersangkutan memiliki usaha aktif sebagai berikut:",
    extraDataRows: [
      { label: "Nama Usaha", key: "Nama Usaha", type: "text", required: true },
      { label: "Jenis Usaha", key: "Jenis Usaha", type: "text", required: true },
      { label: "Alamat Usaha", key: "Alamat Usaha", type: "text", required: true },
      { label: "Tahun Berdiri", key: "Tahun Berdiri", type: "number", required: false }
    ]
  },
  surat_ket_domisili: {
    title: "SURAT KETERANGAN DOMISILI",
    keteranganText: "Adalah benar penduduk yang berdomisili dan bertempat tinggal pada alamat tersebut di atas.",
    extraDataRows: [
      { label: "Sejak Tanggal", key: "Sejak Tanggal", type: "date", required: false },
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_penghasilan: {
    title: "SURAT KETERANGAN PENGHASILAN",
    keteranganText: "Menerangkan bahwa yang bersangkutan memiliki rincian penghasilan rata-rata per bulan sebagai berikut:",
    extraDataRows: [
      { label: "Penghasilan Per Bulan", key: "Penghasilan Per Bulan", type: "text", required: true },
      { label: "Jumlah Tanggungan", key: "Jumlah Tanggungan", type: "number", required: true },
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_bio_penduduk: {
    title: "SURAT KETERANGAN BIODATA PENDUDUK",
    keteranganText: "Menerangkan bahwa data di atas adalah benar biodata penduduk yang tercatat dalam data kependudukan desa kami.",
    extraDataRows: []
  },
  surat_ket_beda_identitas_kis: {
    title: "SURAT KETERANGAN BEDA IDENTITAS KIS",
    keteranganText: "Menerangkan bahwa terdapat perbedaan identitas pada dokumen KTP/KK dengan Kartu Indonesia Sehat (KIS) sebagai berikut:",
    extraDataRows: [
      { label: "No. Kartu KIS", key: "No Kartu KIS", type: "text", required: true },
      { label: "Nama di KIS", key: "Nama di KIS", type: "text", required: true },
      { label: "Nama di KTP/KK", key: "Nama di KTP/KK", type: "text", required: true },
      { label: "Perbedaan Data", key: "Perbedaan Data", type: "textarea", required: true }
    ]
  },
  surat_jalan: {
    title: "SURAT KETERANGAN BEPERGIAN / JALAN",
    keteranganText: "Diberikan kepada yang bersangkutan untuk melakukan perjalanan dengan rincian:",
    extraDataRows: [
      { label: "Tempat Tujuan", key: "Tempat Tujuan", type: "text", required: true },
      { label: "Maksud Keperluan", key: "Maksud Keperluan", type: "textarea", required: true },
      { label: "Lama Bepergian", key: "Lama Bepergian", type: "text", required: true },
      { label: "Pengikut", key: "Pengikut", type: "text", required: false }
    ]
  },
  surat_izin_orangtua_suami_istri: {
    title: "SURAT IZIN ORANG TUA / SUAMI / ISTRI",
    keteranganText: "Menerangkan bahwa yang bersangkutan telah mendapatkan izin resmi dari orang tua / keluarga untuk:",
    extraDataRows: [
      { label: "Nama Pemberi Izin", key: "Nama Pemberi Izin", type: "text", required: true },
      { label: "Hubungan Keluarga", key: "Hubungan Keluarga", type: "text", required: true },
      { label: "Diberikan Izin Untuk", key: "Keperluan Izin", type: "textarea", required: true }
    ]
  },
  surat_izin_keramaian: {
    title: "SURAT PENGANTAR IZIN KERAMAIAN",
    keteranganText: "Menerangkan bahwa yang bersangkutan akan mengadakan kegiatan keramaian sebagai berikut:",
    extraDataRows: [
      { label: "Nama Kegiatan / Acara", key: "Nama Acara", type: "text", required: true },
      { label: "Hari / Tanggal", key: "Hari Tanggal Acara", type: "text", required: true },
      { label: "Waktu Kegiatan", key: "Waktu Acara", type: "text", required: true },
      { label: "Tempat Kegiatan", key: "Tempat Acara", type: "text", required: true },
      { label: "Jenis Hiburan", key: "Jenis Hiburan", type: "text", required: false }
    ]
  },
  surat_ket_beda_nama: {
    title: "SURAT KETERANGAN BEDA NAMA",
    keteranganText: "Menerangkan bahwa nama yang tercantum pada dokumen yang berbeda adalah satu orang yang sama:",
    extraDataRows: [
      { label: "Nama di Dokumen 1", key: "Nama Dokumen 1", type: "text", required: true },
      { label: "Nama di Dokumen 2", key: "Nama Dokumen 2", type: "text", required: true },
      { label: "Nama Dokumen 1", key: "Jenis Dokumen 1", type: "text", required: true },
      { label: "Nama Dokumen 2", key: "Jenis Dokumen 2", type: "text", required: true },
      { label: "Nama Yang Benar", key: "Nama Yang Benar", type: "text", required: true }
    ]
  },
  surat_ket_catatan_kriminal: {
    title: "SURAT PENGANTAR CATATAN KEPOLISIAN (SKCK)",
    keteranganText: "Menerangkan bahwa yang bersangkutan selama berdomisili di Desa [nama_desa] berkelakuan baik, tidak sedang tersangkut perkara pidana:",
    extraDataRows: [
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_jamkesos: {
    title: "SURAT KETERANGAN JAMKESOS",
    keteranganText: "Menerangkan bahwa yang bersangkutan adalah benar warga keluarga kurang mampu dan diusulkan untuk menerima bantuan Jaminan Kesehatan Sosial:",
    extraDataRows: [
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_jual_beli: {
    title: "SURAT KETERANGAN JUAL BELI",
    keteranganText: "Menerangkan bahwa telah terjadi transaksi jual beli antara pihak penjual dan pembeli sebagai berikut:",
    extraDataRows: [
      { label: "Nama Pembeli", key: "Nama Pembeli", type: "text", required: true },
      { label: "NIK Pembeli", key: "NIK Pembeli", type: "text", required: true },
      { label: "Barang / Obyek Jual Beli", key: "Obyek Transaksi", type: "text", required: true },
      { label: "Harga Transaksi", key: "Harga Transaksi", type: "text", required: true }
    ]
  },
  surat_ket_kehilangan: {
    title: "SURAT KETERANGAN KEHILANGAN",
    keteranganText: "Menerangkan bahwa yang bersangkutan telah kehilangan dokumen / barang berharga dengan rincian:",
    extraDataRows: [
      { label: "Barang / Dokumen Hilang", key: "Barang Hilang", type: "text", required: true },
      { label: "Rincian / No. Dokumen", key: "Rincian Dokumen", type: "textarea", required: true },
      { label: "Perkiraan Tempat Hilang", key: "Tempat Hilang", type: "text", required: true },
      { label: "Perkiraan Waktu Hilang", key: "Waktu Hilang", type: "text", required: true }
    ]
  },
  surat_ket_kelahiran: {
    title: "SURAT KETERANGAN KELAHIRAN",
    keteranganText: "Menerangkan bahwa telah lahir seorang anak dengan rincian kelahiran sebagai berikut:",
    extraDataRows: [
      { label: "Nama Anak", key: "Nama Anak", type: "text", required: true },
      { label: "Tempat / Tgl Lahir Anak", key: "TTL Anak", type: "text", required: true },
      { label: "Jenis Kelamin Anak", key: "Jenis Kelamin Anak", type: "text", required: true },
      { label: "Anak Ke-", key: "Anak Ke", type: "number", required: true },
      { label: "Nama Ayah", key: "Nama Ayah", type: "text", required: true },
      { label: "Nama Ibu", key: "Nama Ibu", type: "text", required: true }
    ]
  },
  surat_ket_kematian: {
    title: "SURAT KETERANGAN KEMATIAN",
    keteranganText: "Menerangkan bahwa yang bersangkutan telah meninggal dunia pada:",
    extraDataRows: [
      { label: "Hari / Tanggal Kematian", key: "Hari Tanggal Kematian", type: "text", required: true },
      { label: "Waktu Kematian", key: "Waktu Kematian", type: "text", required: false },
      { label: "Tempat Kematian", key: "Tempat Kematian", type: "text", required: true },
      { label: "Penyebab Kematian", key: "Penyebab Kematian", type: "text", required: true },
      { label: "Nama Pelapor", key: "Nama Pelapor", type: "text", required: true }
    ]
  },
  surat_ket_kepemilikan_kendaraan: {
    title: "SURAT KETERANGAN KEPEMILIKAN KENDARAAN",
    keteranganText: "Menerangkan bahwa yang bersangkutan adalah pemilik sah dari kendaraan bermotor dengan spesifikasi:",
    extraDataRows: [
      { label: "Jenis Kendaraan", key: "Jenis Kendaraan", type: "text", required: true },
      { label: "Merk / Type", key: "Merk Type", type: "text", required: true },
      { label: "Nomor Polisi", key: "Nomor Polisi", type: "text", required: true },
      { label: "Nomor Rangka", key: "Nomor Rangka", type: "text", required: true },
      { label: "Nomor Mesin", key: "Nomor Mesin", type: "text", required: true },
      { label: "Warna Kendaraan", key: "Warna Kendaraan", type: "text", required: true }
    ]
  },
  surat_ket_kepemilikan_tanah: {
    title: "SURAT KETERANGAN KEPEMILIKAN TANAH",
    keteranganText: "Menerangkan bahwa yang bersangkutan menguasai sebidang tanah yang terletak di Desa [nama_desa] dengan batas-batas:",
    extraDataRows: [
      { label: "Luas Tanah", key: "Luas Tanah", type: "text", required: true },
      { label: "Letak / Blok", key: "Letak Tanah", type: "text", required: true },
      { label: "Batas Utara", key: "Batas Utara", type: "text", required: true },
      { label: "Batas Timur", key: "Batas Timur", type: "text", required: true },
      { label: "Batas Selatan", key: "Batas Selatan", type: "text", required: true },
      { label: "Batas Barat", key: "Batas Barat", type: "text", required: true }
    ]
  },
  surat_ket_ktp_dalam_proses: {
    title: "SURAT KETERANGAN KTP DALAM PROSES",
    keteranganText: "Menerangkan bahwa KTP Elektronik (e-KTP) yang bersangkutan saat ini sedang dalam proses pencetakan di Dinas Kependudukan dan Pencatatan Sipil.",
    extraDataRows: [
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_kurang_mampu: {
    title: "SURAT KETERANGAN KURANG MAMPU (SKTM)",
    keteranganText: "Menerangkan bahwa yang bersangkutan berasal dari keluarga prasejahtera / kurang mampu di Desa [nama_desa] dan diberikan untuk:",
    extraDataRows: [
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_janda: {
    title: "SURAT KETERANGAN JANDA / DUDA",
    keteranganText: "Menerangkan bahwa yang bersangkutan berstatus Janda / Duda dengan keterangan:",
    extraDataRows: [
      { label: "Status", key: "Status (Janda/Duda)", type: "text", required: true },
      { label: "Nama Mantan Pasangan", key: "Nama Pasangan", type: "text", required: true },
      { label: "Penyebab Status", key: "Penyebab (Cerai Mati/Hidup)", type: "text", required: true },
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_lahir_mati: {
    title: "SURAT KETERANGAN LAHIR MATI",
    keteranganText: "Menerangkan bahwa telah lahir mati seorang anak dari pasangan suami istri tersebut di atas:",
    extraDataRows: [
      { label: "Hari / Tanggal", key: "Tanggal Kejadian", type: "text", required: true },
      { label: "Tempat Kejadian", key: "Tempat Kejadian", type: "text", required: true },
      { label: "Jenis Kelamin Bayi", key: "Jenis Kelamin Bayi", type: "text", required: true },
      { label: "Nama Ibu", key: "Nama Ibu", type: "text", required: true },
      { label: "Nama Ayah", key: "Nama Ayah", type: "text", required: true }
    ]
  },
  surat_ket_penduduk: {
    title: "SURAT KETERANGAN PENDUDUK",
    keteranganText: "Menerangkan bahwa yang bersangkutan adalah benar warga penduduk yang terdaftar sah di Desa [nama_desa].",
    extraDataRows: [
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_pengantar: {
    title: "SURAT PENGANTAR",
    keteranganText: "Diberikan kepada yang bersangkutan sebagai surat pengantar untuk keperluan:",
    extraDataRows: [
      { label: "Keperluan Pengantar", key: "Keperluan", type: "textarea", required: true },
      { label: "Tujuan Instansi", key: "Instansi Tujuan", type: "text", required: true }
    ]
  },
  surat_ket_pergi_kawin: {
    title: "SURAT KETERANGAN UNTUK NIKAH (N1)",
    keteranganText: "Menerangkan bahwa yang bersangkutan bermaksud melangsungkan pernikahan dengan calon mempelai:",
    extraDataRows: [
      { label: "Nama Calon Pasangan", key: "Nama Calon Pasangan", type: "text", required: true },
      { label: "Tempat Pernikahan", key: "Tempat Pernikahan", type: "text", required: true },
      { label: "Status Sebelum Nikah", key: "Status Sebelum Nikah", type: "text", required: true }
    ]
  },
  surat_ket_pindah_penduduk: {
    title: "SURAT KETERANGAN PINDAH PENDUDUK",
    keteranganText: "Menerangkan bahwa yang bersangkutan mengajukan permohonan pindah domisili penduduk dengan rincian:",
    extraDataRows: [
      { label: "Alasan Pindah", key: "Alasan Pindah", type: "textarea", required: true },
      { label: "Alamat Tujuan", key: "Alamat Tujuan", type: "text", required: true },
      { label: "Desa / Kelurahan Tujuan", key: "Desa Tujuan", type: "text", required: true },
      { label: "Kecamatan Tujuan", key: "Kecamatan Tujuan", type: "text", required: true },
      { label: "Kabupaten / Kota Tujuan", key: "Kabupaten Tujuan", type: "text", required: true },
      { label: "Provinsi Tujuan", key: "Provinsi Tujuan", type: "text", required: true },
      { label: "Jumlah Pengikut", key: "Jumlah Pengikut", type: "number", required: true }
    ]
  },
  surat_ket_rujuk_cerai: {
    title: "SURAT KETERANGAN RUJUK / CERAI",
    keteranganText: "Menerangkan bahwa yang bersangkutan telah terjadi peristiwa rujuk/cerai sebagai berikut:",
    extraDataRows: [
      { label: "Peristiwa", key: "Peristiwa (Rujuk/Cerai)", type: "text", required: true },
      { label: "Nama Pasangan", key: "Nama Pasangan", type: "text", required: true },
      { label: "Hari / Tanggal Kejadian", key: "Tanggal Kejadian", type: "date", required: true },
      { label: "No. Akta / Putusan", key: "No Akta", type: "text", required: true }
    ]
  },
  surat_ket_wali_hakim: {
    title: "SURAT KETERANGAN WALI HAKIM",
    keteranganText: "Menerangkan bahwa calon mempelai wanita memerlukan Wali Hakim dalam pernikahannya karena:",
    extraDataRows: [
      { label: "Sebab / Alasan Wali Hakim", key: "Alasan Wali Hakim", type: "textarea", required: true },
      { label: "Nama Calon Suami", key: "Nama Calon Suami", type: "text", required: true }
    ]
  },
  surat_kuasa: {
    title: "SURAT KUASA",
    keteranganText: "Dengan ini memberikan kuasa penuh kepada penerima kuasa di bawah ini:",
    extraDataRows: [
      { label: "Nama Penerima Kuasa", key: "Nama Penerima Kuasa", type: "text", required: true },
      { label: "NIK Penerima Kuasa", key: "NIK Penerima Kuasa", type: "text", required: true },
      { label: "Umur Penerima Kuasa", key: "Umur Penerima Kuasa", type: "text", required: true },
      { label: "Pekerjaan Penerima Kuasa", key: "Pekerjaan Penerima Kuasa", type: "text", required: true },
      { label: "Alamat Penerima Kuasa", key: "Alamat Penerima Kuasa", type: "text", required: true },
      { label: "Isi / Maksud Kuasa", key: "Isi Kuasa", type: "textarea", required: true }
    ]
  },
  surat_perjalanan_dinas: {
    title: "SURAT PERINTAH PERJALANAN DINAS (SPPD)",
    keteranganText: "Memerintahkan pejabat/perangkat desa di bawah ini untuk melaksanakan tugas dinas:",
    extraDataRows: [
      { label: "Nama Pejabat Yang Ditugaskan", key: "Nama Pejabat", type: "text", required: true },
      { label: "Jabatan", key: "Jabatan Pejabat", type: "text", required: true },
      { label: "Tempat Tujuan", key: "Tempat Tujuan", type: "text", required: true },
      { label: "Maksud Perjalanan Dinas", key: "Maksud Dinas", type: "textarea", required: true },
      { label: "Lama Perjalanan (Hari)", key: "Lama Perjalanan", type: "text", required: true },
      { label: "Tanggal Berangkat", key: "Tanggal Berangkat", type: "date", required: true },
      { label: "Tanggal Kembali", key: "Tanggal Kembali", type: "date", required: true },
      { label: "Beban Anggaran", key: "Beban Anggaran", type: "text", required: true }
    ]
  },
  surat_permohonan_akta: {
    title: "SURAT PERMOHONAN AKTA KELAHIRAN",
    keteranganText: "Mengajukan permohonan penerbitan Akta Kelahiran anak dengan data sebagai berikut:",
    extraDataRows: [
      { label: "Nama Lengkap Anak", key: "Nama Anak", type: "text", required: true },
      { label: "Tempat / Tgl Lahir Anak", key: "TTL Anak", type: "text", required: true },
      { label: "Jenis Kelamin Anak", key: "Jenis Kelamin Anak", type: "text", required: true },
      { label: "Anak Ke-", key: "Anak Ke", type: "number", required: true },
      { label: "Nama Ayah", key: "Nama Ayah", type: "text", required: true },
      { label: "Nama Ibu", key: "Nama Ibu", type: "text", required: true }
    ]
  },
  surat_permohonan_cerai: {
    title: "SURAT PERMOHONAN CERAI",
    keteranganText: "Mengajukan permohonan rekomendasi proses perceraian dengan pasangan:",
    extraDataRows: [
      { label: "Nama Pasangan (Suami/Istri)", key: "Nama Pasangan", type: "text", required: true },
      { label: "Alasan Perceraian", key: "Alasan Perceraian", type: "textarea", required: true }
    ]
  },
  surat_permohonan_duplikat_kelahiran: {
    title: "SURAT PERMOHONAN DUPLIKAT AKTA KELAHIRAN",
    keteranganText: "Mengajukan permohonan duplikat kutipan Akta Kelahiran karena hilang / rusak:",
    extraDataRows: [
      { label: "Alasan Permohonan", key: "Alasan Permohonan", type: "textarea", required: true },
      { label: "Keterangan Tambahan", key: "Keterangan Tambahan", type: "textarea", required: false }
    ]
  },
  surat_permohonan_duplikat_surat_nikah: {
    title: "SURAT PERMOHONAN DUPLIKAT BUKU NIKAH",
    keteranganText: "Mengajukan permohonan duplikat Buku Nikah / Surat Nikah karena hilang / rusak:",
    extraDataRows: [
      { label: "Alasan Permohonan", key: "Alasan Permohonan", type: "textarea", required: true },
      { label: "Nomor Surat Nikah Lama", key: "Nomor Nikah Lama", type: "text", required: false }
    ]
  },
  surat_permohonan_kartu_keluarga: {
    title: "SURAT PERMOHONAN KARTU KELUARGA (KK BARU)",
    keteranganText: "Mengajukan permohonan penerbitan Kartu Keluarga (KK) baru dengan rincian:",
    extraDataRows: [
      { label: "Alasan Permohonan", key: "Alasan Permohonan", type: "textarea", required: true },
      { label: "Jumlah Anggota Keluarga", key: "Jumlah Anggota", type: "number", required: true }
    ]
  },
  surat_permohonan_perubahan_kartu_keluarga: {
    title: "SURAT PERMOHONAN PERUBAHAN KARTU KELUARGA",
    keteranganText: "Mengajukan permohonan perbaikan/perubahan data pada Kartu Keluarga (KK):",
    extraDataRows: [
      { label: "Alasan Perubahan Data", key: "Alasan Perubahan", type: "textarea", required: true },
      { label: "Nomor Kartu Keluarga Lama", key: "No KK Lama", type: "text", required: true }
    ]
  },
  surat_permohonan_pas_lintas: {
    title: "SURAT PERMOHONAN PAS LINTAS BATAS",
    keteranganText: "Mengajukan permohonan rekomendasi Pas Lintas Batas antar negara / wilayah perbatasan:",
    extraDataRows: [
      { label: "Daerah Tujuan Perbatasan", key: "Tujuan Perbatasan", type: "text", required: true },
      { label: "Maksud Kunjungan", key: "Maksud Kunjungan", type: "textarea", required: true }
    ]
  },
  surat_pernyataan_akta: {
    title: "SURAT PERNYATAAN KELAHIRAN",
    keteranganText: "Menyatakan dengan sesungguhnya atas kelahiran anak:",
    extraDataRows: [
      { label: "Nama Anak", key: "Nama Anak", type: "text", required: true },
      { label: "Tempat / Tgl Lahir Anak", key: "TTL Anak", type: "text", required: true },
      { label: "Nama Ayah", key: "Nama Ayah", type: "text", required: true },
      { label: "Nama Ibu", key: "Nama Ibu", type: "text", required: true }
    ]
  },
  surat_sporadik: {
    title: "SURAT PERNYATAAN PENGUASAAN FISIK BIDANG TANAH (SPORADIK)",
    keteranganText: "Menyatakan dengan sesungguhnya bahwa yang bersangkutan secara fisik menguasai sebidang tanah dengan sketsa dan batas-batas sebagai berikut:",
    hasLandSketch: true,
    extraDataRows: [
      { label: "Nomor Alas Hak / Persil", key: "Nomor Persil", type: "text", required: false },
      { label: "Luas Bidang Tanah (M2)", key: "Luas Tanah M2", type: "number", required: true },
      { label: "Dipergunakan Untuk", key: "Penggunaan Tanah", type: "text", required: true }
    ]
  },
  surat_ket_domisili_usaha: {
    title: "SURAT KETERANGAN DOMISILI USAHA",
    keteranganText: "Menerangkan bahwa tempat usaha tersebut di bawah ini berdomisili sah di wilayah Desa [nama_desa]:",
    extraDataRows: [
      { label: "Nama Usaha / Perusahaan", key: "Nama Usaha", type: "text", required: true },
      { label: "Jenis / Bidang Usaha", key: "Jenis Usaha", type: "text", required: true },
      { label: "Alamat Lokasi Usaha", key: "Alamat Usaha", type: "text", required: true },
      { label: "Jumlah Tenaga Kerja", key: "Jumlah Tenaga Kerja", type: "number", required: false }
    ]
  },
  surat_ket_domisili_usaha_non_warga: {
    title: "SURAT KETERANGAN DOMISILI USAHA (NON WARGA)",
    keteranganText: "Menerangkan bahwa pemohon (bukan warga desa ini) memiliki unit usaha yang berdomisili di wilayah Desa [nama_desa]:",
    extraDataRows: [
      { label: "Nama Usaha / Perusahaan", key: "Nama Usaha", type: "text", required: true },
      { label: "Jenis / Bidang Usaha", key: "Jenis Usaha", type: "text", required: true },
      { label: "Alamat Lokasi Usaha", key: "Alamat Usaha", type: "text", required: true },
      { label: "Status Bangunan Usaha", key: "Status Bangunan", type: "text", required: true }
    ]
  },
  surat_nikah_non_muslim: {
    title: "SURAT KETERANGAN NIKAH (NON MUSLIM)",
    keteranganText: "Menerangkan bahwa yang bersangkutan melangsungkan pernikahan menurut tata cara agama / kepercayaan yang diakui:",
    extraDataRows: [
      { label: "Nama Pasangan", key: "Nama Pasangan", type: "text", required: true },
      { label: "Agama / Kepercayaan", key: "Agama Pasangan", type: "text", required: true },
      { label: "Tempat Pernikahan", key: "Tempat Pernikahan", type: "text", required: true },
      { label: "Tanggal Pernikahan", key: "Tanggal Pernikahan", type: "date", required: true }
    ]
  },
  surat_ket_nikah: {
    title: "SURAT KETERANGAN NIKAH (N1 - N4)",
    keteranganText: "Menerangkan bahwa yang bersangkutan berstatus belum pernah menikah / duda / janda dan memenuhi syarat untuk menikah:",
    extraDataRows: [
      { label: "Nama Calon Pasangan", key: "Nama Calon Pasangan", type: "text", required: true },
      { label: "Status Perkawinan Pemohon", key: "Status Pemohon", type: "text", required: true },
      { label: "Wali Nikah", key: "Nama Wali", type: "text", required: false }
    ]
  },
  surat_ket_penghasilan_ayah: {
    title: "SURAT KETERANGAN PENGHASILAN AYAH",
    keteranganText: "Menerangkan bahwa orang tua (Ayah) dari yang bersangkutan memiliki rincian penghasilan rata-rata per bulan:",
    extraDataRows: [
      { label: "Nama Ayah", key: "Nama Ayah", type: "text", required: true },
      { label: "Pekerjaan Ayah", key: "Pekerjaan Ayah", type: "text", required: true },
      { label: "Penghasilan Ayah / Bulan", key: "Penghasilan Ayah", type: "text", required: true },
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_penghasilan_ibu: {
    title: "SURAT KETERANGAN PENGHASILAN IBU",
    keteranganText: "Menerangkan bahwa orang tua (Ibu) dari yang bersangkutan memiliki rincian penghasilan rata-rata per bulan:",
    extraDataRows: [
      { label: "Nama Ibu", key: "Nama Ibu", type: "text", required: true },
      { label: "Pekerjaan Ibu", key: "Pekerjaan Ibu", type: "text", required: true },
      { label: "Penghasilan Ibu / Bulan", key: "Penghasilan Ibu", type: "text", required: true },
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_ket_penghasilan_orangtua: {
    title: "SURAT KETERANGAN PENGHASILAN ORANG TUA",
    keteranganText: "Menerangkan bahwa orang tua dari yang bersangkutan memiliki rincian penghasilan gabungan rata-rata per bulan:",
    extraDataRows: [
      { label: "Nama Ayah", key: "Nama Ayah", type: "text", required: true },
      { label: "Nama Ibu", key: "Nama Ibu", type: "text", required: true },
      { label: "Total Penghasilan / Bulan", key: "Total Penghasilan", type: "text", required: true },
      { label: "Jumlah Tanggungan Anak", key: "Jumlah Tanggungan", type: "number", required: true },
      { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
    ]
  },
  surat_perintah_perjalanan_dinas: {
    title: "SURAT PERINTAH PERJALANAN DINAS",
    keteranganText: "Memerintahkan kepada pejabat / perangkat desa untuk melaksanakan perjalanan dinas dalam rangka:",
    extraDataRows: [
      { label: "Nama Pejabat", key: "Nama Pejabat", type: "text", required: true },
      { label: "Jabatan Pejabat", key: "Jabatan Pejabat", type: "text", required: true },
      { label: "Tujuan Dinas", key: "Tujuan Dinas", type: "text", required: true },
      { label: "Maksud Perjalanan", key: "Maksud Perjalanan", type: "textarea", required: true },
      { label: "Lama Perjalanan", key: "Lama Perjalanan", type: "text", required: true },
      { label: "Tanggal Berangkat", key: "Tanggal Berangkat", type: "date", required: true },
      { label: "Tanggal Kembali", key: "Tanggal Kembali", type: "date", required: true }
    ]
  }
};

async function seedAllSuratTemplates() {
  try {
    console.log("Starting full database seeding for all 46 surat templates...");
    const formats = await prisma.$queryRawUnsafe('SELECT id, nama, url_surat FROM public.surat_formats ORDER BY id ASC;');
    console.log(`Found ${formats.length} formats in database to seed.`);

    let updatedCount = 0;

    for (const fmt of formats) {
      const urlSurat = fmt.url_surat || "";
      const templateConfig = TEMPLATES_MAP[urlSurat] || {
        title: fmt.nama ? fmt.nama.toUpperCase() : "SURAT KETERANGAN",
        keteranganText: "Menerangkan dengan sebenarnya bahwa yang bersangkutan adalah benar warga yang berdomisili di wilayah kami.",
        extraDataRows: [
          { label: "Keperluan", key: "Keperluan", type: "textarea", required: true }
        ]
      };

      // Generate complete CraftJS AST JSON string
      const jsonTemplate = buildCraftTemplate(templateConfig);

      // Generate structured form_isian schema
      const formIsianSchema = templateConfig.extraDataRows.map(r => ({
        id: r.key,
        key: r.key,
        label: r.label,
        type: r.type,
        required: r.required !== false,
        placeholder: r.placeholder || `Masukkan ${r.label}...`
      }));

      const formIsianJson = JSON.stringify(formIsianSchema);

      // Update in PostgreSQL database
      await prisma.$executeRawUnsafe(
        `UPDATE public.surat_formats 
         SET template = $1, form_isian = $2 
         WHERE id = $3`,
        jsonTemplate,
        formIsianJson,
        fmt.id
      );

      updatedCount++;
      console.log(`[${updatedCount}/${formats.length}] Seeded format #${fmt.id}: ${fmt.nama} (${urlSurat})`);
    }

    console.log("\n==========================================");
    console.log(`SUCCESS! 100% of ${updatedCount} surat templates are now seeded directly in database.`);
    console.log("==========================================");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAllSuratTemplates();
