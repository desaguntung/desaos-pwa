import { useNode, Element } from "@craftjs/core";
import { Text } from "./Text";
import { Variable } from "./Variable";
import { PenTool, Layout, Type } from "lucide-react";

export const Signature = ({ 
    showNip = true,
    marginTop = "32", // mt-8
    gap = "0", // justify-between default
    leftTitle = "Pemegang Surat",
    leftName = "penduduk.nama",
    rightTitle = "[penandatangan]",
    rightName = "pamong.nama",
    rightNip = "pamong.nip",
    placeDate = "[nama_des], [tgl_surat]",
    fontSize = "12",
    textAlign = "center"
}: { 
    showNip?: boolean;
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

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full flex transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:bg-gray-50"}`}
      style={{
          marginTop: `${marginTop}px`,
          justifyContent: gap === "0" ? "space-between" : "flex-start",
          gap: gap !== "0" ? `${gap}px` : undefined
      }}
    >
      {/* Left Signature: Pemegang Surat */}
      <div className="w-64" style={{ textAlign: textAlign as any }}>
         <div className="h-4"></div> {/* Spacer for date alignment */}
         <Element id="sig_left_title" is={Text} text={leftTitle} fontSize={fontSize} textAlign={textAlign} />
         <div className="h-20"></div>
         <Element id="sig_left_name" is={Variable} name={leftName} fontSize={fontSize} />
      </div>

      {/* Right Signature: Kades/Pamong */}
      <div className="w-64" style={{ textAlign: textAlign as any }}>
        <Element id="sig_place" is={Text} text={placeDate} fontSize={fontSize} textAlign={textAlign} />
        <Element id="sig_jabatan" is={Text} text={rightTitle} fontSize={fontSize} textAlign={textAlign} />
        <div className="h-20"></div>
        <Element id="sig_nama" is={Variable} name={rightName} fontSize={fontSize} />
        <div className="h-1"></div>
        
        {/* Line for NIP - Conditionally rendered based on prop, or handled by renderer logic if Variable is empty */}
        {showNip && (
            <div className="nip-container">
                <div className={`w-full flex ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <div className="border-t border-black w-3/4"></div>
                </div>
                <div className={`flex ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'} gap-1 mt-1`}>
                    <span style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-sans)' }}>NIP:</span>
                    <Element id="sig_nip" is={Variable} name={rightNip} fontSize={fontSize} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export const SignatureSettings = () => {
    const { actions: { setProp }, showNip, marginTop, gap, leftTitle, leftName, rightTitle, rightName, rightNip, placeDate, fontSize, textAlign } = useNode((node) => ({
      showNip: node.data.props.showNip,
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

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Left Title</label>
                <input 
                    type="text" 
                    value={leftTitle || ""} 
                    onChange={(e) => setProp((props: any) => (props.leftTitle = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>
            
             <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Place & Date</label>
                <input 
                    type="text" 
                    value={placeDate || ""} 
                    onChange={(e) => setProp((props: any) => (props.placeDate = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Right Title (Jabatan)</label>
                <input 
                    type="text" 
                    value={rightTitle || ""} 
                    onChange={(e) => setProp((props: any) => (props.rightTitle = e.target.value))}
                    className="w-full px-2 py-1 text-xs border rounded"
                />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input 
                    type="checkbox" 
                    checked={showNip} 
                    onChange={(e) => setProp((props: any) => (props.showNip = e.target.checked))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-xs font-medium text-gray-500">Tampilkan NIP</label>
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
    marginTop: "32",
    gap: "0",
    leftTitle: "Pemegang Surat",
    leftName: "penduduk.nama",
    rightTitle: "[penandatangan]",
    rightName: "pamong.nama",
    rightNip: "pamong.nip",
    placeDate: "[nama_des], [tgl_surat]",
    fontSize: "12",
    textAlign: "center"
  },
  related: {
    settings: SignatureSettings
  }
};
