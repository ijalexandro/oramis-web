import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
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
      error: "No encontramos una tabla de productos para esta demo.",
    };
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from(tableName)
    .select("id,nombre_producto,descripcion,precio,imagen_url,producto_url")
    .eq("tenant_id", context.tenant.tenant_id)
    .neq("estado", "inactivo")
    .order("id", { ascending: true })
    .limit(100);

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
      error: "No pudimos leer los productos de esta demo.",
    };
  }

  return {
    context,
    tableName,
    products: (data || []) as DemoProduct[],
    error: null as string | null,
  };
}

export default async function DemoPreviewPage({
  searchParams,
}: {
  searchParams?: { error?: string; saved?: string; try?: string };
}) {
  const { products, error } = await getDemoProducts();

  return (
    <DemoPreviewClient
      products={products}
      error={searchParams?.error || error}
      savedToken={searchParams?.saved || null}
      openDemo={searchParams?.try === "1"}
    />
  );
}
