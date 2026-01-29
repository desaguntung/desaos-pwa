import { useNode, Element, useEditor } from "@craftjs/core";
import { Text } from "./Text";
import { Variable } from "./Variable";
import { Input } from "./Input";
import { Type, LayoutTemplate, AlignLeft, Hash } from "lucide-react";

export const DataRow = ({ 
  label = "Label", 
  variable = "variable", 
  useInput = false,
  inputPlaceholder = "Masukkan data...",
  fontSize = "12",
  labelWidth = "192", // 48 * 4 = 192px (w-48)
  gap = "16", // w-4
  paddingY = "2",
  marginBottom = "0"
}: { 
  label?: string; 
  variable?: string; 
  useInput?: boolean;
  inputPlaceholder?: string;
  fontSize?: string;
  labelWidth?: string;
  gap?: string;
  paddingY?: string;
  marginBottom?: string;
}) => {
  const { connectors: { connect, drag }, selected, id, parent } = useNode((state) => ({
    selected: state.events.selected,
    parent: state.data.parent
  }));
  
  // Subscribe to parent's children to trigger re-render when siblings change
  const { query } = useEditor();

  // Calculate dynamic number based on index among DataRow siblings
  const parentNode = parent ? query.node(parent).get() : null;
  
  let rowNumber = "";
  if (parentNode) {
      const siblings = parentNode.data.nodes;
      const dataRowSiblings = siblings.filter(siblingId => {
          const node = query.node(siblingId).get();
          return node.data.displayName === "Data Row (No. Label : Val)" || node.data.name === "DataRow";
      });
      const index = dataRowSiblings.indexOf(id);
      if (index !== -1) {
          rowNumber = `${index + 1}.`;
      }
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`flex flex-row items-start w-full transition-all ${selected ? "bg-blue-50" : "hover:bg-gray-50"}`}
      style={{ 
        paddingTop: `${paddingY}px`, 
        paddingBottom: `${paddingY}px`,
        marginBottom: `${marginBottom}px`
      }}
    >
       {/* Numbering Column - Auto-calculated */}
       <div className="w-8 pt-0.5 text-right pr-1">
          <span style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-sans)' }} className="leading-relaxed">{rowNumber}</span>
       </div>
       
       <div style={{ width: `${gap}px` }}></div> {/* Spacer */}

       {/* Label Column */}
       <div style={{ width: `${labelWidth}px` }} className="pt-0.5">
          <Element id="row_label" is={Text} text={label} fontSize={fontSize} textAlign="left" />
       </div>

       {/* Separator */}
       <div className="w-4 pt-0.5">
          <Text text=":" fontSize={fontSize} textAlign="center" />
       </div>

       <div className="w-2"></div>

       {/* Value Column */}
       <div className="flex-1 pt-0.5">
          {useInput ? (
            <Element id="row_input" is={Input} label={variable} placeholder={inputPlaceholder} />
          ) : (
            <Element id="row_val" is={Variable} name={variable} />
          )}
       </div>
    </div>
  );
};

export const DataRowSettings = () => {
  const { actions: { setProp }, label, variable, useInput, inputPlaceholder, fontSize, labelWidth, gap, paddingY, marginBottom } = useNode((node) => ({
    label: node.data.props.label,
    variable: node.data.props.variable,
    useInput: node.data.props.useInput,
    inputPlaceholder: node.data.props.inputPlaceholder,
    fontSize: node.data.props.fontSize,
    labelWidth: node.data.props.labelWidth,
    gap: node.data.props.gap,
    paddingY: node.data.props.paddingY,
    marginBottom: node.data.props.marginBottom,
  }));

  return (
    <div className="space-y-4">
      {/* Data Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Hash className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Data Binding</h4>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Label Text</label>
          <input
            type="text"
            value={label || ""}
            onChange={(e) => setProp((props: any) => (props.label = e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Variable / Input Name</label>
          <input
            type="text"
            value={variable || ""}
            onChange={(e) => setProp((props: any) => (props.variable = e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        </div>

        <div className="flex items-center gap-2 pt-1 bg-gray-50 p-2 rounded border border-gray-100">
          <input
            type="checkbox"
            id="use-input-check"
            checked={useInput || false}
            onChange={(e) => setProp((props: any) => (props.useInput = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="use-input-check" className="text-xs text-gray-700 font-medium">Use Input Field</label>
        </div>

        {useInput && (
          <div className="space-y-1 pl-6">
            <label className="text-xs font-medium text-gray-500">Placeholder</label>
            <input
              type="text"
              value={inputPlaceholder || ""}
              onChange={(e) => setProp((props: any) => (props.inputPlaceholder = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
        )}
      </div>

      {/* Typography Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Type className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Typography</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Font Size (px)</label>
            <input
              type="number"
              value={fontSize || "12"}
              onChange={(e) => setProp((props: any) => (props.fontSize = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
        </div>
      </div>

      {/* Layout Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <LayoutTemplate className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Layout & Spacing</h4>
        </div>
        
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Label Width (px)</label>
            <input
              type="range"
              min="50"
              max="400"
              value={labelWidth || "192"}
              onChange={(e) => setProp((props: any) => (props.labelWidth = e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="text-[10px] text-right text-gray-400">{labelWidth}px</div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Gap after Number (px)</label>
            <input
              type="number"
              value={gap || "16"}
              onChange={(e) => setProp((props: any) => (props.gap = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Padding Y</label>
              <input
                type="number"
                value={paddingY || "2"}
                onChange={(e) => setProp((props: any) => (props.paddingY = e.target.value))}
                className="w-full px-2 py-1 text-xs border rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Margin Bottom</label>
              <input
                type="number"
                value={marginBottom || "0"}
                onChange={(e) => setProp((props: any) => (props.marginBottom = e.target.value))}
                className="w-full px-2 py-1 text-xs border rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DataRow.craft = {
  displayName: "Data Row (No. Label : Val)",
  props: {
    label: "Nama Label",
    variable: "nama_variable",
    useInput: false,
    inputPlaceholder: "Masukkan data...",
    fontSize: "12",
    labelWidth: "192",
    gap: "16",
    paddingY: "2",
    marginBottom: "0"
  },
  related: {
    settings: DataRowSettings,
  }
};
