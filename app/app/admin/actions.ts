"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { syncChatwootTenantUser } from "@/utils/oramis/chatwoot";

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

function getAppUrl() {
  return (
    process.env.ORAMIS_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.oramis.ai"
  ).replace(/\/$/, "");
}

function normalizeUserPermissions(formData: FormData) {
  const admin = boolValue(formData, "perm_admin");

  const conversations = boolValue(formData, "perm_conversations");
  const metrics = boolValue(formData, "perm_metrics");
  const business = boolValue(formData, "perm_business");

  let equipoVentas = boolValue(formData, "equipo_ventas");
  let equipoSoporte = boolValue(formData, "equipo_soporte");
  let conversacionesAcceso = "ninguno";

  // Administración es un permiso independiente.
  // No fuerza acceso a Conversaciones, Métricas ni Negocio.

  if (!conversations) {
    equipoVentas = false;
    equipoSoporte = false;
    conversacionesAcceso = "ninguno";
  } else if (equipoVentas || equipoSoporte) {
    conversacionesAcceso = "operador";
  } else {
    conversacionesAcceso = "supervisor";
  }

  return {
    admin,
    conversations,
    metrics,
    business,
    conversacionesAcceso,
    equipoVentas,
    equipoSoporte,
    permisos: {
      conversations,
      metrics,
      business,
      admin,
    },
  };
}

export async function createTenantUser(formData: FormData) {
  const context = await getCurrentTenantContext();

  if (!context?.tenant?.tenant_id) {
    throw new Error("No hay tenant activo.");
  }

  if (!getCurrentUserCanAdmin(context)) {
    throw new Error("No tenés permisos para administrar usuarios.");
  }

  const tenantId = context.tenant.tenant_id;

  const email = textValue(formData, "email").toLowerCase();
  const nombre = textValue(formData, "nombre");
  const apellido = textValue(formData, "apellido");
  const telefono = textValue(formData, "telefono");

  if (!email || !email.includes("@")) {
    throw new Error("Ingresá un email válido.");
  }

  const normalized = normalizeUserPermissions(formData);

  const adminClient = createAdminClient();

  const { data: existingMembership, error: existingError } = await adminClient
    .from("usuarios_tenants")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    console.error("Error validando usuario existente:", existingError);
    throw new Error("No se pudo validar si el usuario ya existe.");
  }

  if (existingMembership?.id) {
    throw new Error("Ese email ya está asociado a este negocio.");
  }

  let userId: string | null = null;
  let invitationStatus = "enviado";
  let emailLimited = false;

  const redirectTo = `${getAppUrl()}/reset-password`;

  const { data: inviteData, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        nombre,
        apellido,
      },
    });

  if (inviteError) {
    const msg = String(inviteError.message || "").toLowerCase();

    if (
      msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      msg.includes("user")
    ) {
      const { data: usersList, error: listError } =
        await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (listError) {
        console.error("Error buscando usuario existente en Auth:", listError);
        throw new Error("El usuario ya existe, pero no pudimos recuperarlo desde Auth.");
      }

      const existingAuthUser = usersList.users.find(
        (user) => String(user.email || "").toLowerCase() === email
      );

      userId = existingAuthUser?.id ?? null;

      const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        const resetMsg = String(resetError.message || "").toLowerCase();
        const resetCode = String((resetError as any).code || "").toLowerCase();

        if (
          resetCode === "over_email_send_rate_limit" ||
          resetMsg.includes("rate limit")
        ) {
          console.error("Rate limit reenviando email para usuario existente:", resetError);
          emailLimited = true;
          invitationStatus = "pendiente_rate_limit";
        } else {
          console.error("Error enviando email para usuario existente:", resetError);
          throw new Error(
            `El usuario ya existe, pero no se pudo enviar el email de acceso: ${resetError.message}`
          );
        }
      } else {
        invitationStatus = "reenviado";
      }
    } else {
      const inviteCode = String((inviteError as any).code || "").toLowerCase();

      if (
        inviteCode === "over_email_send_rate_limit" ||
        msg.includes("rate limit")
      ) {
        console.error("Rate limit invitando usuario:", inviteError);
        emailLimited = true;
        invitationStatus = "pendiente_rate_limit";
      } else {
        console.error("Error invitando usuario:", inviteError);
        throw new Error(`No se pudo invitar el usuario: ${inviteError.message}`);
      }
    }
  } else {
    userId = inviteData.user?.id ?? null;
  }

  const { data: insertedMembershipRaw, error: insertError } = await adminClient
    .from("usuarios_tenants")
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      email,
      rol: normalized.admin ? "admin" : "operador",
      nombre: nombre || null,
      apellido: apellido || null,
      telefono: telefono || null,
      activo: true,
      permisos: normalized.permisos,
      conversaciones_acceso: normalized.conversacionesAcceso,
      equipo_ventas: normalized.equipoVentas,
      equipo_soporte: normalized.equipoSoporte,
      chatwoot_sync_estado: "pendiente",
      auth_invitation_estado: invitationStatus,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error creando usuario_tenant después de invitación:", insertError);
    throw new Error("No se pudo asociar el usuario al negocio.");
  }

  const insertedMembership = insertedMembershipRaw as unknown as { id: string } | null;

  if (insertedMembership?.id && context.tenant.account_id) {
    try {
      const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ").trim();

      const syncResult = await syncChatwootTenantUser({
        tenantId: Number(tenantId),
        usuarioTenantId: insertedMembership.id,
        accountId: Number(context.tenant.account_id),
        ventasTeamId: context.tenant.chatwoot_team_id_ventas
          ? Number(context.tenant.chatwoot_team_id_ventas)
          : null,
        soporteTeamId: context.tenant.chatwoot_team_id_soporte
          ? Number(context.tenant.chatwoot_team_id_soporte)
          : null,
        email,
        name: nombreCompleto || email || "Usuario Oramis",
        conversaciones: normalized.permisos.conversations === true,
        conversacionesAcceso: normalized.conversacionesAcceso,
        equipoVentas: normalized.equipoVentas === true,
        equipoSoporte: normalized.equipoSoporte === true,
        existingChatwootUserId: null,
      });

      await adminClient
        .from("usuarios_tenants")
        .update({
          chatwoot_user_id: syncResult.chatwootUserId,
          chatwoot_sync_estado: syncResult.estado,
          chatwoot_sync_error: null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("tenant_id", tenantId)
        .eq("id", insertedMembership.id);
    } catch (syncError) {
      const message =
        syncError instanceof Error
          ? syncError.message
          : "Error desconocido sincronizando Chatwoot";

      console.error("Error sincronizando Chatwoot al crear usuario:", syncError);

      await adminClient
        .from("usuarios_tenants")
        .update({
          chatwoot_sync_estado: "error",
          chatwoot_sync_error: message.slice(0, 500),
          updated_at: new Date().toISOString(),
        } as never)
        .eq("tenant_id", tenantId)
        .eq("id", insertedMembership.id);
    }
  }

  revalidatePath("/app/admin");

  redirect("/app/admin?created=1");
}

export async function resendTenantUserInvitation(formData: FormData) {
  const context = await getCurrentTenantContext();

  if (!context?.tenant?.tenant_id) {
    throw new Error("No hay tenant activo.");
  }

  if (!getCurrentUserCanAdmin(context)) {
    throw new Error("No tenés permisos para administrar usuarios.");
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  const tenantId = context.tenant.tenant_id;
  const usuarioTenantId = textValue(formData, "usuario_tenant_id");

  if (!usuarioTenantId) {
    throw new Error("Falta usuario_tenant_id.");
  }

  const { data: usuario, error: userError } = await supabase
    .from("usuarios_tenants")
    .select("id, email")
    .eq("tenant_id", tenantId)
    .eq("id", usuarioTenantId)
    .single();

  if (userError || !usuario?.email) {
    console.error("Error leyendo usuario para reenviar invitación:", userError);
    throw new Error("No se pudo leer el usuario para reenviar la invitación.");
  }

  const redirectTo = `${getAppUrl()}/reset-password`;

  const { error } = await adminClient.auth.resetPasswordForEmail(usuario.email, {
    redirectTo,
  });

  if (error) {
    console.error("Error reenviando invitación/reset:", error);
    throw new Error(`No se pudo reenviar la invitación: ${error.message}`);
  }

  const { error: updateError } = await supabase
    .from("usuarios_tenants")
    .update({
      auth_invitation_estado: "reenviado",
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("id", usuarioTenantId);

  if (updateError) {
    console.error("Error actualizando estado de invitación:", updateError);
  }

  revalidatePath("/app/admin");
  redirect("/app/admin?resent=1");
}

export async function deleteTenantUser(formData: FormData) {
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

  const { data: usuariosActuales, error: usersError } = await supabase
    .from("usuarios_tenants")
    .select("id, activo, permisos")
    .eq("tenant_id", tenantId);

  if (usersError) {
    console.error("Error leyendo usuarios para validar eliminación:", usersError);
    throw new Error("No se pudo validar la configuración de usuarios.");
  }

  const activosConAdminLuegoDeEliminar = (usuariosActuales ?? []).filter((u: any) => {
    if (u.id === usuarioTenantId) return false;
    return u.activo === true && permisoAdmin(u.permisos);
  });

  if (activosConAdminLuegoDeEliminar.length === 0) {
    throw new Error("No podés eliminar el único usuario administrador activo del negocio.");
  }

  const { error } = await supabase
    .from("usuarios_tenants")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("id", usuarioTenantId);

  if (error) {
    console.error("Error eliminando usuario tenant:", error);
    throw new Error("No se pudo eliminar el usuario del negocio.");
  }

  revalidatePath("/app/admin");
  redirect("/app/admin?deleted=1");
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

  const normalized = normalizeUserPermissions(formData);
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
      return activo && normalized.admin;
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
    permisos: normalized.permisos,
    conversaciones_acceso: normalized.conversacionesAcceso,
    equipo_ventas: normalized.equipoVentas,
    equipo_soporte: normalized.equipoSoporte,
    rol: normalized.admin ? "admin" : "operador",
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

  let chatwootSyncFailed = false;

  const { data: usuarioActualizado, error: usuarioActualizadoError } = await supabase
    .from("usuarios_tenants")
    .select(
      [
        "id",
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
    .eq("tenant_id", tenantId)
    .eq("id", usuarioTenantId)
    .single();

  if (usuarioActualizadoError || !usuarioActualizado) {
    console.error("Error leyendo usuario actualizado para sincronizar Chatwoot:", usuarioActualizadoError);
    chatwootSyncFailed = true;
  } else {
    try {
      const usuario = usuarioActualizado as unknown as {
        id: string;
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

      const nombreCompleto = [usuario.nombre, usuario.apellido]
        .filter(Boolean)
        .join(" ")
        .trim();

      const result = await syncChatwootTenantUser({
        tenantId: Number(tenantId),
        usuarioTenantId: usuario.id,
        accountId: Number(context.tenant.account_id),
        ventasTeamId: context.tenant.chatwoot_team_id_ventas
          ? Number(context.tenant.chatwoot_team_id_ventas)
          : null,
        soporteTeamId: context.tenant.chatwoot_team_id_soporte
          ? Number(context.tenant.chatwoot_team_id_soporte)
          : null,
        email: usuario.email || "",
        name: nombreCompleto || usuario.email || "Usuario Oramis",
        conversaciones: usuario.permisos?.conversations === true,
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
        .eq("tenant_id", tenantId)
        .eq("id", usuarioTenantId);
    } catch (syncError) {
      chatwootSyncFailed = true;

      const message =
        syncError instanceof Error ? syncError.message : "Error desconocido sincronizando Chatwoot";

      console.error("Error sincronizando Chatwoot al guardar usuario:", syncError);

      await supabase
        .from("usuarios_tenants")
        .update({
          chatwoot_sync_estado: "error",
          chatwoot_sync_error: message.slice(0, 500),
          updated_at: new Date().toISOString(),
        } as never)
        .eq("tenant_id", tenantId)
        .eq("id", usuarioTenantId);
    }
  }

  revalidatePath("/app/admin");

  if (chatwootSyncFailed) {
    redirect("/app/admin?saved=1&chatwoot_error=1");
  }

  redirect("/app/admin?saved=1&chatwoot_synced=1");
}
