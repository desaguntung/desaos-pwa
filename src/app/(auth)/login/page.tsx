"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setCheckingSession(false);
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setErrorMessage(null);
      setSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      if (typeof document !== "undefined") {
        document.cookie = "desaos-auth=1; Max-Age=604800; Path=/; SameSite=Lax";
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage("Email atau password tidak valid.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-secondary-text">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-body-bg overflow-y-auto">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-primary-text rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-text">Masuk ke DesaOS Admin</p>
            <p className="text-xs text-secondary-text">
              Gunakan akun admin atau staff yang telah terdaftar.
            </p>
          </div>
        </div>

          {errorMessage && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
          <label className="text-xs font-medium text-secondary-text">Email</label>
          <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -tranzinc-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-zinc-200"
                  placeholder="admin@desa.id"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-secondary-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -tranzinc-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-zinc-200"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 text-xs bg-primary-text text-white rounded-md px-3 py-1.75 hover:opacity-90 transition-opacity font-medium mt-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{submitting ? "Masuk..." : "Masuk"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

