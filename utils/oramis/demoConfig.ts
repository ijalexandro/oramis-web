import { createAdminClient } from "@/utils/supabase/admin";

export const DEFAULT_DEMO_CONFIG_CODE = "onboarding_demo_default";

export type DemoConfig = {
  id: number;
  codigo: string;
  activo: boolean;

  nombre: string;
  descripcion: string | null;

  url_webhook: string;
  url_chatwoot: string;

  account_id: number;
  inbox_id: number;
  chatwoot_team_id_ventas: number | null;
  chatwoot_team_id_soporte: number | null;

  mensaje_identificador: string | null;
  info_empresa: string | null;
  info_general: string | null;
  info_contestar_producto: string | null;

  productos_max_demo: number;

  scraper_flujo: string | null;
  scraper_metodo: string | null;

  variante_idioma: string | null;
  pais: string | null;
  moneda: string | null;

  check_stock_activo: boolean;
  cross_selling_activo: boolean;
  usar_links_producto: boolean;
  checkout_envio_activo: boolean;
  checkout_pago_activo: boolean;

  anti_loop_activo: boolean;
  max_mensajes_10_min: number;
  max_mensajes_24_hs: number;
  max_mensajes_repetidos_5_min: number;

  bot_activo: boolean;
  motivo_estado: string | null;

  metadata: Record<string, unknown>;
};

function toNumber(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toStringOrNull(value: unknown) {
  const clean = String(value ?? "").trim();
  return clean || null;
}

export async function getDemoConfig(
  codigo = DEFAULT_DEMO_CONFIG_CODE
): Promise<DemoConfig> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("demo_config")
    .select("*")
    .eq("codigo", codigo)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    console.error("DEMO_CONFIG_READ_ERROR:", {
      error,
      codigo,
    });
  }

  if (!data) {
    throw new Error(`No encontramos demo_config activo para código ${codigo}.`);
  }

  return {
    id: toNumber(data.id, 0),
    codigo: String(data.codigo),
    activo: Boolean(data.activo),

    nombre: String(data.nombre || "Demo Oramis"),
    descripcion: toStringOrNull(data.descripcion),

    url_webhook: String(data.url_webhook || ""),
    url_chatwoot: String(data.url_chatwoot || ""),

    account_id: toNumber(data.account_id, 4),
    inbox_id: toNumber(data.inbox_id, 4),
    chatwoot_team_id_ventas: toNullableNumber(data.chatwoot_team_id_ventas),
    chatwoot_team_id_soporte: toNullableNumber(data.chatwoot_team_id_soporte),

    mensaje_identificador: toStringOrNull(data.mensaje_identificador),
    info_empresa: toStringOrNull(data.info_empresa),
    info_general: toStringOrNull(data.info_general),
    info_contestar_producto: toStringOrNull(data.info_contestar_producto),

    productos_max_demo: toNumber(data.productos_max_demo, 50),

    scraper_flujo: toStringOrNull(data.scraper_flujo),
    scraper_metodo: toStringOrNull(data.scraper_metodo),

    variante_idioma: toStringOrNull(data.variante_idioma) || "es-AR",
    pais: toStringOrNull(data.pais) || "AR",
    moneda: toStringOrNull(data.moneda) || "ARS",

    check_stock_activo: Boolean(data.check_stock_activo),
    cross_selling_activo: Boolean(data.cross_selling_activo),
    usar_links_producto: data.usar_links_producto !== false,
    checkout_envio_activo: Boolean(data.checkout_envio_activo),
    checkout_pago_activo: Boolean(data.checkout_pago_activo),

    anti_loop_activo: data.anti_loop_activo !== false,
    max_mensajes_10_min: toNumber(data.max_mensajes_10_min, 30),
    max_mensajes_24_hs: toNumber(data.max_mensajes_24_hs, 100),
    max_mensajes_repetidos_5_min: toNumber(
      data.max_mensajes_repetidos_5_min,
      5
    ),

    bot_activo: data.bot_activo !== false,
    motivo_estado: toStringOrNull(data.motivo_estado),

    metadata:
      data.metadata && typeof data.metadata === "object" ? data.metadata : {},
  };
}

export function buildDemoTenantDefaults(config: DemoConfig) {
  return {
    url_webhook: config.url_webhook,
    url_chatwoot: config.url_chatwoot,
    account_id: config.account_id,
    inbox_id: config.inbox_id,
    chatwoot_team_id_ventas: config.chatwoot_team_id_ventas,
    chatwoot_team_id_soporte: config.chatwoot_team_id_soporte,

    mensaje_identificador: config.mensaje_identificador,
    info_empresa: config.info_empresa,
    info_general: config.info_general,
    info_contestar_producto: config.info_contestar_producto,

    variante_idioma: config.variante_idioma,
    pais: config.pais,
    moneda: config.moneda,

    check_stock_activo: config.check_stock_activo,
    cross_selling_activo: config.cross_selling_activo,
    usar_links_producto: config.usar_links_producto,
    checkout_envio_activo: config.checkout_envio_activo,
    checkout_pago_activo: config.checkout_pago_activo,

    anti_loop_activo: config.anti_loop_activo,
    max_mensajes_10_min: config.max_mensajes_10_min,
    max_mensajes_24_hs: config.max_mensajes_24_hs,
    max_mensajes_repetidos_5_min: config.max_mensajes_repetidos_5_min,

    bot_activo: config.bot_activo,
    motivo_estado: config.motivo_estado,
  };
}
