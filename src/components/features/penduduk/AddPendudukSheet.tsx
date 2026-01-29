"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetTrigger,
  SheetPortal,
  SheetOverlay,
} from "@/components/ui/Sheet";
import ResidentForm from "../../ResidentForm";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident } from "@/lib/services/penduduk";

export default function AddPendudukSheet({ onSuccess, trigger }: { onSuccess?: () => void, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: Omit<Resident, "id">) => {
    try {
      setIsSubmitting(true);
      const supabase = createSupabaseBrowserClient();
      
      // Check for existing NIK
      const { data: existing } = await supabase
        .from("penduduk")
        .select("id")
        .eq("nik", data.nik)
        .single();
        
      if (existing) {
        alert("NIK sudah terdaftar!");
        setIsSubmitting(false);
        return;
      }

      // Insert data
      const { error } = await supabase.from("penduduk").insert({
        ...data,
        status_penduduk: "TETAP",
      });

      if (error) throw error;

      setOpen(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error saving:", error);
      alert(error.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ? trigger : (
          <Button 
            size="sm" 
            className="h-9 gap-2 px-3 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-md transition-all active:scale-95 flex items-center justify-center"
          >
             <span>Add New</span>
             <ChevronDown className="h-4 w-4 text-slate-400" />
          </Button>
        )}
      </SheetTrigger>
      
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
          className="fixed z-[100] gap-4 shadow-lg transition ease-in-out tailwind focus:outline-none data-[state=closed]:duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 inset-y-0 right-0 data-[state=open]:slide-in-from-right-5 data-[state=closed]:slide-out-to-right-10 m-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] overflow-hidden rounded-[1rem] bg-white dark:bg-zinc-900 p-0 lg:w-11/12 xl:w-5/6 xl:max-w-6xl sm:max-w-[auto]"
        >
          <DialogPrimitive.Title className="sr-only">Tambah Penduduk</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Formulir untuk menambahkan data penduduk baru
          </DialogPrimitive.Description>
          {/* Custom Close Button from User */}
          <DialogPrimitive.Close className="absolute top-4 right-4 z-50 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none">
            <span className="flex items-center justify-center">
                <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{ color: "currentColor" }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z" fill="currentColor"></path>
                </svg>
            </span>
          </DialogPrimitive.Close>

          {/* Form Content */}
          <div className="h-full w-full overflow-hidden">
             <ResidentForm 
               mode="create" 
               onSubmit={handleFormSubmit} 
               isSubmitting={isSubmitting}
               embedded={true}
             />
          </div>

        </DialogPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}
