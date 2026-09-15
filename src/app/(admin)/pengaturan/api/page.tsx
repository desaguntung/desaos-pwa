"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Eye, EyeOff, Save, Trash2, Key } from "lucide-react";

import { getApiSettings, saveApiSettings } from "@/app/actions/api-settings";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ApiSettingsPage() {
  const [keys, setKeys] = useState<{ [key: string]: string }>({
    groq: "",
    gemini: "",
    openai: "",
  });
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getApiSettings()
      .then((settings) => {
        setKeys({
          groq: settings.groq || "",
          gemini: settings.gemini || "",
          openai: settings.openai || "",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await saveApiSettings(keys);
      if (res.success) {
        toast.success("API Keys berhasil disimpan ke database pengaturan aplikasi.");
      } else {
        toast.error(`Gagal menyimpan: ${res.error}`);
      }
    } catch (e: any) {
      toast.error(`Terjadi kesalahan: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (provider: string, value: string) => {
    setKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const toggleVisibility = (provider: string) => {
    setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  if (isLoading) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-body-bg">
      {/* Header */}
      <PageHeader
        title="Pengaturan API & Integrasi"
        subtitle="Kelola kunci API untuk fitur AI dan integrasi pihak ketiga. Data disimpan lokal di browser Anda."
        actions={
          <Button onClick={handleSave} className="bg-primary-text hover:opacity-90 text-card-bg h-9 text-xs px-3">
            <Save className="w-3.5 h-3.5 mr-2" />
            Simpan Pengaturan
          </Button>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <div className="text-amber-600 shrink-0 mt-0.5">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Keamanan Data</h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Kunci API yang Anda masukkan di sini <strong>TIDAK</strong> disimpan di database server. 
                Data hanya tersimpan di <em>Local Storage</em> browser Anda. 
                Jika Anda membersihkan cache browser atau ganti perangkat, Anda perlu memasukkan kunci kembali.
              </p>
            </div>
          </div>

          {/* Groq API */}
          <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-primary-text">Groq Cloud API</h3>
                <p className="text-xs text-secondary-text">Digunakan untuk fitur generate artikel cepat.</p>
              </div>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Dapatkan API Key
              </a>
            </div>
            <div className="relative">
              <Input
                type={showKey["groq"] ? "text" : "password"}
                value={keys.groq}
                onChange={(e) => handleChange("groq", e.target.value)}
                placeholder="gsk_..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("groq")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              >
                {showKey["groq"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Gemini API */}
          <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-primary-text">Google Gemini API</h3>
                <p className="text-xs text-secondary-text">Alternatif untuk analisis konten mendalam.</p>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Dapatkan API Key
              </a>
            </div>
            <div className="relative">
              <Input
                type={showKey["gemini"] ? "text" : "password"}
                value={keys.gemini}
                onChange={(e) => handleChange("gemini", e.target.value)}
                placeholder="AIza..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("gemini")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              >
                {showKey["gemini"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

           {/* OpenAI API */}
           <div className="bg-card-bg rounded-xl border border-border-color shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-primary-text">OpenAI API</h3>
                <p className="text-xs text-secondary-text">Standar industri untuk GPT-4.</p>
              </div>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Dapatkan API Key
              </a>
            </div>
            <div className="relative">
              <Input
                type={showKey["openai"] ? "text" : "password"}
                value={keys.openai}
                onChange={(e) => handleChange("openai", e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("openai")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              >
                {showKey["openai"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
