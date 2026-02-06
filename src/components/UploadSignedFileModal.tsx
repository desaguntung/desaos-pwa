import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadSignedSurat } from "@/lib/services/surat";

interface UploadSignedFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratId: number | null;
  onSuccess: () => void;
}

export function UploadSignedFileModal({ isOpen, onClose, suratId, onSuccess }: UploadSignedFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !suratId) return;

    try {
      setIsUploading(true);
      await uploadSignedSurat(suratId, file);
      toast.success("Dokumen berhasil diupload");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Gagal mengupload dokumen: " + (error.message || "Unknown error") + (error.error ? " - " + error.error : ""));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Dokumen Tanda Tangan</DialogTitle>
          <DialogDescription>
            Upload dokumen surat yang telah ditandatangani oleh Kepala Desa (Scan Basah atau BSrE). Maksimal ukuran file 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div 
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer
              ${dragActive ? "border-accent bg-accent/10" : "border-border-color hover:border-primary-text bg-card-bg"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {file ? (
              <div className="flex items-center gap-2 text-primary-text">
                <FileText className="w-8 h-8 text-accent" />
                <div className="text-sm font-medium max-w-[200px] truncate">{file.name}</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 hover:bg-hover-bg rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-zinc-500">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Klik atau drag file ke sini</p>
                <p className="text-xs text-zinc-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            )}
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload & Selesai"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
