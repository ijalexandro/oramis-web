export const metadata = {
  title: "Métricas comerciales | Oramis",
  description: "Preview de métricas comerciales.",
};

export default function MetricsPage() {
  return (
    <PreviewShell
      eyebrow="Métricas comerciales"
      title="Entendé qué conversaciones generan negocio."
      description="Este módulo se activa al contratar Oramis. Vas a poder medir consultas, productos más pedidos, carritos armados, derivaciones y oportunidades comerciales."
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-5">
        <div className="blur-[2px]">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Consultas" value="1.248" />
            <Metric label="Carritos" value="312" />
            <Metric label="Derivadas" value="186" />
          </div>
          <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-500">
              Productos con más intención
            </p>
            <div className="mt-5 space-y-4">
              <Bar label="Cafetera Compact Black" width="88%" />
              <Bar label="Mochila Urban Pro" width="72%" />
              <Bar label="Perfume Blue Special" width="61%" />
              <Bar label="Labial Gold Plus" width="46%" />
            </div>
          </div>
        </div>
        <Overlay />
      </div>
    </PreviewShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#07111f]">{value}</p>
    </div>
  );
}

function Bar({ label, width }: { label: string; width: string }) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold text-slate-500">{label}</div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-emerald-500" style={{ width }} />
      </div>
    </div>
  );
}

function PreviewShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle="Preview" />
      <section className="mx-auto max-w-[1240px] px-5 py-8 lg:px-0">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-medium leading-8 text-slate-600">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

function Overlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
      <div className="rounded-full bg-[#07111f] px-5 py-3 text-sm font-black text-white shadow-xl">
        Disponible al contratar
      </div>
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-0">
        <a href="/app" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
            <div className="absolute inset-1 rounded-xl border border-white/40" />
            <span className="text-lg font-black text-white">O</span>
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">Oramis</p>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          <a href="/app" className="transition hover:text-emerald-600">
            Inicio
          </a>
          <a href="/app/conversations" className="transition hover:text-emerald-600">
            Conversaciones
          </a>
          <a href="/app/metrics" className="transition hover:text-emerald-600">
            Métricas
          </a>
          <a href="/app/business" className="transition hover:text-emerald-600">
            Negocio
          </a>
          <a href="/app/admin" className="transition hover:text-emerald-600">
            Administración
          </a>
        </nav>

        <a
          href="/logout"
          className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
        >
          Salir
        </a>
      </div>
    </header>
  );
}
