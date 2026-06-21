"use client";

import { useState } from "react";
import type { Profile } from "@/lib/access";

export default function PaywallScreen({
  profile,
  onLogout,
}: {
  profile: Profile;
  onLogout: () => void;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubscribe() {
    setIsRedirecting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }

      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal.");
      setIsRedirecting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <SealMark className="mx-auto h-12 w-12 opacity-70" />
        <p className="label-eyebrow mt-6">
          {profile.subscription_status === "past_due" ? "Pago pendiente" : "Tu día gratis terminó"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Sigamos redactando propuestas
        </h1>
        <p className="mt-4 font-body text-graphite">
          Activá tu plan para seguir generando propuestas ilimitadas, guardar
          tu historial y descargar en PDF.
        </p>

        <div className="paper-card mt-8 p-7">
          <p className="font-display text-4xl font-semibold tracking-tight">
            $14.99<span className="font-body text-base font-normal text-graphite">/mes</span>
          </p>
          <p className="mt-2 font-body text-sm text-graphite">Cancelás cuando quieras.</p>

          {errorMsg && <p className="mt-3 font-body text-sm text-seal-dark">{errorMsg}</p>}

          <button
            onClick={handleSubscribe}
            disabled={isRedirecting}
            className="btn-seal mt-6 w-full"
          >
            {isRedirecting ? "Abriendo pago seguro…" : "Activar mi plan"}
          </button>
        </div>

        <button onClick={onLogout} className="mt-6 font-body text-sm text-graphite hover:text-ink">
          Salir de la cuenta
        </button>
      </div>
    </div>
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
