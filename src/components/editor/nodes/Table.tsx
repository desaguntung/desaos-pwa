import { useNode, Element } from "@craftjs/core";
import { Text } from "@/components/editor/nodes/Text";
import { Grid3X3, Palette, Type, Layout } from "lucide-react";

export const Table = ({ 
  rows = 2, 
  cols = 3,
  borderWidth = "1",
  borderColor = "#000000",
  headerBgColor = "#f3f4f6", // gray-100
  headerTextColor = "#000000",
  cellPadding = "2",
  fontSize = "12",
  alternateRowColor = false
}: { 
  rows?: number; 
  cols?: number;
  borderWidth?: string;
  borderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  cellPadding?: string;
  fontSize?: string;
  alternateRowColor?: boolean;
}) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const cellStyle = {
    border: `${borderWidth}px solid ${borderColor}`,
    padding: `${cellPadding}px`,
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full my-4 transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:bg-gray-50"}`}
    >
      <table className="w-full border-collapse" style={{ border: `${borderWidth}px solid ${borderColor}` }}>
        <thead>
          <tr style={{ backgroundColor: headerBgColor }}>
            <th style={{ ...cellStyle, width: "48px" }}>
               <Element id="th_no" is={Text} text="No" fontSize={fontSize} bold={true} textAlign="center" color={headerTextColor} />
            </th>
            <th style={cellStyle}>
               <Element id="th_desc" is={Text} text="Keterangan" fontSize={fontSize} bold={true} textAlign="center" color={headerTextColor} />
            </th>
            <th style={{ ...cellStyle, width: "128px" }}>
               <Element id="th_val" is={Text} text="Jumlah" fontSize={fontSize} bold={true} textAlign="center" color={headerTextColor} />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className={alternateRowColor ? "bg-white" : ""}>
             <td style={cellStyle}>
                <Element id="td_1_1" is={Text} text="1" fontSize={fontSize} textAlign="center" />
             </td>
             <td style={cellStyle}>
                <Element id="td_1_2" is={Text} text="Contoh Item 1" fontSize={fontSize} textAlign="left" />
             </td>
             <td style={cellStyle}>
                <Element id="td_1_3" is={Text} text="-" fontSize={fontSize} textAlign="center" />
             </td>
          </tr>
          <tr className={alternateRowColor ? "bg-gray-50" : ""}>
             <td style={cellStyle}>
                <Element id="td_2_1" is={Text} text="2" fontSize={fontSize} textAlign="center" />
             </td>
             <td style={cellStyle}>
                <Element id="td_2_2" is={Text} text="Contoh Item 2" fontSize={fontSize} textAlign="left" />
             </td>
             <td style={cellStyle}>
                <Element id="td_2_3" is={Text} text="-" fontSize={fontSize} textAlign="center" />
             </td>
          </tr>
        </tbody>
      </table>
      <div className="text-[10px] text-gray-400 text-center mt-1 italic">
        * Tabel ini statis untuk template. Untuk data dinamis, gunakan fitur Lampiran.
      </div>
    </div>
  );
};

export const TableSettings = () => {
  const { actions: { setProp }, borderWidth, borderColor, headerBgColor, headerTextColor, cellPadding, fontSize, alternateRowColor } = useNode((node) => ({
    borderWidth: node.data.props.borderWidth,
    borderColor: node.data.props.borderColor,
    headerBgColor: node.data.props.headerBgColor,
    headerTextColor: node.data.props.headerTextColor,
    cellPadding: node.data.props.cellPadding,
    fontSize: node.data.props.fontSize,
    alternateRowColor: node.data.props.alternateRowColor,
  }));

  return (
    <div className="space-y-4">
       {/* Appearance Settings */}
       <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Palette className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Colors & Style</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Header Bg</label>
            <input
              type="color"
              value={headerBgColor || "#f3f4f6"}
              onChange={(e) => setProp((props: any) => (props.headerBgColor = e.target.value))}
              className="w-full h-6 p-0 border rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Border Color</label>
            <input
              type="color"
              value={borderColor || "#000000"}
              onChange={(e) => setProp((props: any) => (props.borderColor = e.target.value))}
              className="w-full h-6 p-0 border rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="alt-row-check"
            checked={alternateRowColor || false}
            onChange={(e) => setProp((props: any) => (props.alternateRowColor = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="alt-row-check" className="text-xs text-gray-700">Alternate Row Color</label>
        </div>
      </div>

      {/* Typography & Layout */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Layout className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Layout & Text</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Border Width</label>
            <input
              type="number"
              value={borderWidth || "1"}
              onChange={(e) => setProp((props: any) => (props.borderWidth = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Cell Padding</label>
            <input
              type="number"
              value={cellPadding || "2"}
              onChange={(e) => setProp((props: any) => (props.cellPadding = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
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
      </div>
    </div>
  );
};

Table.craft = {
  displayName: "Tabel Sederhana",
  props: {
    rows: 2,
    cols: 3,
    borderWidth: "1",
    borderColor: "#000000",
    headerBgColor: "#f3f4f6",
    headerTextColor: "#000000",
    cellPadding: "2",
    fontSize: "12",
    alternateRowColor: false
  },
  related: {
    settings: TableSettings,
  }
};
