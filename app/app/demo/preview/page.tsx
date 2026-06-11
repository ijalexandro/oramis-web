import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { getDemoConfig } from "@/utils/oramis/demoConfig";
import { DemoPreviewClient } from "./DemoPreviewClient";

export type DemoProduct = {
  id: number;
  nombre_producto: string | null;
  descripcion: string | null;
  precio: string | null;
  imagen_url: string | null;
  producto_url: string | null;
};

export const metadata = {
  title: "Demo | Oramis",
  description: "Demo de Oramis.",
};

function isSafeTableName(tableName: string) {
  return /^zz_demo_[a-zA-Z0-9_]+$/.test(tableName);
}

async function getDemoProducts() {
  const context = await getCurrentTenantContext();

  if (!context?.user) {
    redirect("/login");
  }

  if (!context.tenant || !context.membership) {
    redirect("/app/demo/new");
  }

  const tableName = String(context.tenant.tabla_productos || "").trim();

  if (!tableName || !isSafeTableName(tableName)) {
    return {
      context,
      tableName: null,
      products: [] as DemoProduct[],
      maxProducts: 50,
      contractAttemptInProgress: false,
      error: "No encontramos una tabla de productos para esta demo.",
    };
  }

  const adminClient = createAdminClient();
  const demoConfig = await getDemoConfig();
  const maxProducts = demoConfig.productos_max_demo;

  const tenantId = context.tenant.tenant_id;

  const { data, error } = await adminClient
    .from(tableName)
    .select("id,titulo,descripcion,precio_oferta,url_imagen,url_producto")
    .eq("tenant_id", tenantId)
    .neq("estado", "inactivo")
    .order("id", { ascending: true })
    .limit(maxProducts);

  if (error) {
    console.error("DEMO_PRODUCTS_READ_ERROR:", {
      error,
      tableName,
      tenantId: context.tenant.tenant_id,
    });

    return {
      context,
      tableName,
      products: [] as DemoProduct[],
      maxProducts,
      contractAttemptInProgress: false,
      error: "No pudimos leer los productos de esta demo.",
    };
  }

  const products: DemoProduct[] = (data || []).map((item: any) => ({
    id: item.id,
    nombre_producto: item.titulo || null,
    descripcion: item.descripcion || null,
    precio: item.precio_oferta || null,
    imagen_url: item.url_imagen || null,
    producto_url: item.url_producto || null,
  }));

  const contractStatusesInProgress = [
    "pendiente_contacto",
    "custom_solicitado",
    "calculado",
  ];

  const email = String(context.user.email || context.membership.email || "")
    .trim()
    .toLowerCase();

  let contractAttemptInProgress = false;

  const { data: tenantContractAttempt, error: tenantContractError } = await adminClient
    .from("contratacion_intentos")
    .select("id,estado")
    .eq("tenant_id", tenantId)
    .in("estado", contractStatusesInProgress)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tenantContractError) {
    console.error("DEMO_CONTRACT_ATTEMPT_TENANT_READ_ERROR:", {
      tenantContractError,
      tenantId,
    });
  }

  contractAttemptInProgress = Boolean(tenantContractAttempt?.id);

  if (!contractAttemptInProgress && email) {
    const { data: emailContractAttempt, error: emailContractError } = await adminClient
      .from("contratacion_intentos")
      .select("id,estado")
      .eq("email", email)
      .in("estado", contractStatusesInProgress)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (emailContractError) {
      console.error("DEMO_CONTRACT_ATTEMPT_EMAIL_READ_ERROR:", {
        emailContractError,
        email,
      });
    }

    contractAttemptInProgress = Boolean(emailContractAttempt?.id);
  }

  return {
    context,
    tableName,
    products,
    maxProducts,
    contractAttemptInProgress,
    error: null as string | null,
  };
}

export default async function DemoPreviewPage({
  searchParams,
}: {
  searchParams?: { error?: string; saved?: string; try?: string; imported?: string };
}) {
  const { products, maxProducts, contractAttemptInProgress, error } = await getDemoProducts();

  return (
    <DemoPreviewClient
      products={products}
      maxProducts={maxProducts}
      contractAttemptInProgress={contractAttemptInProgress}
      error={searchParams?.error || error}
      savedToken={searchParams?.saved || null}
      openDemo={searchParams?.try === "1"}
      importedCount={searchParams?.imported || null}
    />
  );
}
