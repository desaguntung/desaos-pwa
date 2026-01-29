import React from "react";
import { useEditor } from "@craftjs/core";
import { Settings } from "lucide-react";

export const SettingsPanel = () => {
  const { selected, actions } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected;
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
    };
  });

  return (
    <div className="w-72 bg-white border-l border-zinc-200 flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="p-4 border-b border-zinc-100 bg-white sticky top-0 z-10 flex justify-between items-center h-[57px]">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Properties</h3>
        <Settings className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {selected ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {selected.name}
              </span>
              {selected.isDeletable && (
                <button
                  onClick={() => {
                    actions.delete(selected.id);
                  }}
                  className="text-[10px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {selected.settings && React.createElement(selected.settings)}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
              <Settings className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="text-xs text-center max-w-[150px]">Select an element on the canvas to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
};
