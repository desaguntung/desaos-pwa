import { useNode } from "@craftjs/core";
import { useState, useMemo, useEffect, useRef } from "react";
import ContentEditable from "react-contenteditable";
import { useSuratContext } from "@/lib/contexts/SuratContext";
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Bold, Italic, Underline, Strikethrough,
  Type, Move, Palette, Layout, PlusCircle
} from "lucide-react";

const AVAILABLE_VARIABLES = [
  { label: "Nama Desa", value: "Nama_Desa" },
  { label: "Sebutan Desa", value: "Sebutan_Desa" },
  { label: "Kecamatan", value: "Nama_Kecamatan" },
  { label: "Kabupaten", value: "Nama_Kabupaten" },
  { label: "Sebutan Kabupaten", value: "Sebutan_Kabupaten" },
  { label: "Provinsi", value: "Nama_Provinsi" },
  { label: "Alamat Desa", value: "Alamat_Desa" },
  { label: "Kode Pos", value: "Kode_Pos" },
  { label: "Website", value: "Website" },
  { label: "Email Desa", value: "Email_Desa" },
  { label: "Telepon Desa", value: "Telepon_Desa" },
  { label: "Kode Desa", value: "Kode_Desa" },
  
  { label: "Nomor Surat", value: "Nomor_Surat" },
  { label: "Tanggal Surat", value: "Tanggal_Surat" },
  { label: "Kode Surat", value: "Kode_Surat" },
  
  { label: "Nama Pamong", value: "Nama_Pamong" },
  { label: "NIP Pamong", value: "NIP_Pamong" },
  { label: "Pangkat Pamong", value: "Pangkat_Pamong" },
  { label: "Jabatan (Penandatangan)", value: "Penandatangan" },

  // Penduduk
  { label: "Nama Penduduk", value: "Nama_Penduduk" },
  { label: "NIK", value: "NIK_Penduduk" },
  { label: "No. KK", value: "No_KK" },
  { label: "Tempat Lahir", value: "Tempat_Lahir" },
  { label: "Tanggal Lahir", value: "Tanggal_Lahir_Penduduk" },
  { label: "Jenis Kelamin", value: "Jenis_Kelamin" },
  { label: "Agama", value: "Agama" },
  { label: "Pekerjaan", value: "Pekerjaan" },
  { label: "Pendidikan", value: "Pendidikan" },
  { label: "Status Kawin", value: "Status_Kawin" },
  { label: "Alamat Penduduk", value: "Alamat_Penduduk" },
  { label: "RT", value: "RT" },
  { label: "RW", value: "RW" },
  { label: "Dusun", value: "Dusun" },
  { label: "Warga Negara", value: "Warganegara" },
  { label: "Nama Ayah", value: "Nama_Ayah" },
  { label: "Nama Ibu", value: "Nama_Ibu" },
];

export const Text = ({ 
  text, 
  fontSize = "12", 
  textAlign = "left", 
  fontWeight = "normal",
  color = "#000000",
  fontFamily = "Arial, sans-serif",
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
  const { connectors: { connect, drag }, selected, actions: { setProp }, insertVariable } = useNode((state) => ({
    selected: state.events.selected,
    insertVariable: state.data.props.insertVariable,
  }));
  const [editable, setEditable] = useState(false);
  const { mode, data } = useSuratContext();

  const contentEditableRef = useRef<HTMLElement>(null);
  const savedRange = useRef<Range | null>(null);

  // Handle selection change to save cursor position
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editable) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const el = contentEditableRef.current;
        if (el && el.contains(range.commonAncestorContainer)) {
          savedRange.current = range.cloneRange();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editable]);

  // Handle variable insertion request from settings
  useEffect(() => {
    if (insertVariable) {
      if (!editable) {
        setEditable(true);
        return; // Wait for next render where editable is true
      }

      const el = contentEditableRef.current;
      if (el) {
        el.focus();
        
        // Restore selection if available
        const sel = window.getSelection();
        let rangeRestored = false;

        if (sel && savedRange.current) {
            // Validate that the saved range is actually inside this element
            if (el.contains(savedRange.current.commonAncestorContainer)) {
                sel.removeAllRanges();
                sel.addRange(savedRange.current);
                rangeRestored = true;
            }
        }

        // If no valid selection restored, move cursor to end
        if (!rangeRestored && sel) {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false); // false = end
            sel.removeAllRanges();
            sel.addRange(range);
        }

        // Insert text at cursor
        // Note: insertText command is deprecated but widely supported and handles undo/redo + HTML cleanup well
        document.execCommand('insertText', false, ` [${insertVariable}] `);
        
        // Clear the request
        setProp((props: any) => props.insertVariable = null);
      }
    }
  }, [insertVariable, editable, setProp]);
  
  // Replace variables in preview mode
  const displayContent = useMemo(() => {
    if (mode !== 'preview' || !text) return text;
    
    let processedText = text;

    // Helper for Title Case with Roman numerals and acronyms support
    const ROMAN_OR_ACRONYMS = new Set([
      'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii',
      'rt', 'rw', 'kk', 'nik', 'ktp', 'skck', 'wni', 'wna', 'pns', 'tni', 'polri',
      'bpd', 'lpm', 'pdam', 'pln', 'bpjs', 'sim', 'hp', 'dki', 'diy'
    ]);

    const toTitleCase = (str: string) => {
      if (!str) return "";
      return str.replace(/\w\S*/g, (txt) => {
        const lower = txt.toLowerCase();
        if (ROMAN_OR_ACRONYMS.has(lower)) {
          return lower.toUpperCase();
        }
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      });
    };

    // Helper for Date Formatting
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        } catch (e) {
            return dateStr;
        }
    };
    
    // Dictionary of values (raw)
    const variables: Record<string, string> = {};
    
    if (data.desa) {
      variables['nama_des'] = data.desa.nama_desa || data.desa.nama || "";
      variables['nama_desa'] = data.desa.nama_desa || data.desa.nama || "";
      variables['sebutan_desa'] = data.desa.sebutan_desa || "Desa";
      variables['nama_kec'] = data.desa.nama_kecamatan || data.desa.kecamatan || "";
      variables['nama_kecamatan'] = data.desa.nama_kecamatan || data.desa.kecamatan || "";
      variables['sebutan_kecamatan'] = data.desa.sebutan_kecamatan || "Kecamatan";
      variables['nama_kab'] = data.desa.nama_kabupaten || data.desa.kabupaten || "";
      variables['nama_kabupaten'] = data.desa.nama_kabupaten || data.desa.kabupaten || "";
      variables['sebutan_kabupaten'] = data.desa.sebutan_kabupaten || "Kabupaten";
      variables['nama_prov'] = data.desa.nama_provinsi || data.desa.provinsi || "";
      variables['nama_provinsi'] = data.desa.nama_provinsi || data.desa.provinsi || "";
      variables['kode_prov'] = data.desa.kode_provinsi || "";
      variables['kode_provinsi'] = data.desa.kode_provinsi || "";
      variables['alamat_des'] = data.desa.alamat_kantor || data.desa.alamat || "";
      variables['alamat_desa'] = data.desa.alamat_kantor || data.desa.alamat || "";
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
      variables['penandatangan'] = data.pamong.jabatan || data.pamong.pangkat || "Kepala Desa";
      variables['nama_pamong'] = data.pamong.nama || "";
      variables['nama-pamong'] = variables['nama_pamong'];
      variables['nip_pamong'] = data.pamong.nip || "";
      variables['nip-pamong'] = variables['nip_pamong'];
      variables['pangkat_pamong'] = data.pamong.pangkat || "";
      variables['pangkat-pamong'] = variables['pangkat_pamong'];
    }

    if (data.surat) {
       variables['nomor_surat'] = data.surat.nomor || data.surat.no_surat || "";
       variables['format_nomor_surat'] = data.surat.nomor || data.surat.no_surat || "";
       variables['tgl_surat'] = data.surat.tanggal_surat || data.surat.tanggal || "";
       variables['tanggal_surat'] = data.surat.tanggal_surat || data.surat.tanggal || "";
       variables['kode_surat'] = data.surat.kode || data.surat.kode_surat || "";
    }

    // Combine penduduk and form_data for variable resolution
    const pendudukData = data.penduduk || {};
    const formData = data.form_data || {};
    
    // Helper to get value from either source
    const getValue = (keys: string[]) => {
        for (const key of keys) {
            if (pendudukData[key] !== undefined && pendudukData[key] !== null && pendudukData[key] !== "") return String(pendudukData[key]);
            if (formData[key] !== undefined && formData[key] !== null && formData[key] !== "") return String(formData[key]);
        }
        return "";
    };

    if (data.penduduk || data.form_data) {
      variables['nama_penduduk'] = getValue(['nama', 'nama_lengkap', 'nama_pemohon']);
      variables['nik_penduduk'] = getValue(['nik', 'nik_pemohon']);
      variables['no_kk'] = getValue(['no_kk', 'nomor_kk']);
      
      variables['tempat_lahir'] = getValue(['tempat_lahir', 'tempatlahir', 'tempat_kelahiran']);
      
      const tglLahirRaw = getValue(['tanggal_lahir', 'tanggallahir', 'tgl_lahir']);
      variables['tanggal_lahir_penduduk'] = formatDate(tglLahirRaw);
      variables['tanggal_lahir'] = variables['tanggal_lahir_penduduk'];
      
      // Combined Tempat/Tanggal Lahir
      const tempat = variables['tempat_lahir'];
      const tgl = variables['tanggal_lahir_penduduk'];
      variables['tempat_tanggal_lahir'] = (tempat && tgl) ? `${tempat}, ${tgl}` : (tempat || tgl);
      variables['ttl'] = variables['tempat_tanggal_lahir'];
      variables['tempat_tgl_lahir'] = variables['tempat_tanggal_lahir'];
      variables['tempat-tanggal-lahir'] = variables['tempat_tanggal_lahir'];
      variables['tempat-tgl-lahir'] = variables['tempat_tanggal_lahir'];

      // Jenis Kelamin
      const sex = getValue(['sex', 'jenis_kelamin', 'jk', 'gender']);
      let jk = sex;
      if (sex === "1") jk = "Laki-laki";
      else if (sex === "2") jk = "Perempuan";
      else if (sex) {
          if (sex.toUpperCase() === "L" || sex.toUpperCase() === "LAKI-LAKI") jk = "Laki-laki";
          else if (sex.toUpperCase() === "P" || sex.toUpperCase() === "PEREMPUAN") jk = "Perempuan";
      }
      variables['jenis_kelamin'] = jk || "";
      variables['jk'] = jk || "";
      variables['sex'] = jk || "";
      variables['jenis-kelamin'] = jk || "";

      variables['agama'] = getValue(['agama']);
      variables['pekerjaan'] = getValue(['pekerjaan', 'pekerjaan_kk']);
      variables['pendidikan'] = getValue(['pendidikan', 'pendidikan_kk', 'pendidikan_terakhir']);
      variables['status_kawin'] = getValue(['status_kawin', 'status_perkawinan']);
      
      // Alamat from penduduk (pre-formatted by buildSuratPreviewData)
      const fullAddress = getValue(['alamat', 'alamat_lengkap', 'alamat_penduduk', 'alamat_tempat_tinggal', 'alamat_saat_ini']);
      
      variables['alamat_penduduk'] = fullAddress;
      variables['alamat_tempat_tinggal'] = fullAddress;
      variables['alamat-tempat-tinggal'] = fullAddress;
      variables['alamat'] = fullAddress;
      variables['alamat_lengkap'] = fullAddress;
      
      variables['rt'] = getValue(['rt']);
      variables['rw'] = getValue(['rw']);
      variables['dusun'] = getValue(['dusun', 'dusun_sekarang']);
      
      variables['warganegara'] = getValue(['warga_negara', 'warganegara', 'kewarganegaraan', 'status_kewarganegaraan']) || "WNI";
      variables['kewarganegaraan'] = variables['warganegara'];
      variables['wn'] = variables['warganegara'];
      variables['warga-negara'] = variables['warganegara'];

      variables['nama_ayah'] = getValue(['ayah', 'nama_ayah']);
      variables['nama_ibu'] = getValue(['ibu', 'nama_ibu']);
    }

    // Register all custom form_data variables
    if (data.form_data && typeof data.form_data === 'object') {
      Object.entries(data.form_data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          const valStr = String(v);
          const cleanK = k.trim();
          variables[cleanK] = valStr;
          variables[cleanK.toLowerCase()] = valStr;
          variables[cleanK.toLowerCase().replace(/[\s\-_/]+/g, '_')] = valStr;
        }
      });
    }

    // Replacer function using Regex to capture key and respect casing
    // Pattern: [key] - Allow alphanumeric, underscore, dash, space, AND SLASH
    processedText = processedText.replace(/\[([a-zA-Z0-9_\-\s\/]+)\]/g, (match: string, key: string) => {
        const lowerKey = key.toLowerCase().replace(/[\s\/]+/g, '_');
        const rawKey = key.trim();
        const value = variables[rawKey] || variables[lowerKey] || variables[key.toLowerCase()] || variables[key.trim().toLowerCase()];
        
        if (value === undefined || value === null) return match; // Keep placeholder if variable not found

        // 1. ALL CAPS ([NAMA_DESA] or [KEPERLUAN]) -> UPPERCASE
        if (key === key.toUpperCase() && key !== key.toLowerCase()) {
            return String(value).toUpperCase();
        }

        // 2. Default: Return formatted value directly (never downcase proper nouns like desa/kecamatan)
        return String(value);
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
        fontFamily: fontFamily || 'Arial, "Times New Roman", sans-serif',
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
        innerRef={contentEditableRef}
        html={displayContent}
        disabled={!editable || mode === 'preview'}
        onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
        onBlur={() => setEditable(false)}
        className="outline-none focus:outline-none"
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

  const [selectedVariable, setSelectedVariable] = useState("");

  const handleInsertVariable = () => {
      if(!selectedVariable) return;
      // Trigger insertion in Text component via prop
      setProp((props: any) => {
          props.insertVariable = selectedVariable;
      });
      setSelectedVariable("");
  };

  return (
    <div className="flex flex-col gap-1">
      <SettingsSection title="Insert Variable" icon={PlusCircle}>
         <div className="flex gap-1">
            <select 
                value={selectedVariable} 
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">Select Variable...</option>
                {AVAILABLE_VARIABLES.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                ))}
            </select>
            <button 
                onClick={handleInsertVariable}
                disabled={!selectedVariable}
                className="px-2 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            >
                Add
            </button>
         </div>
         <p className="text-[10px] text-gray-400 mt-1">
            Select a variable to insert into the text content.
         </p>
      </SettingsSection>

      <SettingsSection title="Typography" icon={Type}>
        {/* Font Family */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Font Family (Standar Dinas)</label>
          <select
            value={props.fontFamily || "Arial, sans-serif"}
            onChange={(e) => handlePropChange("fontFamily", e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Arial, sans-serif">Arial (Standar Naskah Dinas)</option>
            <option value='"Times New Roman", Times, serif'>Times New Roman (Formal Serif)</option>
            <option value='"Bookman Old Style", Georgia, serif'>Bookman Old Style (Keputusan Resmi)</option>
            <option value="Calibri, sans-serif">Calibri</option>
            <option value="Georgia, serif">Georgia</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
           {/* Font Size */}
          <div className="space-y-1">
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">Size</label>
            <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
              <input
                type="number"
                value={props.fontSize || 12}
                onChange={(e) => handlePropChange("fontSize", e.target.value)}
                className="w-full px-2 py-1.5 text-xs outline-none"
              />
              <span className="text-xs text-zinc-400 pr-2">px</span>
            </div>
          </div>
          {/* Line Height */}
          <div className="space-y-1">
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">Line Height</label>
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
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">Weight</label>
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
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">Color</label>
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
          <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">Opacity</label>
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
          <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">Alignment</label>
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

Text.displayName = "Text";

Text.craft = {
  props: {
    text: "Edit text here...",
    fontSize: "12",
    textAlign: "left",
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Arial, sans-serif",
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
