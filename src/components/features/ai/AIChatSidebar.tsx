import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, X, ChevronRight, Check, Link as LinkIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ChatMessage, chatWithAI } from "@/lib/services/ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { scrapeUrl } from "@/app/actions/scrape";

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (title: string, content: string, coverImage?: string) => void;
  onInsertImage?: (imageUrl: string) => void;
  currentContent: string;
}

interface DraftData {
  type: "draft";
  title: string;
  content: string;
  photo_suggestions: string[];
}

export default function AIChatSidebar({ isOpen, onClose, onApplyDraft, onInsertImage, currentContent }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Halo! Saya siap membantu. Pilih menu di bawah atau ketik langsung topik berita Anda."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerMode, setImagePickerMode] = useState<'cover' | 'content'>('cover');
  const [scrapedData, setScrapedData] = useState<{url: string, title: string, content: string, images?: string[]} | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    // Check for URLs
    const urlMatch = textToSend.match(/(https?:\/\/[^\s]+)/g);
    let scrapedContext = "";

    if (urlMatch && urlMatch[0]) {
      const toastId = toast.loading("Sedang membaca konten dari link...");
      try {
        const result = await scrapeUrl(urlMatch[0]);
        // If we have content OR at least a title, we proceed.
        // Some sites might block content scraping but we can still get title/images.
        if (result.content || result.title) {
          // Prepare context but WAIT for image selection if images exist
          const baseContext = `\n\n[SUMBER BERITA EKSTERNAL DARI LINK]\nURL: ${result.url}\nJUDUL: ${result.title}\nISI: ${result.content || "(Konten teks tidak dapat diekstrak sepenuhnya, silakan kembangkan berita berdasarkan Judul dan Gambar yang ada)"}\nGAMBAR TERSEDIA: ${result.images.join(", ")}\n\nINSTRUKSI: Tulis ulang berita di atas agar unik, tidak plagiat, tambahkan konteks desa jika perlu, dan gunakan gambar yang tersedia jika relevan.`;
          
          if (result.images.length > 0) {
            // STOP HERE! Show image picker and wait for user.
            setScrapedImages(result.images);
            setImagePickerMode('cover');
            setShowImagePicker(true);
            setScrapedData({
              url: result.url,
              title: result.title,
              content: baseContext,
              images: result.images
            });
            
            // Do NOT call AI yet. Wait for user to pick image.
            setMessages(prev => [...prev, { 
              role: "assistant", 
              content: `Saya menemukan **${result.images.length} gambar** dari link tersebut. \n\nSilakan **Pilih Gambar Cover** di atas untuk melanjutkan pembuatan berita.` 
            }]);
            
            toast.success("Link terbaca! Silakan pilih cover.", { id: toastId });
            setIsLoading(false);
            return;
          }
          
          // If no images, proceed immediately
          scrapedContext = baseContext;
          setSourceUrl(result.url);
          toast.success("Berhasil membaca link!", { id: toastId });
        } else {
          toast.error("Gagal membaca link, melanjutkan tanpa konteks link.", { id: toastId });
        }
      } catch (e) {
        console.error(e);
        toast.error("Gagal memproses link.", { id: toastId });
      }
    }

    const response = await chatWithAI([...messages, userMessage], currentContent + scrapedContext);

    if (response.error) {
      toast.error(response.error);
    } else if (response.content) {
      setMessages(prev => [...prev, { role: "assistant", content: response.content! }]);
    }

    setIsLoading(false);
  };

  const extractDraft = (content: string): { text: string, draft: DraftData | null } => {
    // Relaxed regex to match ```json ... ``` or just ``` ... ``` or even bare JSON if it looks like one
    let jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/);
    let jsonString = jsonMatch ? jsonMatch[1] : null;
    
    // Fallback: try to find a JSON object starting with { "type": "draft"
    if (!jsonString) {
       const rawMatch = content.match(/({[\s\S]*"type"\s*:\s*"draft"[\s\S]*})/);
       if (rawMatch) {
         jsonString = rawMatch[1];
         // If we matched raw JSON, the text is everything BEFORE the JSON
         const parts = content.split(rawMatch[0]);
         return { text: parts[0].trim(), draft: parseDraft(jsonString) };
       }
    }

    if (jsonString) {
      const draft = parseDraft(jsonString);
      if (draft) {
        const text = content.replace(jsonMatch ? jsonMatch[0] : jsonString, "").trim();
        return { text, draft };
      }
    }
    return { text: content, draft: null };
  };

  const parseDraft = (jsonString: string): DraftData | null => {
    try {
      const draft = JSON.parse(jsonString);
      if (draft.type === "draft") return draft;
    } catch (e) {
      // Retry with sanitized string
      try {
        const sanitized = jsonString.replace(/[\u0000-\u001F]+/g, " ");
        const draft = JSON.parse(sanitized);
        if (draft.type === "draft") return draft;
      } catch (e2) {
        console.error("Failed to parse draft JSON", e2);
      }
    }
    return null;
  };

  const handleImageSelect = async (img: string) => {
    setShowImagePicker(false);
    
    // Add hidden instruction message
    const instructionMsg: ChatMessage = { 
      role: "user", 
      content: `[INSTRUKSI OTOMATIS: Saya memilih gambar ini sebagai Cover: ${img}. Silakan buat berita lengkap sekarang.]` 
    };
    
    setMessages(prev => [...prev, instructionMsg]);
    setIsLoading(true);

    // Combine previous context with specific image instruction
    // IMPORTANT: Clear currentContent to avoid duplication! We want a fresh start based on the scraped content.
    const fullContext = (scrapedData?.content || "") + `\n\n[PILIHAN GAMBAR USER: ${img}]`;
    
    // We send empty string as currentArticleContext to prevent AI from seeing the old content and duplicating it.
    const response = await chatWithAI([...messages, instructionMsg], fullContext);

    if (response.error) {
      toast.error(response.error);
    } else if (response.content) {
      setMessages(prev => [...prev, { role: "assistant", content: response.content! }]);
    }
    
    setIsLoading(false);
    setScrapedData(null); // Reset
  };

  if (!isOpen) return null;

  return (
    <div className="w-[340px] bg-zinc-50 border-l border-zinc-200 flex flex-col h-full shrink-0 relative">
          {/* Image Picker Overlay */}
      {showImagePicker && scrapedImages.length > 0 && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Pilih Gambar Cover
            </h3>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
              setShowImagePicker(false);
              // If closed without selection, ask user to continue manually
              setMessages(prev => [...prev, { role: "assistant", content: "Anda menutup pemilih gambar. Silakan ketik instruksi manual jika ingin melanjutkan." }]);
            }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mb-3">
            Klik gambar untuk menjadikannya Cover Utama berita.
          </p>
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="grid grid-cols-2 gap-2 pb-4">
              {scrapedImages.map((img, i) => (
                <div key={i} className="group relative aspect-video bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all"
                  onClick={() => handleImageSelect(img)}
                >
                  <img src={img} alt={`Scraped ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Pilih Cover
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Close Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6 text-zinc-400 hover:text-zinc-600 z-10" 
        onClick={onClose}
      >
        <X className="w-3.5 h-3.5" />
      </Button>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const { text, draft } = extractDraft(msg.content);
          const isUser = msg.role === "user";

          return (
            <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <div className={`max-w-[90%] text-xs leading-relaxed ${
                isUser 
                  ? "text-zinc-800 bg-white border border-zinc-200 px-3 py-2 rounded-lg shadow-sm" 
                  : "text-zinc-600"
              }`}>
                {text && (
                  <div className="prose prose-xs max-w-none prose-p:my-1 prose-headings:my-2 dark:prose-invert break-words">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                )}
                
                {draft && (
                  <div className="mt-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-sm space-y-2">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-[10px] uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Draf Berita
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-900 text-xs line-clamp-2">{draft.title}</p>
                      <p className="text-zinc-400 text-[10px] line-clamp-3">
                        {draft.content.replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>
                    
                    {draft.photo_suggestions && draft.photo_suggestions.length > 0 && (
                      <div className="text-[10px] text-zinc-500 bg-zinc-50 p-2 rounded border border-zinc-100">
                        <span className="font-medium text-zinc-700">Saran Foto:</span>
                        <ul className="list-disc list-inside mt-1 pl-1">
                          {draft.photo_suggestions.map((s, i) => {
                             // Check if it's a URL
                             const isUrl = s.startsWith("http");
                             return (
                               <li key={i} className="truncate">
                                 {isUrl ? (
                                   <a href={s} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat Gambar</a>
                                 ) : s}
                               </li>
                             );
                          })}
                        </ul>
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full mt-2 h-7 text-xs border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                      onClick={() => {
                        // Use first photo suggestion as cover image if available
                        const coverImage = draft.photo_suggestions?.find(s => s.startsWith("http"));
                        onApplyDraft(draft.title, draft.content, coverImage);
                        toast.success("Draf diterapkan (Judul, Isi, dan Cover)");

                        // If there are scraped images, offer to insert them into content
                        if (scrapedImages.length > 0) {
                          setImagePickerMode('content');
                          setShowImagePicker(true);
                          toast("Silakan pilih gambar tambahan untuk disisipkan ke isi konten.", { duration: 4000 });
                        }
                      }}
                    >
                      <Check className="w-3 h-3 mr-1.5" />
                      Gunakan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Quick Suggestions */}
        {showSuggestions && messages.length === 1 && (
          <div className="grid grid-cols-1 gap-2 mt-2">
            <button 
              onClick={() => handleSend("Bantu saya membuat Berita Desa baru")}
              className="flex items-center gap-3 p-3 text-left bg-white border border-zinc-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-900">Buat Berita Desa</span>
                <span className="block text-[10px] text-zinc-500">Mulai dari nol atau topik</span>
              </div>
            </button>
            
            <button 
              onClick={() => {
                setInput("Ini link beritanya: ");
                // Focus input
                const inputEl = document.querySelector('input[placeholder="Ketik instruksi..."]') as HTMLInputElement;
                if(inputEl) inputEl.focus();
              }}
              className="flex items-center gap-3 p-3 text-left bg-white border border-zinc-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-pink-100">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-900">Link Referensi</span>
                <span className="block text-[10px] text-zinc-500">Rewrite berita dari URL lain</span>
              </div>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
             <span className="text-[10px] text-zinc-400 animate-pulse">Sedang mengetik...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-zinc-50 border-t border-zinc-200">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik instruksi..."
            className="w-full pr-8 text-xs h-9 bg-white border-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-200 text-zinc-600 placeholder:text-zinc-400 shadow-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            disabled={isLoading || !input.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-zinc-400 hover:text-indigo-600"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
