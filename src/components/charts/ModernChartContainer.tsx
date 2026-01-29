import { useState } from "react";
import { 
    ResponsiveContainer, 
    Treemap, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis,
    Legend,
    ComposedChart,
    Scatter,
    CartesianGrid,
    Rectangle
} from "recharts";
import { 
    LayoutGrid, 
    Circle, 
    List, 
    Info, 
    Grid3X3, 
    GitCommitHorizontal, 
    Flower2, 
    Eye, 
    EyeOff 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface StatRow {
  id: string | number;
  label: string;
  key: string;
  total: number;
  totalPercent: number;
  male: number;
  malePercent: number;
  female: number;
  femalePercent: number;
}

interface ModernChartContainerProps {
    data: StatRow[];
    category: string;
}

type ChartMode = "treemap" | "sunburst" | "capsule" | "waffle" | "dumbbell" | "rose";

const COLORS = [
  'var(--chart-1)', 
  'var(--chart-2)', 
  'var(--chart-3)', 
  'var(--chart-4)', 
  'var(--chart-5)', 
  'var(--chart-6)', 
  'var(--chart-7)', 
  'var(--chart-8)'
];

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        // Handle different payload structures
        // For Dumbbell, payload might be slightly different depending on which element triggered it
        // But usually payload[0].payload has the full data object if mapped correctly.
        
        return (
            <div className="bg-card-bg border border-border-color p-3 rounded-xl shadow-lg text-xs z-50 relative dark:bg-zinc-900 dark:border-zinc-800">
                <p className="font-semibold text-primary-text mb-1">{data.label || data.name || label}</p>
                <div className="space-y-1">
                    <p className="text-secondary-text flex justify-between gap-4">
                        <span>Total:</span>
                        <span className="font-medium text-primary-text">{data.total ?? data.value}</span>
                    </p>
                    {data.male !== undefined && (
                        <p className="text-blue-500 flex justify-between gap-4">
                            <span>Laki-laki:</span>
                            <span className="font-medium">{data.male}</span>
                        </p>
                    )}
                    {data.female !== undefined && (
                        <p className="text-pink-500 flex justify-between gap-4">
                            <span>Perempuan:</span>
                            <span className="font-medium">{data.female}</span>
                        </p>
                    )}
                     {data.malePercent !== undefined && (
                        <div className="pt-1 mt-1 border-t border-border-color flex gap-2 text-[10px] text-secondary-text">
                             <span>L: {data.malePercent?.toFixed(1)}%</span>
                             <span>P: {data.femalePercent?.toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const CustomizedTreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value } = props;
    
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? `var(--chart-${(index % 8) + 1})` : "none",
                    stroke: "var(--card-bg)",
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > 50 && height > 30 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    className="fill-white dark:fill-zinc-50 font-medium text-[10px]"
                    style={{ pointerEvents: "none" }}
                >
                    {name}
                </text>
            )}
        </g>
    );
};

// --- Sub-Chart Components ---

const WaffleChart = ({ data }: { data: StatRow[] }) => {
    // Calculate total to normalize to 100 blocks
    const total = data.reduce((acc, curr) => acc + curr.total, 0);
    
    // Generate 100 blocks based on percentage
    let blocks: { color: string, label: string, opacity: number, value: number, percent: string }[] = [];
    
    data.forEach((item, index) => {
        const count = Math.round((item.total / total) * 100);
        for (let i = 0; i < count; i++) {
            if (blocks.length < 100) {
                blocks.push({
                    color: `var(--chart-${(index % 8) + 1})`,
                    label: item.label,
                    opacity: 1,
                    value: item.total,
                    percent: ((item.total/total)*100).toFixed(1)
                });
            }
        }
    });

    // Fill remaining if rounding down left gaps
    while (blocks.length < 100) {
        blocks.push({ color: "var(--border-color)", label: "Other", opacity: 0.5, value: 0, percent: "0" });
    }
    // Trim if rounding up exceeded
    blocks = blocks.slice(0, 100);

    return (
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full max-w-[300px] sm:max-w-[350px] aspect-square">
                {blocks.map((block, i) => (
                    <div 
                        key={i}
                        className="w-full h-full rounded-[2px] sm:rounded-sm transition-all hover:scale-110 hover:shadow-sm cursor-help relative group"
                        style={{ backgroundColor: block.color, opacity: block.opacity }}
                    >
                         {/* Simple CSS Tooltip */}
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 min-w-[120px]">
                            <div className="bg-card-bg text-primary-text border border-border-color text-[10px] rounded px-2 py-1 shadow-xl whitespace-nowrap dark:bg-zinc-900 dark:border-zinc-800">
                                <div className="font-semibold">{block.label}</div>
                                <div className="text-secondary-text">Total: {block.value} ({block.percent}%)</div>
                            </div>
                            {/* Arrow */}
                            <div className="w-2 h-2 bg-card-bg border-r border-b border-border-color rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1 dark:bg-zinc-900 dark:border-zinc-800"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DumbbellChart = ({ data }: { data: StatRow[] }) => {
    // Prepare data
    const chartData = data.map(d => {
        const min = Math.min(d.male, d.female);
        const max = Math.max(d.male, d.female);
        return {
            ...d,
            minVal: min,
            gap: max - min,
            maxVal: max
        };
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="label" 
                    type="category" 
                    width={80}
                    tick={{ fontSize: 10, fill: 'var(--secondary-text)' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-color)', opacity: 0.5 }} />
                
                {/* The Line */}
                <Bar dataKey="minVal" stackId="a" fill="transparent" barSize={2} />
                <Bar dataKey="gap" stackId="a" fill="var(--secondary-text)" barSize={2} radius={[2, 2, 2, 2]} />

                {/* The Dots */}
                <Scatter dataKey="male" name="Laki-laki" fill="var(--chart-1)" shape={<Circle r={4} />} />
                <Scatter dataKey="female" name="Perempuan" fill="var(--chart-2)" shape={<Circle r={4} />} />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

const RoseChart = ({ data }: { data: StatRow[] }) => {
    const maxTotal = Math.max(...data.map(d => d.total));
    const sliceAngle = 360 / data.length;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip content={<CustomTooltip />} />
                {data.map((entry, index) => {
                    const startAngle = 90 - (index * sliceAngle);
                    const endAngle = startAngle - sliceAngle;
                    const radiusPercent = 20 + ((entry.total / maxTotal) * 70); 
                    
                    return (
                        <Pie
                            key={entry.key}
                            data={[entry]}
                            cx="50%"
                            cy="50%"
                            startAngle={startAngle}
                            endAngle={endAngle}
                            innerRadius={0}
                            outerRadius={`${radiusPercent}%`}
                            fill={`var(--chart-${(index % 8) + 1})`}
                            dataKey="total"
                            nameKey="label"
                            stroke="var(--card-bg)"
                            strokeWidth={1}
                            cornerRadius={4}
                            paddingAngle={0}
                        >
                            <Cell fill={`var(--chart-${(index % 8) + 1})`} />
                        </Pie>
                    );
                })}
                 <Pie 
                    data={[{ value: 1 }]} 
                    cx="50%" cy="50%" 
                    innerRadius={0} 
                    outerRadius="10%" 
                    fill="var(--card-bg)" 
                    dataKey="value" 
                    isAnimationActive={false} 
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export function ModernChartContainer({ data, category }: ModernChartContainerProps) {
    const [mode, setMode] = useState<ChartMode>("capsule");
    const [isOpen, setIsOpen] = useState(false);

    // Transform data for Treemap
    const treemapData = [
        {
            name: category,
            children: data.map(item => ({
                name: item.label,
                size: item.total, 
                value: item.total,
                ...item
            }))
        }
    ];

    // For Sunburst
    const pieData = data.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length]
    }));

    const renderChart = () => {
        switch(mode) {
            case "treemap":
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={treemapData}
                            dataKey="value"
                            stroke="var(--card-bg)"
                            fill="var(--accent)"
                            content={<CustomizedTreemapContent />}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer>
                );
            case "sunburst":
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius="55%"
                                outerRadius="75%"
                                paddingAngle={2}
                                dataKey="total"
                                nameKey="label"
                                stroke="var(--card-bg)"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 8) + 1})`} strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            {/* Center Text */}
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="var(--primary-text)" className="font-bold text-xl sm:text-2xl dark:fill-zinc-100">
                                {data.reduce((acc, curr) => acc + curr.total, 0)}
                            </text>
                            <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="var(--secondary-text)" className="text-[10px] sm:text-xs font-medium dark:fill-zinc-400">
                                Total
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                );
            case "waffle":
                return <WaffleChart data={data} />;
            case "dumbbell":
                return <DumbbellChart data={data} />;
            case "rose":
                return <RoseChart data={data} />;
            case "capsule":
            default:
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            barSize={16}
                        >
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="label" 
                                width={80} 
                                tick={{ fontSize: 10, fill: 'var(--secondary-text)' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                cursor={{ fill: 'var(--border-color)', radius: 4 }}
                                content={<CustomTooltip />}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="var(--accent)" 
                                radius={[8, 8, 8, 8]}
                                background={{ fill: 'var(--border-color)', radius: 8 }}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 8) + 1})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800">
            {/* Header & Toggle */}
            <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-800/50 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Visualisasi Data</span>
                </div>
                
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        isOpen 
                            ? "bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700" 
                            : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    )}
                >
                    {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isOpen ? "Sembunyikan Grafik" : "Tampilkan Grafik"}</span>
                </button>
            </div>

            {/* Collapsible Content */}
            <div 
                className={cn(
                    "grid transition-[grid-template-rows] duration-500 ease-in-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div className="overflow-hidden min-h-0">
                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b border-zinc-200 bg-white flex justify-center dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="flex items-center bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-x-auto max-w-full no-scrollbar">
                            <button onClick={() => setMode("treemap")} className={cn("p-2 rounded-md transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", mode === "treemap" && "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400 shadow-sm")} title="Treemap"><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setMode("sunburst")} className={cn("p-2 rounded-md transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", mode === "sunburst" && "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400 shadow-sm")} title="Sunburst"><Circle className="w-4 h-4" /></button>
                            <button onClick={() => setMode("capsule")} className={cn("p-2 rounded-md transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", mode === "capsule" && "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400 shadow-sm")} title="Capsule"><List className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-zinc-200 mx-1 shrink-0 dark:bg-zinc-700" />
                            <button onClick={() => setMode("waffle")} className={cn("p-2 rounded-md transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", mode === "waffle" && "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400 shadow-sm")} title="Waffle Chart"><Grid3X3 className="w-4 h-4" /></button>
                            <button onClick={() => setMode("dumbbell")} className={cn("p-2 rounded-md transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", mode === "dumbbell" && "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400 shadow-sm")} title="Dumbbell Plot"><GitCommitHorizontal className="w-4 h-4" /></button>
                            <button onClick={() => setMode("rose")} className={cn("p-2 rounded-md transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100", mode === "rose" && "bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400 shadow-sm")} title="Rose Chart"><Flower2 className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="h-[350px] sm:h-[400px] w-full p-2 sm:p-6 relative bg-white flex items-center justify-center dark:bg-zinc-900">
                        {renderChart()}
                    </div>
                </div>
            </div>
        </div>
    );
}
