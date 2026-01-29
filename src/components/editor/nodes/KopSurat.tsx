import { useNode, Element } from "@craftjs/core";
import { Text } from "./Text";
import { Image, Layout, AlignCenter } from "lucide-react";
import { useSuratContext } from "@/lib/contexts/SuratContext";

export const KopSurat = ({
    logoSize = "80", // w-20 = 80px
    lineThickHeight = "3",
    lineThinHeight = "1",
    spacing = "8", // mb-2 = 8px
    showLogoLeft = true,
    showLogoRight = false,
    fontSizeTitle = "14"
}: {
    logoSize?: string;
    lineThickHeight?: string;
    lineThinHeight?: string;
    spacing?: string;
    showLogoLeft?: boolean;
    showLogoRight?: boolean;
    fontSizeTitle?: string;
}) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));
  const { data, mode } = useSuratContext();

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
                     {data?.desa?.logo ? (
                       <img src={data.desa.logo} alt="Logo" className="w-full h-full object-contain" />
                     ) : (
                       <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-gray-400">
                          <span className="text-[10px] text-center">LOGO</span>
                       </div>
                     )}
                  </div>
              )}
          </div>

          {/* Text Section - Preview Mode (Direct Data) */}
          <div className="flex-1 text-center uppercase font-bold text-black" style={{ fontFamily: 'var(--font-sans)' }}>
            <div style={{ fontSize: `${fontSizeTitle}px`, lineHeight: "1.2" }}>
                PEMERINTAH {data?.desa?.sebutan_kabupaten || "KABUPATEN"} {data?.desa?.nama_kabupaten || "[NAMA_KAB]"}
            </div>
            <div style={{ fontSize: `${fontSizeTitle}px`, lineHeight: "1.2" }}>
                KECAMATAN {data?.desa?.nama_kecamatan || "[NAMA_KEC]"}
            </div>
            <div style={{ fontSize: `${Number(fontSizeTitle) + 4}px`, lineHeight: "1.2", marginTop: "4px" }}>
                {data?.desa?.sebutan_desa || "DESA"} {data?.desa?.nama_desa || "[NAMA_DES]"}
            </div>
            <div className="mt-1 italic font-normal" style={{ fontSize: `${Number(fontSizeTitle) - 3}px` }}>
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
                   {data?.desa?.logo ? (
                     <img src={data.desa.logo} alt="Logo" className="w-full h-full object-contain" />
                   ) : (
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded text-gray-400">
                        <span className="text-[10px] text-center">LOGO</span>
                     </div>
                   )}
                </div>
            )}
        </div>

        {/* Text Section */}
        <div className="flex-1 text-center uppercase">
          <Element id="kop_pem" is={Text} text="PEMERINTAH [SEBUTAN_KABUPATEN] [NAMA_KAB]" fontSize={fontSizeTitle} textAlign="center" fontWeight="bold" />
          <Element id="kop_kec" is={Text} text="KECAMATAN [NAMA_KEC]" fontSize={fontSizeTitle} textAlign="center" fontWeight="bold" />
          <Element id="kop_des" is={Text} text="[SEBUTAN_DESA] [NAMA_DES]" fontSize={`${Number(fontSizeTitle) + 4}`} textAlign="center" fontWeight="bold" />
          <div className="mt-1 lowercase capitalize italic">
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
    const { actions: { setProp }, logoSize, lineThickHeight, lineThinHeight, spacing, showLogoLeft, showLogoRight, fontSizeTitle } = useNode((node) => ({
      logoSize: node.data.props.logoSize,
      lineThickHeight: node.data.props.lineThickHeight,
      lineThinHeight: node.data.props.lineThinHeight,
      spacing: node.data.props.spacing,
      showLogoLeft: node.data.props.showLogoLeft,
      showLogoRight: node.data.props.showLogoRight,
      fontSizeTitle: node.data.props.fontSizeTitle,
    }));
  
    return (
      <div className="space-y-4">
        {/* Logo Settings */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Image className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700">Logo</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                    onChange={(e) => setProp((props: any) => (props.fontSizeTitle = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
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
      fontSizeTitle: "14"
  },
  related: {
      settings: KopSuratSettings
  }
};
