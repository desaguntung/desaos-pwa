import { useEditor, Element } from "@craftjs/core";
import { 
  Type, 
  Box, 
  Tag, 
  Square, 
  LayoutList, 
  FileBadge, 
  PenTool, 
  ListOrdered, 
  File, 
  Table as TableIcon,
  Search,
  ChevronDown,
  Map,
  Compass
} from "lucide-react";
import { Text } from "./nodes/Text";
import { Container } from "./nodes/Container";
import { Variable } from "./nodes/Variable";
import { Input } from "./nodes/Input";
import { Row } from "./nodes/Row";
import { KopSurat } from "./nodes/KopSurat";
import { Signature } from "./nodes/Signature";
import { DataRow } from "./nodes/DataRow";
import { Page } from "./nodes/Page";
import { Table } from "./nodes/Table";
import { LandSketch } from "./nodes/LandSketch";
import { LandBoundaries } from "./nodes/LandBoundaries";
import { useState } from "react";

interface ToolboxItemProps {
  icon: any;
  title: string;
  description: string;
  element: React.ReactElement;
  onHover: (e: React.MouseEvent<HTMLDivElement>, title: string, description: string) => void;
  onLeave: () => void;
  disabled?: boolean;
}

const ToolboxItem = ({ 
  icon: Icon, 
  title, 
  description, 
  element,
  onHover,
  onLeave,
  disabled
}: ToolboxItemProps) => {
  const { connectors } = useEditor();
  
  return (
    <div 
      ref={(ref) => { if (ref && !disabled) connectors.create(ref, element); }}
      className={`flex flex-col items-center justify-center p-2 bg-white border border-zinc-200 rounded-lg transition-all aspect-square relative
        ${disabled 
          ? "opacity-40 cursor-not-allowed grayscale" 
          : "hover:border-blue-500 hover:shadow-sm hover:bg-blue-50/50 cursor-grab active:cursor-grabbing group"
        }`}
      onMouseEnter={(e) => !disabled && onHover(e, title, description)}
      onMouseLeave={onLeave}
    >
      <div className={`w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center transition-colors mb-1.5 border border-zinc-100 ${!disabled && "group-hover:bg-white group-hover:border-blue-100"}`}>
        <Icon className={`w-4 h-4 text-zinc-500 ${!disabled && "group-hover:text-blue-600"}`} />
      </div>
      <span className={`text-[9px] font-medium text-zinc-600 text-center w-full truncate px-0.5 ${!disabled && "group-hover:text-blue-700"}`}>{title}</span>
    </div>
  );
};

interface TooltipState {
  title: string;
  description: string;
  top: number;
  left: number;
}

export const Toolbox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);

  const { hasLandSketch } = useEditor((state) => ({
    hasLandSketch: Object.values(state.nodes).some(node => 
       node.data.displayName === "Sketsa Tanah" || 
       node.data.displayName === "LandSketch" || 
       node.data.name === "LandSketch" ||
       (node.data.type as any)?.name === "LandSketch"
    )
  }));

  const handleHover = (e: React.MouseEvent<HTMLDivElement>, title: string, description: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      title,
      description,
      top: rect.top + rect.height / 2,
      left: rect.right
    });
  };

  const handleLeave = () => {
    setActiveTooltip(null);
  };

  const sections = [
    {
      title: "Layout & Halaman",
      items: [
        { icon: File, title: "Halaman", description: "Halaman surat (A4/F4)", element: <Element is={Page} canvas /> },
        { icon: Box, title: "Container", description: "Wadah elemen (Group)", element: <Element is={Container} padding="20" background="#f9fafb" canvas /> },
        { icon: LayoutList, title: "Row Label", description: "Layout Label : Value", element: <Element is={Row} canvas><Element is={Container} width="30%" padding="0" background="transparent" canvas><Element is={Text} text="Label :" fontSize="12" textAlign="left" /></Element><Element is={Container} width="70%" padding="0" background="transparent" canvas><Element is={Variable} name="penduduk.nama" /></Element></Element> }
      ]
    },
    {
      title: "Sketsa & Batas",
      items: [
        { icon: Map, title: "Sketsa Tanah", description: "Gambar denah/batas tanah", element: <LandSketch /> },
        { icon: Compass, title: "Batas Tanah", description: "Deskripsi batas otomatis", element: <LandBoundaries />, disabled: !hasLandSketch },
      ]
    },
    {
      title: "Elemen Surat",
      items: [
        { icon: FileBadge, title: "Kop Surat", description: "Header resmi desa", element: <KopSurat /> },
        { icon: Type, title: "Teks", description: "Teks bebas", element: <Element is={Text} text="Teks Baru" /> },
        { icon: Tag, title: "Variabel", description: "Data otomatis (Database)", element: <Element is={Variable} /> },
        { icon: PenTool, title: "TTD", description: "Area tanda tangan", element: <Signature /> },
        { icon: TableIcon, title: "Tabel", description: "Tabel data", element: <Element is={Table} /> }
      ]
    },
    {
      title: "Data & Form",
      items: [
        { icon: ListOrdered, title: "Data Row", description: "Baris data bernomor", element: <Element is={DataRow} /> },
        { icon: Square, title: "Input", description: "Field input manual", element: <Element is={Input} /> }
      ]
    }
  ];

  return (
    <div className="w-72 bg-white border-r border-zinc-200 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Box className="w-4 h-4 text-white" />
            </div>
            <div>
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Widget Pallete</h2>
                <p className="text-[10px] text-zinc-500">Drag & drop components</p>
            </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search widgets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar"
        onScroll={() => setActiveTooltip(null)}
      >
        <div className="p-4 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center justify-between group cursor-pointer">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{section.title}</p>
                <ChevronDown className="w-3 h-3 text-zinc-300 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {section.items.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item, itemIdx) => (
                  <ToolboxItem 
                    key={itemIdx}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    element={item.element}
                    onHover={handleHover}
                    onLeave={handleLeave}
                    disabled={(item as any).disabled}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Tooltip Overlay */}
      {activeTooltip && (
        <div 
          className="fixed z-[9999] w-48 bg-zinc-600/95 backdrop-blur-sm text-white text-[10px] p-3 rounded-lg shadow-xl border border-white/10 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{  
            top: activeTooltip.top, 
            left: activeTooltip.left + 12,
            transform: 'translateY(-50%)' 
          }}
        >
          <p className="font-semibold mb-1 text-xs text-white">{activeTooltip.title}</p>
          <p className="text-zinc-100 leading-relaxed">{activeTooltip.description}</p>
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-zinc-600/95 transform rotate-45 border-l border-b border-white/10"></div>
        </div>
      )}
    </div>
  );
};
