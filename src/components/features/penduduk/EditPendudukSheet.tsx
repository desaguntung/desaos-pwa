"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
      <SheetContent className="w-full sm:max-w-3xl flex flex-col h-full p-0 gap-0 bg-card-bg">
        <SheetHeader className="px-6 py-4 border-b border-border-color">
          <SheetTitle>Edit Penduduk</SheetTitle>
          <SheetDescription>
            Perbarui data penduduk yang terdaftar
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-text"></div>
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
      </SheetContent>
    </Sheet>
  );
}
