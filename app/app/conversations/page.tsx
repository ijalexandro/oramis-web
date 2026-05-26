import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { canAccessSection, getSectionPermissions } from "@/utils/oramis/permissions";
import ChatwootFrame from "./ChatwootFrame";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conversaciones | Oramis",
  description: "Conversaciones comerciales de Oramis.",
};

export default async function ConversationsPage() {
  const context = await getCurrentTenantContext();
  const canViewConversations = canAccessSection(context?.membership, "conversations");
  const sectionPermissions = getSectionPermissions(context?.membership);

  const tenant = context?.tenant;

  const chatwootUrl =
    tenant?.url_chatwoot && tenant?.account_id
      ? `https://${tenant.url_chatwoot}/app/accounts/${tenant.account_id}/conversations`
      : null;


  if (!canViewConversations) {
    return (
      <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
        <Header subtitle="Conversaciones" tenantName={context?.tenant?.nombre_empresa ?? null} />

        <section className="mx-auto max-w-[1180px] px-4 py-8 lg:px-5">
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-amber-950">
              No tenés permisos para ver conversaciones
            </h2>
            <p className="mt-3 text-base font-semibold leading-7 text-amber-900">
              Tu usuario no tiene habilitada la sección Conversaciones de este negocio.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 lg:px-5">
          <a href="/app" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200">
              <div className="absolute inset-1 rounded-xl border border-white/40" />
              <span className="text-sm font-black text-white">O</span>
            </div>
            <div>
              <p className="text-base font-black leading-4 tracking-tight">
                Oramis
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Conversaciones
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
            {sectionPermissions.conversations && (
              <a href="/app/conversations" className="text-emerald-600">
                Conversaciones
              </a>
            )}
            {sectionPermissions.metrics && (
              <a href="/app/metrics" className="transition hover:text-emerald-600">
                Métricas
              </a>
            )}
            {sectionPermissions.business && (
              <a href="/app/business" className="transition hover:text-emerald-600">
                Negocio
              </a>
            )}
            {sectionPermissions.admin && (
              <a href="/app/admin" className="transition hover:text-emerald-600">
                Administración
              </a>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {tenant && (
              <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 sm:block">
                {tenant.nombre_empresa}
              </div>
            )}
            <a
              href="/logout"
              className="rounded-full bg-[#07111f] px-4 py-2 text-xs font-black text-white shadow-md shadow-slate-300 transition hover:bg-emerald-600"
            >
              Salir
            </a>
          </div>
        </div>
      </header>

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
        <>
          <section className="mx-auto max-w-[1600px] px-4 pt-4 lg:px-5">
            <details className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <summary className="cursor-pointer text-sm font-black text-[#07111f]">
                Ayuda / Primer ingreso al Centro de conversaciones
              </summary>

              <div className="mt-3 grid gap-3 text-sm font-semibold leading-6 text-slate-600 md:grid-cols-2">
                <div>
                  <p className="font-black text-slate-800">Primer ingreso</p>
                  <p className="mt-1">
                    Ingresá al Centro de conversaciones con el mismo email que usás en Oramis:
                    <span className="ml-1 font-black text-emerald-700">
                      {context?.user?.email ?? "tu email de Oramis"}
                    </span>
                  </p>
                  <p className="mt-1">
                    Si todavía no tenés contraseña, tocá “¿Olvidaste tu contraseña?” en la pantalla de Chatwoot.
                    Vas a recibir un email desde <span className="font-black">no-reply@oramis.ai</span>.
                  </p>
                </div>

                <div>
                  <p className="font-black text-slate-800">Preguntas frecuentes</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Oramis y el Centro de conversaciones usan el mismo email, pero tienen contraseñas separadas.</li>
                    <li>Si el email no llega, revisá spam o promociones.</li>
                    <li>Si seguís sin poder ingresar, pedile a un administrador que revise que tu usuario esté activo.</li>
                  </ul>
                </div>
              </div>
            </details>
          </section>

          <ChatwootFrame chatwootUrl={chatwootUrl} />
        </>
      )}
    </main>
  );
}

function StateCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-8 lg:px-0">
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-amber-950">
          {title}
        </h2>
        <p className="mt-3 text-base font-semibold leading-7 text-amber-900">
          {text}
        </p>
      </div>
    </section>
  );
}


function Header({
  subtitle,
  tenantName,
}: {
  subtitle: string;
  tenantName: string | null;
}) {
  return (
    <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 lg:px-5">
        <a href="/app" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200">
            <div className="absolute inset-1 rounded-xl border border-white/40" />
            <span className="text-sm font-black text-white">O</span>
          </div>
          <div>
            <p className="text-base font-black leading-4 tracking-tight">
              Oramis
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {subtitle}
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          <a href="/app/conversations" className="text-emerald-600">
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

        <div className="flex items-center gap-3">
          {tenantName && (
            <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 sm:block">
              {tenantName}
            </div>
          )}

          <a
            href="/logout"
            className="rounded-full bg-[#07111f] px-4 py-2 text-xs font-black text-white shadow-md shadow-slate-300 transition hover:bg-emerald-600"
          >
            Salir
          </a>
        </div>
      </div>
    </header>
  );
}
