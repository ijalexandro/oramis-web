import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { getSectionPermissions } from "@/utils/oramis/permissions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ayuda | Oramis",
  description: "Ayuda para usar Oramis.",
};

export default async function HelpPage() {
  const context = await getCurrentTenantContext();
  const tenant = context?.tenant;
  const sectionPermissions = getSectionPermissions(context?.membership);

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header
        subtitle="Ayuda"
        tenantName={tenant?.nombre_empresa ?? null}
        sectionPermissions={sectionPermissions}
      />

      <section className="mx-auto max-w-[1180px] px-4 py-8 lg:px-5">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">
            Ayuda
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#07111f]">
            Primer ingreso al Centro de conversaciones
          </h1>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-black text-[#07111f]">
                Cómo ingresar por primera vez
              </h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm font-semibold leading-6 text-slate-600">
                <li>
                  Ingresá al Centro de conversaciones con el mismo email que usás en Oramis.
                </li>
                <li>
                  Si todavía no tenés contraseña, tocá “¿Olvidaste tu contraseña?” en la pantalla de Chatwoot.
                </li>
                <li>
                  Vas a recibir un email desde <span className="font-black">no-reply@oramis.ai</span>.
                </li>
                <li>
                  Creá tu contraseña y volvé a la sección Conversaciones.
                </li>
              </ol>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-black text-[#07111f]">
                Preguntas frecuentes
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm font-semibold leading-6 text-slate-600">
                <li>
                  Oramis y el Centro de conversaciones usan el mismo email, pero tienen contraseñas separadas.
                </li>
                <li>
                  Si el email no llega, revisá spam o promociones.
                </li>
                <li>
                  Si seguís sin poder ingresar, pedile a un administrador que revise que tu usuario esté activo.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Header({
  subtitle,
  tenantName,
  sectionPermissions,
}: {
  subtitle: string;
  tenantName: string | null;
  sectionPermissions: {
    conversations: boolean;
    metrics: boolean;
    business: boolean;
    admin: boolean;
  };
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
            <p className="text-base font-black leading-4 tracking-tight">Oramis</p>
            <p className="text-[11px] font-semibold text-slate-500">{subtitle}</p>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          {sectionPermissions.conversations && (
            <a href="/app/conversations" className="transition hover:text-emerald-600">
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
          <a href="/app/help" className="text-emerald-600">
            Ayuda
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
