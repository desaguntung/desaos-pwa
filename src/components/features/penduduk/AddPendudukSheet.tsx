"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/Sheet";
import ResidentForm from "../../ResidentForm";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Resident } from "@/lib/services/penduduk";
import { toast } from "sonner";

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
        toast.error("NIK sudah terdaftar dalam sistem!");
        setIsSubmitting(false);
        return;
      }

      // Insert data
      const { error } = await supabase.from("penduduk").insert({
        ...data,
        status_penduduk: "TETAP",
      });

      if (error) throw error;

      toast.success(`Data penduduk "${data.nama}" berhasil disimpan`);
      setOpen(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Gagal menyimpan data penduduk");
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
            className="h-9 gap-2 px-3 text-sm font-medium shadow-sm rounded-md transition-all active:scale-95 flex items-center justify-center"
          >
             <span>Add New</span>
             <ChevronDown className="h-4 w-4 text-slate-400" />
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-3xl flex flex-col h-full p-0 gap-0 bg-white dark:bg-zinc-900">
        <SheetHeader className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <SheetTitle>Tambah Penduduk</SheetTitle>
          <SheetDescription>
            Lengkapi data penduduk di bawah ini
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
           <ResidentForm 
             mode="create" 
             onSubmit={handleFormSubmit} 
             isSubmitting={isSubmitting}
             embedded={true}
           />
        </div>
      </SheetContent>
    </Sheet>
  );
}
