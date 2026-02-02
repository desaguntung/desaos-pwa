import { useNode } from "@craftjs/core";
import { PenLine, Palette, Layout, Type } from "lucide-react";
import { useSuratContext } from "@/lib/contexts/SuratContext";

export const Input = ({ 
  label = "Input Field", 
  placeholder = "", 
  inputType = "text", 
  required = false,
  width = "auto",
  fontSize = "12",
  padding = "4",
  margin = "4",
  borderColor = "#e5e7eb", // gray-200
  borderWidth = "1",
  borderRadius = "4",
  backgroundColor = "#f9fafb" // gray-50
}: { 
  label?: string, 
  placeholder?: string, 
  inputType?: string, 
  required?: boolean,
  width?: string,
  fontSize?: string,
  padding?: string,
  margin?: string,
  borderColor?: string,
  borderWidth?: string,
  borderRadius?: string,
  backgroundColor?: string
}) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { mode, data } = useSuratContext();

  if (mode === 'preview') {
      // In DataRow, label prop is used as variable key
      const value = data.form_data?.[label || ""];
      return (
        <span style={{ fontSize: `${fontSize}px`, color: "#000000", fontFamily: 'Arial, sans-serif' }}>
          {value || "-"}
        </span>
      );
  }

  return (
    <span
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`inline-flex items-center gap-2 select-none transition-all
        ${selected 
          ? "ring-2 ring-amber-500/20" 
          : "hover:bg-gray-100"
        }`}
      style={{
        width: width === "auto" ? "auto" : `${width}px`,
        fontSize: `${fontSize}px`,
        padding: `${padding}px`,
        margin: `${margin}px`,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        minWidth: "100px"
      }}
    >
      <PenLine className="w-3 h-3 opacity-50" />
      <span className="font-medium">{label || "Input Field"}</span>
      {required && <span className="text-red-500">*</span>}
    </span>
  );
};

export const InputSettings = () => {
  const { actions: { setProp }, label, placeholder, inputType, required, width, fontSize, padding, margin, borderColor, borderWidth, borderRadius, backgroundColor } = useNode((node) => ({
    label: node.data.props.label,
    placeholder: node.data.props.placeholder,
    inputType: node.data.props.inputType,
    required: node.data.props.required,
    width: node.data.props.width,
    fontSize: node.data.props.fontSize,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    borderColor: node.data.props.borderColor,
    borderWidth: node.data.props.borderWidth,
    borderRadius: node.data.props.borderRadius,
    backgroundColor: node.data.props.backgroundColor,
  }));

  return (
    <div className="space-y-4">
      {/* General Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Type className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Content</h4>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Label</label>
          <input
            type="text"
            value={label || ""}
            onChange={(e) => setProp((props: any) => (props.label = e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="e.g. Keperluan"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Placeholder</label>
          <input
            type="text"
            value={placeholder || ""}
            onChange={(e) => setProp((props: any) => (props.placeholder = e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
            placeholder="e.g. Masukkan keperluan..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Input Type</label>
          <select
            value={inputType || "text"}
            onChange={(e) => setProp((props: any) => (props.inputType = e.target.value))}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="text">Short Text</option>
            <option value="textarea">Long Text (Textarea)</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="required-check"
            checked={required || false}
            onChange={(e) => setProp((props: any) => (props.required = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="required-check" className="text-xs text-gray-700">Required Field</label>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Palette className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Appearance</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Bg Color</label>
            <input
              type="color"
              value={backgroundColor || "#f9fafb"}
              onChange={(e) => setProp((props: any) => (props.backgroundColor = e.target.value))}
              className="w-full h-6 p-0 border rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Border Color</label>
            <input
              type="color"
              value={borderColor || "#e5e7eb"}
              onChange={(e) => setProp((props: any) => (props.borderColor = e.target.value))}
              className="w-full h-6 p-0 border rounded cursor-pointer"
            />
          </div>
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
            <label className="text-xs font-medium text-gray-500">Radius</label>
            <input
              type="number"
              value={borderRadius || "4"}
              onChange={(e) => setProp((props: any) => (props.borderRadius = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Layout className="w-4 h-4 text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-700">Layout</h4>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Width</label>
           <div className="flex gap-2">
            <input
              type="text"
              value={width || "auto"}
              onChange={(e) => setProp((props: any) => (props.width = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
              placeholder="e.g. 100 or auto"
            />
             <span className="text-xs py-1 text-gray-400">px</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Padding</label>
            <input
              type="number"
              value={padding || "4"}
              onChange={(e) => setProp((props: any) => (props.padding = e.target.value))}
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Margin</label>
            <input
              type="number"
              value={margin || "4"}
              onChange={(e) => setProp((props: any) => (props.margin = e.target.value))}
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
      
      <p className="text-[10px] text-gray-400 mt-2">
        This field will appear as an input form when creating the letter.
      </p>
    </div>
  );
};

Input.displayName = "Input";

Input.craft = {
  props: {
    label: "Input Field",
    placeholder: "",
    inputType: "text",
    required: false,
    width: "auto",
    fontSize: "12",
    padding: "4",
    margin: "4",
    borderColor: "#e5e7eb",
    borderWidth: "1",
    borderRadius: "4",
    backgroundColor: "#f9fafb"
  },
  related: {
    settings: InputSettings,
  },
};
