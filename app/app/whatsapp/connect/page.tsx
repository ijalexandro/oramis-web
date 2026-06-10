import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { getSectionPermissions } from "@/utils/oramis/permissions";
import WhatsAppEmbeddedSignupTest from "./WhatsAppEmbeddedSignupTest";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conectar WhatsApp | Oramis",
  description: "Conexión de WhatsApp a Oramis.",
};

const META_APP_ID =
  process.env.NEXT_PUBLIC_META_APP_ID || "1062228460316734";

const META_WHATSAPP_CONFIGURATION_ID =
  process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIGURATION_ID || "828535606751091";

type WhatsAppConnectPageProps = {
  searchParams?: Promise<{
    debug?: string;
  }>;
};

export default async function WhatsAppConnectPage({
  searchParams,
}: WhatsAppConnectPageProps) {
  const params = await searchParams;
  const debugMode = params?.debug === "1";

  const context = await getCurrentTenantContext();
  const sectionPermissions = getSectionPermissions(context?.membership);
  const tenant = context?.tenant;

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header
        subtitle="Conectar WhatsApp"
        tenantName={tenant?.nombre_empresa ?? null}
        permissions={sectionPermissions}
      />

      <section className="mx-auto max-w-[1180px] px-4 py-6 lg:px-5">
        {!context && (
          <StateCard
            title="No pudimos leer tu sesión"
            text="Volvé a ingresar para conectar WhatsApp."
          />
        )}

        {context && !tenant && (
          <StateCard
            title="Tu usuario todavía no tiene un entorno activo"
            text="El login funciona, pero falta asociar tu cuenta a un negocio en Oramis."
          />
        )}

        {tenant && (
          <WhatsAppEmbeddedSignupTest
            appId={META_APP_ID}
            configurationId={META_WHATSAPP_CONFIGURATION_ID}
            debugMode={debugMode}
          />
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

function Header({
  subtitle,
  tenantName,
  permissions,
}: {
  subtitle: string;
  tenantName: string | null;
  permissions: {
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
            <p className="text-base font-black leading-4 tracking-tight">
              Oramis
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {subtitle}
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          {permissions.conversations && (
            <a href="/app/conversations" className="transition hover:text-emerald-600">
              Conversaciones
            </a>
          )}
          {permissions.metrics && (
            <a href="/app/metrics" className="transition hover:text-emerald-600">
              Métricas
            </a>
          )}
          {permissions.business && (
            <a href="/app/business" className="transition hover:text-emerald-600">
              Negocio
            </a>
          )}
          {permissions.admin && (
            <a href="/app/admin" className="transition hover:text-emerald-600">
              Administración
            </a>
          )}
          <a href="/app/help" className="transition hover:text-emerald-600">
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
