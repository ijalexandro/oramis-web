"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

const MAX_DEMO_PRODUCTS = 50;

function cleanString(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isSafeTableName(tableName: string) {
  return /^zz_demo_[a-zA-Z0-9_]+$/.test(tableName);
}

function getIndexedValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => cleanString(value));
}

export async function saveDemoProductsAction(formData: FormData) {
  const context = await getCurrentTenantContext();

  if (!context?.user) {
    redirect("/login");
  }

  if (!context.tenant || !context.membership) {
    redirect("/app/demo/new");
  }

  const tableName = String(context.tenant.tabla_productos || "").trim();

  if (!tableName || !isSafeTableName(tableName)) {
    redirect("/app/demo/preview?error=No encontramos una tabla de productos válida.");
  }

  const adminClient = createAdminClient();
  const tenantId = context.tenant.tenant_id;

  const rowIds = getIndexedValues(formData, "row_id");
  const nombres = getIndexedValues(formData, "nombre_producto");
  const descripciones = getIndexedValues(formData, "descripcion");
  const precios = getIndexedValues(formData, "precio");
  const productoUrls = getIndexedValues(formData, "producto_url");
  const imagenUrls = getIndexedValues(formData, "imagen_url");
  const deleteIds = new Set(getIndexedValues(formData, "delete_id"));

  for (const deleteId of deleteIds) {
    const productId = Number(deleteId);

    if (!Number.isFinite(productId)) continue;

    const { error } = await adminClient
      .from(tableName)
      .update({
        estado: "inactivo",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("DEMO_PRODUCT_DELETE_ERROR:", {
        error,
        tableName,
        productId,
        tenantId,
      });

      redirect("/app/demo/preview?error=No pudimos borrar un producto.");
    }
  }

  const { count: activeCount, error: countError } = await adminClient
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .neq("estado", "inactivo");

  if (countError) {
    console.error("DEMO_PRODUCT_COUNT_ERROR:", {
      countError,
      tableName,
      tenantId,
    });

    redirect("/app/demo/preview?error=No pudimos validar el límite de productos.");
  }

  let remainingNewProducts = Math.max(0, MAX_DEMO_PRODUCTS - Number(activeCount || 0));

  const maxRows = Math.max(
    rowIds.length,
    nombres.length,
    descripciones.length,
    precios.length,
    productoUrls.length,
    imagenUrls.length
  );

  for (let index = 0; index < maxRows; index += 1) {
    const rawId = rowIds[index] || "";
    const productId = rawId ? Number(rawId) : null;

    if (productId && deleteIds.has(String(productId))) {
      continue;
    }

    const titulo = nombres[index] || "";
    const descripcion = descripciones[index] || "";
    const precioOferta = precios[index] || "";
    const urlProducto = productoUrls[index] || "";
    const urlImagen = imagenUrls[index] || "";

    if (!titulo && !productId) {
      continue;
    }

    if (!titulo && productId) {
      continue;
    }

    const payload = {
      titulo,
      descripcion: descripcion || null,
      precio_oferta: precioOferta || null,
      url_producto: urlProducto || null,
      url_imagen: urlImagen || null,
      estado: "activo",
      editable_manual: true,
      updated_at: new Date().toISOString(),
    };

    if (productId) {
      const { error } = await adminClient
        .from(tableName)
        .update(payload)
        .eq("id", productId)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("DEMO_PRODUCT_UPDATE_ERROR:", {
          error,
          tableName,
          productId,
          tenantId,
        });

        redirect("/app/demo/preview?error=No pudimos guardar los cambios.");
      }
    } else {
      if (remainingNewProducts <= 0) {
        redirect("/app/demo/preview?error=La demo permite cargar hasta 50 productos de muestra.");
      }

      const { error } = await adminClient.from(tableName).insert({
        tenant_id: tenantId,
        ...payload,
        atributos_json: {},
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("DEMO_PRODUCT_INSERT_ERROR:", {
          error,
          tableName,
          tenantId,
        });

        redirect("/app/demo/preview?error=No pudimos agregar un producto.");
      }

      remainingNewProducts -= 1;
    }
  }

  revalidatePath("/app/demo/preview");
  redirect(`/app/demo/preview?saved=${Date.now()}&try=1`);
}


export async function resetDemoSiteAction() {
  const context = await getCurrentTenantContext();

  if (!context?.user) {
    redirect("/login");
  }

  if (!context.tenant || !context.membership) {
    redirect("/app/demo/new");
  }

  const adminClient = createAdminClient();
  const tenantId = context.tenant.tenant_id;
  const tableName = String(context.tenant.tabla_productos || "").trim();

  if (tableName && isSafeTableName(tableName)) {
    const { error: deleteError } = await adminClient
      .from(tableName)
      .delete()
      .eq("tenant_id", tenantId);

    if (deleteError) {
      console.error("DEMO_RESET_DELETE_PRODUCTS_ERROR:", {
        deleteError,
        tableName,
        tenantId,
      });
    }
  }

  const { data: tenantData, error: tenantReadError } = await adminClient
    .from("_0_tenants")
    .select("metadata")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (tenantReadError) {
    console.error("DEMO_RESET_TENANT_READ_ERROR:", {
      tenantReadError,
      tenantId,
    });
  }

  const metadata =
    tenantData?.metadata && typeof tenantData.metadata === "object"
      ? { ...(tenantData.metadata as Record<string, unknown>) }
      : {};

  delete metadata.onboarding_demo;

  metadata.demo_reset = {
    reset_at: new Date().toISOString(),
    reset_by: context.user.id,
    previous_table: tableName || null,
  };

  const { error: updateError } = await adminClient
    .from("_0_tenants")
    .update({
      estado: "pendiente_onboarding",
      sitio_web: null,
      tabla_productos: null,
      tabla_productos_reducida: null,
      motivo_estado: null,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId);

  if (updateError) {
    console.error("DEMO_RESET_TENANT_UPDATE_ERROR:", {
      updateError,
      tenantId,
    });

    redirect("/app/demo/preview?error=No pudimos reiniciar la demo.");
  }

  revalidatePath("/app/demo/new");
  revalidatePath("/app/demo/preview");

  redirect("/app/demo/new");
}
