import { useNode } from "@craftjs/core";
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Layout, Move, Palette, Box, Layers, Maximize, CreditCard
} from "lucide-react";

export const Container = ({ 
  children, 
  padding = "20", 
  background = "#ffffff",
  flexDirection = "column",
  justifyContent = "flex-start",
  alignItems = "stretch",
  gap = "0",
  overflow = "visible",
  width = "100%",
  height = "auto",
  minWidth = "0",
  minHeight = "0",
  maxWidth = "none",
  maxHeight = "none",
  opacity = "1",
  marginTop = "0",
  marginBottom = "0",
  marginLeft = "0",
  marginRight = "0",
  paddingTop = "0",
  paddingBottom = "0",
  paddingLeft = "0",
  paddingRight = "0",
  borderRadius = "0",
  borderWidth = "0",
  borderColor = "#e5e7eb",
  borderStyle = "solid",
  shadow = "none"
}: any) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`min-h-[50px] transition-all relative ${selected ? "border border-blue-500 border-dashed" : "border border-transparent hover:border-blue-400/30 border-dashed"}`}
      style={{ 
        background,
        display: "flex",
        flexDirection: flexDirection as any,
        justifyContent: justifyContent as any,
        alignItems: alignItems as any,
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        opacity,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        borderRadius: `${borderRadius}px`,
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderStyle,
        boxShadow: shadow === "none" ? "none" : shadow
      }}
    >
      {children}
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

export const ContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const handlePropChange = (key: string, value: any) => {
    setProp((props: any) => (props[key] = value));
  };

  return (
    <div className="flex flex-col gap-1">
      <SettingsSection title="Layout" icon={Layout}>
         {/* Direction */}
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Direction</label>
            <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
               <button onClick={() => handlePropChange("flexDirection", "column")} className={`flex-1 text-xs py-1.5 rounded ${props.flexDirection === "column" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}>Column</button>
               <button onClick={() => handlePropChange("flexDirection", "row")} className={`flex-1 text-xs py-1.5 rounded ${props.flexDirection === "row" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}>Row</button>
            </div>
         </div>
         
         {/* Justify Content */}
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Justify</label>
            <select value={props.justifyContent} onChange={(e) => handlePropChange("justifyContent", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white">
               <option value="flex-start">Start</option>
               <option value="center">Center</option>
               <option value="flex-end">End</option>
               <option value="space-between">Space Between</option>
               <option value="space-around">Space Around</option>
            </select>
         </div>

         {/* Align Items */}
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Align</label>
            <select value={props.alignItems} onChange={(e) => handlePropChange("alignItems", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white">
               <option value="flex-start">Start</option>
               <option value="center">Center</option>
               <option value="flex-end">End</option>
               <option value="stretch">Stretch</option>
            </select>
         </div>

         {/* Gap */}
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Gap</label>
            <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
               <input
                type="number"
                value={props.gap || 0}
                onChange={(e) => handlePropChange("gap", e.target.value)}
                className="w-full px-2 py-1.5 text-xs outline-none"
              />
              <span className="text-[10px] text-zinc-400 pr-2">px</span>
            </div>
         </div>

         {/* Overflow */}
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Overflow</label>
            <select value={props.overflow || "visible"} onChange={(e) => handlePropChange("overflow", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white">
               <option value="visible">Visible</option>
               <option value="hidden">Hidden</option>
               <option value="scroll">Scroll</option>
               <option value="auto">Auto</option>
            </select>
         </div>

         {/* Width & Height */}
         <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
               <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Width</label>
               <input type="text" value={props.width} onChange={(e) => handlePropChange("width", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md" />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Height</label>
               <input type="text" value={props.height} onChange={(e) => handlePropChange("height", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md" />
            </div>
         </div>
      </SettingsSection>

      <SettingsSection title="Spacing" icon={Move}>
         {/* Padding */}
         <div className="space-y-2 mb-3">
             <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-2">
                <Box className="w-3 h-3" /> Padding
             </label>
             <div className="grid grid-cols-2 gap-2">
                <input placeholder="Top" type="number" value={props.paddingTop} onChange={(e) => handlePropChange("paddingTop", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Right" type="number" value={props.paddingRight} onChange={(e) => handlePropChange("paddingRight", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Bottom" type="number" value={props.paddingBottom} onChange={(e) => handlePropChange("paddingBottom", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Left" type="number" value={props.paddingLeft} onChange={(e) => handlePropChange("paddingLeft", e.target.value)} className="px-2 py-1 text-xs border rounded" />
             </div>
         </div>

         {/* Margin */}
         <div className="space-y-2">
             <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-2">
                <Maximize className="w-3 h-3" /> Margin
             </label>
             <div className="grid grid-cols-2 gap-2">
                <input placeholder="Top" type="number" value={props.marginTop} onChange={(e) => handlePropChange("marginTop", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Right" type="number" value={props.marginRight} onChange={(e) => handlePropChange("marginRight", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Bottom" type="number" value={props.marginBottom} onChange={(e) => handlePropChange("marginBottom", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Left" type="number" value={props.marginLeft} onChange={(e) => handlePropChange("marginLeft", e.target.value)} className="px-2 py-1 text-xs border rounded" />
             </div>
         </div>
      </SettingsSection>

      <SettingsSection title="Appearance" icon={Palette}>
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Background</label>
            <div className="flex items-center gap-2">
               <input type="color" value={props.background} onChange={(e) => handlePropChange("background", e.target.value)} className="w-8 h-8 rounded border border-zinc-200 cursor-pointer p-0.5 bg-white" />
               <input type="text" value={props.background} onChange={(e) => handlePropChange("background", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md uppercase" />
            </div>
         </div>

         {/* Opacity */}
         <div className="space-y-1 mt-3">
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
         
         <div className="grid grid-cols-2 gap-2 mt-3">
             <div className="space-y-1">
               <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Radius</label>
               <input type="number" value={props.borderRadius} onChange={(e) => handlePropChange("borderRadius", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md" />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Border Width</label>
               <input type="number" value={props.borderWidth} onChange={(e) => handlePropChange("borderWidth", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md" />
            </div>
         </div>

         <div className="space-y-1 mt-3">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Border Color</label>
            <div className="flex items-center gap-2">
               <input type="color" value={props.borderColor} onChange={(e) => handlePropChange("borderColor", e.target.value)} className="w-8 h-8 rounded border border-zinc-200 cursor-pointer p-0.5 bg-white" />
               <input type="text" value={props.borderColor} onChange={(e) => handlePropChange("borderColor", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md uppercase" />
            </div>
         </div>

         <div className="space-y-1 mt-3">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Shadow</label>
            <select value={props.shadow} onChange={(e) => handlePropChange("shadow", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white">
               <option value="none">None</option>
               <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Small</option>
               <option value="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)">Normal</option>
               <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Medium</option>
               <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Large</option>
            </select>
         </div>
      </SettingsSection>
    </div>
  );
};

Container.craft = {
  props: {
    padding: "0",
    background: "#ffffff",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: "0",
    overflow: "visible",
    width: "100%",
    height: "auto",
    minWidth: "0",
    minHeight: "0",
    maxWidth: "none",
    maxHeight: "none",
    opacity: "1",
    marginTop: "0",
    marginBottom: "0",
    marginLeft: "0",
    marginRight: "0",
    paddingTop: "0",
    paddingBottom: "0",
    paddingLeft: "0",
    paddingRight: "0",
    borderRadius: "0",
    borderWidth: "0",
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    shadow: "none"
  },
  related: {
    settings: ContainerSettings,
  },
};
