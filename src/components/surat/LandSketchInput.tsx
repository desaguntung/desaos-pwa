import React, { useState, useEffect } from 'react';
import { Move, Ruler, RotateCcw, Save, X, Scissors, Trash2, User, Map as MapIcon, SplitSquareHorizontal, Waves, Anchor, Sunset } from "lucide-react";
import { LandSketchCanvas } from "../shared/LandSketchCanvas";

interface LandSketchInputProps {
  value?: any;
  onChange: (value: any) => void;
}

// Helper to calculate distance
const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export default function LandSketchInput({ value, onChange }: LandSketchInputProps) {
  // Default points (Rectangle) - Smaller default
  const defaultPoints = [
    { x: 50, y: 50 },
    { x: 250, y: 50 },
    { x: 250, y: 150 },
    { x: 50, y: 150 },
  ];

  // Initialize data from props or default
  const data = value || {
    points: defaultPoints,
    labels: [],
    scale: 10
  };

  const { points, labels, scale } = data;

  // Selected Edge State
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number | null>(null);
  const [edgeForm, setEdgeForm] = useState({
    text: "",
    length: "",
    type: "person", // 'person' | 'road' | 'ditch' | 'river' | 'coast' | 'sea'
    roadWidth: "3",
    startType: "auto", // 'auto' | 'through' | 'stop'
    endType: "auto" // 'auto' | 'through' | 'stop'
  });

  // Handle selection change from Canvas
  const handleSelectEdge = (index: number | null) => {
    setSelectedEdgeIndex(index);
    
    if (index !== null) {
        const p1 = points[index];
        const p2 = points[(index + 1) % points.length];
        const distPx = distance(p1, p2);
        const distM = (distPx / scale).toFixed(1);
        
        const labelObj = labels.find((l: any) => l.edgeIndex === index);
        
        setEdgeForm({
            text: labelObj?.text || "",
            length: distM,
            type: labelObj?.type || 'person',
            roadWidth: labelObj?.roadWidth?.toString() || "3",
            startType: labelObj?.startType || 'auto',
            endType: labelObj?.endType || 'auto'
        });
    }
  };

  const handleCanvasChange = (newPoints: any[], newLabels: any[], newScale?: number) => {
      const newData = { 
          ...data, 
          points: newPoints, 
          labels: newLabels,
      };
      if (newScale !== undefined) {
          newData.scale = newScale;
      }
      onChange(newData);
      
      // Update form length if geometry changes while selected
      if (selectedEdgeIndex !== null) {
          const p1 = newPoints[selectedEdgeIndex];
          const p2 = newPoints[(selectedEdgeIndex + 1) % newPoints.length];
          const distPx = distance(p1, p2);
          const distM = (distPx / (newScale || scale)).toFixed(1);
          setEdgeForm(prev => ({ ...prev, length: distM }));
      }
  };

  const resetShape = () => {
    if (confirm("Reset bentuk tanah ke awal? Perubahan saat ini akan hilang.")) {
        onChange({
            points: defaultPoints,
            labels: [],
            scale: 10
        });
        setSelectedEdgeIndex(null);
    }
  };

  // Helper for slider
  const updateScale = (newScale: number) => {
      onChange({ ...data, scale: newScale });
  };

  // Apply Property Changes
  const applyPropertyChanges = () => {
      if (selectedEdgeIndex === null) return;

      const { text, length, type, roadWidth, startType, endType } = edgeForm;
      const targetLengthM = parseFloat(length);
      const targetRoadWidth = parseFloat(roadWidth);

      // Update Label Text/Type
      const newLabels = [...labels];
      const existingIndex = newLabels.findIndex((l: any) => l.edgeIndex === selectedEdgeIndex);
      
      const labelData = { 
          edgeIndex: selectedEdgeIndex, 
          text: text,
          type: type,
          roadWidth: !isNaN(targetRoadWidth) ? targetRoadWidth : 3,
          startType: startType,
          endType: endType
      };
      
      if (existingIndex >= 0) {
            if (!text && edgeForm.type === 'person') newLabels.splice(existingIndex, 1);
            else newLabels[existingIndex] = labelData;
        } else if (text || edgeForm.type !== 'person') {
            newLabels.push(labelData);
        }

      // Update Geometry if length changed
      let newPoints = [...points];
      if (!isNaN(targetLengthM) && targetLengthM > 0) {
          const p1 = points[selectedEdgeIndex];
          const p2 = points[(selectedEdgeIndex + 1) % points.length];
          const currentDist = distance(p1, p2);
          const targetDistPx = targetLengthM * scale;
          
          if (Math.abs(currentDist - targetDistPx) > 1) { // 1px tolerance
              // Move p2 along vector p1->p2
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const ratio = targetDistPx / currentDist;
              
              const newP2 = {
                  x: p1.x + dx * ratio,
                  y: p1.y + dy * ratio
              };
              
              newPoints[(selectedEdgeIndex + 1) % points.length] = newP2;
          }
      }

      onChange({ ...data, points: newPoints, labels: newLabels });
  };

  const splitEdge = () => {
      if (selectedEdgeIndex === null) return;
      const index = selectedEdgeIndex;
      const p1 = points[index];
      const p2 = points[(index + 1) % points.length];
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      const newPoints = [...points];
      newPoints.splice(index + 1, 0, mid);

      const newLabels = labels.map((l: any) => {
          if (l.edgeIndex > index) return { ...l, edgeIndex: l.edgeIndex + 1 };
          return l;
      });

      // Recalculate length for the selected edge (which is now shorter)
      const distPx = distance(p1, mid);
      const distM = (distPx / scale).toFixed(1);
      
      setEdgeForm(prev => ({ ...prev, length: distM }));
      
      // Update data
      onChange({ ...data, points: newPoints, labels: newLabels });
  };

  const deleteVertex = () => {
     if (selectedEdgeIndex === null) return;
     if (points.length <= 3) {
         alert("Minimal harus ada 3 titik sudut untuk membentuk area.");
         return;
     }
     
     // Remove the END point of the selected edge (p2)
     // This merges edge(i) and edge(i+1) into a new edge(i)
     const indexToRemove = (selectedEdgeIndex + 1) % points.length;
     
     const newPoints = [...points];
     newPoints.splice(indexToRemove, 1);
     
     const newLabels = labels
         .filter((l: any) => l.edgeIndex !== indexToRemove) // Remove label attached to the deleted edge
         .map((l: any) => {
             if (l.edgeIndex > indexToRemove) return { ...l, edgeIndex: l.edgeIndex - 1 };
             return l;
         });
         
     onChange({ ...data, points: newPoints, labels: newLabels });
     setSelectedEdgeIndex(null);
  };

  // Auto-apply changes when form values change (optional, but requested UX was "isi ... dan terapkan", so maybe button is better? 
  // User said: "untuk mengisi Jenis Sisi, Nama tetangga, Panjang Sisi Meter dan terapkan" -> Implies explicit action or immediate effect.
  // Immediate effect is cleaner for "editor" feel. Let's try immediate effect for text/type, but length might need debounce or Enter key.
  // Actually, let's provide a clear "Update" button or just auto-update on blur/change. 
  // Given the "terapkan" keyword, I'll add a button or just make it reactive. 
  // Let's make it reactive for better UX, but maybe add a small "Terapkan" button if length is tricky.
  // For now, I will add a "Terapkan Perubahan" button to be safe and explicit as requested.
  
  return (
    <div className="flex flex-col md:flex-row gap-4 border border-zinc-200 rounded-lg bg-white p-4">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col gap-2">
         <div className="border border-zinc-200 rounded-md overflow-hidden relative h-[500px] bg-zinc-50/50">
            <LandSketchCanvas
                points={points}
                labels={labels}
                scale={scale}
                width="100%"
                height="100%"
                readOnly={false}
                selected={true}
                onChange={handleCanvasChange}
                className="overflow-visible"
                onSelectEdge={handleSelectEdge}
                selectedEdgeIndex={selectedEdgeIndex}
            />
         </div>
         <p className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Move size={12} /> Klik garis untuk edit properti. Alt+Drag untuk geser view.
         </p>
      </div>

      {/* Sidebar Controls (Property & Settings) */}
      <div className="w-full md:w-72 flex flex-col gap-6 border-l border-zinc-100 pl-4 overflow-y-auto max-h-[500px] pr-2">
          
          {/* Section: Properties */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2 border-b border-zinc-100 pb-2">
                <Ruler size={14} className="text-zinc-500" /> Detail Sisi
            </h4>

            {selectedEdgeIndex !== null ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    
                    {/* Header Info */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Sisi Terpilih</span>
                        <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">#{selectedEdgeIndex + 1}</span>
                    </div>

                    {/* Type Selector (Segmented Control) */}
                    <div className="bg-zinc-100 p-1.5 rounded-lg grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => setEdgeForm({...edgeForm, type: 'person'})}
                            className={`flex items-center justify-start px-3 gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                                edgeForm.type === 'person' 
                                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                        >
                            <User size={14} /> Tetangga
                        </button>
                        <button
                            type="button"
                            onClick={() => setEdgeForm({...edgeForm, type: 'road'})}
                            className={`flex items-center justify-start px-3 gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                                edgeForm.type === 'road' 
                                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                        >
                            <MapIcon size={14} /> Jalan
                        </button>
                        <button
                            type="button"
                            onClick={() => setEdgeForm({...edgeForm, type: 'ditch'})}
                            className={`flex items-center justify-start px-3 gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                                edgeForm.type === 'ditch' 
                                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                        >
                            <Waves size={14} className="rotate-90" /> Parit
                        </button>
                        <button
                            type="button"
                            onClick={() => setEdgeForm({...edgeForm, type: 'river'})}
                            className={`flex items-center justify-start px-3 gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                                edgeForm.type === 'river' 
                                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                        >
                            <Waves size={14} /> Sungai
                        </button>
                        <button
                            type="button"
                            onClick={() => setEdgeForm({...edgeForm, type: 'coast'})}
                            className={`flex items-center justify-start px-3 gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                                edgeForm.type === 'coast' 
                                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                        >
                            <Sunset size={14} /> Pantai
                        </button>
                        <button
                            type="button"
                            onClick={() => setEdgeForm({...edgeForm, type: 'sea'})}
                            className={`flex items-center justify-start px-3 gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                                edgeForm.type === 'sea' 
                                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                        >
                            <Anchor size={14} /> Laut
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-zinc-500 uppercase">
                                {edgeForm.type === 'person' ? 'Nama Tetangga' : 
                                 edgeForm.type === 'road' ? 'Nama Jalan' :
                                 edgeForm.type === 'ditch' ? 'Nama Parit' :
                                 edgeForm.type === 'river' ? 'Nama Sungai' :
                                 edgeForm.type === 'coast' ? 'Nama Pantai' : 'Nama Laut'}
                            </label>
                            <input 
                                type="text" 
                                value={edgeForm.text}
                                onChange={(e) => setEdgeForm({...edgeForm, text: e.target.value})}
                                placeholder={
                                    edgeForm.type === 'person' ? 'Contoh: Bpk. Budi' : 
                                    edgeForm.type === 'road' ? 'Contoh: Jl. Merpati' :
                                    edgeForm.type === 'ditch' ? 'Contoh: Parit Desa' :
                                    edgeForm.type === 'river' ? 'Contoh: Sungai Brantas' :
                                    'Contoh: Laut Jawa'
                                }
                                className="w-full text-xs border border-zinc-200 rounded px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-zinc-500 uppercase">Panjang (Meter)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={edgeForm.length}
                                    onChange={(e) => setEdgeForm({...edgeForm, length: e.target.value})}
                                    className="flex-1 text-xs border border-zinc-200 rounded px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                                />
                                <span className="text-xs text-zinc-500 font-medium">m</span>
                            </div>
                        </div>

                        {edgeForm.type !== 'person' && (
                            <div className="space-y-3 pt-2 border-t border-dashed border-zinc-200">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-zinc-500 uppercase">
                                        Lebar {
                                            edgeForm.type === 'road' ? 'Jalan' : 
                                            edgeForm.type === 'ditch' ? 'Parit' : 
                                            edgeForm.type === 'river' ? 'Sungai' : 
                                            edgeForm.type === 'coast' ? 'Pantai' : 'Laut'
                                        }
                                    </label>
                                    <input 
                                        type="number" 
                                        value={edgeForm.roadWidth}
                                        onChange={(e) => setEdgeForm({...edgeForm, roadWidth: e.target.value})}
                                        className="w-full text-xs border border-zinc-200 rounded px-2 py-1.5"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-zinc-500 uppercase">Ujung Awal</label>
                                        <select 
                                            value={edgeForm.startType}
                                            onChange={(e) => setEdgeForm({...edgeForm, startType: e.target.value})}
                                            className="w-full text-xs border border-zinc-200 rounded px-2 py-1.5 bg-white"
                                        >
                                            <option value="auto">Auto</option>
                                            <option value="through">Terus</option>
                                            <option value="stop">Buntu</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-zinc-500 uppercase">Ujung Akhir</label>
                                        <select 
                                            value={edgeForm.endType}
                                            onChange={(e) => setEdgeForm({...edgeForm, endType: e.target.value})}
                                            className="w-full text-xs border border-zinc-200 rounded px-2 py-1.5 bg-white"
                                        >
                                            <option value="auto">Auto</option>
                                            <option value="through">Terus</option>
                                            <option value="stop">Buntu</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={applyPropertyChanges}
                        className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors shadow-sm active:scale-[0.98]"
                    >
                        <Save size={14} />
                        Simpan Perubahan
                    </button>
                    
                    <hr className="border-zinc-100 my-1" />
                    
                    {/* Geometry Actions */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium text-zinc-400 uppercase">Aksi Geometri</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                type="button"
                                onClick={splitEdge}
                                className="flex flex-col items-center gap-1.5 p-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 rounded-md transition-all active:scale-[0.98]"
                                title="Bagi sisi ini menjadi dua bagian sama panjang"
                            >
                                <SplitSquareHorizontal size={16} className="text-zinc-500" />
                                <span>Bagi Sisi</span>
                            </button>
                            <button 
                                type="button"
                                onClick={deleteVertex}
                                className="flex flex-col items-center gap-1.5 p-2 text-xs font-medium text-red-700 bg-white border border-zinc-200 hover:bg-red-50 hover:border-red-200 rounded-md transition-all active:scale-[0.98]"
                                title="Hapus titik sudut dan gabungkan sisi"
                            >
                                <Trash2 size={16} className="text-red-500" />
                                <span>Hapus Titik</span>
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => setSelectedEdgeIndex(null)}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                        <X size={14} />
                        Batalkan Seleksi
                    </button>
                </div>
            ) : (
                <div className="text-center py-12 text-zinc-400 text-xs italic border border-dashed border-zinc-200 rounded bg-zinc-50/50 flex flex-col items-center gap-2">
                    <Move size={24} className="opacity-20" />
                    <p>Klik garis pada sketsa<br/>untuk mengedit properti.</p>
                </div>
            )}
          </div>

          <hr className="border-zinc-100" />

          {/* General Settings */}
          <div className="flex flex-col gap-3">
             <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide">Pengaturan Umum</h4>
             
             <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase flex justify-between">
                    <span>Skala Dasar</span>
                    <span className="font-mono text-zinc-700">{scale}px/m</span>
                </label>
                <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="1"
                    value={scale}
                    onChange={(e) => updateScale(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                />
             </div>

             <button 
                type="button"
                onClick={resetShape}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors mt-2"
            >
                <RotateCcw size={14} />
                Reset Bentuk Awal
            </button>
          </div>

      </div>
    </div>
  );
}
