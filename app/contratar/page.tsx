import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { ContratarClient } from "./ContratarClient";

export const metadata = {
  title: "Contratar Oramis",
  description: "Cotizá y contratá Oramis para tu operación comercial.",
};

export const dynamic = "force-dynamic";

export type Plan = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio_mensual_usd: number | null;
  moneda: string;
  conversaciones_max: number | null;
  mensajes_max: number | null;
  usuarios_max: number | null;
  productos_efectivos_max: number | null;
  listas_precio_max: number | null;
  es_custom: boolean;
  activo: boolean;
  orden: number;
  incluye_json: string[];
};

export type PrefillData = {
  tenant_id: number | null;
  user_id: string | null;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresa: string;
  sitio_web: string;
};

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function splitName(value: string) {
  const clean = cleanString(value);

  if (!clean) {
    return { nombre: "", apellido: "" };
  }

  const parts = clean.split(/\s+/);
  const nombre = parts.shift() || "";
  const apellido = parts.join(" ");

  return { nombre, apellido };
}

async function getPrefillData(): Promise<PrefillData> {
  const fallback: PrefillData = {
    tenant_id: null,
    user_id: null,
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    empresa: "",
    sitio_web: "",
  };

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return fallback;
    }

    const metadata = user.user_metadata || {};
    const fullName = cleanString(metadata.name || metadata.nombre);
    const split = splitName(fullName);

    const base: PrefillData = {
      ...fallback,
      user_id: user.id,
      nombre: cleanString(metadata.nombre) || split.nombre,
      apellido: cleanString(metadata.apellido) || split.apellido,
      email: cleanString(user.email || metadata.email),
      telefono: cleanString(metadata.telefono || metadata.phone),
      empresa: cleanString(metadata.company || metadata.empresa),
      sitio_web: cleanString(metadata.sitio_web || metadata.website),
    };

    const { data: membership } = await adminClient
      .from("usuarios_tenants")
      .select("tenant_id,nombre,apellido,telefono,email")
      .eq("user_id", user.id)
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!membership?.tenant_id) {
      return base;
    }

    const { data: tenant } = await adminClient
      .from("_0_tenants")
      .select("tenant_id,nombre_empresa,email_contacto,telefono_contacto,sitio_web")
      .eq("tenant_id", membership.tenant_id)
      .maybeSingle();

    return {
      tenant_id: Number(membership.tenant_id),
      user_id: user.id,
      nombre: cleanString(membership.nombre) || base.nombre,
      apellido: cleanString(membership.apellido) || base.apellido,
      email: cleanString(membership.email) || base.email,
      telefono: cleanString(membership.telefono) || cleanString(tenant?.telefono_contacto) || base.telefono,
      empresa: cleanString(tenant?.nombre_empresa) || base.empresa,
      sitio_web: cleanString(tenant?.sitio_web) || base.sitio_web,
    };
  } catch (error) {
    console.error("CONTRATAR_PREFILL_ERROR:", error);
    return fallback;
  }
}

async function getPlanes(): Promise<Plan[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("planes")
    .select(
      "id,codigo,nombre,descripcion,precio_mensual_usd,moneda,conversaciones_max,mensajes_max,usuarios_max,productos_efectivos_max,listas_precio_max,es_custom,activo,orden,incluye_json"
    )
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("CONTRATAR_PLANES_ERROR:", error);
    return [];
  }

  return (data || []).map((plan: any) => ({
    id: Number(plan.id),
    codigo: String(plan.codigo),
    nombre: String(plan.nombre),
    descripcion: plan.descripcion || null,
    precio_mensual_usd:
      plan.precio_mensual_usd === null || plan.precio_mensual_usd === undefined
        ? null
        : Number(plan.precio_mensual_usd),
    moneda: String(plan.moneda || "USD"),
    conversaciones_max:
      plan.conversaciones_max === null || plan.conversaciones_max === undefined
        ? null
        : Number(plan.conversaciones_max),
    mensajes_max:
      plan.mensajes_max === null || plan.mensajes_max === undefined
        ? null
        : Number(plan.mensajes_max),
    usuarios_max:
      plan.usuarios_max === null || plan.usuarios_max === undefined
        ? null
        : Number(plan.usuarios_max),
    productos_efectivos_max:
      plan.productos_efectivos_max === null || plan.productos_efectivos_max === undefined
        ? null
        : Number(plan.productos_efectivos_max),
    listas_precio_max:
      plan.listas_precio_max === null || plan.listas_precio_max === undefined
        ? null
        : Number(plan.listas_precio_max),
    es_custom: Boolean(plan.es_custom),
    activo: Boolean(plan.activo),
    orden: Number(plan.orden || 0),
    incluye_json: Array.isArray(plan.incluye_json) ? plan.incluye_json.map(String) : [],
  }));
}

export default async function ContratarPage() {
  const [prefill, planes] = await Promise.all([getPrefillData(), getPlanes()]);

  return <ContratarClient prefill={prefill} planes={planes} />;
}
