"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface FormDraftOptions<T> {
  key: string;
  initialData: T;
  enabled?: boolean;
  debounceMs?: number;
  onRestore?: (restoredData: T) => void;
}

export function useFormDraft<T extends Record<string, any>>({
  key,
  initialData,
  enabled = true,
  debounceMs = 800,
  onRestore,
}: FormDraftOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `desaos_draft_${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data && parsed.updatedAt) {
          setHasDraft(true);
          setDraftTimestamp(parsed.updatedAt);
        }
      }
    } catch (e) {
      console.error("Error reading form draft from localStorage:", e);
    }
  }, [enabled, storageKey]);

  // Save draft debounced
  const saveDraft = useCallback(
    (currentData: T) => {
      if (!enabled || typeof window === "undefined") return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const payload = {
            data: currentData,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(payload));
          setHasDraft(true);
        } catch (e) {
          console.error("Error saving form draft:", e);
        }
      }, debounceMs);
    },
    [enabled, storageKey, debounceMs]
  );

  // Restore draft
  const restoreDraft = useCallback((): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data) {
          if (onRestore) onRestore(parsed.data);
          toast.success("Draf formulir berhasil dipulihkan.");
          return parsed.data;
        }
      }
    } catch (e) {
      console.error("Error restoring form draft:", e);
      toast.error("Gagal memulihkan draf formulir.");
    }
    return null;
  }, [storageKey, onRestore]);

  // Discard / Clear draft
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setDraftTimestamp(null);
    } catch (e) {
      console.error("Error clearing form draft:", e);
    }
  }, [storageKey]);

  return {
    hasDraft,
    draftTimestamp,
    saveDraft,
    restoreDraft,
    clearDraft,
  };
}
