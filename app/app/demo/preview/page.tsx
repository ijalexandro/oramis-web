const products = [
  {
    name: "Mochila Urban Pro",
    price: "$89.900",
    detail: "Impermeable · notebook 15” · color negro",
  },
  {
    name: "Cafetera Compact Black",
    price: "$189.900",
    detail: "Compacta · color negro · ideal para regalo",
  },
  {
    name: "Perfume Blue Special",
    price: "$72.000",
    detail: "Fragancia intensa · presentación premium",
  },
  {
    name: "Labial Gold Plus",
    price: "$18.500",
    detail: "Acabado brillante · larga duración",
  },
];

export const metadata = {
  title: "Preview demo | Oramis",
  description: "Preview de demo en Oramis.",
};

export default function DemoPreviewPage() {
  return (
    <AppShell>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Demo generada
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              Así se vería Oramis vendiendo tus productos.
            </h1>
            <p className="mt-4 max-w-3xl text-lg font-medium leading-8 text-slate-600">
              Esta vista simula la experiencia comercial: productos detectados,
              conversación tipo WhatsApp, oportunidades, conversaciones
              centralizadas y métricas que se activan al contratar.
            </p>
          </div>

          <a
            href="/signup?intent=contract"
            className="rounded-full bg-[#07111f] px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-slate-300 transition hover:bg-emerald-600"
          >
            Quiero contratar Oramis
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Productos encontrados
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Muestra inicial
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.name}
                className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-5"
              >
                <div className="mb-4 h-28 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-emerald-200" />
                <h3 className="font-black text-[#07111f]">{product.name}</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                  {product.detail}
                </p>
                <p className="mt-3 text-lg font-black text-[#07111f]">
                  {product.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Conversación de venta
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Oramis responde y arma el carrito
          </h2>

          <div className="mt-6 mx-auto max-w-[390px] rounded-[2.4rem] border border-slate-200 bg-white p-3 shadow-xl shadow-emerald-950/10">
            <div className="overflow-hidden rounded-[2rem] bg-[#e9f8ef]">
              <div className="bg-[#075e54] px-4 py-4 text-white">
                <p className="text-sm font-black">Oramis Demo</p>
                <p className="text-xs text-white/75">WhatsApp</p>
              </div>

              <div className="space-y-3 p-4">
                <Bubble from="customer">
                  Busco una cafetera compacta negra para regalo.
                </Bubble>
                <Bubble from="bot">
                  Te recomiendo la Cafetera Compact Black: es fácil de usar,
                  compacta y tiene muy buena presentación.
                </Bubble>
                <div className="rounded-2xl rounded-tl-sm bg-white shadow-md">
                  <div className="h-32 rounded-t-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-200" />
                  <div className="p-4">
                    <p className="font-black">Cafetera Compact Black</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      Compacta · color negro · ideal para regalo
                    </p>
                    <p className="mt-2 text-lg font-black">$189.900</p>
                  </div>
                </div>
                <Bubble from="customer">La quiero comprar.</Bubble>
                <Bubble from="bot">
                  Listo ✅ Te dejo el carrito armado:
                  {"\n\n"}1 × Cafetera Compact Black — $189.900
                  {"\n\n"}¿Querés que te pase con un vendedor para finalizar la
                  compra?
                </Bubble>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <LockedModule
          eyebrow="Conversaciones comerciales"
          title="Se activa al contratar Oramis"
          description="Centralizá consultas, oportunidades, carritos y derivaciones para que tu equipo comercial continúe cada conversación con contexto."
        >
          <InboxMockup />
        </LockedModule>

        <LockedModule
          eyebrow="Métricas comerciales"
          title="Se activa al contratar Oramis"
          description="Visualizá intención de compra, productos más pedidos, carritos armados, derivaciones y oportunidades generadas por conversaciones."
        >
          <MetricsMockup />
        </LockedModule>
      </section>
    </AppShell>
  );
}

function LockedModule({
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
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">{title}</h2>
      <p className="mt-3 text-base font-medium leading-7 text-slate-600">
        {description}
      </p>

      <div className="relative mt-6 overflow-hidden rounded-[1.7rem] border border-slate-200 bg-[#f8fafc] p-5">
        <div className="blur-[2px]">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <div className="rounded-full bg-[#07111f] px-5 py-3 text-sm font-black text-white shadow-xl">
            Disponible al contratar
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxMockup() {
  const rows = [
    ["María", "Quiere comprar una cafetera compacta", "Carrito listo"],
    ["Julián", "Consulta por envío y horarios", "Atención"],
    ["Sofía", "Pidió perfume + labial", "Derivado"],
    ["Lucas", "Busca mochila para notebook", "Compra"],
  ];

  return (
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
  );
}

function MetricsMockup() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Consultas" value="1.248" />
        <MiniMetric label="Carritos" value="312" />
        <MiniMetric label="Derivadas" value="186" />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-slate-500">
          Productos con más intención
        </p>
        <div className="mt-4 space-y-3">
          <Bar label="Cafetera Compact Black" width="88%" />
          <Bar label="Mochila Urban Pro" width="72%" />
          <Bar label="Perfume Blue Special" width="61%" />
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#07111f]">{value}</p>
    </div>
  );
}

function Bar({ label, width }: { label: string; width: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{label}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div
          className="h-3 rounded-full bg-emerald-500"
          style={{ width }}
        />
      </div>
    </div>
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
        className={`max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm font-medium leading-5 shadow-sm ${
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

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
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
                Demo preview
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
