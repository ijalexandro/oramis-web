import jwt from "jsonwebtoken";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { canAccessSection, getSectionPermissions } from "@/utils/oramis/permissions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Métricas | Oramis",
  description: "Métricas comerciales de Oramis.",
};

function buildMetabaseEmbedUrl(tenantId: number) {
  const siteUrl = process.env.METABASE_SITE_URL;
  const secretKey = process.env.METABASE_SECRET_KEY;
  const dashboardId = process.env.METABASE_DASHBOARD_ID;

  if (!siteUrl || !secretKey || !dashboardId) {
    return null;
  }

  const fechaHasta = new Date();
  const fechaDesde = new Date();
  fechaDesde.setDate(fechaHasta.getDate() - 7);

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const fechaDesdeParam = formatDate(fechaDesde);
  const fechaHastaParam = formatDate(fechaHasta);

  const payload = {
    resource: { dashboard: Number(dashboardId) },
    params: {
      "n%C3%BAmero": String(tenantId),
    },
    exp: Math.round(Date.now() / 1000) + 60 * 10,
  };

  const token = jwt.sign(payload, secretKey);

  const query = new URLSearchParams({
    fecha_desde: fechaDesdeParam,
    fecha_hasta: fechaHastaParam,
  });

  return `${siteUrl}/embed/dashboard/${token}?${query.toString()}#bordered=true&titled=false`;
}

export default async function MetricsPage() {
  const context = await getCurrentTenantContext();
  const canViewMetrics = canAccessSection(context?.membership, "metrics");
  const sectionPermissions = getSectionPermissions(context?.membership);
  const tenant = context?.tenant;
  const membership = context?.membership;

  const embedUrl = tenant ? buildMetabaseEmbedUrl(tenant.tenant_id) : null;

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle="Métricas" tenantName={tenant?.nombre_empresa ?? null} permissions={sectionPermissions} />

      {!canViewMetrics && (
        <section className="mx-auto max-w-[1180px] px-4 py-8 lg:px-5">
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-amber-950">
              No tenés permisos para ver métricas
            </h2>
            <p className="mt-3 text-base font-semibold leading-7 text-amber-900">
              Tu usuario no tiene habilitada la sección Métricas de este negocio.
            </p>
          </div>
        </section>
      )}

      {canViewMetrics && (

      <section className="mx-auto max-w-[1600px] px-3 py-3 lg:px-5">

        {!context && (
          <StateCard
            title="No pudimos leer tu sesión"
            text="Volvé a ingresar para ver las métricas."
          />
        )}

        {context && !tenant && (
          <StateCard
            title="Tu usuario todavía no tiene un entorno activo"
            text="El login funciona, pero falta asociar tu cuenta a un negocio en Oramis."
          />
        )}

        {tenant && !embedUrl && (
          <StateCard
            title="Metabase todavía no está configurado"
            text="Faltan variables de entorno para embeber el dashboard de métricas."
          />
        )}

        {embedUrl && (
          <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-xl shadow-emerald-950/5">
            <iframe
              src={embedUrl}
              className="h-[calc(100vh-150px)] min-h-[760px] w-full border-0 bg-white"
              title="Métricas comerciales Oramis"
            />
          </div>
        )}
      </section>
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
        <a href="/app/conversations" className="flex items-center gap-2.5">
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
            <a href="/app/metrics" className="text-emerald-600">
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
