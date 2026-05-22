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
      title="Todos tus canales comerciales en una sola bandeja."
      description="Al contratar Oramis, tu equipo ingresa acá para responder conversaciones, continuar oportunidades, ver carritos armados y seguir cada venta con contexto. WhatsApp es el primer canal; luego podés sumar otros canales comerciales según tu operación."
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-5">
        <div className="blur-[2px]">
          <div className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="space-y-3">
              {rows.map(([name, message, state]) => (
                <div
                  key={name}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-[#07111f]">{name}</p>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {state}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {message}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-slate-500">
                Conversación seleccionada
              </p>
              <div className="mt-5 space-y-3 rounded-2xl bg-[#e9f8ef] p-4">
                <Bubble from="customer">
                  Hola, quiero comprar la cafetera compacta.
                </Bubble>
                <Bubble from="bot">
                  Perfecto, te dejo el carrito armado y te paso con un vendedor
                  para finalizar la compra.
                </Bubble>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-[#07111f]">
                  Carrito asociado
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  1 × Cafetera Compact Black — $189.900
                </p>
              </div>
            </div>
          </div>
        </div>
        <Overlay />
      </div>
    </PreviewShell>
  );
}

function Bubble({
  from,
  children,
}: {
  from: "customer" | "bot";
  children: React.ReactNode;
}) {
  return (
    <div className={`flex ${from === "customer" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm font-medium leading-5 shadow-sm ${
          from === "customer"
            ? "rounded-tr-sm bg-[#dcf8c6] text-slate-800"
            : "rounded-tl-sm bg-white text-slate-800"
        }`}
      >
        {children}
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
