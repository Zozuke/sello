"use client";

import { useEffect, useState } from "react";

type Proposal = {
  id: string;
  client_name: string;
  project_title: string;
  content: string;
  price_quoted: string | null;
  created_at: string;
};

export default function ProposalResult({
  proposal,
  onClose,
}: {
  proposal: Proposal;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [proposal.id]);

  async function handleCopy() {
    await navigator.clipboard.writeText(proposal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    const maxWidth = 500;
    let cursorY = 72;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(proposal.project_title, marginX, cursorY);
    cursorY += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110, 110, 122);
    doc.text(`Para: ${proposal.client_name}`, marginX, cursorY);
    cursorY += 28;

    doc.setTextColor(26, 26, 46);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(proposal.content, maxWidth);
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line: string) => {
      if (cursorY > pageHeight - 56) {
        doc.addPage();
        cursorY = 56;
      }
      doc.text(line, marginX, cursorY);
      cursorY += 16;
    });

    doc.save(`propuesta-${proposal.client_name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }

  return (
    <div className="relative animate-fade-up">
      <button
        onClick={onClose}
        className="mb-3 font-body text-sm text-graphite hover:text-ink"
      >
        ← Volver al historial
      </button>

      <div className="paper-card relative overflow-hidden p-7">
        <div className="pointer-events-none absolute -right-3 -top-3 flex h-20 w-20 origin-center animate-stamp items-center justify-center rounded-full border-2 border-seal bg-paper/95 font-mono text-[10px] font-bold uppercase tracking-wider text-seal shadow-sm">
          Sellado
        </div>

        <p className="label-eyebrow">Propuesta de proyecto</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">{proposal.project_title}</h2>
        <p className="font-mono text-xs text-graphite">Para: {proposal.client_name}</p>

        <div className="mt-6 max-h-[480px] overflow-y-auto border-t border-ink/10 pt-6">
          <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-ink/90">
            {proposal.content}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row">
          <button onClick={handleCopy} className="btn-ghost flex-1">
            {copied ? "Copiado ✓" : "Copiar texto"}
          </button>
          <button onClick={handleDownloadPdf} className="btn-seal flex-1">
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
