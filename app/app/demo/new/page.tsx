export const metadata = {
  title: "Crear demo | Oramis",
  description: "Crear una demo con productos en Oramis.",
};

export default function NewDemoPage() {
  return (
    <AppShell subtitle="Crear demo">
      <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Demo gratis
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
            Ingresá tu web y probalo gratis en segundos.
          </h1>
          <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
            Prepará una demo con productos de tu sitio y mirá cómo Oramis
            respondería consultas, recomendaría opciones y armaría oportunidades
            de venta.
          </p>

          <div className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-black text-emerald-800">
              Probá la experiencia antes de contratar
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900">
              Vas a poder ver productos, simular una conversación y entender
              cómo Oramis trabajaría junto a tu equipo comercial.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <form className="space-y-4">
            <Field label="Web o tienda online" placeholder="https://tutienda.com" />

            <a
              href="/app/demo/preview"
              className="block rounded-full bg-emerald-500 px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
            >
              Crear demo gratis
            </a>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-semibold text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
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
  );
}
