import { useNode } from "@craftjs/core";
import { Move, RotateCcw } from "lucide-react";
import { LandSketchCanvas } from "../../shared/LandSketchCanvas";

export const LandSketch = ({
  width = "100%",
  height = "400px",
  initialPoints,
  initialLabels,
}: {
  width?: string;
  height?: string;
  initialPoints?: {x: number, y: number}[];
  initialLabels?: {edgeIndex: number, text: string}[];
}) => {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Default points (Rectangle) - Smaller default
  const defaultPoints = [
    { x: 50, y: 50 },
    { x: 250, y: 50 },
    { x: 250, y: 150 },
    { x: 50, y: 150 },
  ];

  // State managed by Craft.js props
  const { points, labels, scale } = useNode((node) => ({
    points: node.data.props.points || defaultPoints,
    labels: node.data.props.labels || [],
    scale: node.data.props.scale || 10, // Default 10px = 1m
  }));

  const handleChange = (newPoints: any[], newLabels: any[], newScale?: number) => {
    setProp((props: any) => {
        props.points = newPoints;
        props.labels = newLabels;
        if (newScale) props.scale = newScale;
    });
  };

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative w-full transition-all ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:bg-gray-50"}`}
      style={{ height, width }}
    >
      <LandSketchCanvas
        points={points}
        labels={labels}
        scale={scale}
        width="100%"
        height="100%"
        selected={selected}
        onChange={handleChange}
        className="overflow-visible"
      />
    </div>
  );
};

export const LandSketchSettings = () => {
  const { scale, actions: { setProp } } = useNode((node) => ({
      scale: node.data.props.scale || 10
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Move className="w-4 h-4 text-gray-500" />
        <h4 className="text-xs font-semibold text-gray-700">Sketsa Tanah</h4>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Skala Tampilan (px/m)</label>
        <div className="flex items-center gap-2">
            <input 
                type="range" 
                min="1" 
                max="50" 
                value={scale} 
                onChange={(e) => setProp((props: any) => props.scale = parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono w-8 text-right">{scale}</span>
        </div>
        <p className="text-[10px] text-gray-400">
            Sesuaikan skala agar gambar muat di halaman.
        </p>
      </div>

      <button 
        onClick={() => setProp((props: any) => {
             props.points = [
                { x: 50, y: 50 },
                { x: 250, y: 50 },
                { x: 250, y: 150 },
                { x: 50, y: 150 },
              ];
             props.labels = [];
             props.scale = 10;
        })}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset Bentuk (Default)
      </button>

      <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-[10px] text-blue-700 leading-relaxed">
          <strong>Logika Sketsa:</strong><br/>
          Klik label pada garis untuk memasukkan <strong>Panjang (Meter)</strong> yang presisi. Sistem akan otomatis menyesuaikan panjang garis sesuai skala.
        </p>
      </div>
    </div>
  );
};

LandSketch.craft = {
  displayName: "Sketsa Tanah",
  props: {
    points: [
        { x: 100, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 300 },
        { x: 100, y: 300 },
    ],
    labels: [],
    scale: 10,
    width: "100%",
    height: "400px",
  },
  related: {
    settings: LandSketchSettings,
  },
};
