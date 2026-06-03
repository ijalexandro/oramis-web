"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import type { DemoProduct } from "./page";
import { saveDemoProductsAction } from "../productActions";
import {
  listDemoMessagesAction,
  sendDemoMessageAction,
  startDemoConversationAction,
} from "./chatwootDemoActions";

type ModulePreview = "conversations" | "metrics" | "admin" | null;

const CONTRACT_URL = "/contratar";

const MODULE_PREVIEW_IMAGES = {
  conversations: "/demo-previews/conversaciones.png",
  metrics: "/demo-previews/metricas.png",
  admin: "/demo-previews/administracion.png",
} as const;

function isPlaceholderImage(url: string | null) {
  if (!url) return true;
  return url.startsWith("data:image/gif;base64");
}

export function DemoPreviewClient({
  products,
  error,
  savedToken,
  openDemo,
}: {
  products: DemoProduct[];
  error: string | null;
  savedToken: string | null;
  openDemo: boolean;
}) {
  const hasProducts = products.length > 0;
  const shouldOpenDemo = Boolean(openDemo && hasProducts);
  const [isCatalogOpen, setIsCatalogOpen] = useState(!hasProducts);
  const [isDemoOpen, setIsDemoOpen] = useState(shouldOpenDemo);
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

  useEffect(() => {
    if (!savedToken) return;

    if (openDemo && hasProducts) {
      setIsDemoOpen(true);
    }
  }, [savedToken, openDemo, hasProducts]);

  function openCatalog() {
    setIsCatalogOpen(true);
    setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return (
    <AppShell subtitle="Demo">
      <section className="rounded-[2.4rem] border border-emerald-100 bg-white p-7 shadow-sm sm:p-9">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
            Demo lista
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] lg:text-6xl">
            Tu vendedor IA ya está listo para probar.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            {hasProducts
              ? "Probalo con productos detectados de tu web."
              : "Cargá algunos productos para probar cómo respondería Oramis."}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {hasProducts ? (
              <button
                type="button"
                onClick={() => setIsDemoOpen(true)}
                className="rounded-full bg-emerald-500 px-9 py-4 text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
              >
                Probar ahora
              </button>
            ) : null}

            <button
              type="button"
              onClick={openCatalog}
              className={`rounded-full px-9 py-4 text-base font-black shadow-sm transition ${
                hasProducts
                  ? "border border-slate-200 bg-white text-slate-800 hover:border-emerald-200 hover:text-emerald-700"
                  : "bg-emerald-500 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-600"
              }`}
            >
              {hasProducts ? "Editar productos" : "Cargar productos"}
            </button>

            <a
              href={CONTRACT_URL}
              className="rounded-full border border-slate-200 bg-white px-9 py-4 text-center text-base font-black text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Quiero contratar
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm font-black text-slate-500">
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
              {hasProducts
                ? `Demo cargada con ${products.length} productos de muestra`
                : "Catálogo pendiente"}
            </span>

          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}


      </section>

      {hasProducts ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <PreviewCard
            icon="💬"
            title="Conversaciones"
            text="Bandeja comercial para atender consultas."
            variant="dark"
            onClick={() => setModulePreview("conversations")}
          />
          <PreviewCard
            icon="📊"
            title="Métricas"
            text="Seguimiento de oportunidades y productos."
            variant="light"
            onClick={() => setModulePreview("metrics")}
          />
          <PreviewCard
            icon="⚙️"
            title="Administración"
            text="Usuarios, permisos y configuración."
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
              {products.length >= 50
                ? "La demo permite hasta 50 productos de muestra."
                : "Las filas vacías agregan productos."}
            </p>
          </div>



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

function PreviewCard({
  icon,
  title,
  text,
  variant,
  onClick,
}: {
  icon: string;
  title: string;
  text: string;
  variant: "dark" | "light" | "green";
  onClick: () => void;
}) {
  const isDark = variant === "dark";
  const isGreen = variant === "green";

  const wrapperClass = isDark
    ? "border-[#07111f] bg-[#07111f] text-white shadow-lg shadow-slate-300"
    : isGreen
      ? "border-emerald-200 bg-emerald-50 text-slate-900 shadow-sm"
      : "border-slate-200 bg-white text-slate-900 shadow-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[2rem] border p-6 text-left transition hover:-translate-y-1 hover:shadow-xl ${wrapperClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
            isDark ? "bg-white text-[#07111f]" : "bg-white text-slate-900 shadow-sm"
          }`}
        >
          {icon}
        </span>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black transition group-hover:scale-110 ${
            isDark ? "bg-white/10 text-white" : "bg-[#07111f] text-white"
          }`}
        >
          ↗
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">
        {title}
      </h3>

      <p
        className={`mt-2 text-sm font-semibold leading-6 ${
          isDark ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {text}
      </p>

      <p
        className={`mt-5 text-sm font-black ${
          isDark ? "text-emerald-300" : "text-emerald-600"
        }`}
      >
        Ver preview →
      </p>
    </button>
  );
}

function ProductTable({ products }: { products: DemoProduct[] }) {
  const maxProducts = 50;
  const availableRows = Math.max(0, maxProducts - products.length);
  const emptyRows = Array.from({ length: Math.min(5, availableRows) });
  const reachedLimit = products.length >= maxProducts;

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
          {reachedLimit
            ? "Llegaste al máximo de 50 productos para esta demo."
            : "Podés cargar hasta 50 productos de muestra."}
        </p>
        <SaveProductsButton />
      </div>
    </form>
  );
}

function SaveProductsButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[#07111f] px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          <span>Guardando productos...</span>
        </span>
      ) : (
        "Guardar productos"
      )}
    </button>
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

type ChatAttachment = {
  id: string;
  fileType: string | null;
  dataUrl: string | null;
  thumbUrl: string | null;
  fallbackUrl: string | null;
};

type ChatBubble = {
  id: string;
  content: string;
  direction: "incoming" | "outgoing";
  attachments?: ChatAttachment[];
};

type DemoConversationState = {
  contactSourceId: string;
  conversationId: number;
};

function DemoModal({ onClose }: { onClose: () => void }) {
  const [conversation, setConversation] = useState<DemoConversationState | null>(null);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const [isStarting, setIsStarting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;

    startedRef.current = true;

    async function start() {
      try {
        setIsStarting(true);
        setError(null);

        const result = await startDemoConversationAction();

        setConversation({
          contactSourceId: result.contactSourceId,
          conversationId: result.conversationId,
        });
      } catch (err) {
        console.error("DEMO_CHAT_START_ERROR:", err);
        setError("No pudimos iniciar la demo. Probá nuevamente.");
      } finally {
        setIsStarting(false);
      }
    }

    start();
  }, []);

  async function pollForReply(currentConversation: DemoConversationState, previousOutgoingIds: Set<string>) {
    const startedAt = Date.now();
    const timeoutMs = 120000;
    const intervalMs = 2500;
    const extraWaitAfterFirstReplyMs = 9000;

    let firstReplyAt: number | null = null;
    let lastMessageSignature = "";

    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));

      try {
        const result = await listDemoMessagesAction(currentConversation);
        const normalized = result.messages.map((message) => ({
          id: message.id,
          content: message.content,
          direction: message.direction,
          attachments: message.attachments || [],
        }));

        const outgoing = normalized.filter((message) => message.direction === "outgoing");
        const newOutgoing = outgoing.find((message) => !previousOutgoingIds.has(message.id));

        const messageSignature = normalized
          .map((message) => `${message.id}:${message.attachments?.length || 0}`)
          .join("|");

        setMessages(normalized);

        if (newOutgoing && !firstReplyAt) {
          firstReplyAt = Date.now();
          lastMessageSignature = messageSignature;
          continue;
        }

        if (firstReplyAt) {
          const enoughExtraWait = Date.now() - firstReplyAt >= extraWaitAfterFirstReplyMs;
          const noNewChanges = messageSignature === lastMessageSignature;

          if (enoughExtraWait && noNewChanges) {
            return true;
          }

          lastMessageSignature = messageSignature;
        }
      } catch (err) {
        console.error("DEMO_CHAT_POLL_ERROR:", err);
      }
    }

    return false;
  }

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversation || isSending || isStarting) return;

    const message = input.trim();

    if (!message) return;

    const localId = `local-${Date.now()}`;

    const previousOutgoingIds = new Set(
      messages
        .filter((item) => item.direction === "outgoing")
        .map((item) => item.id)
    );

    setInput("");
    setError(null);
    setIsSending(true);
    setIsTyping(true);

    setMessages((current) => [
      ...current,
      {
        id: localId,
        content: message,
        direction: "incoming",
        attachments: [],
      },
    ]);

    try {
      await sendDemoMessageAction({
        contactSourceId: conversation.contactSourceId,
        conversationId: conversation.conversationId,
        message,
      });

      await pollForReply(conversation, previousOutgoingIds);
    } catch (err) {
      console.error("DEMO_CHAT_SEND_ERROR:", err);
      setError(null);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/60 p-5 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar demo"
      />

      <div className="relative z-10 w-full max-w-[430px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -right-3 -top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-700 shadow-lg transition hover:bg-slate-100"
        >
          ×
        </button>

        <div className="mx-auto rounded-[2.6rem] border border-emerald-200 bg-[#dff4e8] p-3 shadow-2xl shadow-emerald-950/20">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="bg-[#075e54] px-5 py-4 text-white">
              <p className="text-sm font-black">Oramis Demo</p>
              <p className="text-xs text-white/75">
                {isStarting ? "Creando conversación..." : "Conectado a tu catálogo"}
              </p>
            </div>

            <div className="h-[500px] overflow-y-auto bg-[#e9f8ef] p-4">
              {messages.length === 0 && !isTyping ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="rounded-3xl bg-white/80 p-5 shadow-sm">
                    <p className="text-base font-black text-slate-800">
                      Tu conversación empieza acá
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                      Escribí como si fueras un cliente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <ChatMessageBubble key={message.id} message={message} />
                  ))}

                  {isTyping ? <TypingBubble /> : null}
                </div>
              )}
            </div>



            <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isStarting || isSending || !conversation}
                  placeholder={
                    isStarting
                      ? "Preparando demo..."
                      : isSending
                        ? "Esperando respuesta..."
                        : "Escribí una consulta"
                  }
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-wait disabled:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isStarting || isSending || !conversation || !input.trim()}
                  aria-label="Enviar"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                  ) : (
                    "➤"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function splitTextWithLinks(text: string) {
  const parts: Array<{ type: "text" | "link"; value: string }> = [];
  const regex = /(https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: "link",
      value: match[0],
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return parts;
}

function renderInlineMarkdown(text: string) {
  const parts: Array<{ type: "text" | "bold" | "italic"; value: string }> = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    const raw = match[0];

    if (raw.startsWith("**") && raw.endsWith("**")) {
      parts.push({
        type: "bold",
        value: raw.slice(2, -2),
      });
    } else if (raw.startsWith("*") && raw.endsWith("*")) {
      parts.push({
        type: "italic",
        value: raw.slice(1, -1),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return parts;
}

function MessageText({ text }: { text: string }) {
  return (
    <>
      {splitTextWithLinks(text).map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={`${part.value}-${index}`}
              href={part.value}
              target="_blank"
              rel="noreferrer"
              className="break-all font-black text-emerald-700 underline decoration-emerald-300 underline-offset-2"
            >
              {part.value}
            </a>
          );
        }

        return (
          <span key={`${part.value}-${index}`}>
            {renderInlineMarkdown(part.value).map((inlinePart, inlineIndex) => {
              const key = `${inlinePart.value}-${index}-${inlineIndex}`;

              if (inlinePart.type === "bold") {
                return (
                  <strong key={key} className="font-black">
                    {inlinePart.value}
                  </strong>
                );
              }

              if (inlinePart.type === "italic") {
                return (
                  <em key={key} className="italic">
                    {inlinePart.value}
                  </em>
                );
              }

              return <span key={key}>{inlinePart.value}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}

function isImageAttachment(attachment: ChatAttachment) {
  const fileType = String(attachment.fileType || "").toLowerCase();
  const url = String(attachment.fallbackUrl || "").toLowerCase();

  return (
    fileType.includes("image") ||
    url.endsWith(".png") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".webp") ||
    url.endsWith(".gif")
  );
}

function ChatMessageBubble({ message }: { message: ChatBubble }) {
  const isIncoming = message.direction === "incoming";
  const attachments = message.attachments || [];

  return (
    <div className={`flex ${isIncoming ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] overflow-hidden whitespace-pre-line break-words rounded-2xl px-4 py-3 text-sm font-semibold leading-5 shadow-sm ${
          isIncoming
            ? "rounded-tr-sm bg-[#dcf8c6] text-slate-800"
            : "rounded-tl-sm bg-white text-slate-800"
        }`}
      >
        {message.content ? <MessageText text={message.content} /> : null}

        {attachments.length > 0 ? (
          <div className={message.content ? "mt-3 space-y-2" : "space-y-2"}>
            {attachments.map((attachment) => {
              const url = attachment.fallbackUrl || attachment.dataUrl || attachment.thumbUrl || "";

              if (!url) return null;

              if (isImageAttachment(attachment)) {
                return (
                  <a
                    key={attachment.id}
                    href={attachment.dataUrl || url}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <img
                      src={url}
                      alt="Imagen enviada"
                      className="max-h-56 w-full object-cover"
                    />
                  </a>
                );
              }

              return (
                <a
                  key={attachment.id}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-emerald-700 underline"
                >
                  Ver archivo adjunto
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
        </div>
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

          </div>

          <div className="bg-slate-50 p-6">
            <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <img
                src={MODULE_PREVIEW_IMAGES[type]}
                alt={`Preview ${copy.eyebrow}`}
                className="h-full w-full object-cover blur-[1px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-white/10" />
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-5">
                <span className="rounded-full bg-[#07111f]/90 px-5 py-2.5 text-sm font-black text-white shadow-xl backdrop-blur">
                  Disponible al contratar Oramis
                </span>
              </div>
            </div>
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
