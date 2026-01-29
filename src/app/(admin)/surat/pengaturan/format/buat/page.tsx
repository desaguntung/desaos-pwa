import Editor from "@/components/editor/Editor";
import { PageHeader } from "@/components/layout/PageHeader";

export default function FormatEditorPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-hidden">
      <PageHeader 
        title="Buat Format Surat" 
        subtitle="Surat / Pengaturan / Format / Buat"
        showBackButton={true}
        backButtonHref="/surat/pengaturan?tab=format"
      />
      <div className="flex-1 overflow-hidden">
        <Editor hideHeaderNavigation={true} />
      </div>
    </div>
  );
}
