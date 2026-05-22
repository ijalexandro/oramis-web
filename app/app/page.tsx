const whatsappDemoUrl =
  "https://api.whatsapp.com/send/?phone=5491130416164&text=Hola%21&type=phone_number&app_absent=0";

export const metadata = {
  title: "Panel | Oramis",
  description: "Panel inicial de Oramis.",
};

export default function AppHomePage() {
  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Panel inicial
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#07111f] sm:text-5xl">
            Creá tu primera demo con productos reales.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600">
            Ingresá la web de tu negocio y prepará una vista de prueba para ver
            cómo Oramis respondería consultas, recomendaría productos y armaría
            oportunidades comerciales.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/app/demo/new"
              className="rounded-full bg-emerald-500 px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
            >
              Crear demo con mis productos
            </a>
            <a
              href={whatsappDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-7 py-4 text-center text-base font-black text-[#07111f] shadow-sm transition hover:border-emerald-300"
            >
              Ver Oramis en acción en WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[#07111f] p-7 text-white shadow-xl shadow-slate-300">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Al contratar
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Activás operación comercial completa.
          </h2>
          <div className="mt-6 space-y-4 text-sm font-semibold leading-6 text-slate-300">
            <p>✓ Conversaciones comerciales centralizadas</p>
            <p>✓ Métricas de intención, carritos y derivaciones</p>
            <p>✓ Bandeja para vendedores y seguimiento</p>
            <p>✓ Configuración operativa de tu cuenta</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Estado" value="Demo pendiente" />
        <MetricCard label="Productos demo" value="0" />
        <MetricCard label="Canal inicial" value="WhatsApp" />
      </section>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-[#07111f]">{value}</p>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-0">
          <a href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
              <div className="absolute inset-1 rounded-xl border border-white/40" />
              <span className="text-lg font-black text-white">O</span>
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">Oramis</p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">
                Panel demo
              </p>
            </div>
          </a>

          <nav className="flex items-center gap-2">
            <a
              href="/app"
              className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:text-[#07111f]"
            >
              Panel
            </a>
            <a
              href="/"
              className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
            >
              Salir
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-5 py-8 lg:px-0">
        {children}
      </section>
    </main>
  );
}
