export const metadata = {
  title: "Onboarding | Oramis",
  description: "Onboarding inicial de Oramis.",
};

export default function AppHomePage() {
  return (
    <AppShell subtitle="Onboarding">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
          Bienvenido a Oramis
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#07111f] sm:text-5xl">
          Empezá con una demo o activá el servicio.
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-slate-600">
          Podés probar Oramis con productos de tu web o avanzar con la
          contratación para dejarlo funcionando en tu operación comercial.
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChoiceCard
          eyebrow="Demo gratis"
          title="Probar con mis productos"
          description="Ingresá tu sitio web y prepará una demo para ver cómo Oramis respondería consultas, recomendaría productos y armaría oportunidades."
          href="/app/demo/new"
          cta="Crear demo"
          primary
        />

        <ChoiceCard
          eyebrow="Activación"
          title="Contratar Oramis"
          description="Completá los datos de tu operación comercial para avanzar con la configuración, el canal de atención y el modelo recomendado."
          href="/app/contract"
          cta="Quiero contratar"
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <LockedLink
          title="Conversaciones comerciales"
          description="Vista previa de la bandeja donde tu equipo responde conversaciones de venta, atención y seguimiento desde un solo lugar."
          href="/app/conversations"
        />
        <LockedLink
          title="Métricas comerciales"
          description="Vista previa del módulo para medir consultas, intención, productos pedidos, carritos y oportunidades generadas."
          href="/app/metrics"
        />
      </section>
    </AppShell>
  );
}

function ChoiceCard({
  eyebrow,
  title,
  description,
  href,
  cta,
  primary = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#07111f]">
        {title}
      </h2>
      <p className="mt-4 text-base font-medium leading-7 text-slate-600">
        {description}
      </p>
      <a
        href={href}
        className={`mt-7 inline-flex rounded-full px-7 py-4 text-center text-base font-black shadow-xl transition ${
          primary
            ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600"
            : "bg-[#07111f] text-white shadow-slate-300 hover:bg-emerald-600"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function LockedLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-lg hover:shadow-emerald-950/5"
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
        Vista previa
      </p>
      <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#07111f]">
        {title}
      </h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
        {description}
      </p>
      <p className="mt-5 text-sm font-black text-emerald-600">
        Ver módulo →
      </p>
    </a>
  );
}

function AppShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle={subtitle} />
      <section className="mx-auto max-w-[1240px] px-5 py-8 lg:px-0">
        {children}
      </section>
    </main>
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
        <a
          href="/"
          className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
        >
          Salir
        </a>
      </div>
    </header>
  );
}
