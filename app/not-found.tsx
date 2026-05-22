const whatsappDemoUrl =
  "https://api.whatsapp.com/send/?phone=5491130416164&text=Hola%21&type=phone_number&app_absent=0";

const contactEmail = "ivan@autoia.com.ar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
        <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 -z-10 h-[420px] w-[420px] rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center">
          <a href="/" className="mb-8 inline-flex items-center justify-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
              <div className="absolute inset-1 rounded-xl border border-white/40" />
              <span className="text-lg font-black text-white">O</span>
            </div>
            <div className="text-left">
              <p className="text-xl font-black tracking-tight text-[#07111f]">
                Oramis
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Ventas conversacionales
              </p>
            </div>
          </a>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Estamos preparando el lanzamiento
          </div>

          <h1 className="mt-7 text-5xl font-black tracking-[-0.06em] text-[#07111f] sm:text-6xl">
            Esta sección todavía está en construcción.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-9 text-slate-600">
            Estamos terminando de preparar Oramis para que puedas crear demos,
            conectar tu catálogo y empezar a vender por WhatsApp con productos reales.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-500">
            Mientras tanto, podés ver Oramis en acción por WhatsApp o escribirnos
            para conocer más sobre el lanzamiento.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={whatsappDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-500 px-8 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              Ver Oramis en acción en WhatsApp
            </a>

            <a
              href={`mailto:${contactEmail}`}
              className="rounded-full border border-slate-200 bg-white px-8 py-4 text-center text-base font-black text-[#07111f] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
            >
              Escribir a {contactEmail}
            </a>
          </div>

          <div className="mt-8">
            <a
              href="/"
              className="text-sm font-bold text-slate-500 transition hover:text-emerald-600"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
