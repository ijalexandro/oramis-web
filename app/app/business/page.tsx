import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { createClient } from "@/utils/supabase/server";
import { updateBusinessConfig } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Negocio | Oramis",
  description: "Configuración del negocio en Oramis.",
};

type BusinessTenant = {
  tenant_id: number;
  nombre_empresa: string;
  email_contacto: string | null;
  telefono_contacto: string | null;
  sitio_web: string | null;
  pais: string | null;
  moneda: string | null;
  variante_idioma: string | null;
  info_empresa: string | null;
  info_general: string | null;
  info_contestar_producto: string | null;
  usar_links_producto: boolean | null;
  check_stock_activo: boolean | null;
  cross_selling_activo: boolean | null;
  bot_activo: boolean | null;
};

type BusinessPageProps = {
  searchParams?: Promise<{
    saved?: string;
  }>;
};

export default async function BusinessPage({ searchParams }: BusinessPageProps) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const context = await getCurrentTenantContext();
  const tenantBase = context?.tenant;

  const supabase = await createClient();

  let tenant: BusinessTenant | null = null;
  let hasError = false;

  if (tenantBase?.tenant_id) {
    const result = await supabase
      .from("_0_tenants")
      .select(
        [
          "tenant_id",
          "nombre_empresa",
          "email_contacto",
          "telefono_contacto",
          "sitio_web",
          "pais",
          "moneda",
          "variante_idioma",
          "info_empresa",
          "info_general",
          "info_contestar_producto",
          "usar_links_producto",
          "check_stock_activo",
          "cross_selling_activo",
          "bot_activo",
        ].join(",")
      )
      .eq("tenant_id", tenantBase.tenant_id)
      .single();

    tenant = result.data as BusinessTenant | null;
    hasError = Boolean(result.error);
  }

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle="Negocio" tenantName={tenant?.nombre_empresa ?? null} />

      <section className="mx-auto max-w-[1180px] px-4 py-6 lg:px-5">
        {!context && (
          <StateCard
            title="No pudimos leer tu sesión"
            text="Volvé a ingresar para configurar el negocio."
          />
        )}

        {context && !tenantBase && (
          <StateCard
            title="Tu usuario todavía no tiene un entorno activo"
            text="El login funciona, pero falta asociar tu cuenta a un negocio en Oramis."
          />
        )}

        {tenantBase && hasError && (
          <StateCard
            title="No pudimos cargar la configuración"
            text="Hubo un problema leyendo los datos del negocio desde Supabase."
          />
        )}

        {tenant && (
          <form action={updateBusinessConfig} className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                    Configuración del negocio
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#07111f]">
                    Datos que usa Oramis para responder y vender.
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                    Estos campos alimentan el motor de ventas y definen cómo se comporta el bot para este negocio.
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  Guardar cambios
                </button>
              </div>

              {saved && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800">
                  Configuración guardada correctamente.
                </div>
              )}
            </div>

            <Section title="Estado del bot" description="Control operativo general del motor automático.">
              <ToggleField
                name="bot_activo"
                label="Responder automáticamente"
                description="Si está desactivado, Oramis no responderá automáticamente. Las conversaciones seguirán entrando a la bandeja comercial."
                defaultChecked={tenant.bot_activo !== false}
              />
            </Section>

            <Section title="Datos del negocio" description="Información básica visible y usada como contexto general.">
              <div className="grid gap-4 lg:grid-cols-2">
                <TextField name="nombre_empresa" label="Nombre comercial" defaultValue={tenant.nombre_empresa} required />
                <TextField name="email_contacto" label="Email de contacto" defaultValue={tenant.email_contacto} />
                <TextField name="telefono_contacto" label="Teléfono de contacto" defaultValue={tenant.telefono_contacto} />
                <TextField name="sitio_web" label="Sitio web" defaultValue={tenant.sitio_web} />
                <TextField name="pais" label="País" defaultValue={tenant.pais || "AR"} />
                <TextField name="moneda" label="Moneda" defaultValue={tenant.moneda || "ARS"} />
                <TextField name="variante_idioma" label="Variante de idioma" defaultValue={tenant.variante_idioma || "es-AR"} />
              </div>
            </Section>

            <Section title="Contexto para la IA" description="Texto que ayuda a Oramis a entender el negocio y responder mejor.">
              <div className="space-y-4">
                <TextAreaField
                  name="info_empresa"
                  label="Información de la empresa"
                  defaultValue={tenant.info_empresa}
                  rows={5}
                />
                <TextAreaField
                  name="info_general"
                  label="Información general"
                  defaultValue={tenant.info_general}
                  rows={6}
                />
                <TextAreaField
                  name="info_contestar_producto"
                  label="Reglas para responder sobre productos"
                  defaultValue={tenant.info_contestar_producto}
                  rows={6}
                />
              </div>
            </Section>

            <Section title="Configuración de venta" description="Opciones comerciales que el motor ya interpreta en el flujo actual.">
              <div className="grid gap-4 lg:grid-cols-3">
                <ToggleField
                  name="usar_links_producto"
                  label="Usar links de producto"
                  description="Permite que Oramis incluya enlaces a productos cuando estén disponibles."
                  defaultChecked={tenant.usar_links_producto !== false}
                />
                <ToggleField
                  name="check_stock_activo"
                  label="Verificar stock"
                  description="Indica al motor que tenga en cuenta stock cuando el catálogo lo permita."
                  defaultChecked={tenant.check_stock_activo === true}
                />
                <ToggleField
                  name="cross_selling_activo"
                  label="Cross-selling activo"
                  description="Permite sugerencias comerciales adicionales cuando correspondan."
                  defaultChecked={tenant.cross_selling_activo === true}
                />
              </div>
            </Section>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-[#07111f] px-7 py-4 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
              >
                Guardar configuración
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07111f]">
          {title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#07111f] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
  rows,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#07111f] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex h-full cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 transition hover:border-emerald-200 hover:bg-emerald-50/40">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
      />
      <span>
        <span className="block text-sm font-black text-[#07111f]">{label}</span>
        <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">
          {description}
        </span>
      </span>
    </label>
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
}: {
  subtitle: string;
  tenantName: string | null;
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
          <a href="/app/conversations" className="transition hover:text-emerald-600">
            Conversaciones
          </a>
          <a href="/app/metrics" className="transition hover:text-emerald-600">
            Métricas
          </a>
          <a href="/app/business" className="text-emerald-600">
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
