import { useEditor } from "@craftjs/core";
import { ArrowLeft, Save, Undo, Redo, Eye, Check, Code, ZoomIn, ZoomOut, Printer, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "../layout/SidebarContext";
import { cn } from "@/lib/utils";

export const Header = ({ onSave, zoom, setZoom, readOnly, hideNavigation }: { onSave?: (json: string) => void, zoom: number, setZoom: (z: number) => void, readOnly?: boolean, hideNavigation?: boolean }) => {
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

  const handleSave = () => {
    setSaveStatus("saving");
    const json = query.serialize();
    if (onSave) {
      onSave(json);
      setTimeout(() => setSaveStatus("saved"), 500);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      console.log(json);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  return (
    <header className="sticky top-0 bg-white border-b border-zinc-200 z-30 flex items-center justify-between px-4 md:px-6 h-16 print:hidden">
      {/* Left: Navigation & Title */}
      <div className="flex items-center gap-3">
        {!hideNavigation && (
          <button 
            className="text-zinc-500 md:hidden hover:bg-zinc-100 p-1 rounded-md transition-colors" 
            onClick={toggle}
            aria-label="Toggle Menu"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {!hideNavigation && (
          <div className="flex items-center gap-3">
            <Link
              href="/surat/pengaturan"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Format Surat Editor</h2>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <span className="hidden sm:inline">Surat</span>
                <span className="hidden sm:inline text-zinc-300">/</span>
                <span className="font-medium">Editor</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Canvas Controls (Undo/Redo & Zoom) - Hidden on mobile if needed, or condensed */}
      <div className="hidden md:flex items-center gap-2">
         <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/50">
            <button 
              onClick={() => actions.history.undo()}
              disabled={!canUndo}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => actions.history.redo()}
              disabled={!canRedo}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
         </div>

         <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200/50">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-zinc-500 hover:text-zinc-900 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-medium text-zinc-600 w-8 text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-zinc-500 hover:text-zinc-900 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
         </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {readOnly ? (
          <button 
            onClick={handlePrint}
            className="h-8 px-3 rounded-md flex items-center gap-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        ) : (
          <>
            <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-200/50">
                <button 
                    onClick={() => actions.setOptions((options) => (options.enabled = true))}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                      enabled ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                    )}
                >
                    <Code className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                </button>
                <button 
                    onClick={() => actions.setOptions((options) => (options.enabled = false))}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                      !enabled ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                    )}
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                </button>
            </div>

            <button 
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className={cn(
                "h-8 px-3 rounded-md flex items-center gap-2 text-xs font-medium text-white transition-all shadow-sm",
                saveStatus === "saved" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-900 hover:bg-zinc-800"
              )}
            >
              {saveStatus === "saved" ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {saveStatus === "saving" ? (
                    <span className="hidden sm:inline">Saving...</span>
                  ) : (
                    <span className="hidden sm:inline">Save</span>
                  )}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
