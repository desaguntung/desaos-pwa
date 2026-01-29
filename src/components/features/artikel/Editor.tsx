"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useState, useEffect } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  ImageIcon, 
  Link as LinkIcon,
  Sparkles,
  Undo,
  Redo,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateWithAI } from "@/lib/services/ai";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function ArticleEditor({ content, onChange }: EditorProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis cerita Anda...",
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-zinc max-w-none focus:outline-none min-h-[500px]",
      },
    },
  });

  // Sync content from props to editor
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("URL Gambar:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleAiAction = async (action: string) => {
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
    
    // If no text selected, take the whole document for context
    const context = selectedText || editor.getText();
    
    let prompt = "";
    switch (action) {
      case "fix":
        prompt = "Perbaiki tata bahasa dan ejaan dari teks berikut ini. Hanya berikan hasil perbaikan.";
        break;
      case "shorter":
        prompt = "Ringkas teks berikut ini agar lebih padat dan jelas.";
        break;
      case "longer":
        prompt = "Kembangkan teks berikut ini agar lebih detail dan deskriptif.";
        break;
      case "tone_formal":
        prompt = "Ubah nada teks berikut menjadi lebih formal dan profesional.";
        break;
      case "continue":
        prompt = "Lanjutkan penulisan artikel ini berdasarkan konteks yang ada. Tambahkan 1-2 paragraf.";
        break;
    }

    setIsAiLoading(true);
    const result = await generateWithAI(prompt, context);
    setIsAiLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.content) {
      if (selectedText) {
        // Replace selection
        editor.chain().focus().insertContent(result.content).run();
      } else {
        // Append
        editor.chain().focus().insertContent(result.content).run();
      }
      toast.success("AI berhasil memproses permintaan Anda.");
    }
  };

  return (
    <div className="relative group min-h-[500px]">
      {/* Fixed Toolbar */}
      <div className="flex items-center gap-1 py-2 mb-4 border-b border-zinc-100 bg-white sticky top-0 z-20 transition-all">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-zinc-200" : ""}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-zinc-200" : ""}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-zinc-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-zinc-200" : ""}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-zinc-200" : ""}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-zinc-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-zinc-200" : ""}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-zinc-200" : ""}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-zinc-200" : ""}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-zinc-300 mx-1" />
        <Button variant="ghost" size="sm" onClick={addImage} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        
        {/* AI Toolbar Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              disabled={isAiLoading}
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              {isAiLoading ? "Processing..." : "AI Assistant"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             <DropdownMenuItem onClick={() => handleAiAction("fix")}>
                Perbaiki Tata Bahasa
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleAiAction("tone_formal")}>
                Ubah ke Formal
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleAiAction("shorter")}>
                Ringkas Teks
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleAiAction("longer")}>
                Kembangkan Teks
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleAiAction("continue")}>
                Lanjutkan Menulis...
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Floating Menu (Selected Text) */}
      {editor && (
        <BubbleMenu className="flex bg-white shadow-xl border border-zinc-200 rounded-lg p-1 gap-1" editor={editor}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-zinc-100" : ""}
          >
            <Bold className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-zinc-100" : ""}
          >
            <Italic className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction("fix")}
            className="text-purple-600 hover:bg-purple-50"
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <div className="p-8 min-h-[500px] cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
      
      {/* Drag & Drop Overlay Hint (Visual only, TipTap handles drag natively) */}
      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-transparent group-hover:border-zinc-200/50 transition-colors m-2 rounded-lg" />
    </div>
  );
}
