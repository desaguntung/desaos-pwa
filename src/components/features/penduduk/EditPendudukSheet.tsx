"use client";

import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Sheet,
  SheetPortal,
  SheetOverlay,
} from "@/components/ui/Sheet";
import ResidentForm from "../../ResidentForm";
import { Resident, getResidentByNIK, updateResident } from "@/lib/services/penduduk";
import { toast } from "sonner";

interface EditPendudukSheetProps {
  nik: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditPendudukSheet({ 
  nik, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditPendudukSheetProps) {
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && nik) {
      fetchResident(nik);
    } else {
      setResident(null);
    }
  }, [open, nik]);

  const fetchResident = async (targetNik: string) => {
    try {
      setLoading(true);
      const data = await getResidentByNIK(targetNik);
      if (!data) {
        toast.error("Data penduduk tidak ditemukan");
        onOpenChange(false);
      } else {
        setResident(data);
      }
    } catch (err: any) {
      console.error("Error fetching resident:", err);
      toast.error("Gagal mengambil data penduduk");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Resident, "id">) => {
    if (!resident?.id) return;

    try {
      setIsSubmitting(true);
      await updateResident(resident.id, data);
      
      toast.success("Data penduduk berhasil diperbarui");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error updating resident:", error);
      toast.error(error.message || "Gagal memperbarui data penduduk");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
          className="fixed z-[100] gap-4 shadow-lg transition ease-in-out tailwind focus:outline-none data-[state=closed]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 inset-y-0 right-0 data-[state=open]:slide-in-from-right-5 data-[state=closed]:slide-out-to-right-10 m-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] overflow-hidden rounded-[1rem] bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800 p-0 lg:w-11/12 xl:w-5/6 xl:max-w-6xl sm:max-w-[auto]"
        >
          <DialogPrimitive.Title className="sr-only">Edit Penduduk</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Formulir untuk mengubah data penduduk
          </DialogPrimitive.Description>
          
          {/* Custom Close Button */}
          <DialogPrimitive.Close className="absolute top-4 right-4 z-50 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none">
            <span className="flex items-center justify-center">
                <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{ color: "currentColor" }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z" fill="currentColor"></path>
                </svg>
            </span>
          </DialogPrimitive.Close>

          {/* Content */}
          <div className="h-full w-full overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Memuat data...</span>
                </div>
              </div>
            ) : resident ? (
              <ResidentForm 
                mode="edit" 
                initialData={resident}
                onSubmit={handleFormSubmit} 
                isSubmitting={isSubmitting}
                embedded={true}
              />
            ) : null}
          </div>

        </DialogPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}
