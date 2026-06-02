"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { DemoProduct } from "./page";
import { saveDemoProductsAction } from "../productActions";

function isPlaceholderImage(url: string | null) {
  if (!url) return true;
  return url.startsWith("data:image/gif;base64");
}

export function DemoPreviewClient({
  products,
  error,
  saved,
}: {
  products: DemoProduct[];
  error: string | null;
  saved: boolean;
}) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <AppShell subtitle="Demo">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Demo lista
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] lg:text-4xl">
              Probá Oramis con productos reales de tu web.
            </h1>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-600">
              Detectamos productos de prueba para que puedas ver cómo respondería
              un vendedor IA en una conversación comercial.
            </p>
          </div>

          <a
            href="/signup?intent=contract"
            className="shrink-0 rounded-full bg-emerald-500 px-6 py-3 text-center text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
          >
            Quiero contratar Oramis
          </a>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            Cambios guardados.
          </div>
        ) : null}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-xl shadow-emerald-950/5">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Probá la demo
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
            Escribí como si fueras un cliente.
          </h2>
          <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-slate-700">
            Abrí el simulador y probá una consulta real. Los ejemplos son solo
            ideas: podés preguntar por cualquier producto, necesidad o recomendación.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Suggestion>Busco una opción para regalar</Suggestion>
            <Suggestion>¿Qué me recomendás?</Suggestion>
            <Suggestion>Quiero algo económico</Suggestion>
          </div>

          <button
            type="button"
            onClick={() => setIsDemoOpen(true)}
            className="mt-7 rounded-full bg-emerald-500 px-8 py-4 text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
          >
            Probar vendedor IA
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Catálogo
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            {products.length} productos detectados
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Podés probar la demo directamente o ajustar nombres, descripciones y
            precios antes de consultar.
          </p>

          <div className="mt-5 space-y-3">
            {products.slice(0, 4).map((product) => (
              <MiniProduct key={product.id} product={product} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCatalogOpen((value) => !value)}
            className="mt-6 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            {isCatalogOpen ? "Ocultar productos" : "Editar productos"}
          </button>
        </div>
      </section>

      {isCatalogOpen ? (
        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Productos editables
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Ajustá el catálogo de prueba
              </h2>
            </div>
            <p className="text-xs font-bold text-slate-500">
              Las filas vacías agregan productos.
            </p>
          </div>

          <ProductTable products={products} />
        </section>
      ) : null}

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-[#07111f] p-7 text-white shadow-xl shadow-slate-300 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Activá Oramis
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
              Llevá esta demo a una operación real.
            </h2>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-300">
              Conectamos tus canales comerciales y dejamos el vendedor IA funcionando
              con tu catálogo.
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

      {isDemoOpen ? <DemoModal onClose={() => setIsDemoOpen(false)} /> : null}
    </AppShell>
  );
}

function MiniProduct({ product }: { product: DemoProduct }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-1 text-sm font-black text-slate-900">
          {product.nombre_producto || "Producto sin nombre"}
        </p>
        <p className="shrink-0 text-sm font-black text-slate-900">
          {product.precio || ""}
        </p>
      </div>
      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
        {product.descripcion || "Descripción editable"}
      </p>
    </div>
  );
}

function ProductTable({ products }: { products: DemoProduct[] }) {
  const emptyRows = Array.from({ length: 5 });

  return (
    <form action={saveDemoProductsAction} className="mt-6">
      <div className="max-h-[520px] overflow-auto rounded-3xl border border-slate-200">
        <table className="min-w-[900px] w-full border-collapse bg-white text-xs">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <th className="w-[190px] px-2 py-2">Nombre</th>
              <th className="w-[230px] px-2 py-2">Descripción</th>
              <th className="w-[95px] px-2 py-2">Precio</th>
              <th className="w-[170px] px-2 py-2">URL producto</th>
              <th className="w-[170px] px-2 py-2">URL imagen</th>
              <th className="w-[70px] px-2 py-2 text-center">Borrar</th>
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
        <p className="text-xs font-semibold leading-5 text-slate-500">
          Borrar oculta el producto de la demo.
        </p>

        <button
          type="submit"
          className="rounded-full bg-[#07111f] px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

function ProductRow({ product }: { product: DemoProduct }) {
  return (
    <tr className="border-t border-slate-200 align-top">
      <td className="px-2 py-2">
        <input type="hidden" name="row_id" value={product.id} />
        <CellInput
          name="nombre_producto"
          defaultValue={product.nombre_producto || ""}
          placeholder="Nombre"
        />
      </td>
      <td className="px-2 py-2">
        <CellTextarea
          name="descripcion"
          defaultValue={product.descripcion || ""}
          placeholder="Descripción"
        />
      </td>
      <td className="px-2 py-2">
        <CellInput name="precio" defaultValue={product.precio || ""} placeholder="$" />
      </td>
      <td className="px-2 py-2">
        <CellInput
          name="producto_url"
          defaultValue={product.producto_url || ""}
          placeholder="Opcional"
        />
      </td>
      <td className="px-2 py-2">
        <CellInput
          name="imagen_url"
          defaultValue={isPlaceholderImage(product.imagen_url) ? "" : product.imagen_url || ""}
          placeholder="Opcional"
        />
      </td>
      <td className="px-2 py-2 text-center">
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
      <td className="px-2 py-2">
        <input type="hidden" name="row_id" value="" />
        <CellInput name="nombre_producto" defaultValue="" placeholder="Nuevo producto" />
      </td>
      <td className="px-2 py-2">
        <CellTextarea name="descripcion" defaultValue="" placeholder="Descripción" />
      </td>
      <td className="px-2 py-2">
        <CellInput name="precio" defaultValue="" placeholder="$" />
      </td>
      <td className="px-2 py-2">
        <CellInput name="producto_url" defaultValue="" placeholder="Opcional" />
      </td>
      <td className="px-2 py-2">
        <CellInput name="imagen_url" defaultValue="" placeholder="Opcional" />
      </td>
      <td className="px-2 py-2 text-center">
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
      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
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
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
    />
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/55 p-5 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar demo"
      />

      <div className="relative z-10 grid w-full max-w-[980px] gap-6 rounded-[2rem] bg-white p-5 shadow-2xl lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[1.7rem] bg-emerald-50 p-5">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Demo interactiva
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
            Probá una consulta real.
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Usá una pregunta genérica o específica. Oramis responderá con el catálogo
            cargado para esta demo cuando conectemos el motor.
          </p>

          <div className="mt-5 space-y-2">
            <Suggestion>Busco una opción para regalar</Suggestion>
            <Suggestion>¿Qué me recomendás?</Suggestion>
            <Suggestion>Quiero comparar opciones</Suggestion>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[410px] rounded-[2.4rem] border border-emerald-200 bg-[#dff4e8] p-3 shadow-2xl shadow-emerald-950/10">
          <div className="overflow-hidden rounded-[1.9rem] bg-white shadow-sm">
            <div className="bg-[#075e54] px-5 py-4 text-white">
              <p className="text-sm font-black">Oramis Demo</p>
              <p className="text-xs text-white/75">Conectado a tu catálogo</p>
            </div>

            <div className="flex min-h-[380px] items-center justify-center bg-[#e9f8ef] p-6 text-center">
              <div className="rounded-3xl bg-white/80 p-5 shadow-sm">
                <p className="text-base font-black text-slate-800">
                  Tu conversación empieza acá
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  En el próximo paso activamos la respuesta real del motor.
                </p>
              </div>
            </div>

            <form className="border-t border-slate-200 bg-white p-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Mensaje
                </span>
                <div className="flex gap-3">
                  <input
                    disabled
                    placeholder="Ej. busco una recomendación"
                    className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 outline-none"
                  />
                  <button
                    disabled
                    className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200"
                  >
                    Probar
                  </button>
                </div>
              </label>
            </form>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function Suggestion({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-sm font-black text-emerald-800 shadow-sm">
      {children}
    </div>
  );
}

function AppShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: ReactNode;
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

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-500 lg:flex">
          <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
            Demo interactiva
          </span>
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
