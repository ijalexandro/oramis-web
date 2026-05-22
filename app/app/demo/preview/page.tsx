const products = Array.from({ length: 50 }).map((_, index) => {
  const base = [
    ["Mochila Urban Pro", "$89.900", "Impermeable · notebook 15”"],
    ["Cafetera Compact Black", "$189.900", "Compacta · color negro"],
    ["Perfume Blue Special", "$72.000", "Fragancia intensa"],
    ["Labial Gold Plus", "$18.500", "Acabado brillante"],
    ["Auriculares Sound Fit", "$54.900", "Bluetooth · estuche carga"],
  ][index % 5];

  return {
    name: `${base[0]} ${index + 1}`,
    price: base[1],
    detail: base[2],
  };
});

export const metadata = {
  title: "Demo | Oramis",
  description: "Demo de Oramis.",
};

export default function DemoPreviewPage() {
  return (
    <AppShell subtitle="Demo">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
          Demo lista
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
          Cargamos 50 productos de tu web para que pruebes Oramis.
        </h1>
        <p className="mt-4 max-w-3xl text-lg font-medium leading-8 text-slate-600">
          Probá cómo respondería frente a consultas reales. Al contratar Oramis,
          la cuenta queda activa con todos tus productos y la operación comercial
          completa.
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Productos
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
                Muestra cargada
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
              50 productos
            </span>
          </div>

          <div className="mt-6 max-h-[650px] space-y-3 overflow-y-auto pr-2">
            {products.map((product) => (
              <div
                key={product.name}
                className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-black text-[#07111f]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                      {product.detail}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-black text-[#07111f]">
                    {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Prueba de conversación
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Consultá por un producto como si fueras un cliente.
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-slate-600">
            Escribí una consulta de compra y Oramis responderá usando los
            productos cargados para esta demo.
          </p>

          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[#e9f8ef] p-4">
            <div className="rounded-[1.6rem] bg-white shadow-sm">
              <div className="rounded-t-[1.6rem] bg-[#075e54] px-4 py-4 text-white">
                <p className="text-sm font-black">Oramis Demo</p>
                <p className="text-xs text-white/75">WhatsApp</p>
              </div>

              <div className="space-y-3 bg-[#e9f8ef] p-4">
                <Bubble from="customer">
                  Busco una cafetera compacta negra para regalo.
                </Bubble>
                <Bubble from="bot">
                  Te recomiendo la Cafetera Compact Black: es fácil de usar,
                  compacta y tiene muy buena presentación.
                </Bubble>
                <Bubble from="customer">La quiero comprar.</Bubble>
                <Bubble from="bot">
                  Listo ✅ Te dejo el carrito armado:
                  {"\n\n"}1 × Cafetera Compact Black — $189.900
                  {"\n\n"}¿Querés que te pase con un vendedor para finalizar la
                  compra?
                </Bubble>
              </div>

              <form className="border-t border-slate-200 p-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">
                    ¿Qué producto querés comprar?
                  </span>
                  <div className="flex gap-3">
                    <input
                      placeholder="Ej. quiero una mochila para notebook"
                      className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                    <button className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white">
                      Enviar
                    </button>
                  </div>
                </label>
              </form>
            </div>
          </div>

          <a
            href="/signup?intent=contract"
            className="mt-6 block rounded-full bg-[#07111f] px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-slate-300 transition hover:bg-emerald-600"
          >
            Quiero contratar Oramis
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Teaser
          title="Conversaciones comerciales"
          description="Al contratar, todos los canales comerciales se centralizan para responder, derivar y hacer seguimiento desde un solo lugar."
          href="/app/conversations"
        />
        <Teaser
          title="Métricas comerciales"
          description="Al contratar, vas a medir intención, productos pedidos, carritos y oportunidades generadas."
          href="/app/metrics"
        />
      </section>
    </AppShell>
  );
}

function Teaser({
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
      className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        Disponible al contratar
      </p>
      <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">{title}</h3>
      <p className="mt-3 text-base font-medium leading-7 text-slate-600">
        {description}
      </p>
      <p className="mt-5 text-sm font-black text-emerald-600">Ver preview →</p>
    </a>
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
