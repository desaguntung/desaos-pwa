"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-md mx-auto md:mx-0">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
        <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Search className="w-5 h-5 text-zinc-400 ml-4" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Cari berita..."
            className="w-full py-3 px-4 bg-transparent border-none focus:ring-0 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 rounded-full focus:outline-none"
          />
          {value && (
            <button
              onClick={() => setValue("")}
              className="p-1 mr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
