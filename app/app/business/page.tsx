export const metadata = {
  title: "Configuración del negocio | Oramis",
  description: "Vista previa de configuración del negocio en Oramis.",
};

export default function BusinessSettingsPage() {
  return (
    <PreviewShell
      eyebrow="Configuración del negocio"
      title="Definí cómo tiene que atender y vender Oramis."
      description="Al contratar, desde este módulo vas a configurar información operativa del negocio: horarios, datos comerciales, mensajes frecuentes, tono de atención y reglas básicas para responder consultas."
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-5">
        <div className="blur-[2px]">
          <div className="grid gap-4 md:grid-cols-2">
            <ConfigCard title="Horarios de atención" value="Lunes a viernes · 9 a 18 hs" />
            <ConfigCard title="Datos del negocio" value="Nombre comercial · sucursales · datos de contacto" />
            <ConfigCard title="Preguntas frecuentes" value="Horarios · ubicación · atención · consultas habituales" />
            <ConfigCard title="Tono de atención" value="Cercano, claro y orientado a venta" />
          </div>
        </div>
        <Overlay />
      </div>
    </PreviewShell>
  );
}

function ConfigCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-black text-[#07111f]">{title}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{value}</p>
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
      <Header subtitle="Negocio" />
      <section className="mx-auto max-w-[1240px] px-5 py-8 lg:px-0">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-4 max-w-4xl text-lg font-medium leading-8 text-slate-600">
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
