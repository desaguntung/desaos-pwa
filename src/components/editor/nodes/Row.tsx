import { useNode } from "@craftjs/core";
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Layout, Move, Maximize
} from "lucide-react";

export const Row = ({ 
  children,
  gap = "0",
  alignItems = "flex-start",
  justifyContent = "flex-start",
  marginTop = "0",
  marginBottom = "0",
  paddingTop = "4",
  paddingBottom = "4"
}: any) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`flex flex-row w-full transition-all ${selected ? "border border-blue-500 border-dashed bg-blue-50/50" : "hover:bg-gray-50 border border-transparent"}`}
      style={{
        gap: `${gap}px`,
        alignItems,
        justifyContent,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`
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

export const RowSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const handlePropChange = (key: string, value: any) => {
    setProp((props: any) => (props[key] = value));
  };

  return (
    <div className="flex flex-col gap-1">
      <SettingsSection title="Layout" icon={Layout}>
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Gap</label>
            <input type="number" value={props.gap} onChange={(e) => handlePropChange("gap", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md" />
         </div>

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

         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Align Items</label>
            <select value={props.alignItems} onChange={(e) => handlePropChange("alignItems", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white">
               <option value="flex-start">Top</option>
               <option value="center">Center</option>
               <option value="flex-end">Bottom</option>
               <option value="stretch">Stretch</option>
            </select>
         </div>
      </SettingsSection>

      <SettingsSection title="Spacing" icon={Move}>
         <div className="space-y-2 mb-3">
             <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-2">
                Padding (Vertical)
             </label>
             <div className="grid grid-cols-2 gap-2">
                <input placeholder="Top" type="number" value={props.paddingTop} onChange={(e) => handlePropChange("paddingTop", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Bottom" type="number" value={props.paddingBottom} onChange={(e) => handlePropChange("paddingBottom", e.target.value)} className="px-2 py-1 text-xs border rounded" />
             </div>
         </div>
         <div className="space-y-2">
             <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-2">
                Margin (Vertical)
             </label>
             <div className="grid grid-cols-2 gap-2">
                <input placeholder="Top" type="number" value={props.marginTop} onChange={(e) => handlePropChange("marginTop", e.target.value)} className="px-2 py-1 text-xs border rounded" />
                <input placeholder="Bottom" type="number" value={props.marginBottom} onChange={(e) => handlePropChange("marginBottom", e.target.value)} className="px-2 py-1 text-xs border rounded" />
             </div>
         </div>
      </SettingsSection>
    </div>
  );
};

Row.craft = {
  props: {
    gap: "0",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: "0",
    marginBottom: "0",
    paddingTop: "4",
    paddingBottom: "4"
  },
  related: {
    settings: RowSettings,
  },
};
