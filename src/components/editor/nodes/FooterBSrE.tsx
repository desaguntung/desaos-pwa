import { useNode } from "@craftjs/core";
import { ShieldCheck } from "lucide-react";
import { useContext } from "react";
import { SuratContext } from "@/lib/contexts/SuratContext";

export const FooterBSrE = () => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));
  
  const context = useContext(SuratContext);
  const data = context?.data || {};
  const signature = data.signature || data.form_data?.signature;

  // Hide if manual signature
  if (signature?.type === 'manual') {
      return (
        <div 
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className="hidden print:hidden"
        />
      );
  }
  
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50" : ""}`}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "8px 0",
        cursor: "move",
        gap: "12px"
      }}
    >
        {/* Logo BSrE */}
        <img 
            src="/bsre-logo.png" 
            alt="BSrE" 
            style={{ 
                width: "48px", 
                height: "auto", 
                objectFit: "contain",
                flexShrink: 0
            }} 
        />

        {/* Vertical Divider for Official Look */}
        <div style={{ width: "1.5px", alignSelf: "stretch", backgroundColor: "#3f3f46", opacity: 0.2 }}></div>

        {/* Text */}
        <div className="flex-1 flex flex-col justify-center gap-[2px]">
            <p 
                className="text-[9px] text-zinc-900 text-left m-0 p-0 leading-tight font-medium"
                style={{ 
                    fontFamily: 'Arial, sans-serif',
                    width: "100%"
                }}
            >
                UU ITE No. 11 Tahun 2008 Pasal 5 Ayat 1
            </p>
            <p 
                className="text-[9px] text-zinc-900 text-left m-0 p-0 leading-tight font-medium"
                style={{ 
                    fontFamily: 'Arial, sans-serif',
                    width: "100%"
                }}
            >
                "Informasi Elektronik dan/atau Dokumen Elektronik dan/atau hasil cetaknya merupakan alat bukti hukum yang sah"
            </p>
            <p 
                className="text-[9px] text-zinc-600 text-left m-0 p-0 leading-tight"
                style={{ 
                    fontFamily: 'Arial, sans-serif',
                    width: "100%"
                }}
            >
                Dokumen ini ditandatangani secara elektronik menggunakan <strong>Sertifikat Elektronik</strong> yang diterbitkan oleh <strong>Balai Sertifikasi Elektronik (BSrE) BSSN</strong>.
            </p>
        </div>
    </div>
  );
};

FooterBSrE.craft = {
  displayName: "Footer BSrE",
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Cannot accept children
  },
  related: {
    settings: () => (
        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-500 text-center">
            Widget ini hanya dapat diletakkan di area footer (kotak putus-putus di bawah halaman).
        </div>
    )
  }
};
