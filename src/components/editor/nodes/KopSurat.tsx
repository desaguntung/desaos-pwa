import { useNode, Element, useEditor } from "@craftjs/core";
import { Text } from "@/components/editor/nodes/Text";
import { Image, Layout, AlignCenter, Upload, Link, Info, X } from "lucide-react";
import { useSuratContext } from "@/lib/contexts/SuratContext";

export const KopSurat = ({
    logoSize = "80", // w-20 = 80px
    lineThickHeight = "3",
    lineThinHeight = "1",
    spacing = "8", // mb-2 = 8px
    showLogoLeft = true,
    showLogoRight = false,
    fontSizeTitle = "14",
    logoUrl = "",
    fontFamilyTitle = "Arial, sans-serif"
}: {
    logoSize?: string;
    lineThickHeight?: string;
    lineThinHeight?: string;
    spacing?: string;
    showLogoLeft?: boolean;
    showLogoRight?: boolean;
    fontSizeTitle?: string;
    logoUrl?: string;
    fontFamilyTitle?: string;
}) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));
  const { data, mode } = useSuratContext();
  const rawLogo = logoUrl || data?.desa?.logo || "";
  const isValidLogo = rawLogo && (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:') || rawLogo.startsWith('/'));
  const effectiveLogo = isValidLogo ? rawLogo : "";

  if (mode === 'preview') {
    return (
      <div
        className="w-full mb-2"
        style={{ marginBottom: `${spacing}px` }}
      >
        <div className="flex items-center justify-between px-4 pb-2">
          {/* Left Logo Section */}
          <div style={{ width: `${Number(logoSize) + 16}px` }} className="flex items-center justify-center relative z-[60]">
              {showLogoLeft && (
                  <div style={{ width: `${logoSize}px`, height: `${Number(logoSize) * 1.2}px` }} className="flex items-center justify-center">
                     {effectiveLogo ? (
                       <img 
                         src={effectiveLogo} 
                         alt="Logo" 
                         className="w-full h-full object-contain" 
                         onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                       />
                     ) : null}
                  </div>
              )}
          </div>

          {/* Text Section - Preview Mode (Direct Data) */}
          <div className="flex-1 text-center uppercase font-bold text-black" style={{ fontFamily: fontFamilyTitle }}>
            <div style={{ fontSize: `${fontSizeTitle}px`, lineHeight: "1.2" }}>
                PEMERINTAH {data?.desa?.sebutan_kabupaten || "KABUPATEN"} {data?.desa?.nama_kabupaten || "[NAMA_KAB]"}
            </div>
            <div style={{ fontSize: `${fontSizeTitle}px`, lineHeight: "1.2" }}>
                KECAMATAN {data?.desa?.nama_kecamatan || "[NAMA_KEC]"}
            </div>
            <div style={{ fontSize: `${Number(fontSizeTitle) + 4}px`, lineHeight: "1.2", marginTop: "4px" }}>
                {data?.desa?.sebutan_desa || "DESA"} {data?.desa?.nama_desa || "[NAMA_DES]"}
            </div>
            <div className="mt-1 italic font-normal normal-case" style={{ fontSize: `${Number(fontSizeTitle) - 3}px` }}>
               {data?.desa?.alamat_kantor || data?.desa?.alamat || "Alamat Kantor Belum Diisi"}
            </div>
          </div>
          
          {/* Right Logo Section */}
          <div style={{ width: `${Number(logoSize) + 16}px` }} className="flex items-center justify-center relative z-[60]">
              {showLogoRight && (
                  <div style={{ width: `${logoSize}px`, height: `${Number(logoSize) * 1.2}px` }} className="flex items-center justify-center">
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-gray-400">
                        <span className="text-[10px] text-center">LOGO</span>
                     </div>
                  </div>
              )}
          </div>
        </div>
        
        {/* Lines */}
        <div className="border-black w-full mx-auto mt-1" style={{ borderBottomWidth: `${lineThickHeight}px` }}></div>
        <div className="border-black w-full mx-auto mt-[2px]" style={{ borderBottomWidth: `${lineThinHeight}px` }}></div>
      </div>
    );
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:bg-gray-50"}`}
      style={{ marginBottom: `${spacing}px` }}
    >
      <div className="flex items-center justify-between px-4 pb-2">
        {/* Left Logo Section */}
        <div style={{ width: `${Number(logoSize) + 16}px` }} className="flex items-center justify-center relative z-[60]">
            {showLogoLeft && (
                <div style={{ width: `${logoSize}px`, height: `${Number(logoSize) * 1.2}px` }} className="flex items-center justify-center">
                   {effectiveLogo ? (
                     <img src={effectiveLogo} alt="Logo" className="w-full h-full object-contain" />
                   ) : (
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-gray-400">
                        <span className="text-[10px] text-center">LOGO</span>
                     </div>
                   )}
                </div>
            )}
        </div>

        {/* Text Section */}
        <div className="flex-1 text-center uppercase" style={{ fontFamily: fontFamilyTitle }}>
          <Element id="kop_pem" is={Text} text="PEMERINTAH [SEBUTAN_KABUPATEN] [NAMA_KAB]" fontSize={fontSizeTitle} textAlign="center" fontWeight="bold" />
          <Element id="kop_kec" is={Text} text="KECAMATAN [NAMA_KEC]" fontSize={fontSizeTitle} textAlign="center" fontWeight="bold" />
          <Element id="kop_des" is={Text} text="[SEBUTAN_DESA] [NAMA_DES]" fontSize={`${Number(fontSizeTitle) + 4}`} textAlign="center" fontWeight="bold" />
          <div className="mt-1 normal-case italic">
             <Element id="kop_alamat" is={Text} text="[alamat_des]" fontSize={`${Number(fontSizeTitle) - 3}`} textAlign="center" />
          </div>
        </div>
        
        {/* Right Logo Section (or Spacer) */}
        <div style={{ width: `${Number(logoSize) + 16}px` }} className="flex items-center justify-center relative z-[60]">
            {showLogoRight && (
                <div style={{ width: `${logoSize}px`, height: `${Number(logoSize) * 1.2}px` }} className="flex items-center justify-center">
                   {/* Right logo logic could be different if needed, for now placeholder or same logic */}
                   <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-gray-400">
                      <span className="text-[10px] text-center">LOGO</span>
                   </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Thick Divider */}
      <div className="border-black w-full mx-auto mt-1" style={{ borderBottomWidth: `${lineThickHeight}px` }}></div>
      <div className="border-black w-full mx-auto mt-[2px]" style={{ borderBottomWidth: `${lineThinHeight}px` }}></div>
    </div>
  );
};

export const KopSuratSettings = () => {
    const { actions: { setProp }, logoSize, lineThickHeight, lineThinHeight, spacing, showLogoLeft, showLogoRight, fontSizeTitle, logoUrl, fontFamilyTitle } = useNode((node) => ({
      logoSize: node.data.props.logoSize,
      lineThickHeight: node.data.props.lineThickHeight,
      lineThinHeight: node.data.props.lineThinHeight,
      spacing: node.data.props.spacing,
      showLogoLeft: node.data.props.showLogoLeft,
      showLogoRight: node.data.props.showLogoRight,
      fontSizeTitle: node.data.props.fontSizeTitle,
      logoUrl: node.data.props.logoUrl,
      fontFamilyTitle: node.data.props.fontFamilyTitle,
    }));
    const { actions } = useEditor();
    
    const updateChildTextSizes = (base: number) => {
      actions.setProp("kop_pem", (props: any) => (props.fontSize = String(base)));
      actions.setProp("kop_kec", (props: any) => (props.fontSize = String(base)));
      actions.setProp("kop_des", (props: any) => (props.fontSize = String(base + 4)));
      actions.setProp("kop_alamat", (props: any) => (props.fontSize = String(base - 3)));
    };
    
    const updateChildTextFontFamily = (family: string) => {
      actions.setProp("kop_pem", (props: any) => (props.fontFamily = family));
      actions.setProp("kop_kec", (props: any) => (props.fontFamily = family));
      actions.setProp("kop_des", (props: any) => (props.fontFamily = family));
      actions.setProp("kop_alamat", (props: any) => (props.fontFamily = family));
    };
  
    const { data } = useSuratContext();
    const effectiveLogo = logoUrl || data?.desa?.logo || "";
    const isBase64 = logoUrl?.startsWith("data:image");

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setProp((props: any) => (props.logoUrl = ev.target?.result as string));
            };
            reader.readAsDataURL(file);
        }
    };
  
    return (
      <div className="space-y-4">
        {/* Logo Settings */}
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-semibold text-gray-700">Logo Settings</h4>
                </div>
            </div>

            {/* Active Logo Preview */}
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col items-center gap-3">
                 <div className="w-20 h-20 bg-white rounded border border-zinc-100 flex items-center justify-center p-2 shadow-sm relative group">
                    {effectiveLogo ? (
                        <img src={effectiveLogo} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-[10px] text-zinc-300">No Logo</span>
                    )}
                    
                    {/* Quick Reset Overlay */}
                    {logoUrl && (
                        <button 
                            onClick={() => setProp((props: any) => (props.logoUrl = ""))}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full shadow-sm hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Reset to Default Desa Logo"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                 </div>
                 
                 <div className="flex w-full gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center gap-1 p-2 bg-white border border-dashed border-zinc-300 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all text-zinc-500">
                        <Upload className="w-3 h-3" />
                        <span className="text-[10px] font-medium">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                 </div>
            </div>

            {/* URL Input */}
             <div className="space-y-1">
                <div className="relative">
                    <Link className={`w-3 h-3 absolute left-2.5 top-2.5 ${isBase64 ? "text-zinc-300" : "text-zinc-400"}`} />
                    <input 
                       type="text" 
                       placeholder="https://example.com/logo.png"
                       value={isBase64 ? "" : (logoUrl || "")} 
                       disabled={isBase64}
                       onChange={(e) => setProp((props: any) => (props.logoUrl = e.target.value))}
                       className={`w-full pl-8 pr-2 py-2 text-xs border rounded transition-all ${
                         isBase64 
                           ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed placeholder-zinc-300" 
                           : "bg-white border-zinc-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       }`}
                    />
                 </div>
             </div>
             
             {/* Info Text */}
             <div className="flex items-start gap-2 p-2 bg-blue-50/50 rounded text-[10px] text-blue-600 border border-blue-100">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                  {logoUrl ? "Menggunakan logo kustom." : "Menggunakan logo default dari Identitas Desa."}
                </span>
             </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 pt-1">
                    <input 
                        type="checkbox" 
                        checked={showLogoLeft !== false} 
                        onChange={(e) => setProp((props: any) => (props.showLogoLeft = e.target.checked))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-xs font-medium text-gray-500">Left Logo</label>
                </div>
                <div className="flex items-center gap-2 pt-1">
                    <input 
                        type="checkbox" 
                        checked={showLogoRight || false} 
                        onChange={(e) => setProp((props: any) => (props.showLogoRight = e.target.checked))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-xs font-medium text-gray-500">Right Logo</label>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Logo Width (px)</label>
                <input 
                    type="number" 
                    value={logoSize || "80"} 
                    onChange={(e) => setProp((props: any) => (props.logoSize = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>
        </div>

        {/* Layout & Typography */}
        <div className="space-y-3">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Layout className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700">Layout</h4>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Bottom Margin (px)</label>
                <input 
                    type="number" 
                    value={spacing || "8"} 
                    onChange={(e) => setProp((props: any) => (props.spacing = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>
            
             <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Base Font Size (px)</label>
                <input 
                    type="number" 
                    value={fontSizeTitle || "14"} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value || "14");
                      setProp((props: any) => (props.fontSizeTitle = String(val)));
                      updateChildTextSizes(val);
                    }}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>
            
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Font Family</label>
                <select
                  value={fontFamilyTitle || "var(--font-sans)"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProp((props: any) => (props.fontFamilyTitle = val));
                    updateChildTextFontFamily(val);
                  }}
                  className="w-full px-2 py-1 text-xs border rounded bg-white"
                >
                  <option value="var(--font-sans)">Sans (Geist Sans)</option>
                  <option value="var(--font-mono)">Mono (Geist Mono)</option>
                  <option value='"Times New Roman", Times, serif'>Serif (Times New Roman)</option>
                </select>
            </div>
        </div>

        {/* Divider Settings */}
        <div className="space-y-3">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <AlignCenter className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700">Divider Lines</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Thick Line (px)</label>
                    <input 
                        type="number" 
                        value={lineThickHeight || "3"} 
                        onChange={(e) => setProp((props: any) => (props.lineThickHeight = e.target.value))}
                        className="w-full px-2 py-1 text-xs border rounded"
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Thin Line (px)</label>
                    <input 
                        type="number" 
                        value={lineThinHeight || "1"} 
                        onChange={(e) => setProp((props: any) => (props.lineThinHeight = e.target.value))}
                        className="w-full px-2 py-1 text-xs border rounded"
                    />
                </div>
            </div>
        </div>
      </div>
    );
};

KopSurat.craft = {
  displayName: "Kop Surat",
  props: {
      logoSize: "80",
      lineThickHeight: "3",
      lineThinHeight: "1",
      spacing: "8",
      showLogoLeft: true,
      showLogoRight: false,
      fontSizeTitle: "14",
      logoUrl: "",
      fontFamilyTitle: "var(--font-sans)"
  },
  related: {
      settings: KopSuratSettings
  }
};
