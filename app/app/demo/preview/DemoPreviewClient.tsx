"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DemoProduct } from "./page";
import { saveDemoProductsAction } from "../productActions";

type ModulePreview = "conversations" | "metrics" | "admin" | null;

const CONTRACT_URL = "/contratar";

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
  const hasProducts = products.length > 0;
  const [isCatalogOpen, setIsCatalogOpen] = useState(!hasProducts);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [modulePreview, setModulePreview] = useState<ModulePreview>(null);
  const catalogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasProducts) {
      setIsCatalogOpen(true);
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [hasProducts]);

  function openCatalog() {
    setIsCatalogOpen(true);
    setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return (
    <AppShell subtitle="Demo">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-emerald-100 bg-white p-7 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-50 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Demo lista
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.055em] lg:text-5xl">
              Tu vendedor IA ya está listo para probar.
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
              {hasProducts
                ? "Probalo con productos detectados de tu web."
                : "Cargá algunos productos para probar cómo respondería Oramis."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {hasProducts ? (
                <button
                  type="button"
                  onClick={() => setIsDemoOpen(true)}
                  className="rounded-full bg-emerald-500 px-8 py-4 text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  Probar ahora
                </button>
              ) : null}

              <button
                type="button"
                onClick={openCatalog}
                className={`rounded-full px-8 py-4 text-base font-black shadow-sm transition ${
                  hasProducts
                    ? "border border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:text-emerald-700"
                    : "bg-emerald-500 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-600"
                }`}
              >
                {hasProducts ? "Editar productos" : "Cargar productos"}
              </button>

              <a
                href={CONTRACT_URL}
                className="rounded-full border border-slate-200 bg-white px-8 py-4 text-center text-base font-black text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
              >
                Quiero contratar
              </a>
            </div>
          </div>

          <HeroMockup
            productCount={products.length}
            hasProducts={hasProducts}
            onTry={() => setIsDemoOpen(true)}
            onEdit={openCatalog}
          />
        </div>

        {error ? (
          <div className="relative mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {saved ? (
          <div className="relative mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            Cambios guardados.
          </div>
        ) : null}
      </section>

      {hasProducts ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <PreviewCard
            eyebrow="Bandeja comercial"
            title="Conversaciones"
            text="Así se centralizan consultas y ventas."
            variant="dark"
            onClick={() => setModulePreview("conversations")}
          />
          <PreviewCard
            eyebrow="Seguimiento"
            title="Métricas"
            text="Así se miden oportunidades y productos pedidos."
            variant="light"
            onClick={() => setModulePreview("metrics")}
          />
          <PreviewCard
            eyebrow="Configuración"
            title="Administración"
            text="Así se gestionan usuarios, negocio y permisos."
            variant="green"
            onClick={() => setModulePreview("admin")}
          />
        </section>
      ) : null}

      {isCatalogOpen ? (
        <section
          ref={catalogRef}
          id="catalogo-demo"
          className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Catálogo
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                {hasProducts ? "Editá productos de prueba" : "Cargá productos para probar"}
              </h2>
            </div>
            <p className="text-xs font-bold text-slate-500">
              Las filas vacías agregan productos.
            </p>
          </div>

          {!hasProducts ? (
            <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <p className="text-sm font-black text-emerald-900">
                No detectamos productos automáticamente.
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800">
                Podés cargar algunos manualmente y probar igual la demo.
              </p>
            </div>
          ) : null}

          <ProductTable products={products} />
        </section>
      ) : null}

      <section className="mt-6 rounded-[2.2rem] border border-slate-200 bg-[#07111f] p-7 text-white shadow-xl shadow-slate-300 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Activá Oramis
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">
              Llevá esta demo a una operación real.
            </h2>
          </div>

          <a
            href={CONTRACT_URL}
            className="rounded-full bg-emerald-500 px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-600"
          >
            Quiero contratar Oramis
          </a>
        </div>
      </section>

      {isDemoOpen ? <DemoModal onClose={() => setIsDemoOpen(false)} /> : null}

      {modulePreview ? (
        <ModulePreviewModal
          type={modulePreview}
          onClose={() => setModulePreview(null)}
        />
      ) : null}
    </AppShell>
  );
}

function HeroMockup({
  productCount,
  hasProducts,
  onTry,
  onEdit,
}: {
  productCount: number;
  hasProducts: boolean;
  onTry: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-emerald-200 bg-gradient-to-br from-emerald-100 via-white to-sky-50 p-5 shadow-xl shadow-emerald-950/5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />

      <div className="relative grid gap-4 sm:grid-cols-[0.82fr_1.18fr] sm:items-center">
        <div className="mx-auto w-full max-w-[230px] rounded-[2rem] border border-emerald-200 bg-[#dff4e8] p-2 shadow-2xl shadow-emerald-950/10">
          <div className="overflow-hidden rounded-[1.55rem] bg-white">
            <div className="bg-[#075e54] px-4 py-3 text-white">
              <p className="text-xs font-black">Oramis Demo</p>
              <p className="text-[10px] font-semibold text-white/75">Vendedor IA</p>
            </div>

            <div className="space-y-3 bg-[#e9f8ef] p-4">
              <div className="ml-auto h-10 w-28 rounded-2xl rounded-tr-sm bg-[#dcf8c6]" />
              <div className="h-12 w-36 rounded-2xl rounded-tl-sm bg-white shadow-sm" />
              <div className="ml-auto h-10 w-24 rounded-2xl rounded-tr-sm bg-[#dcf8c6]" />
            </div>

            <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
              <div className="h-8 flex-1 rounded-full bg-slate-100" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                ➤
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm">
            {hasProducts ? `${productCount} productos detectados` : "Catálogo pendiente"}
          </div>

          <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Demo sin conectar WhatsApp real
          </h3>

          <div className="mt-4 grid gap-2">
            <MockFlowItem icon="🌐" text="Tomamos productos de tu web" />
            <MockFlowItem icon="🛒" text="Armamos un catálogo editable" />
            <MockFlowItem icon="🤖" text="Lo usa el vendedor IA" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {hasProducts ? (
              <button
                type="button"
                onClick={onTry}
                className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
              >
                Probar
              </button>
            ) : null}
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:text-emerald-700"
            >
              {hasProducts ? "Editar catálogo" : "Cargar catálogo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockFlowItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-3 shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-base">
        {icon}
      </span>
      <span className="text-sm font-black text-slate-700">{text}</span>
    </div>
  );
}

function PreviewCard({
  eyebrow,
  title,
  text,
  variant,
  onClick,
}: {
  eyebrow: string;
  title: string;
  text: string;
  variant: "dark" | "light" | "green";
  onClick: () => void;
}) {
  const isDark = variant === "dark";
  const isGreen = variant === "green";

  const wrapperClass = isDark
    ? "border-[#07111f] bg-[#07111f] text-white shadow-xl shadow-slate-300"
    : isGreen
      ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-slate-900 shadow-sm"
      : "border-slate-200 bg-white text-slate-900 shadow-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group overflow-hidden rounded-[2rem] border p-5 text-left transition hover:-translate-y-1 hover:shadow-xl ${wrapperClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-black uppercase tracking-[0.22em] ${
              isDark ? "text-emerald-300" : "text-emerald-600"
            }`}
          >
            {eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            {title}
          </h3>
          <p
            className={`mt-2 text-sm font-semibold leading-6 ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            {text}
          </p>
        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black transition group-hover:scale-110 ${
            isDark ? "bg-white text-[#07111f]" : "bg-[#07111f] text-white"
          }`}
        >
          ↗
        </span>
      </div>

      <div
        className={`mt-5 overflow-hidden rounded-3xl ${
          isDark ? "bg-white/10" : isGreen ? "bg-white/80" : "bg-slate-50"
        }`}
      >
        {variant === "dark" ? <ConversationMini /> : null}
        {variant === "light" ? <MetricMini /> : null}
        {variant === "green" ? <AdminMini /> : null}
      </div>
    </button>
  );
}

function ConversationMini() {
  return (
    <div className="grid h-28 grid-cols-[0.42fr_0.58fr] gap-2 p-3">
      <div className="space-y-2">
        <div className="h-5 rounded-lg bg-white/25" />
        <div className="h-5 rounded-lg bg-emerald-300/35" />
        <div className="h-5 rounded-lg bg-white/15" />
      </div>
      <div className="rounded-2xl bg-[#e9f8ef] p-2">
        <div className="ml-auto h-5 w-16 rounded-xl bg-[#dcf8c6]" />
        <div className="mt-2 h-6 w-20 rounded-xl bg-white" />
        <div className="mt-2 ml-auto h-5 w-14 rounded-xl bg-[#dcf8c6]" />
      </div>
    </div>
  );
}

function MetricMini() {
  return (
    <div className="h-28 p-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-emerald-100 p-2">
          <div className="h-3 w-8 rounded-full bg-emerald-300" />
          <div className="mt-2 h-5 w-10 rounded-full bg-emerald-500" />
        </div>
        <div className="rounded-2xl bg-sky-100 p-2">
          <div className="h-3 w-8 rounded-full bg-sky-300" />
          <div className="mt-2 h-5 w-12 rounded-full bg-sky-500" />
        </div>
        <div className="rounded-2xl bg-amber-100 p-2">
          <div className="h-3 w-8 rounded-full bg-amber-300" />
          <div className="mt-2 h-5 w-8 rounded-full bg-amber-500" />
        </div>
      </div>
      <div className="mt-3 flex h-10 items-end gap-2">
        {[35, 60, 45, 80, 52, 70].map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-lg bg-emerald-400"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function AdminMini() {
  return (
    <div className="grid h-28 grid-cols-2 gap-2 p-3">
      <div className="rounded-2xl bg-emerald-100 p-3">
        <div className="h-7 w-7 rounded-full bg-emerald-400" />
        <div className="mt-3 h-3 w-20 rounded-full bg-emerald-300" />
      </div>
      <div className="rounded-2xl bg-slate-100 p-3">
        <div className="h-7 w-7 rounded-full bg-sky-400" />
        <div className="mt-3 h-3 w-16 rounded-full bg-slate-300" />
      </div>
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

      <div className="mt-5 flex justify-end">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/60 p-5 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar demo"
      />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="mx-auto rounded-[2.6rem] border border-emerald-200 bg-[#dff4e8] p-3 shadow-2xl shadow-emerald-950/20">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="bg-[#075e54] px-5 py-4 text-white">
              <p className="text-sm font-black">Oramis Demo</p>
              <p className="text-xs text-white/75">Conectado a tu catálogo</p>
            </div>

            <div className="flex min-h-[500px] items-center justify-center bg-[#e9f8ef] p-6 text-center">
              <div className="rounded-3xl bg-white/80 p-5 shadow-sm">
                <p className="text-base font-black text-slate-800">
                  Tu conversación empieza acá
                </p>
              </div>
            </div>

            <form className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <input
                  disabled
                  placeholder="Escribí una consulta"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 outline-none"
                />
                <button
                  disabled
                  aria-label="Enviar"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-black text-white shadow-lg shadow-emerald-200"
                >
                  ➤
                </button>
              </div>
            </form>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-4 block rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-lg transition hover:bg-slate-100"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ModulePreviewModal({
  type,
  onClose,
}: {
  type: Exclude<ModulePreview, null>;
  onClose: () => void;
}) {
  const copy = {
    conversations: {
      eyebrow: "Conversaciones",
      title: "Bandeja comercial centralizada",
      text: "Atendé consultas, oportunidades y derivaciones desde un solo lugar.",
    },
    metrics: {
      eyebrow: "Métricas",
      title: "Seguimiento de oportunidades",
      text: "Medí productos pedidos, intención comercial y actividad del vendedor IA.",
    },
    admin: {
      eyebrow: "Administración",
      title: "Configuración del negocio",
      text: "Gestioná usuarios, permisos, catálogo y datos comerciales.",
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/60 p-5 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar preview"
      />

      <div className="relative z-10 w-full max-w-[980px] overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-slate-700 shadow-lg transition hover:bg-slate-100"
        >
          ×
        </button>

        <div className="grid min-h-[560px] lg:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-[#07111f] p-8 text-white">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              {copy.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">
              {copy.title}
            </h2>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-300">
              {copy.text}
            </p>
            <p className="mt-8 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-slate-200">
              Disponible al contratar Oramis.
            </p>
          </div>

          <div className="bg-slate-50 p-6">
            {type === "conversations" ? <ConversationsMock /> : null}
            {type === "metrics" ? <MetricsMock /> : null}
            {type === "admin" ? <AdminMock /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationsMock() {
  return (
    <div className="h-full rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-full gap-4">
        <div className="w-64 rounded-2xl bg-slate-50 p-4">
          <div className="h-10 rounded-xl bg-white" />
          <div className="mt-4 space-y-3">
            <MockLine />
            <MockLine />
            <MockLine />
            <MockLine />
          </div>
        </div>
        <div className="flex-1 rounded-2xl bg-[#e9f8ef] p-5">
          <div className="ml-auto h-14 w-72 rounded-2xl bg-[#dcf8c6]" />
          <div className="mt-4 h-16 w-80 rounded-2xl bg-white" />
          <div className="mt-4 ml-auto h-14 w-64 rounded-2xl bg-[#dcf8c6]" />
        </div>
      </div>
    </div>
  );
}

function MetricsMock() {
  return (
    <div className="h-full rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <MockMetric title="Consultas" value="248" />
        <MockMetric title="Oportunidades" value="76" />
        <MockMetric title="Productos" value="31" />
      </div>
      <div className="mt-6 h-72 rounded-3xl bg-slate-50 p-5">
        <div className="flex h-full items-end gap-3">
          {[45, 72, 52, 88, 64, 92, 76].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-2xl bg-emerald-400"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminMock() {
  return (
    <div className="h-full rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <MockAdminBox title="Usuarios" />
        <MockAdminBox title="Permisos" />
        <MockAdminBox title="Negocio" />
        <MockAdminBox title="Catálogo" />
      </div>
      <div className="mt-5 rounded-3xl bg-slate-50 p-5">
        <MockLine />
        <MockLine />
        <MockLine />
      </div>
    </div>
  );
}

function MockLine() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="h-3 w-3/4 rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-100" />
    </div>
  );
}

function MockMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function MockAdminBox({ title }: { title: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-sm font-black text-slate-900">{title}</p>
      <div className="mt-4 h-3 w-3/4 rounded-full bg-slate-200" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-200" />
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
