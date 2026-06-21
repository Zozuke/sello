import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ===== NAV ===== */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <SealMark className="h-8 w-8" />
            <span className="font-display text-xl font-semibold tracking-tight">
              Sello
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#como-funciona"
              className="hidden font-body text-sm text-graphite hover:text-ink sm:inline"
            >
              Cómo funciona
            </Link>
            <Link
              href="#precio"
              className="hidden font-body text-sm text-graphite hover:text-ink sm:inline"
            >
              Precio
            </Link>
            <Link href="/login" className="font-body text-sm font-semibold text-ink hover:text-seal">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <p className="label-eyebrow mb-5">Para freelancers e independientes</p>
            <h1 className="font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.4rem]">
              Tu próxima propuesta,
              <br />
              <em className="italic text-seal">lista en 4 minutos.</em>
            </h1>
            <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-graphite">
              Respondes cinco preguntas sobre el proyecto. Sello redacta una
              propuesta profesional completa — alcance, cronograma, precio y
              términos — lista para enviar a tu cliente.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-seal">
                Probar gratis 24 horas
              </Link>
              <Link href="#como-funciona" className="btn-ghost">
                Ver cómo funciona
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-graphite">
              Sin tarjeta de crédito para empezar. Cancela cuando quieras.
            </p>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <ProposalPreviewCard />
          </div>
        </div>
      </section>

      {/* ===== PROBLEMA / AGITACIÓN ===== */}
      <section className="border-y border-ink/10 bg-ink/[0.025] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-display text-2xl leading-snug text-ink/80 sm:text-3xl">
            “Llevo dos horas escribiendo esta propuesta y todavía
            <span className="text-seal"> no sé cómo justificar el precio.</span>”
          </p>
          <p className="mt-5 font-body text-graphite">
            Cada propuesta debería ganarte el proyecto, no quitarte la tarde.
            Sello convierte una conversación de cinco preguntas en un
            documento que se ve — y suena — como si lo hubiera escrito tu
            mejor versión.
          </p>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="label-eyebrow mb-4">Cómo funciona</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tres pasos, un documento listo.
        </h2>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          <Step
            mark="A"
            title="Contás el proyecto"
            body="Cliente, qué necesita, alcance aproximado y tu tarifa. Cinco campos, sin formularios eternos."
          />
          <Step
            mark="B"
            title="Sello redacta"
            body="En segundos genera una propuesta completa: resumen, alcance, entregables, cronograma y condiciones de pago."
          />
          <Step
            mark="C"
            title="Vos revisás y enviás"
            body="Editá lo que quieras, copialo o descargalo en PDF. Listo para tu cliente."
          />
        </div>
      </section>

      {/* ===== PRECIO ===== */}
      <section id="precio" className="border-t border-ink/10 bg-ink/[0.025] py-20 sm:py-28">
        <div className="mx-auto max-w-md px-6">
          <p className="label-eyebrow mb-4 text-center">Precio</p>
          <div className="paper-card p-8 text-center">
            <p className="font-display text-lg text-graphite">Un plan. Sin sorpresas.</p>
            <p className="mt-3 font-display text-5xl font-semibold tracking-tight">
              $14.99
              <span className="font-body text-lg font-normal text-graphite">/mes</span>
            </p>
            <ul className="mt-7 space-y-3 text-left font-body text-sm text-ink/80">
              <BulletItem text="Propuestas ilimitadas con IA" />
              <BulletItem text="Descarga en PDF con tu marca" />
              <BulletItem text="Historial de todas tus propuestas" />
              <BulletItem text="Cancelás cuando quieras, sin permanencia" />
            </ul>
            <Link href="/login" className="btn-seal mt-8 w-full">
              Empezar con 24 horas gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <SealMark className="h-5 w-5 opacity-60" />
            <span className="font-body text-sm text-graphite">Sello © {new Date().getFullYear()}</span>
          </div>
          <p className="font-mono text-xs text-graphite">Hecho para quienes facturan por proyecto.</p>
        </div>
      </footer>
    </main>
  );
}

function Step({ mark, title, body }: { mark: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-seal/30 font-mono text-sm font-medium text-seal">
        {mark}
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 font-body text-sm leading-relaxed text-graphite">{body}</p>
    </div>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-seal" />
      <span>{text}</span>
    </li>
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

function ProposalPreviewCard() {
  return (
    <div className="paper-card relative mx-auto max-w-sm -rotate-1 p-7">
      <div className="absolute -right-4 -top-4 flex h-16 w-16 rotate-[-8deg] items-center justify-center rounded-full border-2 border-seal/70 bg-paper/95 font-mono text-[9px] font-semibold uppercase tracking-wider text-seal shadow-sm">
        Listo
      </div>
      <p className="label-eyebrow">Propuesta de proyecto</p>
      <h3 className="mt-2 font-display text-xl font-semibold">
        Rediseño de tienda online
      </h3>
      <p className="mt-1 font-mono text-xs text-graphite">Para: Casa Lúa Cerámica</p>

      <div className="mt-5 space-y-3 border-t border-ink/10 pt-5">
        <PreviewLine label="Alcance" value="Diseño UX/UI + desarrollo, 6 páginas" />
        <PreviewLine label="Cronograma" value="3 semanas, 2 hitos de revisión" />
        <PreviewLine label="Inversión" value="$1,850 USD · 50% por adelantado" />
      </div>

      <div className="mt-6 h-2 w-1/3 rounded-full bg-ink/10" />
      <div className="mt-2 h-2 w-2/3 rounded-full bg-ink/10" />
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[11px] uppercase tracking-wide text-graphite">{label}</span>
      <span className="text-right font-body text-sm text-ink/80">{value}</span>
    </div>
  );
}
