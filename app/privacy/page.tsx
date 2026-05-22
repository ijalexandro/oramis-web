const contactEmail = "ivan@autoia.com.ar";

export const metadata = {
  title: "Política de privacidad | Oramis",
  description: "Política de privacidad de Oramis.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Política de privacidad"
      title="Cómo tratamos la información en Oramis"
      updated="Última actualización: mayo de 2026"
    >
      <Section title="1. Información que podemos recopilar">
        <p>
          Oramis puede recopilar información que el usuario proporciona al
          registrarse, solicitar una demo, cargar una URL, comunicarse con el
          equipo o utilizar la plataforma.
        </p>
        <p>
          Esta información puede incluir nombre, email, empresa, sitio web,
          teléfono comercial, rubro, datos de catálogo, productos, imágenes,
          links, conversaciones, preferencias comerciales y datos necesarios para
          operar el servicio.
        </p>
      </Section>

      <Section title="2. Información de catálogos y productos">
        <p>
          Cuando un usuario solicita una demo con su web, Oramis puede analizar
          información pública disponible en la URL indicada, como nombres de
          productos, precios visibles, imágenes, descripciones, categorías y
          enlaces.
        </p>
        <p>
          La información detectada se usa para crear una experiencia de prueba,
          mostrar productos encontrados y simular cómo Oramis respondería frente
          a consultas comerciales.
        </p>
      </Section>

      <Section title="3. Información de conversaciones">
        <p>
          Si el servicio está activo para un cliente, Oramis puede procesar
          mensajes de conversaciones comerciales para responder consultas,
          detectar intenciones, armar carritos, derivar oportunidades, generar
          reportes y mejorar la operación.
        </p>
        <p>
          El cliente es responsable de informar a sus propios usuarios finales
          sobre el uso de herramientas de automatización o asistencia cuando
          corresponda.
        </p>
      </Section>

      <Section title="4. Para qué usamos la información">
        <p>Usamos la información para:</p>
        <ul>
          <li>crear y administrar cuentas;</li>
          <li>generar demos con productos reales;</li>
          <li>responder consultas comerciales;</li>
          <li>recomendar productos y armar oportunidades;</li>
          <li>derivar conversaciones a vendedores;</li>
          <li>mostrar reportes y métricas comerciales;</li>
          <li>mejorar la plataforma y prevenir usos indebidos;</li>
          <li>comunicarnos con usuarios o clientes.</li>
        </ul>
      </Section>

      <Section title="5. Proveedores y servicios externos">
        <p>
          Para operar Oramis podemos utilizar proveedores de infraestructura,
          hosting, bases de datos, autenticación, mensajería, analítica,
          automatización, inteligencia artificial, almacenamiento y comunicación.
        </p>
        <p>
          Estos proveedores solo deberían acceder a la información necesaria para
          prestar sus servicios y bajo sus propias condiciones de seguridad y
          privacidad.
        </p>
      </Section>

      <Section title="6. Conservación de datos">
        <p>
          Conservamos la información durante el tiempo necesario para prestar el
          servicio, cumplir obligaciones, resolver incidencias, mantener
          registros operativos o según lo requiera la relación comercial.
        </p>
      </Section>

      <Section title="7. Seguridad">
        <p>
          Aplicamos medidas razonables para proteger la información contra
          accesos no autorizados, pérdida, uso indebido o alteración. Ningún
          sistema es completamente infalible, pero buscamos mantener buenas
          prácticas operativas y de seguridad.
        </p>
      </Section>

      <Section title="8. Derechos y solicitudes">
        <p>
          Podés solicitar acceso, corrección o eliminación de información
          asociada a tu cuenta o empresa escribiendo a{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </Section>

      <Section title="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios en la plataforma
          o en la forma en que tratamos la información. La versión vigente estará
          disponible en esta página.
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
