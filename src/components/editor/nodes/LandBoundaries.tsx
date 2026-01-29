import { useNode, useEditor } from "@craftjs/core";
import { useState, useEffect } from "react";

// Helper to calculate distance between points
const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const LandBoundaries = () => {
  const { connectors: { connect, drag } } = useNode();
  
  // Robustly find LandSketch node and subscribe to its state
  const { landSketchData, actions } = useEditor((state) => {
    // Find a node that looks like LandSketch
    const nodeId = Object.keys(state.nodes).find(id => {
        const node = state.nodes[id];
        return (
            node.data.displayName === "Sketsa Tanah" || 
            node.data.displayName === "LandSketch" || 
            node.data.name === "LandSketch" ||
            (node.data.type as any)?.name === "LandSketch"
        );
    });

    if (!nodeId) return { landSketchData: null };
    
    return {
        landSketchData: {
            id: nodeId,
            props: state.nodes[nodeId].data.props
        }
    };
  });

  const landSketchNodeId = landSketchData?.id;

  if (!landSketchNodeId || !landSketchData?.props) {
    return (
        <div 
            ref={ref => { if (ref) connect(drag(ref)); }} 
            className="p-4 border border-dashed border-zinc-300 rounded-lg text-center text-xs text-zinc-500 bg-zinc-50"
        >
            <p className="font-medium">Widget Data Batas Tanah</p>
            <p>Silakan tambahkan widget "Sketsa Tanah" terlebih dahulu.</p>
        </div>
    );
  }

  const { points, labels, scale } = landSketchData.props;

  // Group edges by direction
  const directions = {
    'Utara': [] as any[],
    'Timur': [] as any[],
    'Selatan': [] as any[],
    'Barat': [] as any[]
  };

  points.forEach((p1: any, i: number) => {
    const p2 = points[(i + 1) % points.length];
    
    // Calculate Outside Normal Vector
    // Edge vector
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // Outside Normal (assuming clockwise points order where inside is right)
    // Actually LandSketch assumes clockwise winding.
    // Top edge (Left->Right): Normal points Down (Inside). Outside is Up.
    // Vector (dx, dy). Outside Normal is (dy, -dx).
    
    const angle = Math.atan2(-dx, dy) * 180 / Math.PI;
    
    let dir = '';
    if (angle >= -135 && angle < -45) dir = 'Utara';
    else if (angle >= -45 && angle < 45) dir = 'Timur';
    else if (angle >= 45 && angle < 135) dir = 'Selatan';
    else dir = 'Barat';

    const labelObj = labels.find((l: any) => l.edgeIndex === i);
    const distPx = distance(p1, p2);
    const distM = (distPx / scale).toFixed(1);

    directions[dir as keyof typeof directions].push({
        index: i,
        text: labelObj?.text || (labelObj?.type === 'road' ? 'Jalan' : ''),
        length: distM,
        p1,
        p2
    });
  });

  // Handle Update
  const handleUpdate = (index: number, field: 'text' | 'length', value: string) => {
    const newLabels = [...labels];
    const existingIndex = newLabels.findIndex(l => l.edgeIndex === index);
    
    if (field === 'text') {
        const labelData = existingIndex >= 0 ? { ...newLabels[existingIndex], text: value } : { edgeIndex: index, text: value, type: 'person' };
        if (existingIndex >= 0) newLabels[existingIndex] = labelData;
        else newLabels.push(labelData);
        
        actions.setProp(landSketchNodeId, (props: any) => {
            props.labels = newLabels;
        });
    } else if (field === 'length') {
        const targetLengthM = parseFloat(value);
        if (isNaN(targetLengthM) || targetLengthM <= 0) return;

        // Geometry update logic
        const p1 = points[index];
        const p2 = points[(index + 1) % points.length];
        const currentDist = distance(p1, p2);
        const targetDistPx = targetLengthM * scale;
        
        if (Math.abs(currentDist - targetDistPx) > 1) {
             const dx = p2.x - p1.x;
             const dy = p2.y - p1.y;
             const ratio = targetDistPx / currentDist;
             
             const newP2 = {
                 x: p1.x + dx * ratio,
                 y: p1.y + dy * ratio
             };
             
             const newPoints = [...points];
             newPoints[(index + 1) % points.length] = newP2;
             
             actions.setProp(landSketchNodeId, (props: any) => {
                 props.points = newPoints;
             });
        }
    }
  };

  return (
    <div 
        ref={ref => { if (ref) connect(drag(ref)); }} 
        className="w-full bg-transparent px-4 py-2"
        style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            color: 'inherit'
        }}
    >
        {['Utara', 'Selatan', 'Barat', 'Timur'].map((dir) => {
            const edges = directions[dir as keyof typeof directions];
            if (edges.length === 0) return null;

            return (
                <div key={dir} className="w-full flex items-start gap-4 mb-2">
                    <div className="w-20 font-bold shrink-0">{dir}</div>
                    <div className="shrink-0">:</div>
                    <div className="flex-1 flex flex-col gap-1 w-full min-w-0">
                        {edges.map((edge, idx) => (
                            <div key={edge.index} className="flex items-end w-full gap-2">
                                <span className="whitespace-nowrap shrink-0">berbatas dengan</span>
                                <input 
                                    type="text" 
                                    value={edge.text} 
                                    onChange={(e) => handleUpdate(edge.index, 'text', e.target.value)}
                                    placeholder="Tanah Milik..."
                                    className="px-1 focus:outline-none focus:border-blue-500 bg-transparent shrink-0"
                                    style={{ 
                                        fontFamily: 'inherit', 
                                        fontSize: 'inherit', 
                                        width: 'auto',
                                        minWidth: '100px'
                                    }}
                                />
                                <div className="flex-1 border-b-2 border-dotted border-gray-400 mb-1.5 min-w-[20px]" />
                                <div className="flex items-center shrink-0">
                                    <input 
                                        type="number" 
                                        value={edge.length}
                                        onChange={(e) => handleUpdate(edge.index, 'length', e.target.value)}
                                        className="px-1 w-16 text-right focus:outline-none focus:border-blue-500 bg-transparent"
                                        style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                                    />
                                    <span className="ml-1">m</span>
                                </div>
                                {idx < edges.length - 1 && <span className="mx-1 hidden">,</span>}
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
    </div>
  );
};

LandBoundaries.craft = {
  displayName: "Batas Tanah",
  props: {},
  related: {
    // settings: LandBoundariesSettings
  }
};
