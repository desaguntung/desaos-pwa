import { useEditor } from "@craftjs/core";
import { ArrowLeft, Save, Undo, Redo, Eye, Check, Code, ZoomIn, ZoomOut, Printer, PanelLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "../layout/SidebarContext";
import { cn } from "@/lib/utils";

export const Header = ({ 
  onSave, 
  zoom, 
  setZoom, 
  readOnly, 
  hideNavigation 
}: { 
  onSave?: (json: string) => Promise<void> | void; 
  zoom: number; 
  setZoom: (z: number | ((prev: number) => number)) => void; 
  readOnly?: boolean; 
  hideNavigation?: boolean; 
}) => {
  const { actions, query, enabled, canUndo, canRedo } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const { toggle } = useSidebar();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      const json = query.serialize();
      if (onSave) {
        await onSave(json);
      } else {
        console.log(json);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("idle");
    }
  };

  return (
    <header className="sticky top-0 bg-white/95 dark:bg-card-bg/95 backdrop-blur-sm border-b border-border-color z-20 flex items-center justify-between px-3 md:px-5 h-12 print:hidden transition-colors">
      {/* Left: Navigation / Title */}
      <div className="flex items-center gap-2">
        {!hideNavigation ? (
          <>
            <button 
              className="text-secondary-text md:hidden hover:bg-hover-bg p-1.5 rounded-md transition-colors" 
              onClick={toggle}
              aria-label="Toggle Menu"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Link
                href="/surat/pengaturan?tab=format"
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-hover-bg text-secondary-text hover:text-primary-text transition-colors"
                title="Kembali ke Pengaturan Format"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="h-4 w-px bg-border-color hidden sm:block"></div>
              <div>
                <h2 className="text-xs md:text-sm font-semibold text-primary-text">Editor Format Surat</h2>
                <div className="flex items-center gap-1 text-[11px] text-secondary-text">
                  <span className="hidden sm:inline">Surat</span>
                  <span className="hidden sm:inline text-secondary-text/50">/</span>
                  <span className="font-medium text-accent">Desain Format</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-secondary-text">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline text-primary-text font-semibold">Toolbar Naskah</span>
          </div>
        )}
      </div>

      {/* Center: Canvas Controls (Undo/Redo & Zoom) */}
      <div className="flex items-center gap-2">
        {!readOnly && (
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-border-color">
            <button 
              onClick={() => actions.history.undo()}
              disabled={!canUndo}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 text-secondary-text hover:text-primary-text disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Urungkan (Undo)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => actions.history.redo()}
              disabled={!canRedo}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 text-secondary-text hover:text-primary-text disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Ulangi (Redo)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-border-color">
          <button 
            onClick={() => setZoom((prev: number) => Math.max(50, prev - 10))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 text-secondary-text hover:text-primary-text transition-all"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            title="Reset Zoom ke 100%"
            className="text-[11px] font-medium text-secondary-text hover:text-primary-text px-1.5 min-w-[38px] text-center"
          >
            {zoom}%
          </button>
          <button 
            onClick={() => setZoom((prev: number) => Math.min(150, prev + 10))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 text-secondary-text hover:text-primary-text transition-all"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Mode & Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {readOnly ? (
          <button 
            onClick={handlePrint}
            className="h-8 px-3 rounded-lg flex items-center gap-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        ) : (
          <>
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-border-color">
              <button 
                onClick={() => actions.setOptions((options) => (options.enabled = true))}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  enabled ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary-text' : 'text-secondary-text hover:text-primary-text'
                )}
                title="Mode Desain / Edit"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button 
                onClick={() => actions.setOptions((options) => (options.enabled = false))}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  !enabled ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary-text' : 'text-secondary-text hover:text-primary-text'
                )}
                title="Mode Pratinjau Dokumen"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pratinjau</span>
              </button>
            </div>

            <button 
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className={cn(
                "h-8 px-3.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 disabled:opacity-60",
                saveStatus === "saved" 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              )}
            >
              {saveStatus === "saved" ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tersimpan</span>
                </>
              ) : saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
