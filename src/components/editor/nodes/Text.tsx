import { useNode } from "@craftjs/core";
import { useState, useMemo } from "react";
import ContentEditable from "react-contenteditable";
import { useSuratContext } from "@/lib/contexts/SuratContext";
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline, Strikethrough,
  Type, Move, Palette, Layout
} from "lucide-react";

export const Text = ({ 
  text, 
  fontSize = "12", 
  textAlign = "left", 
  fontWeight = "normal",
  color = "#000000",
  fontFamily = "var(--font-sans)",
  lineHeight = "1.5",
  letterSpacing = "0",
  textDecoration = "none",
  textTransform = "none",
  fontStyle = "normal",
  opacity = "1",
  textShadow = "none",
  marginTop = "0",
  marginBottom = "0",
  marginLeft = "0",
  marginRight = "0"
}: any) => {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
    selected: state.events.selected,
  }));
  const [editable, setEditable] = useState(false);
  const { mode, data } = useSuratContext();
  
  // Replace variables in preview mode
  const displayContent = useMemo(() => {
    if (mode !== 'preview' || !text) return text;
    
    let processedText = text;

    // Helper for Title Case
    const toTitleCase = (str: string) => {
      if (!str) return "";
      return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
    
    // Dictionary of values (raw)
    const variables: Record<string, string> = {};
    
    if (data.desa) {
      variables['nama_des'] = data.desa.nama_desa || "";
      variables['nama_desa'] = data.desa.nama_desa || "";
      variables['sebutan_desa'] = data.desa.sebutan_desa || "Desa";
      variables['nama_kec'] = data.desa.nama_kecamatan || "";
      variables['nama_kecamatan'] = data.desa.nama_kecamatan || "";
      variables['nama_kab'] = data.desa.nama_kabupaten || "";
      variables['nama_kabupaten'] = data.desa.nama_kabupaten || "";
      variables['sebutan_kabupaten'] = data.desa.sebutan_kabupaten || "Kabupaten";
      variables['nama_prov'] = data.desa.nama_provinsi || "";
      variables['nama_provinsi'] = data.desa.nama_provinsi || "";
      variables['kode_prov'] = data.desa.kode_provinsi || "";
      variables['kode_provinsi'] = data.desa.kode_provinsi || "";
      variables['alamat_des'] = data.desa.alamat_kantor || "";
      variables['alamat_desa'] = data.desa.alamat_kantor || "";
      variables['kode_pos'] = data.desa.kode_pos || "";
      variables['website'] = data.desa.website || data.desa.website_desa || "";
      variables['email_desa'] = data.desa.email_desa || "";
      variables['telepon_desa'] = data.desa.telepon_desa || "";
      variables['kode_desa'] = data.desa.kode_desa || "";
      variables['kode_kec'] = data.desa.kode_kecamatan || "";
      variables['kode_kecamatan'] = data.desa.kode_kecamatan || "";
      variables['kode_kab'] = data.desa.kode_kabupaten || "";
      variables['kode_kabupaten'] = data.desa.kode_kabupaten || "";
    }

    if (data.pamong) {
      variables['penandatangan'] = data.pamong.jabatan || data.pamong.pangkat || "";
      variables['nama_pamong'] = data.pamong.nama || "";
      variables['nip_pamong'] = data.pamong.nip || "";
      variables['pangkat_pamong'] = data.pamong.pangkat || "";
    }

    if (data.surat) {
       variables['nomor_surat'] = data.surat.nomor || "";
       variables['format_nomor_surat'] = data.surat.nomor || "";
       variables['tgl_surat'] = data.surat.tanggal_surat || data.surat.tanggal || "";
       variables['tanggal_surat'] = data.surat.tanggal_surat || data.surat.tanggal || "";
       variables['kode_surat'] = data.surat.kode || "";
    }

    // Replacer function using Regex to capture key and respect casing
    // Pattern: [key]
    processedText = processedText.replace(/\[([a-zA-Z0-9_]+)\]/g, (match: string, key: string) => {
        const lowerKey = key.toLowerCase();
        const value = variables[lowerKey];
        
        if (value === undefined) return match; // Keep placeholder if variable not found

        // 1. ALL CAPS ([NAMA_DESA]) -> UPPERCASE
        if (key === key.toUpperCase() && key !== key.toLowerCase()) {
            return value.toUpperCase();
        }

        // 2. all lowercase ([nama_desa]) -> lowercase
        // Note: Check length > 0 to avoid empty string issues
        if (key === key.toLowerCase() && key !== key.toUpperCase()) {
            return value.toLowerCase();
        }

        // 3. Title Case ([Nama_Desa] or [Nama_desa]) -> Title Case
        if (key[0] === key[0].toUpperCase()) {
            return toTitleCase(value);
        }

        // Default fallback (should be covered by above, but just in case)
        return value;
    });

    return processedText;
  }, [text, mode, data]);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      onClick={() => selected && setEditable(true)}
      className={`w-full transition-all relative group ${selected && mode === 'edit' ? "border border-blue-500 border-dashed" : "border border-transparent"}`}
      style={{ 
        fontSize: `${fontSize}px`, 
        textAlign: textAlign as any, 
        fontWeight: fontWeight,
        color: color,
        fontFamily: mode === 'preview' ? 'var(--font-sans)' : fontFamily,
        lineHeight: lineHeight,
        letterSpacing: `${letterSpacing}px`,
        textDecoration: textDecoration,
        textTransform: textTransform as any,
        fontStyle: fontStyle,
        opacity: opacity,
        textShadow: textShadow === "none" ? "none" : textShadow,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`
      }}
    >
      <ContentEditable
        html={displayContent}
        disabled={!editable || mode === 'preview'}
        onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
        tagName="div"
        className="focus:outline-none"
      />
    </div>
  );
};

const SettingsSection = ({ title, icon: Icon, children }: any) => (
  <div className="border-b border-zinc-100 pb-4 mb-4 last:border-0">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-zinc-500" />
      <span className="text-xs font-semibold text-zinc-700">{title}</span>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

export const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const handlePropChange = (key: string, value: any) => {
    setProp((props: any) => (props[key] = value));
  };

  return (
    <div className="flex flex-col gap-1">
      <SettingsSection title="Typography" icon={Type}>
        {/* Font Family */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Font Family</label>
          <select
            value={props.fontFamily || "var(--font-sans)"}
            onChange={(e) => handlePropChange("fontFamily", e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="var(--font-sans)">Geist Sans</option>
            <option value="var(--font-mono)">Geist Mono</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
           {/* Font Size */}
           <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Size</label>
            <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
               <input
                type="number"
                value={props.fontSize || 12}
                onChange={(e) => handlePropChange("fontSize", e.target.value)}
                className="w-full px-2 py-1.5 text-xs outline-none"
              />
              <span className="text-[10px] text-zinc-400 pr-2">px</span>
            </div>
          </div>
          {/* Line Height */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Line Height</label>
            <input
              type="number"
              step="0.1"
              value={props.lineHeight || 1.5}
              onChange={(e) => handlePropChange("lineHeight", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Font Weight & Color */}
        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Weight</label>
            <select
              value={props.fontWeight || "normal"}
              onChange={(e) => handlePropChange("fontWeight", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">SemiBold</option>
              <option value="700">Bold</option>
            </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Color</label>
             <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={props.color || "#000000"}
                  onChange={(e) => handlePropChange("color", e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-200 cursor-pointer p-0.5 bg-white"
                />
                <input 
                  type="text" 
                  value={props.color || "#000000"}
                  onChange={(e) => handlePropChange("color", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md uppercase"
                />
             </div>
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-1 mt-2">
           <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Opacity</label>
           <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={props.opacity || 1} 
                onChange={(e) => handlePropChange("opacity", e.target.value)}
                className="w-full"
              />
              <span className="text-xs w-8 text-right">{Math.round((props.opacity || 1) * 100)}%</span>
           </div>
        </div>

        {/* Alignment */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Alignment</label>
          <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
            {[
              { value: "left", icon: AlignLeft },
              { value: "center", icon: AlignCenter },
              { value: "right", icon: AlignRight },
              { value: "justify", icon: AlignJustify }
            ].map((align) => (
              <button
                key={align.value}
                onClick={() => handlePropChange("textAlign", align.value)}
                className={`flex-1 flex items-center justify-center p-1.5 rounded text-zinc-600 transition-all ${props.textAlign === align.value ? "bg-white shadow-sm text-blue-600" : "hover:bg-zinc-200"}`}
              >
                <align.icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Decoration & Style */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Style</label>
          <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
            <button
              onClick={() => handlePropChange("fontStyle", props.fontStyle === "italic" ? "normal" : "italic")}
              className={`flex-1 flex items-center justify-center p-1.5 rounded text-zinc-600 transition-all ${props.fontStyle === "italic" ? "bg-white shadow-sm text-blue-600" : "hover:bg-zinc-200"}`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePropChange("textDecoration", props.textDecoration === "underline" ? "none" : "underline")}
              className={`flex-1 flex items-center justify-center p-1.5 rounded text-zinc-600 transition-all ${props.textDecoration === "underline" ? "bg-white shadow-sm text-blue-600" : "hover:bg-zinc-200"}`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
             <button
              onClick={() => handlePropChange("textDecoration", props.textDecoration === "line-through" ? "none" : "line-through")}
              className={`flex-1 flex items-center justify-center p-1.5 rounded text-zinc-600 transition-all ${props.textDecoration === "line-through" ? "bg-white shadow-sm text-blue-600" : "hover:bg-zinc-200"}`}
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Shadow */}
        <div className="space-y-1 mt-2">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Shadow</label>
            <select value={props.textShadow || "none"} onChange={(e) => handlePropChange("textShadow", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white">
               <option value="none">None</option>
               <option value="1px 1px 2px rgba(0,0,0,0.2)">Light</option>
               <option value="2px 2px 4px rgba(0,0,0,0.3)">Medium</option>
               <option value="0px 0px 5px rgba(0,0,0,0.5)">Glow</option>
            </select>
        </div>
      </SettingsSection>

      <SettingsSection title="Spacing (Margin)" icon={Move}>
         <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Top</label>
              <input type="number" value={props.marginTop || 0} onChange={(e) => handlePropChange("marginTop", e.target.value)} className="w-full px-2 py-1 text-xs border border-zinc-200 rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Bottom</label>
              <input type="number" value={props.marginBottom || 0} onChange={(e) => handlePropChange("marginBottom", e.target.value)} className="w-full px-2 py-1 text-xs border border-zinc-200 rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Left</label>
              <input type="number" value={props.marginLeft || 0} onChange={(e) => handlePropChange("marginLeft", e.target.value)} className="w-full px-2 py-1 text-xs border border-zinc-200 rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Right</label>
              <input type="number" value={props.marginRight || 0} onChange={(e) => handlePropChange("marginRight", e.target.value)} className="w-full px-2 py-1 text-xs border border-zinc-200 rounded" />
            </div>
         </div>
      </SettingsSection>
    </div>
  );
};

Text.craft = {
  props: {
    text: "Edit text here...",
    fontSize: "12",
    textAlign: "left",
    fontWeight: "400",
    color: "#000000",
    fontFamily: "var(--font-sans)",
    lineHeight: "1.5",
    letterSpacing: "0",
    textDecoration: "none",
    textTransform: "none",
    fontStyle: "normal",
    marginTop: "0",
    marginBottom: "0",
    marginLeft: "0",
    marginRight: "0"
  },
  related: {
    settings: TextSettings,
  },
};
