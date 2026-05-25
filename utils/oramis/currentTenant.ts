import { createClient } from "@/utils/supabase/server";

export type CurrentTenantContext = {
  user: {
    id: string;
    email: string | null;
  };
  membership: {
    tenant_id: number;
    rol: string;
    activo: boolean;
    email: string | null;
    nombre: string | null;
    apellido: string | null;
  } | null;
  tenant: {
    tenant_id: number;
    nombre_empresa: string;
    estado: string;
    url_chatwoot: string | null;
    account_id: number | null;
    inbox_id: number | null;
    chatwoot_team_id_ventas: number | null;
    chatwoot_team_id_soporte: number | null;
  } | null;
};

export async function getCurrentTenantContext(): Promise<CurrentTenantContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: memberships, error: membershipError } = await supabase
    .from("usuarios_tenants")
    .select("tenant_id, rol, activo, email, nombre, apellido, permisos, conversaciones_acceso, equipo_ventas, equipo_soporte")
    .eq("user_id", user.id)
    .eq("activo", true)
    .order("tenant_id", { ascending: true })
    .limit(1);

  if (membershipError) {
    console.error("Error leyendo usuarios_tenants:", membershipError);
  }

  const membership = memberships?.[0] ?? null;

  if (!membership) {
    return {
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      membership: null,
      tenant: null,
    };
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("_0_tenants")
    .select(
      "tenant_id, nombre_empresa, estado, url_chatwoot, account_id, inbox_id, chatwoot_team_id_ventas, chatwoot_team_id_soporte"
    )
    .eq("tenant_id", membership.tenant_id)
    .single();

  if (tenantError) {
    console.error("Error leyendo _0_tenants:", tenantError);
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    membership: {
      tenant_id: Number(membership.tenant_id),
      rol: String(membership.rol),
      activo: Boolean(membership.activo),
      email: membership.email,
      nombre: membership.nombre,
      apellido: membership.apellido,
    },
    tenant: tenant
      ? {
          tenant_id: Number(tenant.tenant_id),
          nombre_empresa: tenant.nombre_empresa,
          estado: String(tenant.estado),
          url_chatwoot: tenant.url_chatwoot,
          account_id: tenant.account_id,
          inbox_id: tenant.inbox_id,
          chatwoot_team_id_ventas: tenant.chatwoot_team_id_ventas,
          chatwoot_team_id_soporte: tenant.chatwoot_team_id_soporte,
        }
      : null,
  };
}
