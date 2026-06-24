"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <SealMark className="h-7 w-7" />
          <span className="font-display text-lg font-semibold">Sello</span>
        </Link>

        <div className="paper-card p-8">
          {status === "sent" ? (
            <div className="text-center">
              <p className="font-display text-xl font-semibold">Revisá tu correo</p>
              <p className="mt-3 font-body text-sm leading-relaxed text-graphite">
                Te mandamos un enlace de acceso a <strong className="text-ink">{email}</strong>.
                Abrilo desde este mismo dispositivo para entrar.
              </p>
            </div>
          ) : (
            <>
              <p className="label-eyebrow mb-2 text-center">Entrar o crear cuenta</p>
              <h1 className="text-center font-display text-2xl font-semibold">
                Empezá tu día gratis
              </h1>
              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block font-body text-sm font-medium text-ink">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="input-field"
                  />
                </div>
                {status === "error" && (
                  <p className="font-body text-sm text-seal-dark">{errorMsg}</p>
                )}
                <button type="submit" disabled={status === "loading"} className="btn-seal w-full">
                  {status === "loading" ? "Enviando enlace…" : "Enviarme el enlace de acceso"}
                </button>
              </form>
              <p className="mt-5 text-center font-mono text-xs text-graphite">
                Sin contraseñas. Te enviamos un enlace mágico por correo.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function SealMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="#B8542C" strokeWidth="2" />
      <circle cx="20" cy="20" r="13" stroke="#B8542C" strokeWidth="1.2" strokeDasharray="2 3" />
      <path d="M20 11L24 18H16L20 11Z" fill="#B8542C" />
      <path d="M14 22H26L24 29H16L14 22Z" fill="#B8542C" />
    </svg>
  );
}
