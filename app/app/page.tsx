import { redirect } from "next/navigation";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { getSectionPermissions } from "@/utils/oramis/permissions";

export const dynamic = "force-dynamic";

function normalizeStatus(status: string | null | undefined) {
  return String(status || "").toLowerCase();
}

export default async function AppPage() {
  const context = await getCurrentTenantContext();

  if (!context?.user) {
    redirect("/login");
  }

  if (!context.membership || !context.tenant) {
    redirect("/app/demo/new");
  }

  const tenantStatus = normalizeStatus(context.tenant.estado);

  if (tenantStatus === "pendiente_onboarding") {
    redirect("/app/demo/new");
  }

  if (tenantStatus === "demo") {
    if (context.tenant.tabla_productos) {
      redirect("/app/demo/preview");
    }

    redirect("/app/demo/new");
  }

  if (tenantStatus === "suspendido" || tenantStatus === "cancelado") {
    return (
      <main className="min-h-screen bg-[#f6fbf8] px-4 py-8 text-[#07111f] lg:px-5">
        <section className="mx-auto max-w-[900px]">
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-700">
              Cuenta no disponible
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-amber-950">
              Tu cuenta no está activa en este momento.
            </h1>
            <p className="mt-3 text-base font-semibold leading-7 text-amber-900">
              Estado: {context.tenant.estado}
              {context.tenant.motivo_estado ? ` · Motivo: ${context.tenant.motivo_estado}` : ""}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const permissions = getSectionPermissions(context.membership);

  if (permissions.conversations) {
    redirect("/app/conversations");
  }

  if (permissions.metrics) {
    redirect("/app/metrics");
  }

  if (permissions.business) {
    redirect("/app/business");
  }

  if (permissions.admin) {
    redirect("/app/admin");
  }

  return (
    <main className="min-h-screen bg-[#f6fbf8] px-4 py-8 text-[#07111f] lg:px-5">
      <section className="mx-auto max-w-[1180px]">
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
          <h1 className="text-2xl font-black tracking-[-0.04em] text-amber-950">
            No tenés secciones habilitadas
          </h1>
          <p className="mt-3 text-base font-semibold leading-7 text-amber-900">
            Tu usuario está activo, pero todavía no tiene permisos para acceder a ninguna sección de este negocio.
          </p>
        </div>
      </section>
    </main>
  );
}
