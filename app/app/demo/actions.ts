"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

function cleanString(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function normalizeUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    throw new Error("Ingresá la URL de tu web o tienda online.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);

  return url.toString().replace(/\/$/, "");
}

type ScraperResult = {
  lead_id?: string | number | null;
  tenant_id?: string | number | null;
  url_sitio?: string | null;
  url_normalizada?: string | null;
  tabla_demo_nombre?: string | null;
  estado_demo?: string | null;
  resultado_scraper?: string | null;
  productos_detectados?: number | string | null;
  requiere_carga_manual?: boolean | null;
  puede_probar_demo?: boolean | null;
  mensaje_resultado?: string | null;
  scraper_productos_flujo?: string | null;
  scraper_productos_metodo?: string | null;
  siguiente_accion?: string | null;
};

function getFirstScraperResult(payload: unknown): ScraperResult {
  if (Array.isArray(payload)) {
    return (payload[0] || {}) as ScraperResult;
  }

  return (payload || {}) as ScraperResult;
}

export async function createDemoAction(formData: FormData) {
  const rawUrl = cleanString(formData.get("url_sitio"));
  const webhookUrl = process.env.N8N_DEMO_SCRAPER_WEBHOOK_URL;

  if (!webhookUrl) {
    redirect("/app/demo/new?error=No está configurado el generador de demos.");
  }

  let urlSitio = "";

  try {
    urlSitio = normalizeUrl(rawUrl);
  } catch {
    redirect("/app/demo/new?error=Ingresá una URL válida.");
  }

  const context = await getCurrentTenantContext();

  if (!context?.user) {
    redirect("/login");
  }

  if (!context.tenant || !context.membership) {
    redirect("/app/demo/new?error=No pudimos encontrar tu cuenta de onboarding.");
  }

  const estado = String(context.tenant.estado || "").toLowerCase();

  if (!["pendiente_onboarding", "demo"].includes(estado)) {
    redirect("/app");
  }

  const adminClient = createAdminClient();

  const tenantId = context.tenant.tenant_id;
  const email = context.user.email || context.membership.email || "";
  const nombreEmpresa = context.tenant.nombre_empresa || "Demo Oramis";

  const scraperResponse = await fetch(webhookUrl!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      url_sitio: urlSitio,
      cantidad_productos: 50,
      nombre_negocio: nombreEmpresa,
      lead_email: email,
      lead_whatsapp: null,
      origen: "oramis_onboarding",
    }),
    cache: "no-store",
  });

  const responseText = await scraperResponse.text();
  let responseJson: unknown = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseJson = { raw: responseText };
  }

  if (!scraperResponse.ok) {
    console.error("DEMO_SCRAPER_ERROR response not ok:", {
      status: scraperResponse.status,
      body: responseJson,
      tenant_id: tenantId,
      url_sitio: urlSitio,
    });

    redirect("/app/demo/new?error=No pudimos preparar la demo. Probá nuevamente.");
  }

  const scraperResult = getFirstScraperResult(responseJson);
  const tablaDemoNombre = String(scraperResult.tabla_demo_nombre || "").trim();

  if (!tablaDemoNombre) {
    console.error("DEMO_SCRAPER_ERROR sin tabla_demo_nombre:", {
      body: responseJson,
      tenant_id: tenantId,
      url_sitio: urlSitio,
    });

    redirect("/app/demo/new?error=No pudimos preparar la tabla de productos. Probá nuevamente.");
  }

  const productosDetectados = Number(scraperResult.productos_detectados || 0);

  const { data: tenantActual, error: tenantReadError } = await adminClient
    .from("_0_tenants")
    .select("metadata")
    .eq("tenant_id", tenantId)
    .single();

  if (tenantReadError) {
    console.error("DEMO_SCRAPER_ERROR leyendo tenant:", {
      tenantReadError,
      tenant_id: tenantId,
    });
  }

  const currentMetadata =
    tenantActual?.metadata && typeof tenantActual.metadata === "object"
      ? tenantActual.metadata
      : {};

  const { error: updateError } = await adminClient
    .from("_0_tenants")
    .update({
      estado: "demo",
      sitio_web: urlSitio,
      url_webhook: "https://n8n.oramis.ai/webhook/motor-ventas-chatwoot-fb-3-1-9c8f4b7a2d6e",
      url_chatwoot: "chat.oramis.ai",
      account_id: 4,
      inbox_id: 4,
      tabla_productos: tablaDemoNombre,
      tabla_productos_reducida: tablaDemoNombre,
      chatwoot_team_id_ventas: 5,
      chatwoot_team_id_soporte: 6,
      metadata: {
        ...currentMetadata,
        onboarding_demo: {
          url_sitio: urlSitio,
          tabla_demo_nombre: tablaDemoNombre,
          productos_detectados: productosDetectados,
          requiere_carga_manual: Boolean(scraperResult.requiere_carga_manual),
          puede_probar_demo: Boolean(scraperResult.puede_probar_demo),
          resultado_scraper: scraperResult.resultado_scraper || null,
          scraper_productos_flujo: scraperResult.scraper_productos_flujo || null,
          scraper_productos_metodo: scraperResult.scraper_productos_metodo || null,
          mensaje_resultado: scraperResult.mensaje_resultado || null,
          lead_id: scraperResult.lead_id || null,
          raw_response: responseJson,
          updated_at: new Date().toISOString(),
        },
      },
    })
    .eq("tenant_id", tenantId);

  if (updateError) {
    console.error("DEMO_SCRAPER_ERROR actualizando tenant:", {
      updateError,
      tenant_id: tenantId,
      tabla_productos: tablaDemoNombre,
    });

    redirect("/app/demo/new?error=La demo se generó, pero no pudimos guardarla en tu cuenta.");
  }

  redirect("/app/demo/preview");
}
