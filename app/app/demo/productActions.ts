"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { getDemoConfig } from "@/utils/oramis/demoConfig";


function cleanString(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isSafeTableName(tableName: string) {
  return /^zz_demo_[a-zA-Z0-9_]+$/.test(tableName);
}

function getIndexedValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => cleanString(value));
}

function detectCsvDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/)[0] || "";
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsvRows(text: string) {
  const delimiter = detectCsvDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }

      row.push(value.trim());
      value = "";

      if (row.some((cell) => cell.trim())) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    value += char;
  }

  row.push(value.trim());

  if (row.some((cell) => cell.trim())) {
    rows.push(row);
  }

  return rows;
}

function normalizeCsvHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function getCsvValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
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
  const demoConfig = await getDemoConfig();
  const maxDemoProducts = demoConfig.productos_max_demo;

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

  let remainingNewProducts = Math.max(0, maxDemoProducts - Number(activeCount || 0));

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
        redirect(`/app/demo/preview?error=La demo permite cargar hasta ${maxDemoProducts} productos de muestra.`);
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



export async function importDemoProductsCsvAction(formData: FormData) {
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

  const file = formData.get("csv_file");

  if (!(file instanceof File) || !file.name) {
    redirect("/app/demo/preview?error=Seleccioná un archivo CSV.");
  }

  const csvText = await file.text();

  if (!csvText.trim()) {
    redirect("/app/demo/preview?error=El CSV está vacío.");
  }

  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    redirect("/app/demo/preview?error=El CSV no tiene productos para importar.");
  }

  const headers = rows[0].map(normalizeCsvHeader);
  const demoConfig = await getDemoConfig();
  const maxDemoProducts = demoConfig.productos_max_demo;

  const parsedProducts = rows
    .slice(1)
    .map((cells) => {
      const row = headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = cells[index] || "";
        return acc;
      }, {});

      const titulo = getCsvValue(row, [
        "nombre_producto",
        "nombre",
        "titulo",
        "producto",
        "name",
        "title",
      ]);

      return {
        titulo,
        descripcion: getCsvValue(row, ["descripcion", "description", "detalle"]),
        precio_oferta: getCsvValue(row, ["precio", "precio_oferta", "price"]),
        url_producto: getCsvValue(row, ["producto_url", "url_producto", "link", "url"]),
        url_imagen: getCsvValue(row, ["imagen_url", "url_imagen", "image", "image_url", "foto"]),
      };
    })
    .filter((product) => product.titulo)
    .slice(0, maxDemoProducts);

  if (parsedProducts.length === 0) {
    redirect("/app/demo/preview?error=El CSV no tiene productos válidos. La columna nombre_producto o titulo es obligatoria.");
  }

  const adminClient = createAdminClient();
  const tenantId = context.tenant.tenant_id;
  const now = new Date().toISOString();

  const { error: deactivateError } = await adminClient
    .from(tableName)
    .update({
      estado: "inactivo",
      updated_at: now,
    })
    .eq("tenant_id", tenantId)
    .neq("estado", "inactivo");

  if (deactivateError) {
    console.error("DEMO_PRODUCT_CSV_DEACTIVATE_ERROR:", {
      deactivateError,
      tableName,
      tenantId,
    });

    redirect("/app/demo/preview?error=No pudimos reemplazar los productos actuales.");
  }

  const { error: insertError } = await adminClient.from(tableName).insert(
    parsedProducts.map((product) => ({
      tenant_id: tenantId,
      ...product,
      estado: "activo",
      editable_manual: true,
      atributos_json: {},
      created_at: now,
      updated_at: now,
    }))
  );

  if (insertError) {
    console.error("DEMO_PRODUCT_CSV_INSERT_ERROR:", {
      insertError,
      tableName,
      tenantId,
    });

    redirect("/app/demo/preview?error=No pudimos importar el CSV.");
  }

  revalidatePath("/app/demo/preview");
  redirect(`/app/demo/preview?saved=${Date.now()}&imported=${parsedProducts.length}`);
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
