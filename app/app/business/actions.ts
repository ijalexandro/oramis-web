"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === null ? null : String(value).trim();
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function updateBusinessConfig(formData: FormData) {
  const context = await getCurrentTenantContext();

  if (!context?.tenant?.tenant_id) {
    throw new Error("No hay tenant activo para actualizar.");
  }

  const supabase = await createClient();

  const payload = {
    bot_activo: boolValue(formData, "bot_activo"),

    nombre_empresa: textValue(formData, "nombre_empresa") || "Sin nombre",
    email_contacto: textValue(formData, "email_contacto"),
    telefono_contacto: textValue(formData, "telefono_contacto"),
    sitio_web: textValue(formData, "sitio_web"),

    pais: textValue(formData, "pais") || "AR",
    moneda: textValue(formData, "moneda") || "ARS",
    variante_idioma: textValue(formData, "variante_idioma") || "es-AR",

    info_empresa: textValue(formData, "info_empresa"),
    info_general: textValue(formData, "info_general"),
    info_contestar_producto: textValue(formData, "info_contestar_producto"),

    usar_links_producto: boolValue(formData, "usar_links_producto"),
    check_stock_activo: boolValue(formData, "check_stock_activo"),
    cross_selling_activo: boolValue(formData, "cross_selling_activo"),

    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("_0_tenants")
    .update(payload)
    .eq("tenant_id", context.tenant.tenant_id);

  if (error) {
    console.error("Error actualizando configuración del negocio:", error);
    throw new Error("No se pudo guardar la configuración del negocio.");
  }

  revalidatePath("/app/business");
  redirect("/app/business?saved=1");
}
