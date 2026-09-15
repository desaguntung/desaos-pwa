import { useNode } from "@craftjs/core";
import { Tag, Palette, Type } from "lucide-react";
import { useSuratContext } from "@/lib/contexts/SuratContext";

const VARIABLE_OPTIONS = [
  // Data Surat
  { label: "Nomor Surat", value: "surat.nomor" },
  { label: "Tanggal Surat", value: "surat.tanggal" },
  { label: "Kode Surat", value: "surat.kode" },

  // Data Desa
  { label: "Nama Desa", value: "desa.nama" },
  { label: "Kecamatan", value: "desa.kecamatan" },
  { label: "Kabupaten", value: "desa.kabupaten" },
  { label: "Provinsi", value: "desa.provinsi" },
  { label: "Alamat Kantor", value: "desa.alamat_kantor" },
  { label: "Kode Pos", value: "desa.kode_pos" },
  { label: "Nama Kepala Desa", value: "desa.kades" },
  { label: "NIP Kepala Desa", value: "desa.kades_nip" },

  // Data Penduduk (Yang Bersangkutan)
  { label: "Nama Lengkap", value: "penduduk.nama" },
  { label: "NIK", value: "penduduk.nik" },
  { label: "No. KK", value: "penduduk.no_kk" },
  { label: "Tempat Lahir", value: "penduduk.tempat_lahir" },
  { label: "Tanggal Lahir", value: "penduduk.tanggal_lahir" },
  { label: "Tempat/Tanggal Lahir", value: "penduduk.ttl" },
  { label: "Jenis Kelamin", value: "penduduk.sex" },
  { label: "Agama", value: "penduduk.agama" },
  { label: "Status Perkawinan", value: "penduduk.status_kawin" },
  { label: "Pekerjaan", value: "penduduk.pekerjaan" },
  { label: "Pendidikan", value: "penduduk.pendidikan" },
  { label: "Alamat", value: "penduduk.alamat" },
  { label: "RT", value: "penduduk.rt" },
  { label: "RW", value: "penduduk.rw" },
  { label: "Dusun", value: "penduduk.dusun" },
  { label: "Kewarganegaraan", value: "penduduk.warga_negara" },
  { label: "Nama Ayah", value: "penduduk.ayah" },
  { label: "Nama Ibu", value: "penduduk.ibu" },
];

export const Variable = ({ 
  name = "penduduk.nama",
  fontSize = "12",
  color = "#374151", // gray-700
  backgroundColor = "#f3f4f6", // gray-100
  paddingX = "6", // 1.5 * 4
  paddingY = "2", // 0.5 * 4
  borderRadius = "4"
}: { 
  name?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  paddingX?: string;
  paddingY?: string;
  borderRadius?: string;
}) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));
  
  const { mode, data } = useSuratContext();

  // Helper to get nested value with robust fallbacks and aliases
  const getValue = (obj: any, path: string) => {
    if (!obj || !path) return undefined;

    const cleanPath = path.trim();

    // 1. Direct dotted lookup
    if (cleanPath.includes('.')) {
      const parts = cleanPath.split('.');
      const direct = parts.reduce((acc, part) => acc && acc[part], obj);
      if (direct !== undefined && direct !== null && direct !== "") return direct;

      // Handle common dot aliases
      const section = parts[0].toLowerCase();
      const field = parts.slice(1).join('.').toLowerCase();

      if (section === 'penduduk' && obj.penduduk) {
        const p = obj.penduduk;
        if (field === 'alamat' || field === 'alamat_saat_ini' || field === 'alamat_penduduk') return p.alamat || p.alamat_saat_ini || p.alamat_lengkap || p.fullAddress;
        if (field === 'ttl' || field === 'tempat_tanggal_lahir' || field === 'tempat_tgl_lahir') return p.ttl || p.tempat_tanggal_lahir || (p.tempat_lahir && p.tanggal_lahir ? `${p.tempat_lahir}, ${p.tanggal_lahir}` : p.tempat_lahir || p.tanggal_lahir);
        if (field === 'sex' || field === 'jenis_kelamin' || field === 'jk') return p.sex || p.jenis_kelamin || p.jk;
        if (field === 'status_kawin' || field === 'status_perkawinan') return p.status_kawin || p.status_perkawinan;
        if (field === 'warga_negara' || field === 'kewarganegaraan' || field === 'warganegara') return p.warga_negara || p.kewarganegaraan || p.warganegara || "WNI";
        if (field === 'ayah' || field === 'nama_ayah') return p.ayah || p.nama_ayah;
        if (field === 'ibu' || field === 'nama_ibu') return p.ibu || p.nama_ibu;
        if (field === 'pendidikan' || field === 'pendidikan_kk') return p.pendidikan || p.pendidikan_kk || p.pendidikan_saat_ini;
      }

      if (section === 'pamong' && obj.pamong) {
        const pam = obj.pamong;
        if (field === 'nama' || field === 'pamong_nama') return pam.nama || pam.pamong_nama;
        if (field === 'nip' || field === 'pamong_nip') return pam.nip || pam.pamong_nip || "-";
        if (field === 'pangkat' || field === 'pamong_pangkat') return pam.pangkat || pam.pamong_pangkat;
        if (field === 'jabatan' || field === 'penandatangan') return pam.jabatan || pam.penandatangan || "Kepala Desa";
      }

      if (section === 'desa' && obj.desa) {
        const d = obj.desa;
        if (field === 'nama' || field === 'nama_desa') return d.nama || d.nama_desa;
        if (field === 'kecamatan' || field === 'nama_kecamatan') return d.kecamatan || d.nama_kecamatan;
        if (field === 'kabupaten' || field === 'nama_kabupaten') return d.kabupaten || d.nama_kabupaten;
        if (field === 'provinsi' || field === 'nama_provinsi') return d.provinsi || d.nama_provinsi;
        if (field === 'alamat' || field === 'alamat_kantor') return d.alamat_kantor || d.alamat || d.alamat_desa;
        if (field === 'kades' || field === 'nama_kepala_desa') return d.kades || d.nama_kepala_desa || obj.pamong?.nama;
        if (field === 'kades_nip' || field === 'nip_kepala_desa') return d.kades_nip || d.nip_kepala_desa || obj.pamong?.nip || "-";
      }

      if (section === 'surat' && obj.surat) {
        const s = obj.surat;
        if (field === 'nomor' || field === 'no_surat') return s.nomor || s.no_surat;
        if (field === 'tanggal' || field === 'tanggal_surat' || field === 'tgl_surat') return s.tanggal || s.tanggal_surat;
        if (field === 'kode' || field === 'kode_surat') return s.kode || s.kode_surat;
      }
    }

    // 2. Flat / Un-dotted Variable lookup (e.g. from Legacy DataRow "Nama", "NIK", "Alamat")
    const lowerKey = cleanPath.toLowerCase().replace(/[\/\s\-]+/g, '_');

    // Check Penduduk
    if (obj.penduduk) {
      const p = obj.penduduk;
      if (lowerKey === 'nama' || lowerKey === 'nama_lengkap' || lowerKey === 'nama_penduduk') return p.nama || p.nama_lengkap;
      if (lowerKey === 'nik' || lowerKey === 'no_nik' || lowerKey === 'nik_penduduk') return p.nik;
      if (lowerKey === 'no_kk' || lowerKey === 'nomor_kk') return p.no_kk;
      if (lowerKey === 'tempat_lahir') return p.tempat_lahir;
      if (lowerKey === 'tanggal_lahir' || lowerKey === 'tgl_lahir') return p.tanggal_lahir;
      if (lowerKey === 'tempat_tgl_lahir' || lowerKey === 'tempat_tanggal_lahir' || lowerKey === 'ttl') return p.ttl || p.tempat_tanggal_lahir || (p.tempat_lahir && p.tanggal_lahir ? `${p.tempat_lahir}, ${p.tanggal_lahir}` : p.tempat_lahir || p.tanggal_lahir);
      if (lowerKey === 'jenis_kelamin' || lowerKey === 'sex' || lowerKey === 'jk') return p.jenis_kelamin || p.sex;
      if (lowerKey === 'agama') return p.agama;
      if (lowerKey === 'pekerjaan') return p.pekerjaan;
      if (lowerKey === 'pendidikan') return p.pendidikan || p.pendidikan_kk || p.pendidikan_saat_ini;
      if (lowerKey === 'status_kawin' || lowerKey === 'status_perkawinan') return p.status_kawin || p.status_perkawinan;
      if (lowerKey === 'alamat' || lowerKey === 'alamat_lengkap' || lowerKey === 'alamat_penduduk' || lowerKey === 'alamat_tempat_tinggal') return p.alamat || p.alamat_saat_ini || p.alamat_lengkap;
      if (lowerKey === 'rt') return p.rt;
      if (lowerKey === 'rw') return p.rw;
      if (lowerKey === 'dusun') return p.dusun;
      if (lowerKey === 'warganegara' || lowerKey === 'warga_negara' || lowerKey === 'kewarganegaraan') return p.warga_negara || p.kewarganegaraan || "WNI";
      if (lowerKey === 'ayah' || lowerKey === 'nama_ayah') return p.ayah || p.nama_ayah;
      if (lowerKey === 'ibu' || lowerKey === 'nama_ibu') return p.ibu || p.nama_ibu;
    }

    // Check Pamong
    if (obj.pamong) {
      const pam = obj.pamong;
      if (lowerKey === 'nama_pamong' || lowerKey === 'pamong') return pam.nama || pam.pamong_nama;
      if (lowerKey === 'nip_pamong' || lowerKey === 'nip') return pam.nip || pam.pamong_nip || "-";
      if (lowerKey === 'pangkat_pamong' || lowerKey === 'pangkat') return pam.pangkat || pam.pamong_pangkat;
      if (lowerKey === 'penandatangan' || lowerKey === 'jabatan') return pam.jabatan || pam.penandatangan;
    }

    // Check Desa
    if (obj.desa) {
      const d = obj.desa;
      if (lowerKey === 'nama_desa' || lowerKey === 'desa') return d.nama || d.nama_desa;
      if (lowerKey === 'nama_kecamatan' || lowerKey === 'kecamatan') return d.kecamatan || d.nama_kecamatan;
      if (lowerKey === 'nama_kabupaten' || lowerKey === 'kabupaten') return d.kabupaten || d.nama_kabupaten;
      if (lowerKey === 'nama_provinsi' || lowerKey === 'provinsi') return d.provinsi || d.nama_provinsi;
      if (lowerKey === 'alamat_desa' || lowerKey === 'alamat_kantor') return d.alamat_kantor || d.alamat;
      if (lowerKey === 'kades' || lowerKey === 'nama_kepala_desa') return d.kades || d.nama_kepala_desa;
      if (lowerKey === 'nip_kades' || lowerKey === 'nip_kepala_desa') return d.kades_nip || d.nip_kepala_desa || "-";
    }

    // Check Surat
    if (obj.surat) {
      const s = obj.surat;
      if (lowerKey === 'nomor_surat' || lowerKey === 'no_surat' || lowerKey === 'format_nomor_surat') return s.nomor || s.no_surat;
      if (lowerKey === 'tanggal_surat' || lowerKey === 'tgl_surat') return s.tanggal || s.tanggal_surat;
    }

    // Check Form Data
    if (obj.form_data) {
      if (obj.form_data[cleanPath] !== undefined) return obj.form_data[cleanPath];
      if (obj.form_data[cleanPath.toLowerCase()] !== undefined) return obj.form_data[cleanPath.toLowerCase()];
      if (obj.form_data[lowerKey] !== undefined) return obj.form_data[lowerKey];
    }

    // Direct object key
    if (obj[cleanPath] !== undefined) return obj[cleanPath];
    if (obj[lowerKey] !== undefined) return obj[lowerKey];

    return undefined;
  };

  if (mode === 'preview') {
    const value = getValue(data, name || "");
    return (
      <span style={{ fontSize: `${fontSize}px`, color: "#000000", fontFamily: 'Arial, sans-serif' }}>
        {value || "-"}
      </span>
    );
  }

  // Find label for display
  const label = VARIABLE_OPTIONS.find(opt => opt.value === name)?.label || name;

  return (
    <span
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`inline-flex items-center gap-1 font-medium border select-none mx-1 transition-all
        ${selected 
          ? "ring-2 ring-blue-500/20 border-blue-300" 
          : "border-gray-300 hover:bg-gray-200"
        }`}
      style={{
        fontSize: `${fontSize}px`,
        color: color,
        backgroundColor: backgroundColor,
        paddingLeft: `${paddingX}px`,
        paddingRight: `${paddingX}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        borderRadius: `${borderRadius}px`
      }}
    >
      <Tag className="w-3 h-3 opacity-50" />
      [{label}]
    </span>
  );
};

export const VariableSettings = () => {
  const { actions: { setProp }, name, fontSize, color, backgroundColor, paddingX, paddingY, borderRadius } = useNode((node) => ({
    name: node.data.props.name,
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    backgroundColor: node.data.props.backgroundColor,
    paddingX: node.data.props.paddingX,
    paddingY: node.data.props.paddingY,
    borderRadius: node.data.props.borderRadius,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Tag className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Source</h4>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Variable Source</label>
          <select
            value={name || ""}
            onChange={(e) => setProp((props: any) => (props.name = e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="">Select Variable...</option>
            {VARIABLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400">
            This field will be automatically filled when generating the letter.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Palette className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Appearance</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Text Color</label>
            <input
              type="color"
              value={color || "#374151"}
              onChange={(e) => setProp((props: any) => (props.color = e.target.value))}
              className="w-full h-6 p-0 border rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Bg Color</label>
            <input
              type="color"
              value={backgroundColor || "#f3f4f6"}
              onChange={(e) => setProp((props: any) => (props.backgroundColor = e.target.value))}
              className="w-full h-6 p-0 border rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Type className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Typography & Spacing</h4>
        </div>

         <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Font Size</label>
            <input
              type="number"
              value={fontSize || "12"}
              onChange={(e) => setProp((props: any) => (props.fontSize = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Padding X</label>
            <input
              type="number"
              value={paddingX || "6"}
              onChange={(e) => setProp((props: any) => (props.paddingX = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Padding Y</label>
            <input
              type="number"
              value={paddingY || "2"}
              onChange={(e) => setProp((props: any) => (props.paddingY = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
        </div>

        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Border Radius</label>
            <input
              type="number"
              value={borderRadius || "4"}
              onChange={(e) => setProp((props: any) => (props.borderRadius = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
      </div>
    </div>
  );
};

Variable.displayName = "Variable";

Variable.craft = {
  props: {
    name: "penduduk.nama",
    fontSize: "12",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    paddingX: "6",
    paddingY: "2",
    borderRadius: "4"
  },
  related: {
    settings: VariableSettings,
  },
};
