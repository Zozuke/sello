"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Profile } from "@/lib/access";
import PaywallScreen from "@/components/PaywallScreen";
import ProposalResult from "@/components/ProposalResult";

type Proposal = {
  id: string;
  client_name: string;
  project_title: string;
  content: string;
  price_quoted: string | null;
  created_at: string;
};

type TrialInfo = {
  isTrialActive: boolean;
  hasPaidAccess: boolean;
  hasAccess: boolean;
  remainingMs: number;
  remainingHours: number;
};

export default function DashboardClient({
  profile,
  trialInfo,
  initialProposals,
}: {
  profile: Profile;
  trialInfo: TrialInfo;
  initialProposals: Proposal[];
}) {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    projectTitle: "",
    scope: "",
    timeline: "",
    price: "",
  });

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar la propuesta.");
      }

      setProposals((prev) => [data.proposal, ...prev]);
      setActiveProposal(data.proposal);
      setForm({ clientName: "", projectTitle: "", scope: "", timeline: "", price: "" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal. Probá de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (!trialInfo.hasAccess) {
    return <PaywallScreen profile={profile} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <SealMark className="h-7 w-7" />
            <span className="font-display text-lg font-semibold">Sello</span>
          </div>
          <div className="flex items-center gap-4">
            {trialInfo.isTrialActive && (
              <span className="rounded-full bg-seal/10 px-3 py-1 font-mono text-xs font-medium text-seal-dark">
                Prueba: {trialInfo.remainingHours}h restantes
              </span>
            )}
            {trialInfo.hasPaidAccess && (
              <span className="rounded-full bg-forest/10 px-3 py-1 font-mono text-xs font-medium text-forest">
                Plan activo
              </span>
            )}
            <button
              onClick={handleLogout}
              className="font-body text-sm text-graphite hover:text-ink"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* FORMULARIO */}
          <div>
            <p className="label-eyebrow mb-2">Nueva propuesta</p>
            <h1 className="font-display text-2xl font-semibold">
              Contame del proyecto
            </h1>

            <form onSubmit={handleGenerate} className="mt-6 space-y-4">
              <Field label="Nombre del cliente">
                <input
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Casa Lúa Cerámica"
                  className="input-field"
                />
              </Field>

              <Field label="Título del proyecto">
                <input
                  required
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                  placeholder="Rediseño de tienda online"
                  className="input-field"
                />
              </Field>

              <Field label="¿Qué necesita el cliente?">
                <textarea
                  required
                  rows={3}
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  placeholder="Rediseñar las 6 páginas principales de su tienda Shopify, mejorar la experiencia de compra en celular y dejar todo listo para que el equipo lo administre solo."
                  className="input-field resize-none"
                />
              </Field>

              <Field label="Tiempo estimado">
                <input
                  required
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                  placeholder="3 semanas"
                  className="input-field"
                />
              </Field>

              <Field label="Tu tarifa o presupuesto">
                <input
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="$1,850 USD, 50% por adelantado"
                  className="input-field"
                />
              </Field>

              {errorMsg && <p className="font-body text-sm text-seal-dark">{errorMsg}</p>}

              <button type="submit" disabled={isGenerating} className="btn-seal w-full">
                {isGenerating ? "Redactando…" : "Generar propuesta"}
              </button>
            </form>
          </div>

          {/* RESULTADO / HISTORIAL */}
          <div>
            {activeProposal ? (
              <ProposalResult
                proposal={activeProposal}
                onClose={() => setActiveProposal(null)}
              />
            ) : (
              <ProposalHistory proposals={proposals} onSelect={setActiveProposal} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

function ProposalHistory({
  proposals,
  onSelect,
}: {
  proposals: Proposal[];
  onSelect: (p: Proposal) => void;
}) {
  if (proposals.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-sm border border-dashed border-ink/15 p-10 text-center">
        <SealMark className="h-10 w-10 opacity-25" />
        <p className="mt-4 font-display text-lg font-semibold text-ink/70">
          Tu primera propuesta aparece aquí
        </p>
        <p className="mt-1 font-body text-sm text-graphite">
          Completá el formulario y generala en segundos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="label-eyebrow mb-4">Historial</p>
      <div className="space-y-2.5">
        {proposals.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="paper-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md"
          >
            <div>
              <p className="font-display font-semibold">{p.project_title}</p>
              <p className="font-mono text-xs text-graphite">{p.client_name}</p>
            </div>
            <span className="font-mono text-xs text-graphite">
              {new Date(p.created_at).toLocaleDateString("es", { day: "2-digit", month: "short" })}
            </span>
          </button>
        ))}
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
