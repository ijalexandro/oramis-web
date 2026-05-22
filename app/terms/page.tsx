const contactEmail = "ivan@autoia.com.ar";

export const metadata = {
  title: "Términos y condiciones | Oramis",
  description: "Términos y condiciones de uso de Oramis.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Términos y condiciones"
      title="Condiciones de uso de Oramis"
      updated="Última actualización: mayo de 2026"
    >
      <Section title="1. Qué es Oramis">
        <p>
          Oramis es una plataforma de ventas conversacionales que ayuda a
          empresas y comercios a responder consultas, recomendar productos,
          armar oportunidades comerciales y derivar conversaciones a equipos de
          venta.
        </p>
        <p>
          El servicio puede incluir experiencias de demostración, automatización
          de conversaciones, análisis de productos, generación de carritos
          potenciales, reportes comerciales y herramientas de seguimiento.
        </p>
      </Section>

      <Section title="2. Uso de la plataforma">
        <p>
          Al utilizar Oramis, aceptás usar la plataforma de forma lícita,
          responsable y de acuerdo con estos términos. No está permitido usar el
          servicio para actividades fraudulentas, engañosas, abusivas, ilegales
          o que afecten derechos de terceros.
        </p>
        <p>
          La persona que crea una cuenta o solicita una demo declara tener
          autorización suficiente para actuar en nombre de la empresa, comercio
          o proyecto informado.
        </p>
      </Section>

      <Section title="3. Demos con productos desde una web">
        <p>
          Oramis puede permitir crear una demo a partir de información pública
          disponible en una tienda, sitio web o catálogo online indicado por el
          usuario. Al ingresar una URL, el usuario declara que tiene autorización
          para utilizar esa información o que se trata de información pública de
          su propio negocio.
        </p>
        <p>
          La información detectada en una demo puede ser parcial, incompleta o
          requerir revisión. Los precios, imágenes, links, descripciones, stock
          y condiciones comerciales deben ser validados por el usuario antes de
          usar la información en una operación real.
        </p>
      </Section>

      <Section title="4. Información comercial y respuestas automáticas">
        <p>
          Oramis puede generar respuestas automáticas o asistidas usando datos
          del catálogo, reglas de negocio, historial conversacional y modelos de
          inteligencia artificial. Aunque la plataforma busca brindar respuestas
          útiles y coherentes, el usuario es responsable de revisar y validar la
          información comercial relevante.
        </p>
        <p>
          Oramis no garantiza que una respuesta automática cierre una venta ni
          reemplaza completamente la intervención humana cuando la operación,
          consulta o situación lo requiera.
        </p>
      </Section>

      <Section title="5. Cuentas, accesos y seguridad">
        <p>
          El usuario es responsable por mantener la confidencialidad de sus
          accesos y por todas las acciones realizadas desde su cuenta. Si detecta
          un uso no autorizado, debe informarlo a la brevedad.
        </p>
      </Section>

      <Section title="6. Disponibilidad del servicio">
        <p>
          Oramis puede realizar cambios, mejoras, tareas de mantenimiento o
          actualizaciones. El servicio puede depender de proveedores externos,
          canales de mensajería, servicios de hosting, bases de datos,
          herramientas de analítica o integraciones de terceros.
        </p>
        <p>
          Haremos esfuerzos razonables para mantener la plataforma disponible,
          pero no garantizamos disponibilidad ininterrumpida ni ausencia total
          de errores.
        </p>
      </Section>

      <Section title="7. Propiedad intelectual">
        <p>
          La marca, diseño, software, flujos, textos, interfaces y componentes
          de Oramis pertenecen a sus titulares o licenciantes. El uso del
          servicio no otorga derechos de propiedad sobre la plataforma.
        </p>
        <p>
          Los datos, catálogos, productos, imágenes, marcas y contenidos de cada
          negocio siguen perteneciendo a sus respectivos titulares.
        </p>
      </Section>

      <Section title="8. Contratación y condiciones comerciales">
        <p>
          Las condiciones de contratación, planes, precios, límites de uso,
          soporte, canales habilitados y funcionalidades incluidas podrán
          variar según el acuerdo comercial aplicable a cada cliente.
        </p>
        <p>
          Las demos, pruebas o accesos preliminares no implican la contratación
          definitiva del servicio.
        </p>
      </Section>

      <Section title="9. Cambios en estos términos">
        <p>
          Podemos actualizar estos términos para reflejar cambios en el servicio,
          requisitos legales o mejoras operativas. La versión vigente estará
          disponible en esta página.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>
          Por consultas sobre estos términos, podés escribir a{" "}
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

          <div className="mt-10 space-y-8 text-base font-medium leading-8 text-slate-600">
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
