"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === null ? "" : String(value).trim();
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function permisoAdmin(permisos: unknown) {
  if (!permisos || typeof permisos !== "object" || Array.isArray(permisos)) {
    return false;
  }

  return (permisos as Record<string, unknown>).admin === true;
}

function getCurrentUserCanAdmin(context: Awaited<ReturnType<typeof getCurrentTenantContext>>) {
  const membership = context?.membership as
    | {
        rol?: string | null;
        permisos?: unknown;
      }
    | null
    | undefined;

  if (!membership) return false;

  const rol = String(membership.rol ?? "").toLowerCase();

  if (rol === "owner" || rol === "admin") return true;

  return permisoAdmin(membership.permisos);
}

export async function updateTenantUser(formData: FormData) {
  const context = await getCurrentTenantContext();

  if (!context?.tenant?.tenant_id) {
    throw new Error("No hay tenant activo.");
  }

  if (!getCurrentUserCanAdmin(context)) {
    throw new Error("No tenés permisos para administrar usuarios.");
  }

  const supabase = await createClient();

  const tenantId = context.tenant.tenant_id;
  const usuarioTenantId = textValue(formData, "usuario_tenant_id");

  if (!usuarioTenantId) {
    throw new Error("Falta usuario_tenant_id.");
  }

  const admin = boolValue(formData, "perm_admin");

  let conversations = boolValue(formData, "perm_conversations");
  let metrics = boolValue(formData, "perm_metrics");
  let business = boolValue(formData, "perm_business");

  let conversacionesAcceso = textValue(formData, "conversaciones_acceso") || "ninguno";

  let equipoVentas = boolValue(formData, "equipo_ventas");
  let equipoSoporte = boolValue(formData, "equipo_soporte");

  if (admin) {
    conversations = true;
    metrics = true;
    business = true;
    conversacionesAcceso = "supervisor";
    equipoVentas = true;
    equipoSoporte = true;
  }

  if (!conversations) {
    conversacionesAcceso = "ninguno";
    equipoVentas = false;
    equipoSoporte = false;
  }

  if (!["ninguno", "supervisor", "operador"].includes(conversacionesAcceso)) {
    conversacionesAcceso = "ninguno";
  }

  if (conversacionesAcceso === "ninguno") {
    equipoVentas = false;
    equipoSoporte = false;
  }

  const activo = boolValue(formData, "activo");

  const { data: usuariosActuales, error: usersError } = await supabase
    .from("usuarios_tenants")
    .select("id, activo, permisos")
    .eq("tenant_id", tenantId);

  if (usersError) {
    console.error("Error leyendo usuarios para validar admins:", usersError);
    throw new Error("No se pudo validar la configuración de usuarios.");
  }

  const activosConAdmin = (usuariosActuales ?? []).filter((u: any) => {
    if (u.id === usuarioTenantId) {
      return activo && admin;
    }

    return u.activo === true && permisoAdmin(u.permisos);
  });

  if (activosConAdmin.length === 0) {
    throw new Error("No podés dejar el negocio sin ningún usuario administrador activo.");
  }

  const payload = {
    nombre: textValue(formData, "nombre") || null,
    apellido: textValue(formData, "apellido") || null,
    telefono: textValue(formData, "telefono") || null,
    activo,
    permisos: {
      conversations,
      metrics,
      business,
      admin,
    },
    conversaciones_acceso: conversacionesAcceso,
    equipo_ventas: equipoVentas,
    equipo_soporte: equipoSoporte,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("usuarios_tenants")
    .update(payload)
    .eq("tenant_id", tenantId)
    .eq("id", usuarioTenantId);

  if (error) {
    console.error("Error actualizando usuario tenant:", error);
    throw new Error("No se pudo actualizar el usuario.");
  }

  revalidatePath("/app/admin");
  redirect("/app/admin?saved=1");
}
