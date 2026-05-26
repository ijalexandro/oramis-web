"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { canAccessSection } from "@/utils/oramis/permissions";
import { syncChatwootTenantUser } from "@/utils/oramis/chatwoot";

type UsuarioTenantRow = {
  id: string;
  tenant_id: number;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  permisos: {
    conversations?: boolean;
    metrics?: boolean;
    business?: boolean;
    admin?: boolean;
  } | null;
  conversaciones_acceso: string | null;
  equipo_ventas: boolean | null;
  equipo_soporte: boolean | null;
  chatwoot_user_id: number | null;
};

export async function syncChatwootUserAction(formData: FormData) {
  const usuarioId = String(formData.get("usuario_id") || "");

  if (!usuarioId) {
    redirect("/app/admin?chatwoot_error=1");
  }

  const context = await getCurrentTenantContext();

  if (!context?.tenant || !canAccessSection(context.membership, "admin")) {
    redirect("/app/admin?chatwoot_error=1");
  }

  const supabase = await createClient();

  const { data: usuarioData, error: usuarioError } = await supabase
    .from("usuarios_tenants")
    .select(
      [
        "id",
        "tenant_id",
        "email",
        "nombre",
        "apellido",
        "permisos",
        "conversaciones_acceso",
        "equipo_ventas",
        "equipo_soporte",
        "chatwoot_user_id",
      ].join(",")
    )
    .eq("id", usuarioId)
    .eq("tenant_id", context.tenant.tenant_id)
    .single();

  const usuario = usuarioData as unknown as UsuarioTenantRow | null;

  if (usuarioError || !usuario) {
    redirect("/app/admin?chatwoot_error=1");
  }

  try {
    const permisos = usuario.permisos ?? {};
    const nombreCompleto = [usuario.nombre, usuario.apellido]
      .filter(Boolean)
      .join(" ")
      .trim();

    const result = await syncChatwootTenantUser({
      accountId: Number(context.tenant.account_id),
      ventasTeamId: context.tenant.chatwoot_team_id_ventas
        ? Number(context.tenant.chatwoot_team_id_ventas)
        : null,
      soporteTeamId: context.tenant.chatwoot_team_id_soporte
        ? Number(context.tenant.chatwoot_team_id_soporte)
        : null,
      email: usuario.email || "",
      name: nombreCompleto || usuario.email || "Usuario Oramis",
      conversaciones: permisos.conversations === true,
      conversacionesAcceso: usuario.conversaciones_acceso,
      equipoVentas: usuario.equipo_ventas === true,
      equipoSoporte: usuario.equipo_soporte === true,
      existingChatwootUserId: usuario.chatwoot_user_id,
    });

    await supabase
      .from("usuarios_tenants")
      .update({
        chatwoot_user_id: result.chatwootUserId,
        chatwoot_sync_estado: result.estado,
        chatwoot_sync_error: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", usuario.id)
      .eq("tenant_id", context.tenant.tenant_id);

    revalidatePath("/app/admin");
    redirect("/app/admin?chatwoot_synced=1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    await supabase
      .from("usuarios_tenants")
      .update({
        chatwoot_sync_estado: "error",
        chatwoot_sync_error: message.slice(0, 500),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", usuario.id)
      .eq("tenant_id", context.tenant.tenant_id);

    revalidatePath("/app/admin");
    redirect("/app/admin?chatwoot_error=1");
  }
}
