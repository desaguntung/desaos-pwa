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

  // Helper to get nested value
  const getValue = (obj: any, path: string) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  if (mode === 'preview') {
    const value = getValue(data, name || "");
    return (
      <span style={{ fontSize: `${fontSize}px`, color: "#000000", fontFamily: 'var(--font-sans)' }}>
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
