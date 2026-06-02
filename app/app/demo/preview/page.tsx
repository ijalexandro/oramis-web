import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";
import { saveDemoProductsAction } from "../productActions";

type DemoProduct = {
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

function isPlaceholderImage(url: string | null) {
  if (!url) return true;
  return url.startsWith("data:image/gif;base64");
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
  searchParams?: { error?: string; saved?: string };
}) {
  const { context, tableName, products, error } = await getDemoProducts();

  const pageError = searchParams?.error || error;
  const saved = searchParams?.saved === "1";
  const emptyRows = Array.from({ length: 5 });

  return (
    <AppShell subtitle="Demo">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Demo lista
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] lg:text-4xl">
              Revisá tus productos y probá el vendedor IA.
            </h1>
            <p className="mt-3 max-w-4xl text-base font-medium leading-7 text-slate-600">
              Ajustá los productos detectados. Esta tabla es la que va a usar Oramis
              para responder en la demo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{products.length} productos</Badge>
            {tableName ? <Badge>{tableName}</Badge> : null}
          </div>
        </div>

        {pageError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {pageError}
          </div>
        ) : null}

        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            Cambios guardados.
          </div>
        ) : null}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Catálogo editable
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                Productos de la demo
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-500">
              Podés agregar productos usando las filas vacías.
            </p>
          </div>

          <form action={saveDemoProductsAction} className="mt-6">
            <div className="max-h-[620px] overflow-auto rounded-3xl border border-slate-200">
              <table className="min-w-[980px] w-full border-collapse bg-white text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    <th className="w-[220px] px-3 py-3">Nombre</th>
                    <th className="w-[260px] px-3 py-3">Descripción</th>
                    <th className="w-[110px] px-3 py-3">Precio</th>
                    <th className="w-[190px] px-3 py-3">URL producto</th>
                    <th className="w-[190px] px-3 py-3">URL imagen</th>
                    <th className="w-[90px] px-3 py-3 text-center">Borrar</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}

                  {emptyRows.map((_, index) => (
                    <EmptyProductRow key={`empty-${index}`} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold leading-6 text-slate-500">
                Borrar oculta el producto de la demo. Las filas vacías se guardan
                solo si completás el nombre.
              </p>

              <button
                type="submit"
                className="rounded-full bg-[#07111f] px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        <DemoChatPreview />
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Teaser
          title="Conversaciones comerciales"
          description="Al contratar, todos los canales comerciales se centralizan para responder, derivar y hacer seguimiento desde un solo lugar."
          href="/app/conversations"
        />
        <Teaser
          title="Métricas comerciales"
          description="Al contratar, vas a medir intención, productos pedidos, carritos y oportunidades generadas."
          href="/app/metrics"
        />
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-[#07111f] p-7 text-white shadow-xl shadow-slate-300 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Listo para activar Oramis
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
              Convertí esta demo en una operación comercial real.
            </h2>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-300">
              Al contratar, Oramis queda activo con tus productos, canales comerciales,
              conversaciones centralizadas y métricas para seguimiento.
            </p>
          </div>

          <a
            href="/signup?intent=contract"
            className="rounded-full bg-emerald-500 px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-600"
          >
            Quiero contratar Oramis
          </a>
        </div>
      </section>

    </AppShell>
  );
}

function ProductRow({ product }: { product: DemoProduct }) {
  return (
    <tr className="border-t border-slate-200 align-top">
      <td className="px-3 py-3">
        <input type="hidden" name="row_id" value={product.id} />
        <CellInput
          name="nombre_producto"
          defaultValue={product.nombre_producto || ""}
          placeholder="Nombre del producto"
        />
      </td>
      <td className="px-3 py-3">
        <CellTextarea
          name="descripcion"
          defaultValue={product.descripcion || ""}
          placeholder="Descripción para el vendedor IA"
        />
      </td>
      <td className="px-3 py-3">
        <CellInput name="precio" defaultValue={product.precio || ""} placeholder="$" />
      </td>
      <td className="px-3 py-3">
        <CellInput
          name="producto_url"
          defaultValue={product.producto_url || ""}
          placeholder="Opcional"
        />
      </td>
      <td className="px-3 py-3">
        <CellInput
          name="imagen_url"
          defaultValue={isPlaceholderImage(product.imagen_url) ? "" : product.imagen_url || ""}
          placeholder="Opcional"
        />
      </td>
      <td className="px-3 py-3 text-center">
        <input
          type="checkbox"
          name="delete_id"
          value={product.id}
          className="h-5 w-5 rounded border-slate-300 text-red-500"
        />
      </td>
    </tr>
  );
}

function EmptyProductRow() {
  return (
    <tr className="border-t border-slate-200 bg-emerald-50/25 align-top">
      <td className="px-3 py-3">
        <input type="hidden" name="row_id" value="" />
        <CellInput name="nombre_producto" defaultValue="" placeholder="Nuevo producto" />
      </td>
      <td className="px-3 py-3">
        <CellTextarea
          name="descripcion"
          defaultValue=""
          placeholder="Descripción opcional"
        />
      </td>
      <td className="px-3 py-3">
        <CellInput name="precio" defaultValue="" placeholder="$" />
      </td>
      <td className="px-3 py-3">
        <CellInput name="producto_url" defaultValue="" placeholder="Opcional" />
      </td>
      <td className="px-3 py-3">
        <CellInput name="imagen_url" defaultValue="" placeholder="Opcional" />
      </td>
      <td className="px-3 py-3 text-center">
        <span className="text-xs font-bold text-slate-400">Nuevo</span>
      </td>
    </tr>
  );
}

function CellInput({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <input
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
    />
  );
}

function CellTextarea({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <textarea
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
    />
  );
}

function Teaser({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
    >
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        Disponible al contratar
      </p>
      <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">{title}</h3>
      <p className="mt-3 text-base font-medium leading-7 text-slate-600">
        {description}
      </p>
      <p className="mt-5 text-sm font-black text-emerald-600">Ver preview →</p>
    </a>
  );
}

function DemoChatPreview() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        Prueba de conversación
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
        Simulá una consulta.
      </h2>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
        En el próximo paso conectamos esta ventana al motor de ventas usando el
        catálogo editado.
      </p>

      <div className="mt-5 rounded-[2rem] border border-slate-200 bg-[#e9f8ef] p-3">
        <div className="rounded-[1.6rem] bg-white shadow-sm">
          <div className="rounded-t-[1.6rem] bg-[#075e54] px-4 py-4 text-white">
            <p className="text-sm font-black">Oramis Demo</p>
            <p className="text-xs text-white/75">WhatsApp</p>
          </div>

          <div className="space-y-3 bg-[#e9f8ef] p-4">
            <Bubble from="customer">Busco neumáticos 205/55R16.</Bubble>
            <Bubble from="bot">
              Perfecto. En el próximo paso voy a responder usando los productos
              editados de esta tabla.
            </Bubble>
          </div>

          <form className="border-t border-slate-200 p-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Mensaje de prueba
              </span>
              <div className="flex gap-3">
                <input
                  disabled
                  placeholder="Próximo paso: conectar al motor"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 outline-none"
                />
                <button
                  disabled
                  className="rounded-full bg-slate-300 px-5 py-3 text-sm font-black text-white"
                >
                  Enviar
                </button>
              </div>
            </label>
          </form>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: "customer" | "bot";
  children: React.ReactNode;
}) {
  return (
    <div className={`flex ${from === "customer" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm font-medium leading-5 shadow-sm ${
          from === "customer"
            ? "rounded-tr-sm bg-[#dcf8c6] text-slate-800"
            : "rounded-tl-sm bg-white text-slate-800"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
      {children}
    </span>
  );
}

function AppShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <Header subtitle={subtitle} />
      <section className="mx-auto max-w-[1500px] px-5 py-8">
        {children}
      </section>
    </main>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4">
        <a href="/app" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
            <div className="absolute inset-1 rounded-xl border border-white/40" />
            <span className="text-lg font-black text-white">O</span>
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">Oramis</p>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          <a href="/app" className="transition hover:text-emerald-600">
            Inicio
          </a>
          <a href="/app/conversations" className="transition hover:text-emerald-600">
            Conversaciones
          </a>
          <a href="/app/metrics" className="transition hover:text-emerald-600">
            Métricas
          </a>
          <a href="/app/business" className="transition hover:text-emerald-600">
            Negocio
          </a>
          <a href="/app/admin" className="transition hover:text-emerald-600">
            Administración
          </a>
        </nav>

        <a
          href="/logout"
          className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
        >
          Salir
        </a>
      </div>
    </header>
  );
}
