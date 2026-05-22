import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Onboarding | Oramis",
  description: "Onboarding inicial de Oramis.",
};

export default async function AppHomePage() {
  const context = await getCurrentTenantContext();

  return (
    <AppShell subtitle="Inicio">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
          Bienvenido a Oramis
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#07111f] sm:text-5xl">
          Empezá con una demo o activá el servicio.
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-slate-600">
          Podés probar Oramis con productos de tu web o avanzar con la
          contratación para dejarlo funcionando en tu operación comercial.
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <TenantContextCard context={context} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ChoiceCard
            eyebrow="Demo gratis"
            title="Probar con mis productos"
            description="Ingresá tu sitio web y prepará una demo para ver cómo Oramis respondería consultas, recomendaría productos y armaría oportunidades."
            href="/app/demo/new"
            cta="Crear demo"
            primary
          />

          <ChoiceCard
            eyebrow="Activación"
            title="Contratar Oramis"
            description="Completá los datos de tu operación comercial para avanzar con la configuración, el canal de atención y el modelo recomendado."
            href="/app/contract"
            cta="Quiero contratar"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <LockedLink
          title="Conversaciones comerciales"
          description="Vista previa de la bandeja donde tu equipo responde conversaciones de venta, atención y seguimiento desde un solo lugar."
          href="/app/conversations"
        />
        <LockedLink
          title="Métricas comerciales"
          description="Vista previa del módulo para medir consultas, intención, productos pedidos, carritos y oportunidades generadas."
          href="/app/metrics"
        />
      </section>
    </AppShell>
  );
}

function TenantContextCard({
  context,
}: {
  context: Awaited<ReturnType<typeof getCurrentTenantContext>>;
}) {
  if (!context) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-7 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-red-600">
          Sesión
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-red-950">
          No se pudo leer la sesión.
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-red-800">
          Volvé a ingresar para continuar.
        </p>
      </div>
    );
  }

  if (!context.tenant || !context.membership) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-700">
          Cuenta sin negocio asociado
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-amber-950">
          Falta vincular tu usuario a un tenant.
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-amber-900">
          Tu login funciona, pero todavía no tenés una empresa activa asociada
          en Oramis.
        </p>
        <p className="mt-4 rounded-2xl bg-white/70 p-4 text-xs font-bold leading-5 text-amber-900">
          Usuario: {context.user.email}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-[#07111f] p-7 text-white shadow-xl shadow-slate-300">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
        Entorno activo
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
        {context.tenant.nombre_empresa}
      </h2>

      <div className="mt-6 grid gap-3 text-sm font-semibold leading-6 text-slate-300">
        <InfoRow label="Tenant" value={String(context.tenant.tenant_id)} />
        <InfoRow label="Estado" value={context.tenant.estado} />
        <InfoRow label="Rol" value={context.membership.rol} />
        <InfoRow
          label="Chatwoot"
          value={
            context.tenant.url_chatwoot
              ? `${context.tenant.url_chatwoot} · account ${context.tenant.account_id ?? "-"}`
              : "Sin configurar"
          }
        />
        <InfoRow
          label="Inbox"
          value={context.tenant.inbox_id ? String(context.tenant.inbox_id) : "Sin configurar"}
        />
      </div>

      <p className="mt-6 rounded-2xl bg-white/10 p-4 text-xs font-bold leading-5 text-slate-300">
        Por ahora usamos el primer tenant activo asociado al usuario. Más
        adelante podemos agregar selector si hace falta operar varios negocios.
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-black text-white">{value}</span>
    </div>
  );
}

function ChoiceCard({
  eyebrow,
  title,
  description,
  href,
  cta,
  primary = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#07111f]">
        {title}
      </h2>
      <p className="mt-4 text-base font-medium leading-7 text-slate-600">
        {description}
      </p>
      <a
        href={href}
        className={`mt-7 inline-flex rounded-full px-7 py-4 text-center text-base font-black shadow-xl transition ${
          primary
            ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600"
            : "bg-[#07111f] text-white shadow-slate-300 hover:bg-emerald-600"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function LockedLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-lg hover:shadow-emerald-950/5"
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
        Vista previa
      </p>
      <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#07111f]">
        {title}
      </h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
        {description}
      </p>
      <p className="mt-5 text-sm font-black text-emerald-600">
        Ver módulo →
      </p>
    </a>
  );
}

function AppShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle={subtitle} />
      <section className="mx-auto max-w-[1240px] px-5 py-8 lg:px-0">
        {children}
      </section>
    </main>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-0">
        <a href="/app" className="flex items-center gap-3">
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
          <a href="/app" className="transition hover:text-emerald-600">
            Inicio
          </a>
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
