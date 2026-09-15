import { useNode, Element } from "@craftjs/core";
import { Text } from "./Text";
import { Variable } from "./Variable";
import { PenTool, Layout, Type, QrCode } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { SuratContext } from "@/lib/contexts/SuratContext";
import QRCode from "qrcode";
import { createPortal } from "react-dom";

export const Signature = ({ 
    showNip = true,
    showLeftSignature = true,
    showQrCode = false,
    marginTop = "32", // mt-8
    gap = "0", // justify-between default
    leftTitle = "Pemegang Surat",
    leftName = "penduduk.nama",
    rightTitle = "[penandatangan]",
    rightName = "pamong.nama",
    rightNip = "pamong.nip",
    placeDate = "[nama_des], [tgl_surat]",
    fontSize = "12",
    textAlign = "left"
}: { 
    showNip?: boolean;
    showLeftSignature?: boolean;
    showQrCode?: boolean;
    marginTop?: string;
    gap?: string;
    leftTitle?: string;
    leftName?: string;
    rightTitle?: string;
    rightName?: string;
    rightNip?: string;
    placeDate?: string;
    fontSize?: string;
    textAlign?: string;
}) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const context = useContext(SuratContext);
  const data = context?.data || {};
  const signature = data.signature || data.form_data?.signature;
  const [qrSrc, setQrSrc] = useState<string>("");
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
    if (signature?.verification_url) {
        QRCode.toDataURL(signature.verification_url, { 
            width: 100,
            margin: 0,
            color: {
                dark: '#000000',
                light: '#ffffff00' 
            }
        }).then(setQrSrc).catch(console.error);
    } else {
        setQrSrc("");
    }
  }, [signature]);

  // Determine alignment logic
  // If left signature is hidden, we usually want the right signature to be on the right (flex-end)
  // unless the user specified a specific gap (which implies flex-start layout).
  const justifyContent = !showLeftSignature && gap === "0" 
      ? "flex-end" 
      : gap === "0" 
          ? "space-between" 
          : "flex-start";

  // Force hide QR code if manual signature type
  const isManual = signature?.type === 'manual';
  // Allow QR code for manual signature as requested
  const shouldShowQrCode = showQrCode;

  // Portal content for Footer Area
  const footerContent = (
    <div 
        className="w-full flex flex-row items-center justify-start py-2 gap-3" 
        style={{ 
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "8px 0",
            gap: "12px"
        }}
    >
         {/* QR Code (Replacing BSrE Logo) */}
         {qrSrc ? (
            <img src={qrSrc} alt="QR Code" style={{ width: "48px", height: "auto", objectFit: "contain", flexShrink: 0 }} />
         ) : (
            <div style={{ width: "48px", height: "48px", border: "2px dashed #d1d5db", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexShrink: 0 }}>
                <QrCode className="w-6 h-6" />
            </div>
         )}

         {/* Vertical Divider */}
         <div style={{ width: "1.5px", height: "48px", backgroundColor: "#3f3f46", opacity: 0.2 }}></div>

         {/* Text Content */}
         <div className="flex-1 flex flex-col justify-center gap-[2px]">
            <p className="text-[9px] text-zinc-900 text-left m-0 p-0 leading-tight font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
                Dokumen ini telah diterbitkan secara resmi melalui Sistem Informasi Desa
            </p>
            <p className="text-[9px] text-zinc-900 text-left m-0 p-0 leading-tight font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
                dan tercatat dalam database desa.
            </p>
            <p className="text-[9px] text-zinc-600 text-left m-0 p-0 leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
                Pindai QR Code disamping untuk memverifikasi keaslian dokumen ini.
            </p>
         </div>
    </div>
  );

  if (context?.mode === 'preview') {
    const desaName = data.desa?.nama || data.desa?.nama_desa || "Guntung";
    const tglSurat = data.surat?.tanggal_surat || data.surat?.tanggal || "";
    const placeDateFormatted = `${desaName}, ${tglSurat}`;
    const jabatan = data.pamong?.jabatan || data.pamong?.penandatangan || "Kepala Desa";
    const officialName = data.pamong?.nama || data.desa?.kades || data.desa?.nama_kepala_desa || "IDRIS";
    const officialNip = data.pamong?.nip && data.pamong?.nip !== '-' ? data.pamong.nip : "";
    const pemohonName = data.penduduk?.nama || data.penduduk?.nama_lengkap || "PEMOHON";

    return (
      <>
        <div
          className="w-full flex flex-col"
          style={{ marginTop: `${marginTop}px` }}
        >
          <div 
            className="w-full flex"
            style={{
              justifyContent,
              gap: gap !== "0" ? `${gap}px` : undefined
            }}
          >
            {/* Left Signature: Pemegang Surat */}
            {showLeftSignature && (
              <div className="w-64" style={{ textAlign: textAlign as any }}>
                <div className="h-4"></div>
                <div style={{ fontSize: `${fontSize}px` }}>{leftTitle || "Pemegang Surat"}</div>
                <div className="h-20"></div>
                <div style={{ fontSize: `${fontSize}px`, fontWeight: "bold", textTransform: "uppercase", textDecoration: "underline" }}>
                  {pemohonName}
                </div>
              </div>
            )}

            {/* Right Signature: Kades/Pamong */}
            <div className="w-64" style={{ textAlign: textAlign as any }}>
              <div style={{ fontSize: `${fontSize}px` }}>{placeDateFormatted}</div>
              <div style={{ fontSize: `${fontSize}px`, textTransform: "capitalize" }}>{jabatan}</div>
              
              {/* QR Code or Space */}
              {shouldShowQrCode && !isManual ? (
                <div className={`h-20 flex items-center ${textAlign === 'left' ? 'justify-start' : textAlign === 'right' ? 'justify-end' : 'justify-center'} my-1`}>
                  {qrSrc ? (
                    <img src={qrSrc} alt="QR Code" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="h-16"></div>
                  )}
                </div>
              ) : (
                <div className="h-20"></div>
              )}

              <div style={{ fontSize: `${fontSize}px`, fontWeight: "bold", textTransform: "uppercase", textDecoration: "underline" }}>
                {officialName}
              </div>
              <div className="h-1"></div>
              
              {/* Line for NIP */}
              {showNip && officialNip && (
                <div className="nip-container">
                  <div className={`flex ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'} gap-1 mt-1`}>
                    <span style={{ fontSize: `${fontSize}px` }}>NIP:</span>
                    <span style={{ fontSize: `${fontSize}px` }}>{officialNip}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portal to Footer Area */}
        {domReady && isManual && shouldShowQrCode && document.getElementById('footer-area-portal') && 
          createPortal(footerContent, document.getElementById('footer-area-portal')!)
        }
      </>
    );
  }

  return (
    <>
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full flex flex-col transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:bg-gray-50"}`}
      style={{
          marginTop: `${marginTop}px`,
      }}
    >
      <div 
        className="w-full flex"
        style={{
            justifyContent,
            gap: gap !== "0" ? `${gap}px` : undefined
        }}
      >
      {/* Left Signature: Pemegang Surat */}
      {showLeftSignature && (
          <div className="w-64" style={{ textAlign: textAlign as any }}>
             <div className="h-4"></div> {/* Spacer for date alignment */}
             <Element id="sig_left_title" is={Text} text={leftTitle} fontSize={fontSize} textAlign={textAlign} />
             <div className="h-20"></div>
             <Element id="sig_left_name" is={Variable} name={leftName} fontSize={fontSize} fontWeight="bold" textTransform="uppercase" textDecoration="underline" />
          </div>
      )}

      {/* Right Signature: Kades/Pamong */}
      <div className="w-64" style={{ textAlign: textAlign as any }}>
        <Element id="sig_place" is={Text} text={placeDate} fontSize={fontSize} textAlign="left" textTransform="capitalize" />
        <Element id="sig_jabatan" is={Text} text={rightTitle} fontSize={fontSize} textAlign="left" textTransform="capitalize" />
        
        {/* QR Code or Space */}
        {shouldShowQrCode && !isManual ? (
            <div className={`h-20 flex items-center ${textAlign === 'left' ? 'justify-start' : textAlign === 'right' ? 'justify-end' : 'justify-center'} my-1`}>
                {qrSrc ? (
                    <img src={qrSrc} alt="QR Code" className="w-16 h-16 object-contain" />
                ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                        <QrCode className="w-6 h-6" />
                        <span className="text-[8px] mt-1">QR CODE</span>
                    </div>
                )}
            </div>
        ) : (
            <div className="h-20"></div>
        )}

        <Element id="sig_nama" is={Variable} name={rightName} fontSize={fontSize} fontWeight="bold" textTransform="uppercase" textDecoration="underline" />
        <div className="h-1"></div>
        
        {/* Line for NIP */}
        {showNip && (
            <div className="nip-container">
                <div className={`w-full flex ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <div className="border-t border-black w-3/4"></div>
                </div>
                <div className={`flex ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'} gap-1 mt-1`}>
                    <span style={{ fontSize: `${fontSize}px`, fontFamily: 'inherit' }}>NIP:</span>
                    <Element id="sig_nip" is={Variable} name={rightNip} fontSize={fontSize} />
                </div>
            </div>
        )}
      </div>
    </div>
    </div>

    {/* Portal to Footer Area */}
    {domReady && isManual && shouldShowQrCode && document.getElementById('footer-area-portal') && 
        createPortal(footerContent, document.getElementById('footer-area-portal')!)
    }
    </>
  );
};

export const SignatureSettings = () => {
    const { actions: { setProp }, showNip, showLeftSignature, showQrCode, marginTop, gap, leftTitle, leftName, rightTitle, rightName, rightNip, placeDate, fontSize, textAlign } = useNode((node) => ({
      showNip: node.data.props.showNip,
      showLeftSignature: node.data.props.showLeftSignature,
      showQrCode: node.data.props.showQrCode,
      marginTop: node.data.props.marginTop,
      gap: node.data.props.gap,
      leftTitle: node.data.props.leftTitle,
      leftName: node.data.props.leftName,
      rightTitle: node.data.props.rightTitle,
      rightName: node.data.props.rightName,
      rightNip: node.data.props.rightNip,
      placeDate: node.data.props.placeDate,
      fontSize: node.data.props.fontSize,
      textAlign: node.data.props.textAlign,
    }));
  
    return (
      <div className="space-y-4">
        {/* Content Settings */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <PenTool className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700">Content</h4>
            </div>

            <div className="space-y-2 border-b border-gray-100 pb-3 mb-3">
                 <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        checked={showLeftSignature !== false} 
                        onChange={(e) => setProp((props: any) => (props.showLeftSignature = e.target.checked))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-xs font-medium text-gray-700">Tampilkan Pemegang Surat (Kiri)</label>
                </div>
                 {showLeftSignature !== false && (
                    <div className="pl-6 space-y-2">
                         <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Judul (Kiri)</label>
                            <input 
                                type="text" 
                                value={leftTitle || ""} 
                                onChange={(e) => setProp((props: any) => (props.leftTitle = e.target.value))}
                                className="w-full px-2 py-1 text-xs border rounded"
                            />
                        </div>
                    </div>
                 )}
            </div>

             <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Tempat & Tanggal</label>
                <input 
                    type="text" 
                    value={placeDate || ""} 
                    onChange={(e) => setProp((props: any) => (props.placeDate = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Judul Kanan (Jabatan)</label>
                <input 
                    type="text" 
                    value={rightTitle || ""} 
                    onChange={(e) => setProp((props: any) => (props.rightTitle = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>

            <div className="flex items-center gap-2 pt-1">
                <input 
                    type="checkbox" 
                    checked={showNip} 
                    onChange={(e) => setProp((props: any) => (props.showNip = e.target.checked))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-xs font-medium text-gray-500">Tampilkan NIP</label>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
                <input 
                    type="checkbox" 
                    checked={showQrCode} 
                    onChange={(e) => setProp((props: any) => (props.showQrCode = e.target.checked))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-xs font-medium text-gray-500">Gunakan QR Code (Tanda Tangan Elektronik)</label>
            </div>
        </div>

        {/* Layout Settings */}
        <div className="space-y-3">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Layout className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700">Layout</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Margin Top</label>
                    <input 
                        type="number" 
                        value={marginTop || "32"} 
                        onChange={(e) => setProp((props: any) => (props.marginTop = e.target.value))}
                        className="w-full px-2 py-1 text-xs border rounded"
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Gap (0=Auto)</label>
                    <input 
                        type="number" 
                        value={gap || "0"} 
                        onChange={(e) => setProp((props: any) => (props.gap = e.target.value))}
                        className="w-full px-2 py-1 text-xs border rounded"
                    />
                </div>
            </div>
        </div>

        {/* Typography Settings */}
        <div className="space-y-3">
             <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Type className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-700">Typography</h4>
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

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Alignment</label>
                 <select
                    value={textAlign || "center"}
                    onChange={(e) => setProp((props: any) => (props.textAlign = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
        </div>
      </div>
    );
};

Signature.craft = {
  displayName: "Tanda Tangan (2 Kolom)",
  props: {
    showNip: true,
    showLeftSignature: true,
    showQrCode: false,
    marginTop: "32",
    gap: "0",
    leftTitle: "Pemegang Surat",
    leftName: "penduduk.nama",
    rightTitle: "[penandatangan]",
    rightName: "pamong.nama",
    rightNip: "pamong.nip",
    placeDate: "[nama_des], [tgl_surat]",
    fontSize: "12",
    textAlign: "left"
  },
  related: {
    settings: SignatureSettings
  }
};
