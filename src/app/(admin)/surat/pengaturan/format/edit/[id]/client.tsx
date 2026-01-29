"use client";

import Editor from "@/components/editor/Editor";
import { updateFormatTemplate } from "@/actions/surat";
import { PageHeader } from "@/components/layout/PageHeader";

interface EditFormatClientProps {
  initialJson?: string;
  letterType: string;
  letterName: string;
  id: string;
}

export default function EditFormatClient({ 
  initialJson, 
  letterType, 
  letterName, 
  id 
}: EditFormatClientProps) {
  
  const handleSave = async (json: string) => {
    try {
      await updateFormatTemplate(id, json);
      // Success state is handled by the Editor Header component
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Gagal menyimpan template. Silakan coba lagi.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-hidden">
      <PageHeader 
        title={`Edit Format: ${letterName}`}
        subtitle="Surat / Pengaturan / Format / Edit"
        showBackButton={true}
        backButtonHref="/surat/pengaturan?tab=format"
      />
      <div className="flex-1 overflow-hidden">
        <Editor 
          initialJson={initialJson} 
          letterType={letterType} 
          letterName={letterName} 
          id={id} 
          onSave={handleSave}
          hideHeaderNavigation={true}
        />
      </div>
    </div>
  );
}
