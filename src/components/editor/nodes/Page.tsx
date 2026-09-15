import { useNode, Element, useEditor } from "@craftjs/core";
import { Plus, Trash2, FileText, Maximize, Image as ImageIcon, Layers, Settings, Ruler } from "lucide-react";
import { FooterArea } from "@/components/editor/nodes/FooterArea";
import { FooterBSrE } from "@/components/editor/nodes/FooterBSrE";

interface PageProps {
  children?: React.ReactNode;
  size?: "A4" | "F4";
  orientation?: "portrait" | "landscape";
  padding?: string; // Deprecated but kept for backward compatibility logic
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginUnit?: "mm" | "cm" | "in" | "px";
  watermarkType?: "none" | "text" | "image";
  watermarkText?: string;
  watermarkImage?: string;
  watermarkOpacity?: number;
  watermarkColor?: string;
  watermarkFontSize?: number;
  watermarkPattern?: "diagonal" | "horizontal";
  watermarkIsWave?: boolean;
  watermarkGapX?: number;
  watermarkGapY?: number;
  watermarkLetterSpacing?: number;
  watermarkFontFamily?: string;
  watermarkGridType?: "grid" | "zigzag";
}

export const Page = ({ 
  children, 
  size = "A4", 
  orientation = "portrait", 
  padding = "40",
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  marginUnit = "cm",
  watermarkType = "none",
  watermarkText = "DRAFT",
  watermarkImage = "",
  watermarkOpacity = 0.1,
  watermarkColor = "#6b7280",
  watermarkFontSize = 24,
  watermarkPattern = "diagonal",
  watermarkIsWave = false,
  watermarkGapX = 40,
  watermarkGapY = 40,
  watermarkLetterSpacing = 0,
  watermarkFontFamily = "Arial, sans-serif",
  watermarkGridType = "grid"
}: PageProps) => {
  const { connectors: { connect, drag }, selected, id, parent } = useNode((state) => ({
    selected: state.events.selected,
    parent: state.data.parent
  }));
  const { actions: { add, delete: deleteNode }, query, enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  // Safe values to prevent NaN issues
  const safeGapX = isNaN(Number(watermarkGapX)) ? 40 : Number(watermarkGapX);
  const safeGapY = isNaN(Number(watermarkGapY)) ? 40 : Number(watermarkGapY);
  const safeFontSize = isNaN(Number(watermarkFontSize)) ? 24 : Number(watermarkFontSize);
  const safeOpacity = isNaN(Number(watermarkOpacity)) ? 0.1 : Number(watermarkOpacity);
  const safeLetterSpacing = isNaN(Number(watermarkLetterSpacing)) ? 0 : Number(watermarkLetterSpacing);

  // Default Margin Logic
  // If specific margins are not set, use default 2.54 cm (standard) or fallback to old padding behavior if needed.
  // Since we are migrating, we will default to 2.54 cm if values are undefined.
  // Note: 2.54 cm = 1 inch.
  const mt = paddingTop !== undefined ? paddingTop : 2.54;
  const mb = paddingBottom !== undefined ? paddingBottom : 2.54;
  const ml = paddingLeft !== undefined ? paddingLeft : 2.54;
  const mr = paddingRight !== undefined ? paddingRight : 2.54;

  // Dimensions in mm
  const dimensions = {
    A4: { width: "210mm", height: "297mm" },
    F4: { width: "215mm", height: "330mm" } // Approximate F4
  };

  // Wave Calculation Helper
  const calculateWavePath = () => {
     const textWidth = watermarkText.length * (safeFontSize * 0.6); // Slightly reduced multiplier for tighter fit
     const minWidth = textWidth + safeGapX;
     
     // Dynamic wave period based on text length to avoid large gaps
     // We try to find a period between 100 and 300 that fits the text + gap well
     let bestPeriod = 200;
     let minWaste = Infinity;
     
     for(let p = 150; p <= 300; p += 10) {
        const waste = (Math.ceil(minWidth / p) * p) - minWidth;
        if(waste < minWaste) {
           minWaste = waste;
           bestPeriod = p;
        }
     }
     
     const wavePeriod = bestPeriod;
     const numPeriods = Math.ceil(minWidth / wavePeriod);
     const finalPatternWidth = numPeriods * wavePeriod;
     
     let path = `M 0 ${safeGapY/2}`;
     for(let i=0; i<numPeriods; i++) {
        const startX = i * wavePeriod;
        path += ` Q ${startX + wavePeriod/4} ${safeGapY/2 - 20} ${startX + wavePeriod/2} ${safeGapY/2} T ${startX + wavePeriod} ${safeGapY/2}`;
     }
     
     return { path, width: finalPatternWidth, period: wavePeriod };
  };

  const waveData = calculateWavePath();

  const currentDim = dimensions[size] || dimensions.A4;
  const width = orientation === "portrait" ? currentDim.width : currentDim.height;
  const height = orientation === "portrait" ? currentDim.height : currentDim.width;

  const isDiagonalWave = watermarkPattern === "diagonal" && watermarkIsWave;

  const handleAddPage = (position: 'before' | 'after') => {
    if (!parent) return;
    const parentNode = query.node(parent).get();
    const index = parentNode.data.nodes.indexOf(id);
    const insertIndex = position === 'before' ? index : index + 1;
    
    const tree = query.parseReactElement(<Element is={Page} canvas />).toNodeTree();
    const node = tree.nodes[tree.rootNodeId];
    add(node, parent, insertIndex);
  };

  const handleDeletePage = () => {
    deleteNode(id);
  };

  return (
    <div className={`relative group/page-wrapper ${enabled ? 'mb-16' : 'mb-0'} mx-auto w-fit`}>
        {/* Top Controls - Only show when enabled (editing mode) */}
        {enabled && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center items-center gap-2 opacity-0 group-hover/page-wrapper:opacity-100 transition-opacity z-20">
             <button 
                onClick={() => handleAddPage('before')} 
                className="flex flex-col items-center group/btn"
             >
                <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform hover:bg-blue-600">
                   <Plus size={16} />
                </div>
                <span className="text-[10px] text-gray-600 bg-white px-2 py-0.5 rounded shadow-sm mt-1 opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap border">
                  Tambah Halaman Di Atas
                </span>
             </button>
        </div>
        )}

        <div
          ref={(ref) => { if (ref) connect(drag(ref)); }}
          className={`bg-white ${enabled ? 'shadow-2xl' : 'shadow-lg border border-slate-200/80'} transition-all relative font-surat ${selected ? "ring-2 ring-blue-500 ring-offset-4" : ""}`}
          style={{
            width: width,
            minHeight: height,
            paddingTop: `${mt}${marginUnit}`,
            paddingBottom: `${mb}${marginUnit}`,
            paddingLeft: `${ml}${marginUnit}`,
            paddingRight: `${mr}${marginUnit}`,
            position: "relative",
            overflow: "hidden" // To clip watermark
          }}
        >
          {/* Watermark Layer - Text */}
          {watermarkType === "text" && (
            <div 
              className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
            >
               <div 
                  className="flex flex-col items-center justify-center absolute left-1/2 top-1/2"
                  style={{
                    opacity: safeOpacity,
                    // Unified logic: Always use oversized container centered on pivot
                    width: "500%", 
                    height: "500%",
                    transform: `translate(-50%, -50%) ${watermarkPattern === "diagonal" ? "rotate(-45deg)" : "rotate(0deg)"}`,
                    gap: `${safeGapY / 2}px`, // Reduced gap for non-wave modes
                    transformOrigin: "center center"
                  }}
               >
                   {watermarkIsWave ? (
                      <svg width="100%" height="100%" style={{ overflow: "visible" }}>
                        <defs>
                          <path 
                            id={`wavepath-${id}`} 
                            d={waveData.path}
                            fill="none"
                          />
                          <pattern 
                            id={`wave-pattern-${id}`} 
                            x="0" 
                            y="0" 
                            width={waveData.width} 
                            height={safeGapY} 
                            patternUnits="userSpaceOnUse"
                          >
                            <text 
                              fill={watermarkColor} 
                              fontSize={safeFontSize} 
                              fontFamily={watermarkFontFamily}
                              letterSpacing={safeLetterSpacing}
                              dominantBaseline="middle"
                              style={{ userSelect: "none" }}
                            >
                              <textPath href={`#wavepath-${id}`} startOffset="50%" textAnchor="middle">
                                {watermarkText}
                              </textPath>
                            </text>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#wave-pattern-${id})`} />
                      </svg>
                   ) : (
                     /* Standard Grid/Flex Rendering */
                     Array.from({ length: 100 }).map((_, rowIndex) => (
                       <div 
                         key={rowIndex} 
                         className="flex justify-center w-full"
                         style={{
                           gap: `${safeGapX}px`,
                           marginLeft: watermarkGridType === "zigzag" && rowIndex % 2 === 1 ? `${safeGapX + 50}px` : "0px"
                         }}
                       >
                         {Array.from({ length: 50 }).map((_, colIndex) => (
                           <span 
                             key={`${rowIndex}-${colIndex}`} 
                             className="font-bold uppercase select-none whitespace-nowrap"
                             style={{
                               color: watermarkColor,
                               fontSize: `${safeFontSize}px`,
                               letterSpacing: `${safeLetterSpacing}em`,
                               fontFamily: watermarkFontFamily
                             }}
                           >
                             {watermarkText}
                           </span>
                         ))}
                       </div>
                   ))
                   )}
               </div>
            </div>
          )}

          {/* Watermark Layer - Image */}
          {watermarkType === "image" && watermarkImage && (
             <div 
               className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
               style={{ opacity: watermarkOpacity }}
             >
                 <img src={watermarkImage} className="w-3/4 h-auto object-contain grayscale" alt="watermark" />
             </div>
          )}

          {/* Content Layer */}
          <div className="relative h-full">
             {children}
          </div>

          {/* Footer Area - Persistent */}
          <Element id="page_footer" is={FooterArea} canvas />
        </div>

        {/* Bottom Controls */}
        {enabled && (
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center items-center opacity-0 group-hover/page-wrapper:opacity-100 transition-opacity z-20 hover:opacity-100">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-zinc-200 p-1.5 rounded-full shadow-sm transform hover:scale-105 transition-transform">
                <button 
                    onClick={() => handleAddPage('after')} 
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors text-[10px] font-medium"
                >
                    <Plus size={14} />
                    <span>Tambah Halaman</span>
                </button>
                <div className="w-px h-4 bg-zinc-200"></div>
                <button 
                    onClick={handleDeletePage} 
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors text-[10px] font-medium"
                >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                </button>
            </div>
        </div>
        )}
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

export const PageSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const handlePropChange = (key: string, value: any) => {
    setProp((props: any) => (props[key] = value));
  };

  const handleUnitChange = (newUnit: string) => {
      // Resetting to defaults is safer for UX to avoid huge/tiny margins when switching units.
      // This ensures the user starts with a valid "industry standard" margin for the selected unit.
      let defaults = { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 };
      if (newUnit === "mm") defaults = { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 };
      if (newUnit === "px") defaults = { top: 96, bottom: 96, left: 96, right: 96 };
      if (newUnit === "in") defaults = { top: 1, bottom: 1, left: 1, right: 1 };
      
      setProp((props: any) => {
          props.marginUnit = newUnit;
          props.paddingTop = defaults.top;
          props.paddingBottom = defaults.bottom;
          props.paddingLeft = defaults.left;
          props.paddingRight = defaults.right;
      });
  };

  return (
    <div className="flex flex-col gap-1">
      <SettingsSection title="Paper Settings" icon={FileText}>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Size</label>
            <select
              value={props.size}
              onChange={(e) => handlePropChange("size", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white"
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="F4">F4 (215 x 330 mm)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Orientation</label>
            <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
               <button onClick={() => handlePropChange("orientation", "portrait")} className={`flex-1 text-xs py-1.5 rounded ${props.orientation === "portrait" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}>Portrait</button>
               <button onClick={() => handlePropChange("orientation", "landscape")} className={`flex-1 text-xs py-1.5 rounded ${props.orientation === "landscape" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}>Landscape</button>
            </div>
          </div>
      </SettingsSection>

      <SettingsSection title="Page Margins" icon={Maximize}>
         {/* Unit Selector */}
         <div className="space-y-1 mb-2">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Unit</label>
            <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
               {["cm", "mm", "in", "px"].map((unit) => (
                   <button 
                    key={unit}
                    onClick={() => handleUnitChange(unit)} 
                    className={`flex-1 text-xs py-1.5 rounded ${props.marginUnit === unit ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}
                   >
                       {unit}
                   </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Top</label>
                <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
                    <input
                    type="number"
                    step="0.1"
                    value={props.paddingTop ?? 2.54}
                    onChange={(e) => handlePropChange("paddingTop", parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 pr-2 bg-zinc-50 h-full flex items-center px-1 border-l border-zinc-100">{props.marginUnit || "cm"}</span>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Bottom</label>
                <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
                    <input
                    type="number"
                    step="0.1"
                    value={props.paddingBottom ?? 2.54}
                    onChange={(e) => handlePropChange("paddingBottom", parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 pr-2 bg-zinc-50 h-full flex items-center px-1 border-l border-zinc-100">{props.marginUnit || "cm"}</span>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Left</label>
                <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
                    <input
                    type="number"
                    step="0.1"
                    value={props.paddingLeft ?? 2.54}
                    onChange={(e) => handlePropChange("paddingLeft", parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 pr-2 bg-zinc-50 h-full flex items-center px-1 border-l border-zinc-100">{props.marginUnit || "cm"}</span>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Right</label>
                <div className="flex items-center border border-zinc-200 rounded-md bg-white overflow-hidden">
                    <input
                    type="number"
                    step="0.1"
                    value={props.paddingRight ?? 2.54}
                    onChange={(e) => handlePropChange("paddingRight", parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 pr-2 bg-zinc-50 h-full flex items-center px-1 border-l border-zinc-100">{props.marginUnit || "cm"}</span>
                </div>
            </div>
         </div>
      </SettingsSection>

      <SettingsSection title="Watermark" icon={Layers}>
         <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Type</label>
            <select
              value={props.watermarkType}
              onChange={(e) => handlePropChange("watermarkType", e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white"
            >
              <option value="none">None</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
         </div>
         
         {props.watermarkType === "text" && (
            <>
            <div className="space-y-1 mt-2">
                <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Content</label>
                <input
                  type="text"
                  value={props.watermarkText}
                  onChange={(e) => handlePropChange("watermarkText", e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md"
                />
            </div>

            <div className="space-y-1 mt-2">
                 <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Pattern</label>
                 <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
                    <button onClick={() => handlePropChange("watermarkPattern", "diagonal")} className={`flex-1 text-xs py-1.5 rounded ${props.watermarkPattern === "diagonal" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}>Diagonal</button>
                    <button onClick={() => handlePropChange("watermarkPattern", "horizontal")} className={`flex-1 text-xs py-1.5 rounded ${props.watermarkPattern === "horizontal" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}>Straight</button>
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="wave-effect"
                      checked={props.watermarkIsWave}
                      onChange={(e) => handlePropChange("watermarkIsWave", e.target.checked)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="wave-effect" className="text-xs text-zinc-700 font-medium">Enable Wave Effect</label>
                 </div>
             </div>

             <div className="space-y-1 mt-2">
                 <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Layout Style</label>
                 <div className="flex bg-zinc-100 rounded-md p-1 gap-1">
                    <button 
                      onClick={() => handlePropChange("watermarkGridType", "grid")} 
                      className={`flex-1 text-xs py-1.5 rounded ${props.watermarkGridType === "grid" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"}`}
                      disabled={props.watermarkIsWave}
                    >
                      Grid
                    </button>
                    <button 
                      onClick={() => handlePropChange("watermarkGridType", "zigzag")} 
                      className={`flex-1 text-xs py-1.5 rounded ${props.watermarkGridType === "zigzag" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-zinc-500 hover:text-zinc-900"} ${props.watermarkIsWave ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={props.watermarkIsWave}
                    >
                      Zig Zag
                    </button>
                 </div>
             </div>

             <div className="space-y-1 mt-2">
                 <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Font Family</label>
                  <select
                    value={props.watermarkFontFamily || "Arial, sans-serif"}
                    onChange={(e) => handlePropChange("watermarkFontFamily", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md bg-white"
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                    <option value='"Bookman Old Style", Georgia, serif'>Bookman Old Style</option>
                  </select>
             </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                        type="color"
                        value={props.watermarkColor}
                        onChange={(e) => handlePropChange("watermarkColor", e.target.value)}
                        className="w-8 h-8 rounded border border-zinc-200 p-0.5 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-500 uppercase">{props.watermarkColor}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Size (px)</label>
                    <input
                    type="number"
                    value={props.watermarkFontSize}
                    onChange={(e) => handlePropChange("watermarkFontSize", parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Gap X (px)</label>
                    <input
                    type="number"
                    value={props.watermarkGapX}
                    onChange={(e) => handlePropChange("watermarkGapX", parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider">Gap Y (px)</label>
                    <input
                    type="number"
                    value={props.watermarkGapY}
                    onChange={(e) => handlePropChange("watermarkGapY", parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-200 rounded-md"
                    />
                </div>
            </div>
            </>
         )}
      </SettingsSection>
    </div>
  );
};

Page.craft = {
  displayName: "Halaman",
  props: {
    size: "A4",
    orientation: "portrait",
    paddingTop: 2.54,
    paddingBottom: 2.54,
    paddingLeft: 2.54,
    paddingRight: 2.54,
    marginUnit: "cm",
    watermarkType: "none",
    watermarkText: "DRAFT",
    watermarkImage: "",
    watermarkOpacity: 0.1,
    watermarkColor: "#6b7280",
    watermarkFontSize: 24,
    watermarkPattern: "diagonal",
    watermarkIsWave: false,
    watermarkGapX: 40,
    watermarkGapY: 40,
    watermarkLetterSpacing: 0,
    watermarkFontFamily: "Arial, sans-serif",
    watermarkGridType: "grid"
  },
  related: {
    settings: PageSettings,
  },
};
