import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type PageProps = {
  params: Promise<{
    tenantSlug: string;
    slugProducto: string;
  }>;
};

type ProductoDemo = {
  tenant_slug: string | null;
  slug_producto: string | null;
  titulo_ficha: string | null;
  precio_ficha: string | null;
  descripcion_ficha: string | null;
  url_imagen: string | null;
  url_producto: string | null;
  sku: string | null;
};

const TABLAS_DEMO: Record<string, string> = {
  "demo-neumaticos": "zzz_demo_neumaticos",
  "demo-iluminacion": "zzz_demo_iluminacion",
  "demo-materiales": "zzz_demo_materiales",
  "demo-gastronomia": "zzz_demo_gastronomia",
};

function limpiarTexto(valor: string | null | undefined) {
  return String(valor ?? "").trim();
}

function getTituloCategoria(tenantSlug: string) {
  if (tenantSlug === "demo-neumaticos") return "Demo Neumáticos";
  if (tenantSlug === "demo-iluminacion") return "Demo Iluminación";
  if (tenantSlug === "demo-materiales") return "Demo Materiales";
  if (tenantSlug === "demo-gastronomia") return "Demo Gastronomía";
  return "Demo Oramis";
}

export async function generateMetadata({ params }: PageProps) {
  const { tenantSlug, slugProducto } = await params;
  const tabla = TABLAS_DEMO[tenantSlug];

  if (!tabla) {
    return {
      title: "Producto no encontrado | Oramis",
    };
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from(tabla)
    .select("titulo_ficha, descripcion_ficha")
    .eq("slug_producto", slugProducto)
    .maybeSingle<ProductoDemo>();

  const titulo = limpiarTexto(data?.titulo_ficha) || "Producto demo";

  return {
    title: `${titulo} | Oramis`,
    description:
      limpiarTexto(data?.descripcion_ficha) ||
      "Ficha de producto demo generada por Oramis.",
  };
}

export default async function ProductoDemoPage({ params }: PageProps) {
  const { tenantSlug, slugProducto } = await params;
  const tabla = TABLAS_DEMO[tenantSlug];

  if (!tabla) {
    notFound();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tabla)
    .select(
      `
      tenant_slug,
      slug_producto,
      titulo_ficha,
      precio_ficha,
      descripcion_ficha,
      url_imagen,
      url_producto,
      sku
    `
    )
    .eq("slug_producto", slugProducto)
    .maybeSingle<ProductoDemo>();

  if (error) {
    console.error("Error buscando producto demo:", error);
  }

  if (!data) {
    notFound();
  }

  const titulo = limpiarTexto(data.titulo_ficha) || "Producto demo";
  const precio = limpiarTexto(data.precio_ficha);
  const descripcion = limpiarTexto(data.descripcion_ficha);
  const imagen = `/img/productos/${tenantSlug}/${slugProducto}.webp`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            ← Volver a Oramis
          </Link>
        </div>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
            <div className="flex items-center justify-center bg-slate-100 p-6 lg:p-8">
              <div className="flex h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl bg-white">
                <img
                  src={imagen}
                  alt={titulo}
                  className="max-h-[280px] w-full object-contain"
                />
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                {getTituloCategoria(tenantSlug)}
              </p>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {titulo}
              </h1>

              {precio ? (
                <div className="mt-6 max-w-xl rounded-2xl bg-emerald-50 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                    Precio
                  </p>
                  <p className="mt-1 text-3xl font-black text-emerald-800">
                    {precio}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  Esta ficha pertenece a una demo de atención comercial por
                  WhatsApp. Los precios y disponibilidad deben ser confirmados
                  por un vendedor antes de cerrar la compra.
                </p>
              </div>
            </div>
          </div>

          {descripcion ? (
            <div className="border-t border-slate-200 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Descripción
              </h2>
              <div className="mt-3 max-w-5xl">
                <p className="whitespace-pre-line text-base leading-8 text-slate-700">
                  {descripcion}
                </p>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
