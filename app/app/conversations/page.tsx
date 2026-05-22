export const metadata = {
  title: "Conversaciones comerciales | Oramis",
  description: "Preview de conversaciones comerciales.",
};

export default function ConversationsPage() {
  const rows = [
    ["María", "Quiere comprar una cafetera compacta", "Carrito listo"],
    ["Julián", "Consulta ubicación y horarios", "Atención"],
    ["Sofía", "Pidió perfume + labial", "Derivado"],
    ["Lucas", "Busca mochila para notebook", "Compra"],
    ["Camila", "Pregunta por formas de pago", "Consulta"],
  ];

  return (
    <PreviewShell
      eyebrow="Conversaciones comerciales"
      title="Centralizá conversaciones, oportunidades y contexto."
      description="Este módulo se activa al contratar Oramis. Tu equipo va a poder continuar conversaciones con el pedido, los productos vistos y el contexto comercial."
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-5">
        <div className="blur-[2px]">
          <div className="space-y-3">
            {rows.map(([name, message, state]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-black text-[#07111f]">{name}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {message}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Overlay />
      </div>
    </PreviewShell>
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
        <a
          href="/app"
          className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
        >
          Volver
        </a>
      </div>
    </header>
  );
}
