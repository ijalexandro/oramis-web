"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

function cleanString(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isSafeTableName(tableName: string) {
  return /^zz_demo_[a-zA-Z0-9_]+$/.test(tableName);
}

function parseNullableNumber(value: string) {
  const clean = value.replace(/\./g, "").replace(",", ".").trim();

  if (!clean) return null;

  const num = Number(clean);

  return Number.isFinite(num) ? num : null;
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

    const nombre = nombres[index] || "";
    const descripcion = descripciones[index] || "";
    const precio = precios[index] || "";
    const productoUrl = productoUrls[index] || "";
    const imagenUrl = imagenUrls[index] || "";

    if (productId && deleteIds.has(String(productId))) {
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

      continue;
    }

    if (!nombre && !productId) {
      continue;
    }

    if (!nombre && productId) {
      continue;
    }

    const payload = {
      nombre_producto: nombre,
      descripcion: descripcion || null,
      precio: precio || null,
      precio_num: parseNullableNumber(precio),
      moneda: "ARS",
      producto_url: productoUrl || null,
      imagen_url: imagenUrl || null,
      editable_manual: true,
      estado: "activo",
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
      const { error } = await adminClient.from(tableName).insert({
        tenant_id: tenantId,
        origen_producto: "manual",
        ...payload,
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
    }
  }

  revalidatePath("/app/demo/preview");
  redirect("/app/demo/preview?saved=1");
}
