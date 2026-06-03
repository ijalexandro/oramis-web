"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type DiscountResult =
  | {
      ok: true;
      codigo: string;
      descripcion: string | null;
      tipo_descuento: string;
      valor_descuento: number;
      duracion_meses: number | null;
      precio_base_usd: number;
      precio_promocional_usd: number;
      ahorro_mensual_usd: number;
      partner_nombre: string | null;
    }
  | {
      ok: false;
      error: string;
    };

type SaveContractAttemptInput = {
  tenant_id: number | null;
  user_id: string | null;

  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresa: string;
  sitio_web: string;

  conversaciones_rango: string;
  conversaciones_estimadas: number | null;

  productos_rango: string;
  productos_estimados: number | null;

  precio_unico_catalogo: boolean;
  listas_precio_rango: string;
  listas_precio_estimadas: number;

  usuarios_rango: string;
  usuarios_estimados: number | null;

  productos_efectivos_estimados: number | null;

  plan_codigo: string | null;
  plan_nombre: string | null;
  precio_mensual_usd: number | null;
  moneda: string;

  es_custom: boolean;
  motivo_custom: string | null;

  codigo_descuento: string | null;
  descuento_snapshot: Record<string, unknown>;

  estado: string;
  metadata?: Record<string, unknown>;
};

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function normalizeCode(value: unknown) {
  return cleanString(value).toUpperCase();
}

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

async function getCurrentUserId() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    return data?.user?.id || null;
  } catch {
    return null;
  }
}

export async function validateDiscountCodeAction(input: {
  code: string;
  email: string;
  planCodigo: string | null;
  precioBaseUsd: number | null;
}): Promise<DiscountResult> {
  const code = normalizeCode(input.code);
  const email = cleanString(input.email).toLowerCase();
  const planCodigo = cleanString(input.planCodigo);
  const precioBaseUsd = toNumber(input.precioBaseUsd);

  if (!code) {
    return {
      ok: false,
      error: "Ingresá un código.",
    };
  }

  if (!precioBaseUsd || precioBaseUsd <= 0) {
    return {
      ok: false,
      error: "El código se puede aplicar cuando hay un plan con precio definido.",
    };
  }

  const adminClient = createAdminClient();

  const { data: discount, error } = await adminClient
    .from("codigos_descuento")
    .select("*")
    .eq("codigo", code)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    console.error("DISCOUNT_VALIDATE_ERROR:", error);

    return {
      ok: false,
      error: "No pudimos validar el código.",
    };
  }

  if (!discount) {
    return {
      ok: false,
      error: "El código no existe o no está activo.",
    };
  }

  const now = new Date();
  const fechaInicioUso = discount.fecha_inicio_uso ? new Date(discount.fecha_inicio_uso) : null;
  const fechaFinUso = discount.fecha_fin_uso ? new Date(discount.fecha_fin_uso) : null;

  if (fechaInicioUso && now < fechaInicioUso) {
    return {
      ok: false,
      error: "El código todavía no está disponible.",
    };
  }

  if (fechaFinUso && now > fechaFinUso) {
    return {
      ok: false,
      error: "El código ya venció.",
    };
  }

  if (discount.aplica_plan_codigo && planCodigo && discount.aplica_plan_codigo !== planCodigo) {
    return {
      ok: false,
      error: "El código no aplica para este plan.",
    };
  }

  if (discount.max_usos_total) {
    const { count, error: countError } = await adminClient
      .from("codigos_descuento_usos")
      .select("id", { count: "exact", head: true })
      .eq("codigo", code)
      .neq("estado", "cancelado");

    if (countError) {
      console.error("DISCOUNT_COUNT_TOTAL_ERROR:", countError);

      return {
        ok: false,
        error: "No pudimos validar el uso del código.",
      };
    }

    if (Number(count || 0) >= Number(discount.max_usos_total)) {
      return {
        ok: false,
        error: "El código ya alcanzó el máximo de usos.",
      };
    }
  }

  if (email && discount.max_usos_por_email) {
    const { count, error: emailCountError } = await adminClient
      .from("codigos_descuento_usos")
      .select("id", { count: "exact", head: true })
      .eq("codigo", code)
      .eq("email", email)
      .neq("estado", "cancelado");

    if (emailCountError) {
      console.error("DISCOUNT_COUNT_EMAIL_ERROR:", emailCountError);

      return {
        ok: false,
        error: "No pudimos validar el uso del código.",
      };
    }

    if (Number(count || 0) >= Number(discount.max_usos_por_email)) {
      return {
        ok: false,
        error: "Este email ya utilizó el código.",
      };
    }
  }

  const tipo = String(discount.tipo_descuento || "porcentaje");
  const valor = Number(discount.valor_descuento || 0);

  let precioPromocional = precioBaseUsd;

  if (tipo === "porcentaje") {
    precioPromocional = precioBaseUsd * (1 - valor / 100);
  } else if (tipo === "monto_fijo") {
    precioPromocional = precioBaseUsd - valor;
  }

  precioPromocional = Math.max(0, Math.round(precioPromocional * 100) / 100);

  return {
    ok: true,
    codigo: code,
    descripcion: discount.descripcion || null,
    tipo_descuento: tipo,
    valor_descuento: valor,
    duracion_meses:
      discount.duracion_meses === null || discount.duracion_meses === undefined
        ? null
        : Number(discount.duracion_meses),
    precio_base_usd: precioBaseUsd,
    precio_promocional_usd: precioPromocional,
    ahorro_mensual_usd: Math.round((precioBaseUsd - precioPromocional) * 100) / 100,
    partner_nombre: discount.partner_nombre || null,
  };
}

export async function saveContractAttemptAction(input: SaveContractAttemptInput) {
  const adminClient = createAdminClient();
  const currentUserId = await getCurrentUserId();

  const payload = {
    tenant_id: input.tenant_id || null,
    user_id: input.user_id || currentUserId,

    nombre: cleanString(input.nombre) || null,
    apellido: cleanString(input.apellido) || null,
    email: cleanString(input.email).toLowerCase() || null,
    telefono: cleanString(input.telefono) || null,
    empresa: cleanString(input.empresa) || null,
    sitio_web: cleanString(input.sitio_web) || null,

    conversaciones_rango: cleanString(input.conversaciones_rango) || null,
    conversaciones_estimadas: input.conversaciones_estimadas,

    productos_rango: cleanString(input.productos_rango) || null,
    productos_estimados: input.productos_estimados,

    precio_unico_catalogo: Boolean(input.precio_unico_catalogo),
    listas_precio_rango: cleanString(input.listas_precio_rango) || null,
    listas_precio_estimadas: input.listas_precio_estimadas || 1,

    usuarios_rango: cleanString(input.usuarios_rango) || null,
    usuarios_estimados: input.usuarios_estimados,

    productos_efectivos_estimados: input.productos_efectivos_estimados,

    plan_codigo: input.plan_codigo,
    plan_nombre: input.plan_nombre,
    precio_mensual_usd: input.precio_mensual_usd,
    moneda: input.moneda || "USD",

    es_custom: Boolean(input.es_custom),
    motivo_custom: input.motivo_custom,

    codigo_descuento: input.codigo_descuento ? normalizeCode(input.codigo_descuento) : null,
    descuento_snapshot: input.descuento_snapshot || {},

    estado: cleanString(input.estado) || "calculado",
    metadata: input.metadata || {},

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await adminClient
    .from("contratacion_intentos")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("CONTRACT_ATTEMPT_SAVE_ERROR:", error);

    return {
      ok: false,
      error: "No pudimos guardar la solicitud.",
    };
  }

  return {
    ok: true,
    id: data.id as string,
  };
}
