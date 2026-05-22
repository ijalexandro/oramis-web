import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conversaciones comerciales | Oramis",
  description: "Conversaciones comerciales de Oramis.",
};

export default async function ConversationsPage() {
  const context = await getCurrentTenantContext();

  const tenant = context?.tenant;
  const membership = context?.membership;

  const chatwootUrl =
    tenant?.url_chatwoot && tenant?.account_id
      ? `https://${tenant.url_chatwoot}/app/accounts/${tenant.account_id}/conversations`
      : null;

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle="Conversaciones comerciales" />

      <section className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8">
        <div className="mb-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Conversaciones comerciales
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#07111f] lg:text-4xl">
                Atendé, seguí oportunidades y cerrá ventas desde un solo lugar.
              </h1>
              <p className="mt-3 max-w-4xl text-base font-medium leading-7 text-slate-600">
                Acá se centralizan las conversaciones comerciales para que tu equipo pueda responder,
                continuar pedidos, ver contexto y avanzar con cada oportunidad.
              </p>
            </div>

            {tenant && membership && (
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-900">
                <p>{tenant.nombre_empresa}</p>
                <p className="mt-1 text-xs text-emerald-700">
                  Rol: {membership.rol}
                </p>
              </div>
            )}
          </div>
        </div>

        {!context && (
          <StateCard
            title="No pudimos leer tu sesión"
            text="Volvé a ingresar para acceder a tus conversaciones."
          />
        )}

        {context && !tenant && (
          <StateCard
            title="Tu usuario todavía no tiene un entorno activo"
            text="El login funciona, pero falta asociar tu cuenta a un negocio en Oramis."
          />
        )}

        {tenant && !chatwootUrl && (
          <StateCard
            title="Chatwoot todavía no está configurado"
            text="Este entorno no tiene URL o account_id de Chatwoot configurado."
          />
        )}

        {chatwootUrl && (
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-emerald-950/5">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-black text-[#07111f]">
                  Bandeja comercial
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Si no aparece la bandeja, abrí Chatwoot una vez para iniciar sesión.
                </p>
              </div>

              <a
                href={chatwootUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
              >
                Abrir en otra pestaña
              </a>
            </div>

            <iframe
              src={chatwootUrl}
              className="h-[760px] w-full border-0 bg-white"
              title="Conversaciones comerciales Oramis"
            />
          </div>
        )}
      </section>
    </main>
  );
}

function StateCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
      <h2 className="text-2xl font-black tracking-[-0.04em] text-amber-950">
        {title}
      </h2>
      <p className="mt-3 text-base font-semibold leading-7 text-amber-900">
        {text}
      </p>
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-8">
        <a href="/app/conversations" className="flex items-center gap-3">
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
