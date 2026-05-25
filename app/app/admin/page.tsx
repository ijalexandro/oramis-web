import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { createClient } from "@/utils/supabase/server";
import { createTenantUser, updateTenantUser } from "./actions";
import AdminSavedScroll from "./AdminSavedScroll";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administración | Oramis",
  description: "Administración de usuarios en Oramis.",
};

type AdminPageProps = {
  searchParams?: Promise<{
    saved?: string;
    created?: string;
  }>;
};

type UsuarioTenant = {
  id: string;
  tenant_id: number;
  user_id: string | null;
  email: string | null;
  rol: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  activo: boolean;
  permisos: {
    conversations?: boolean;
    metrics?: boolean;
    business?: boolean;
    admin?: boolean;
  } | null;
  conversaciones_acceso: "ninguno" | "supervisor" | "operador";
  equipo_ventas: boolean;
  equipo_soporte: boolean;
  chatwoot_user_id: number | null;
  chatwoot_sync_estado: string | null;
  chatwoot_sync_error: string | null;
  auth_invitation_estado: string | null;
  created_at: string;
  updated_at: string;
};

function usuarioEsAdminActivo(usuario: UsuarioTenant) {
  return usuario.activo === true && usuario.permisos?.admin === true;
}

function canAdminFromMembership(membership: any) {
  if (!membership) return false;

  const rol = String(membership.rol ?? "").toLowerCase();

  if (rol === "owner" || rol === "admin") return true;

  const permisos = membership.permisos;

  if (!permisos || typeof permisos !== "object" || Array.isArray(permisos)) {
    return false;
  }

  return permisos.admin === true;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const saved = params?.saved === "1";
  const created = params?.created === "1";

  const context = await getCurrentTenantContext();
  const tenant = context?.tenant;
  const membership = context?.membership;
  const canAdmin = canAdminFromMembership(membership);

  const supabase = await createClient();

  let usuarios: UsuarioTenant[] = [];
  let hasError = false;

  if (tenant?.tenant_id && canAdmin) {
    const result = await supabase
      .from("usuarios_tenants")
      .select(
        [
          "id",
          "tenant_id",
          "user_id",
          "email",
          "rol",
          "nombre",
          "apellido",
          "telefono",
          "activo",
          "permisos",
          "conversaciones_acceso",
          "equipo_ventas",
          "equipo_soporte",
          "chatwoot_user_id",
          "chatwoot_sync_estado",
          "chatwoot_sync_error",
          "auth_invitation_estado",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .eq("tenant_id", tenant.tenant_id)
      .order("created_at", { ascending: true });

    usuarios = (result.data ?? []) as unknown as UsuarioTenant[];
    hasError = Boolean(result.error);
  }

  const adminActivoIds = usuarios
    .filter(usuarioEsAdminActivo)
    .map((usuario) => usuario.id);

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <AdminSavedScroll saved={saved || created} />
      <Header subtitle="Administración" tenantName={tenant?.nombre_empresa ?? null} />

      <section className="mx-auto max-w-[1320px] px-4 py-6 lg:px-5">
        {!context && (
          <StateCard
            title="No pudimos leer tu sesión"
            text="Volvé a ingresar para administrar usuarios."
          />
        )}

        {context && !tenant && (
          <StateCard
            title="Tu usuario todavía no tiene un entorno activo"
            text="El login funciona, pero falta asociar tu cuenta a un negocio en Oramis."
          />
        )}

        {tenant && !canAdmin && (
          <StateCard
            title="No tenés permisos de administración"
            text="Tu usuario no tiene habilitada la administración de este negocio."
          />
        )}

        {tenant && canAdmin && hasError && (
          <StateCard
            title="No pudimos cargar los usuarios"
            text="Hubo un problema leyendo los usuarios desde Supabase."
          />
        )}

        {tenant && canAdmin && !hasError && (
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                    Administración
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#07111f]">
                    Usuarios y permisos
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                    Definí qué secciones puede ver cada usuario y cómo participa en conversaciones comerciales.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-900">
                  La sincronización automática con Chatwoot se agrega en el siguiente tramo.
                </div>
              </div>

              {saved && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800 shadow-sm">
                  ✅ Usuario actualizado correctamente.
                </div>
              )}

              {created && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800 shadow-sm">
                  ✅ Usuario invitado correctamente. Le enviamos un email para crear su acceso.
                </div>
              )}
            </div>

            <div className="space-y-4">
              {usuarios.map((usuario) => (
                <UserCard
                  key={usuario.id}
                  usuario={usuario}
                  isLastFullAdmin={
                    usuarioEsAdminActivo(usuario) &&
                    adminActivoIds.length === 1 &&
                    adminActivoIds[0] === usuario.id
                  }
                />
              ))}

              {usuarios.length === 0 && (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
                  Todavía no hay usuarios asociados a este negocio.
                </div>
              )}
            </div>

            <CreateUserCard />
          </div>
        )}
      </section>
    </main>
  );
}

function CreateUserCard() {
  return (
    <form
      action={createTenantUser}
      className="rounded-[1.5rem] border border-emerald-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
          Nuevo usuario
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#07111f]">
          Agregar usuario
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          El usuario recibirá un email para crear su contraseña y acceder a Oramis.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1.4fr_1.2fr_auto] xl:items-start">
        <div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <TextField name="email" label="Email" defaultValue="" required />
            <TextField name="nombre" label="Nombre" defaultValue="" />
            <TextField name="apellido" label="Apellido" defaultValue="" />
            <TextField name="telefono" label="Teléfono" defaultValue="" />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-slate-700">
            Secciones habilitadas
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxField
              name="perm_conversations"
              label="Conversaciones"
              defaultChecked={true}
            />
            <CheckboxField
              name="perm_metrics"
              label="Métricas"
              defaultChecked={false}
            />
            <CheckboxField
              name="perm_business"
              label="Negocio"
              defaultChecked={false}
            />
            <CheckboxField
              name="perm_admin"
              label="Administración"
              defaultChecked={false}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-slate-700">
            Conversaciones comerciales
          </p>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Acceso
            </span>
            <select
              name="conversaciones_acceso"
              defaultValue="operador"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#07111f] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="ninguno">Sin acceso</option>
              <option value="supervisor">Supervisor</option>
              <option value="operador">Operador</option>
            </select>
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <CheckboxField
              name="equipo_ventas"
              label="Equipo ventas"
              defaultChecked={true}
            />
            <CheckboxField
              name="equipo_soporte"
              label="Equipo soporte"
              defaultChecked={false}
            />
          </div>
        </div>

        <div className="flex h-full flex-col justify-end gap-4">
          <button
            type="submit"
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
          >
            Crear usuario
          </button>
        </div>
      </div>
    </form>
  );
}

function UserCard({
  usuario,
  isLastFullAdmin,
}: {
  usuario: UsuarioTenant;
  isLastFullAdmin: boolean;
}) {
  const permisos = usuario.permisos ?? {};

  const admin = permisos.admin === true;
  const conversations = admin || permisos.conversations === true;
  const metrics = admin || permisos.metrics === true;
  const business = admin || permisos.business === true;

  return (
    <form
      action={updateTenantUser}
      className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="usuario_tenant_id" value={usuario.id} />

      {isLastFullAdmin && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-900">
          Este es el único usuario administrador activo del negocio. Para proteger el acceso, no se puede desactivar ni quitarle Administración hasta crear o habilitar otro administrador.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1.4fr_1.2fr_auto] xl:items-start">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black tracking-[-0.03em] text-[#07111f]">
                {usuario.nombre || usuario.apellido
                  ? `${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.trim()
                  : usuario.email || "Usuario sin email"}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {usuario.email || "Sin email"}
              </p>
            </div>

            <Badge active={usuario.activo} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <TextField name="nombre" label="Nombre" defaultValue={usuario.nombre} />
            <TextField name="apellido" label="Apellido" defaultValue={usuario.apellido} />
            <TextField name="telefono" label="Teléfono" defaultValue={usuario.telefono} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-slate-700">
            Secciones habilitadas
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxField
              name="perm_conversations"
              label="Conversaciones"
              defaultChecked={conversations}
              disabled={admin}
            />
            <CheckboxField
              name="perm_metrics"
              label="Métricas"
              defaultChecked={metrics}
              disabled={admin}
            />
            <CheckboxField
              name="perm_business"
              label="Negocio"
              defaultChecked={business}
              disabled={admin}
            />
            <CheckboxField
              name="perm_admin"
              label="Administración"
              defaultChecked={admin}
              disabled={isLastFullAdmin}
              hiddenWhenDisabled={isLastFullAdmin}
            />
          </div>

          <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
            Si Administración está activo, el usuario queda con acceso completo a todas las secciones.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-slate-700">
            Conversaciones comerciales
          </p>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Acceso
            </span>
            <select
              name="conversaciones_acceso"
              defaultValue={admin ? "supervisor" : usuario.conversaciones_acceso || "ninguno"}
              disabled={admin}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#07111f] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="ninguno">Sin acceso</option>
              <option value="supervisor">Supervisor</option>
              <option value="operador">Operador</option>
            </select>
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <CheckboxField
              name="equipo_ventas"
              label="Equipo ventas"
              defaultChecked={admin || usuario.equipo_ventas}
              disabled={admin}
            />
            <CheckboxField
              name="equipo_soporte"
              label="Equipo soporte"
              defaultChecked={admin || usuario.equipo_soporte}
              disabled={admin}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-500">
            Chatwoot: {usuario.chatwoot_sync_estado || "pendiente"}
            {usuario.chatwoot_user_id ? ` · ID ${usuario.chatwoot_user_id}` : ""}
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-4">
          <CheckboxField
            name="activo"
            label="Usuario activo"
            defaultChecked={usuario.activo}
            disabled={isLastFullAdmin}
            hiddenWhenDisabled={isLastFullAdmin}
          />

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-500">
            Invitación: {usuario.auth_invitation_estado || "pendiente"}
          </div>

          <button
            type="submit"
            className="rounded-full bg-[#07111f] px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
          >
            Guardar usuario
          </button>
        </div>
      </div>
    </form>
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
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#07111f] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
  disabled = false,
  hiddenWhenDisabled = false,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  disabled?: boolean;
  hiddenWhenDisabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-black text-[#07111f] transition hover:border-emerald-200 hover:bg-emerald-50/40 has-disabled:cursor-not-allowed has-disabled:opacity-70">
      {disabled && hiddenWhenDisabled && defaultChecked && (
        <input type="hidden" name={name} value="on" />
      )}

      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
      />
      {label}
    </label>
  );
}

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500"
      }
    >
      {active ? "Activo" : "Inactivo"}
    </span>
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
          <a href="/app/business" className="transition hover:text-emerald-600">
            Negocio
          </a>
          <a href="/app/admin" className="text-emerald-600">
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
