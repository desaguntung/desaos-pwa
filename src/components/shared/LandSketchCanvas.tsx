import React, { useState, useRef, useCallback, useEffect } from "react";
import { Move, Plus, Trash, RotateCcw, Type, Check, Ruler, ZoomIn, ZoomOut, Info } from "lucide-react";

// ==========================================
// Helper Functions (Geometry)
// ==========================================

const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const midpoint = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
};

const getLineIntersection = (p1: {x:number, y:number}, v1: {x:number, y:number}, p2: {x:number, y:number}, v2: {x:number, y:number}) => {
    const det = v1.x * v2.y - v1.y * v2.x;
    if (Math.abs(det) < 0.001) return null; // Parallel

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    const t = (dx * v2.y - dy * v2.x) / det;
    return {
        x: p1.x + t * v1.x,
        y: p1.y + t * v1.y
    };
};

const getOffsetIntersection = (p0: any, p1: any, p2: any, w1: number, w2: number) => {
     // Vector p0->p1
     const v1 = { x: p1.x - p0.x, y: p1.y - p0.y };
     const len1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
     const n1 = { x: -v1.y / len1, y: v1.x / len1 };
     
     // Vector p1->p2
     const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
     const len2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y);
     const n2 = { x: -v2.y / len2, y: v2.x / len2 };

     // Point on offset line 1
     const start1 = { x: p0.x + n1.x * w1, y: p0.y + n1.y * w1 };
     // Point on offset line 2
     const start2 = { x: p1.x + n2.x * w2, y: p1.y + n2.y * w2 };
     
     return getLineIntersection(start1, v1, start2, v2);
};

const createWavePath = (p1: {x:number, y:number}, p2: {x:number, y:number}, amplitude: number, frequency: number, phase: number = 0) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);
    const normal = { x: -Math.sin(angle), y: Math.cos(angle) };

    const steps = Math.ceil(dist / 4); // 4px segments for smoothness
    let path = `M ${p1.x},${p1.y}`;

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        // Linear interpolation
        const lx = p1.x + dx * t;
        const ly = p1.y + dy * t;

        // Wave offset
        const wave = Math.sin((t * dist * frequency) + phase) * amplitude;

        path += ` L ${lx + normal.x * wave},${ly + normal.y * wave}`;
    }
    return path;
};

// ==========================================
// Component Props Interface
// ==========================================

export interface LandSketchCanvasProps {
  points: {x: number, y: number}[];
  labels: {edgeIndex: number, text: string, type?: string, roadWidth?: number, startType?: string, endType?: string}[];
  scale: number;
  width?: string;
  height?: string;
  readOnly?: boolean;
  selected?: boolean; // If true, shows editing controls (like split buttons)
  onChange?: (newPoints: any[], newLabels: any[], newScale?: number) => void;
  className?: string;
  
  // New props for external control
  onSelectEdge?: (index: number | null) => void;
  selectedEdgeIndex?: number | null;
}

// ==========================================
// Main Component
// ==========================================

export const LandSketchCanvas = ({
  points,
  labels,
  scale,
  width = "100%",
  height = "400px",
  readOnly = false,
  selected = true,
  onChange,
  className,
  onSelectEdge,
  selectedEdgeIndex: externalSelectedEdgeIndex
}: LandSketchCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [internalSelectedPointIndex, setInternalSelectedPointIndex] = useState<number | null>(null);
  
  // View Transform State (Pan/Zoom)
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Fallback for internal editing if onSelectEdge is not provided
  const [editingState, setEditingState] = useState<{
    index: number;
    text: string;
    length: string;
    type: 'person' | 'road' | 'ditch' | 'river' | 'coast' | 'sea';
    roadWidth: string;
    startType: 'auto' | 'through' | 'stop';
    endType: 'auto' | 'through' | 'stop';
    position: { x: number, y: number };
  } | null>(null);

  // Use external or internal selected index
  const activeEdgeIndex = externalSelectedEdgeIndex !== undefined ? externalSelectedEdgeIndex : (editingState?.index ?? null);

  // Auto-fit / Constrain logic (Only if not manually panning/zooming)
  // Disable auto-fit for now to allow manual control, or make it run once on mount?
  // We'll keep it simple: manual control overrides auto-fit logic.

  const handleSvgClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    // Deselect if clicking empty space
    if (onSelectEdge) {
        onSelectEdge(null);
    } else if (editingState) {
        setEditingState(null);
    }
    
    if (internalSelectedPointIndex !== null) {
        setInternalSelectedPointIndex(null);
    }
  };

  const handlePointMouseDown = (index: number, e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    if (e.button === 0) {
        setDraggingPoint(index);
        setInternalSelectedPointIndex(index); // Select on click/drag start
    }
  };

  const deletePoint = (index: number, e?: React.MouseEvent) => {
    if (readOnly || !onChange) return;
    if (e) e.stopPropagation();
    if (points.length <= 3) {
        alert("Minimal harus ada 3 titik.");
        return;
    }

    const newPoints = [...points];
    newPoints.splice(index, 1);

    const newLabels = labels
      .filter((l: any) => l.edgeIndex !== index)
      .map((l: any) => {
        if (l.edgeIndex > index) return { ...l, edgeIndex: l.edgeIndex - 1 };
        return l;
      });

    onChange(newPoints, newLabels);
    setInternalSelectedPointIndex(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
     if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt+Left
         setIsPanning(true);
         setPanStart({ x: e.clientX, y: e.clientY });
         e.preventDefault();
     }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    
    // Pan Logic
    if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setViewTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setPanStart({ x: e.clientX, y: e.clientY });
        return;
    }

    // Drag Point Logic
    if (draggingPoint !== null && svgRef.current && onChange) {
      // Need to account for viewTransform
      const CTM = svgRef.current.getScreenCTM();
      if (CTM) {
        // Apply viewTransform inverse
        // Screen -> SVG Coordinate
        const rawX = (e.clientX - CTM.e) / CTM.a;
        const rawY = (e.clientY - CTM.f) / CTM.d;
        
        // SVG -> Transformed Coordinate (Pan/Zoom)
        // x_view = x_raw * k + tx  =>  x_raw = (x_view - tx) / k
        // Wait, the group transform applies to the content. 
        // So rawX is in the coordinate space of the SVG viewport.
        // We need the coordinate in the coordinate space of the group.
        // group_x = (rawX - tx) / k
        
        const x = (rawX - viewTransform.x) / viewTransform.k;
        const y = (rawY - viewTransform.y) / viewTransform.k;
        
        const newPoints = [...points];
        newPoints[draggingPoint] = { x, y };
        onChange(newPoints, labels);
      }
    }
  }, [draggingPoint, points, labels, onChange, readOnly, isPanning, panStart, viewTransform]);

  const handleMouseUp = () => {
    if (readOnly) return;
    setDraggingPoint(null);
    setIsPanning(false);
  };

  const splitEdge = (index: number, e: React.MouseEvent) => {
    if (readOnly || !onChange) return;
    e.stopPropagation();
    const p1 = points[index];
    const p2 = points[(index + 1) % points.length];
    const mid = midpoint(p1, p2);
    
    const newPoints = [...points];
    newPoints.splice(index + 1, 0, mid);
    
    const newLabels = labels.map((l: any) => {
      if (l.edgeIndex > index) return { ...l, edgeIndex: l.edgeIndex + 1 };
      return l;
    });

    onChange(newPoints, newLabels);
    // Select the new point (index + 1)
    setInternalSelectedPointIndex(index + 1);
  };

  const handleEdgeClick = (index: number, labelObj: any, e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();

    // If external handler provided, use it
    if (onSelectEdge) {
        onSelectEdge(index);
        return;
    }

    // Fallback: Internal Editing
    const p1 = points[index];
    const p2 = points[(index + 1) % points.length];
    const mid = midpoint(p1, p2);
    
    // Calculate current length in meters
    const distPx = distance(p1, p2);
    const distM = (distPx / scale).toFixed(1);

    setEditingState({
        index,
        text: labelObj?.text || "",
        length: distM,
        type: labelObj?.type || 'person',
        roadWidth: labelObj?.roadWidth?.toString() || "3",
        startType: labelObj?.startType || 'auto',
        endType: labelObj?.endType || 'auto',
        position: mid
    });
  };

  // Zoom Controls
  const handleZoom = (delta: number) => {
      setViewTransform(prev => ({
          ...prev,
          k: Math.max(0.1, Math.min(5, prev.k + delta))
      }));
  };

  const handleResetView = () => {
      setViewTransform({ x: 0, y: 0, k: 1 });
  };

  // Internal Apply Changes (Legacy/Fallback)
  const applyChanges = () => {
      if (!editingState || !onChange) return;
      
      const { index, text, length, type, roadWidth, startType, endType } = editingState;
      const targetLengthM = parseFloat(length);
      const targetRoadWidth = parseFloat(roadWidth);

      // Update Label Text
      const newLabels = [...labels];
      const existingIndex = newLabels.findIndex(l => l.edgeIndex === index);
      
      const labelData = { 
          edgeIndex: index, 
          text: text,
          type: type,
          roadWidth: !isNaN(targetRoadWidth) ? targetRoadWidth : 3,
          startType: startType,
          endType: endType
      };
      
      if (existingIndex >= 0) {
          if (!text && type !== 'road') newLabels.splice(existingIndex, 1);
          else newLabels[existingIndex] = labelData;
      } else if (text || type === 'road') {
          newLabels.push(labelData);
      }

      // Update Geometry if length changed
      let newPoints = [...points];
      if (!isNaN(targetLengthM) && targetLengthM > 0) {
          const p1 = points[index];
          const p2 = points[(index + 1) % points.length];
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
              
              newPoints[(index + 1) % points.length] = newP2;
          }
      }

      onChange(newPoints, newLabels);
      setEditingState(null);
  };

  // Generate path string
  const pathData = points.map((p: any, i: number) => 
    (i === 0 ? "M" : "L") + ` ${p.x},${p.y}`
  ).join(" ") + " Z";

  // Generate Road Paths
  const roadPaths = points.map((p1: any, i: number) => {
    const label = labels.find((l: any) => l.edgeIndex === i);
    // Allow other types (ditch, river, coast, sea) to render like roads
    if (!label?.type || label.type === 'person') return null;

    const type = label.type;
    // Define Styles based on Type (No color, use patterns/lines)
    const strokeColor = "#52525b"; // Zinc-600 neutral gray for lines
    
    // Wave Parameters
    let isWavy = false;
    let waveAmp = 0;
    let waveFreq = 0;
    let isFilled = false;
    
    if (type === 'river') {
        isWavy = true;
        waveAmp = 3;
        waveFreq = 0.05;
    } else if (type === 'ditch') { // Parit: Simple wave
        isWavy = true;
        waveAmp = 1.5;
        waveFreq = 0.15;
    } else if (type === 'sea' || type === 'coast') {
        isWavy = true;
        waveAmp = 4;
        waveFreq = 0.08;
        if (type === 'sea') isFilled = true;
    }

    const p2 = points[(i + 1) % points.length];
    const widthPx = (label.roadWidth || 3) * scale;
    // Negative width to push outside (assuming clockwise winding)
    const signedWidth = -widthPx; 
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const normal = { x: -dy/len, y: dx/len };
    const dir = { x: dx/len, y: dy/len };

    const extensionPx = 2 * scale; 
    
    // Neighbors
    const prevIdx = (i - 1 + points.length) % points.length;
    const prevLabel = labels.find((l: any) => l.edgeIndex === prevIdx);
    const p0 = points[prevIdx];
    const isPrevWide = prevLabel?.type && prevLabel.type !== 'person';
    const prevRoadWidth = isPrevWide ? (prevLabel.roadWidth || 3) * scale : 0;

    const nextIdx = (i + 1) % points.length;
    const nextLabel = labels.find((l: any) => l.edgeIndex === nextIdx);
    const p3 = points[(i + 2) % points.length];
    const isNextWide = nextLabel?.type && nextLabel.type !== 'person';
    const nextRoadWidth = isNextWide ? (nextLabel.roadWidth || 3) * scale : 0;

    const startType = label.startType || 'auto';
    const endType = label.endType || 'auto';

    // --- Start Logic ---
    let coreInnerStart = { ...p1 };
    let coreOuterStart;
    let startStubs = [];

    if (isPrevWide) {
        // Connected: Calculate Outer Intersection
        const intersection = getOffsetIntersection(p0, p1, p2, -prevRoadWidth, signedWidth);
        coreOuterStart = intersection || { x: p1.x + normal.x * signedWidth, y: p1.y + normal.y * signedWidth };

        if (startType === 'through') {
             // Outer Stub (Continuous)
             startStubs.push(
                 <line key="s-out" x1={coreOuterStart.x} y1={coreOuterStart.y} x2={coreOuterStart.x - dir.x * extensionPx} y2={coreOuterStart.y - dir.y * extensionPx} stroke={strokeColor} strokeWidth="1" />
             );
        }
    } else {
        // Not Connected
        coreOuterStart = { x: p1.x + normal.x * signedWidth, y: p1.y + normal.y * signedWidth };
        const ext = (startType === 'stop') ? 0 : extensionPx;
        if (ext > 0) {
            startStubs.push(
                <line key="s-in" x1={p1.x} y1={p1.y} x2={p1.x - dir.x * ext} y2={p1.y - dir.y * ext} stroke={strokeColor} strokeWidth="1" />
            );
            startStubs.push(
                <line key="s-out" x1={coreOuterStart.x} y1={coreOuterStart.y} x2={coreOuterStart.x - dir.x * ext} y2={coreOuterStart.y - dir.y * extensionPx} stroke={strokeColor} strokeWidth="1" />
            );
        }
    }

    // --- End Logic ---
    let coreInnerEnd = { ...p2 };
    let coreOuterEnd;
    let endStubs = [];

    if (isNextWide) {
        // Connected: Calculate Outer Intersection
        const intersection = getOffsetIntersection(p1, p2, p3, signedWidth, -nextRoadWidth);
        coreOuterEnd = intersection || { x: p2.x + normal.x * signedWidth, y: p2.y + normal.y * signedWidth };

        if (endType === 'through') {
             // Inner Stub with Gap (Jump over neighbor road width)
             const gapPoint = getOffsetIntersection(p1, p2, p3, 0, -nextRoadWidth);
             if (gapPoint) {
                 endStubs.push(
                     <line key="e-in" x1={gapPoint.x} y1={gapPoint.y} x2={gapPoint.x + dir.x * extensionPx} y2={gapPoint.y + dir.y * extensionPx} stroke={strokeColor} strokeWidth="1" />
                 );
             }

             // Outer Stub (Continuous)
             endStubs.push(
                 <line key="e-out" x1={coreOuterEnd.x} y1={coreOuterEnd.y} x2={coreOuterEnd.x + dir.x * extensionPx} y2={coreOuterEnd.y + dir.y * extensionPx} stroke={strokeColor} strokeWidth="1" />
             );
        }
    } else {
        // Not Connected
        coreOuterEnd = { x: p2.x + normal.x * signedWidth, y: p2.y + normal.y * signedWidth };
        const ext = (endType === 'stop') ? 0 : extensionPx;
        if (ext > 0) {
            endStubs.push(
                <line key="e-in" x1={p2.x} y1={p2.y} x2={p2.x + dir.x * ext} y2={p2.y + dir.y * ext} stroke={strokeColor} strokeWidth="1" />
            );
            endStubs.push(
                <line key="e-out" x1={coreOuterEnd.x} y1={coreOuterEnd.y} x2={coreOuterEnd.x + dir.x * ext} y2={coreOuterEnd.y + dir.y * extensionPx} stroke={strokeColor} strokeWidth="1" />
            );
        }
    }

    // Render Lines or Waves
    let innerPath, outerPath, fillPath;
    
    if (isWavy) {
        innerPath = (
            <path d={createWavePath(coreInnerStart, coreInnerEnd, waveAmp, waveFreq, 0)} fill="none" stroke={strokeColor} strokeWidth="1" />
        );
        outerPath = (
            <path d={createWavePath(coreOuterStart, coreOuterEnd, waveAmp, waveFreq, Math.PI)} fill="none" stroke={strokeColor} strokeWidth="1" />
        );
    } else {
        innerPath = <line x1={coreInnerStart.x} y1={coreInnerStart.y} x2={coreInnerEnd.x} y2={coreInnerEnd.y} stroke={strokeColor} strokeWidth="1" />;
        outerPath = <line x1={coreOuterStart.x} y1={coreOuterStart.y} x2={coreOuterEnd.x} y2={coreOuterEnd.y} stroke={strokeColor} strokeWidth="1" />;
    }

    if (isFilled) {
        // Create a closed path for fill
        // Note: For fill, we might want straight edges or wavy edges matching the border.
        // We'll approximate by using the 4 corners.
        // Since createWavePath returns a path string, we can combine them? 
        // Or just fill the polygon with the pattern.
        // Let's try simple polygon fill first.
        const fillPoints = `${coreInnerStart.x},${coreInnerStart.y} ${coreInnerEnd.x},${coreInnerEnd.y} ${coreOuterEnd.x},${coreOuterEnd.y} ${coreOuterStart.x},${coreOuterStart.y}`;
        fillPath = <polygon points={fillPoints} fill="url(#sea-pattern)" stroke="none" />;
    }

    return (
        <g key={`road-${i}`}>
            {isFilled && fillPath}
            {/* Core Lines */}
            {innerPath}
            {outerPath}
            {/* Stubs */}
            {startStubs}
            {endStubs}
        </g>
    );
  });

  return (
    <div 
      className={`relative w-full transition-all ${className || ''}`}
      style={{ height, width }}
    >
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        className={`overflow-visible ${!readOnly ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
      >
        <defs>
            <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
                <path d="M6,0 L0,3 L6,6 L4,3 Z" fill="black" />
            </marker>
            <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="black" />
            </marker>
            <pattern id="sea-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 0,5 Q 2.5,0 5,5 T 10,5" fill="none" stroke="#52525b" strokeWidth="0.5" strokeOpacity="0.5" />
            </pattern>
        </defs>

        {/* Applied Transform Group */}
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.k})`}>
            {/* Road Paths */}
            {roadPaths}

            {/* Main Polygon */}
            <path 
              d={pathData} 
              fill="none" 
              stroke="black" 
              strokeWidth="1" 
            />

            {/* Render Edges and Labels */}
            {points.map((p1: any, i: number) => {
              const p2 = points[(i + 1) % points.length];
              const mid = midpoint(p1, p2);
              const labelObj = labels.find((l: any) => l.edgeIndex === i);
              const labelText = labelObj ? labelObj.text : "";
              const isSelected = activeEdgeIndex === i;
              
              // Calculate length for display
              const distPx = distance(p1, p2);
              const distM = (distPx / scale).toFixed(1);

              // Calculate angle for text
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              let angle = Math.atan2(dy, dx) * 180 / Math.PI;
              // Flip text if upside down
              if (angle > 90 || angle < -90) {
                 angle += 180;
              }

              return (
                <g key={`edge-${i}`} className="group/edge">
                  {/* Transparent Hit Area (Thicker for easier clicking) */}
                  <line 
                    x1={p1.x} 
                    y1={p1.y} 
                    x2={p2.x} 
                    y2={p2.y} 
                    stroke="transparent" 
                    strokeWidth="20"
                    className={!readOnly ? "cursor-pointer" : ""}
                    onClick={(e) => handleEdgeClick(i, labelObj, e)}
                  />

                  {/* Highlight Line if Selected */}
                  {isSelected && (
                      <line 
                        x1={p1.x} 
                        y1={p1.y} 
                        x2={p2.x} 
                        y2={p2.y} 
                        stroke="#18181b" 
                        strokeWidth="4"
                        strokeOpacity="0.2"
                        className="animate-pulse"
                      />
                  )}

                  {/* Dimension Line with Arrows */}
                  <line 
                    x1={p1.x} 
                    y1={p1.y} 
                    x2={p2.x} 
                    y2={p2.y} 
                    stroke={isSelected ? "#18181b" : "black"}
                    strokeWidth={isSelected ? "1.5" : "0.5"}
                    markerStart="url(#arrow-start)"
                    markerEnd="url(#arrow-end)"
                    className="pointer-events-none transition-all duration-200" 
                  />

                  {/* Hover Effect (Visual Only) */}
                  {!readOnly && !isSelected && (
                      <line 
                        x1={p1.x} 
                        y1={p1.y} 
                        x2={p2.x} 
                        y2={p2.y} 
                        stroke="#18181b" 
                        strokeWidth="2"
                        strokeOpacity="0"
                        className="pointer-events-none transition-all duration-200 group-hover/edge:stroke-opacity-10" 
                      />
                  )}
                  
                  {/* Label Display (Clickable) */}
                  {editingState?.index !== i && (
                    <g 
                        onClick={(e) => handleEdgeClick(i, labelObj, e)}
                        className={!readOnly ? "cursor-pointer" : ""}
                    >
                        {/* Rotated Group for Text */}
                        <g transform={`translate(${mid.x}, ${mid.y}) rotate(${angle})`}>
                            {/* Name Label (Above Line) */}
                            <text
                                x="0"
                                y="-6"
                                textAnchor="middle"
                                fill={isSelected ? "#18181b" : "#52525b"}
                                fontSize="9"
                                fontWeight={isSelected ? "600" : "400"}
                                className="select-none bg-white/80"
                                style={{ textShadow: "0px 0px 4px white" }}
                            >
                                {labelText || (
                                    labelObj?.type === 'road' ? `Jalan (${labelObj.roadWidth}m)` : 
                                    labelObj?.type === 'ditch' ? `Parit (${labelObj.roadWidth}m)` :
                                    labelObj?.type === 'river' ? `Sungai (${labelObj.roadWidth}m)` :
                                    labelObj?.type === 'coast' ? `Pantai (${labelObj.roadWidth}m)` :
                                    labelObj?.type === 'sea' ? `Laut (${labelObj.roadWidth}m)` :
                                    ((selected && !readOnly && !labelText) ? "" : "")
                                )}
                            </text>
                            
                            {/* Dimension Label (Below Line or Inline) */}
                            <text
                                x="0"
                                y="10"
                                textAnchor="middle"
                                fill={isSelected ? "#18181b" : "#71717a"}
                                fontSize="8"
                                className="select-none"
                                style={{ textShadow: "0px 0px 4px white" }}
                            >
                                {distM} m
                            </text>
                        </g>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Vertices */}
            {points.map((p: any, i: number) => {
              if (!selected || readOnly) {
                 // View Mode: Small architectural marks
                 return (
                     <circle key={`v-${i}`} cx={p.x} cy={p.y} r="2" fill="black" />
                 );
              }
              
              return (
              <g key={`point-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="white"
                  stroke={internalSelectedPointIndex === i ? "blue" : "black"}
                  strokeWidth={internalSelectedPointIndex === i ? "2" : "1"}
                  className="cursor-move hover:fill-blue-100"
                  onMouseDown={(e) => handlePointMouseDown(i, e)}
                  onDoubleClick={(e) => deletePoint(i, e)}
                />
              </g>
              );
            })}
        </g>
      </svg>
      
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white/90 border border-zinc-200 rounded-md shadow-sm p-1">
          <button type="button" onClick={() => handleZoom(0.1)} className="p-1 hover:bg-zinc-100 rounded text-zinc-600" title="Zoom In">
              <ZoomIn size={16} />
          </button>
          <button type="button" onClick={() => handleZoom(-0.1)} className="p-1 hover:bg-zinc-100 rounded text-zinc-600" title="Zoom Out">
              <ZoomOut size={16} />
          </button>
          <button type="button" onClick={handleResetView} className="p-1 hover:bg-zinc-100 rounded text-zinc-600" title="Reset View">
              <RotateCcw size={16} />
          </button>
      </div>

      {/* Internal Modal Fallback (Only if no external handler) */}
      {editingState && !onSelectEdge && (
          <div 
            className="absolute p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-10 w-64"
            style={{ 
                left: editingState.position.x * viewTransform.k + viewTransform.x, 
                top: editingState.position.y * viewTransform.k + viewTransform.y + 20 
            }}
          >
            <h4 className="text-xs font-semibold mb-2">Edit Sisi {editingState.index + 1}</h4>
            
            <div className="space-y-2">
                <div>
                    <label className="text-xs text-gray-500 block">Tipe Sisi</label>
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            className={`flex-1 text-xs py-1 rounded border ${editingState.type === 'person' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200'}`}
                            onClick={() => setEditingState({...editingState, type: 'person'})}
                        >
                            Tetangga
                        </button>
                        <button 
                            type="button"
                            className={`flex-1 text-xs py-1 rounded border ${editingState.type === 'road' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200'}`}
                            onClick={() => setEditingState({...editingState, type: 'road'})}
                        >
                            Jalan
                        </button>
                    </div>
                </div>

                {editingState.type === 'person' ? (
                    <div>
                        <label className="text-[10px] text-gray-500 block">Nama Tetangga</label>
                        <input 
                            type="text" 
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            value={editingState.text}
                            onChange={(e) => setEditingState({...editingState, text: e.target.value})}
                            placeholder="Contoh: Bpk. Budi"
                        />
                    </div>
                ) : (
                    <>
                    <div>
                        <label className="text-[10px] text-gray-500 block">Nama Jalan</label>
                        <input 
                            type="text" 
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            value={editingState.text}
                            onChange={(e) => setEditingState({...editingState, text: e.target.value})}
                            placeholder="Contoh: Jl. Mawar"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 block">Lebar Jalan (m)</label>
                        <input 
                            type="number" 
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                            value={editingState.roadWidth}
                            onChange={(e) => setEditingState({...editingState, roadWidth: e.target.value})}
                        />
                    </div>
                    </>
                )}

                <div>
                    <label className="text-xs text-gray-500 block">Panjang Sisi (m)</label>
                    <input 
                        type="number" 
                        step="0.1"
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        value={editingState.length}
                        onChange={(e) => setEditingState({...editingState, length: e.target.value})}
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <button 
                        type="button"
                        onClick={() => setEditingState(null)}
                        className="flex-1 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Batal
                    </button>
                    <button 
                        type="button"
                        onClick={applyChanges}
                        className="flex-1 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Simpan
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}
