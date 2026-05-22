const contactEmail = "ivan@autoia.com.ar";

export const metadata = {
  title: "Política de cookies | Oramis",
  description: "Política de cookies de Oramis.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Política de cookies"
      title="Uso de cookies y tecnologías similares"
      updated="Última actualización: mayo de 2026"
    >
      <Section title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que se almacenan en el navegador del
          usuario y permiten recordar información sobre su visita, mejorar la
          experiencia, mantener sesiones activas, medir uso del sitio o habilitar
          ciertas funcionalidades.
        </p>
      </Section>

      <Section title="2. Qué cookies podemos usar">
        <p>Oramis puede utilizar cookies o tecnologías similares para:</p>
        <ul>
          <li>mantener sesiones y accesos seguros;</li>
          <li>recordar preferencias básicas;</li>
          <li>medir visitas y rendimiento del sitio;</li>
          <li>entender qué secciones generan interés;</li>
          <li>mejorar la experiencia de navegación;</li>
          <li>prevenir abusos o usos indebidos.</li>
        </ul>
      </Section>

      <Section title="3. Cookies necesarias">
        <p>
          Algunas cookies pueden ser necesarias para que el sitio o la plataforma
          funcionen correctamente, por ejemplo para seguridad, navegación,
          autenticación o mantenimiento de sesión.
        </p>
      </Section>

      <Section title="4. Cookies de análisis o medición">
        <p>
          Podemos utilizar herramientas de análisis para conocer cómo se usa el
          sitio, medir tráfico, detectar errores, evaluar rendimiento y mejorar
          la experiencia. Estas herramientas pueden utilizar cookies o
          identificadores similares.
        </p>
      </Section>

      <Section title="5. Cookies de terceros">
        <p>
          Algunas cookies pueden pertenecer a proveedores externos utilizados por
          Oramis, como servicios de hosting, analítica, autenticación,
          comunicación, automatización o herramientas integradas.
        </p>
      </Section>

      <Section title="6. Cómo gestionar cookies">
        <p>
          Podés configurar tu navegador para bloquear, eliminar o limitar el uso
          de cookies. Si desactivás ciertas cookies, algunas funcionalidades del
          sitio o de la plataforma podrían no funcionar correctamente.
        </p>
      </Section>

      <Section title="7. Cambios en esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios en las
          herramientas utilizadas o en la forma en que operamos el sitio. La
          versión vigente estará disponible en esta página.
        </p>
      </Section>

      <Section title="8. Contacto">
        <p>
          Por consultas sobre cookies o privacidad, podés escribir a{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </Section>
    </LegalPage>
  );
}

function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
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
                Ventas conversacionales
              </p>
            </div>
          </a>

          <a
            href="/"
            className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
          >
            Volver al inicio
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-[980px] px-5 py-16 lg:px-0">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {updated}
          </p>

          <div className="mt-10 space-y-8 text-base font-medium leading-8 text-slate-600 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-2xl font-black tracking-[-0.03em] text-[#07111f]">
        {title}
      </h2>
      <div className="space-y-3 [&_a]:font-bold [&_a]:text-emerald-600 [&_a]:underline">
        {children}
      </div>
    </section>
  );
}
