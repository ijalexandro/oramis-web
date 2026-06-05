"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

export type DemoChatAttachment = {
  id: string;
  fileType: string | null;
  dataUrl: string | null;
  thumbUrl: string | null;
  fallbackUrl: string | null;
};

type DemoChatMessage = {
  id: string;
  content: string;
  direction: "incoming" | "outgoing";
  createdAt: string | null;
  attachments: DemoChatAttachment[];
};

type StartDemoConversationResult = {
  ok: true;
  contactSourceId: string;
  contactIdentifier: string;
  conversationId: number;
};

type SendDemoMessageResult = {
  ok: true;
};

type ListDemoMessagesResult = {
  ok: true;
  messages: DemoChatMessage[];
};

function getChatwootConfig() {
  const baseUrl = process.env.CHATWOOT_BASE_URL?.replace(/\/+$/, "");
  const inboxIdentifier = process.env.CHATWOOT_DEMO_INBOX_IDENTIFIER;

  if (!baseUrl) {
    throw new Error("Falta CHATWOOT_BASE_URL.");
  }

  if (!inboxIdentifier) {
    throw new Error("Falta CHATWOOT_DEMO_INBOX_IDENTIFIER.");
  }

  return { baseUrl, inboxIdentifier };
}

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseConversationId(data: any) {
  const value =
    data?.id ??
    data?.payload?.id ??
    data?.conversation?.id ??
    data?.data?.id;

  const id = Number(value);

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(`Chatwoot no devolvió conversation_id válido: ${JSON.stringify(data)}`);
  }

  return id;
}

function parseContactSourceId(data: any) {
  const sourceId =
    data?.source_id ??
    data?.payload?.source_id ??
    data?.contact?.source_id ??
    data?.data?.source_id;

  const clean = safeText(sourceId);

  if (!clean) {
    throw new Error(`Chatwoot no devolvió source_id válido: ${JSON.stringify(data)}`);
  }

  return clean;
}

async function chatwootFetch(path: string, init?: RequestInit) {
  const { baseUrl } = getChatwootConfig();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      `Chatwoot ${response.status}: ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`
    );
  }

  return data;
}

function normalizeAttachments(message: any): DemoChatAttachment[] {
  const rawAttachments =
    message?.attachments ??
    message?.content_attributes?.attachments ??
    message?.content_attributes?.items ??
    [];

  if (!Array.isArray(rawAttachments)) return [];

  return rawAttachments
    .map((attachment: any) => {
      const fileType =
        attachment?.file_type ??
        attachment?.fileType ??
        attachment?.content_type ??
        attachment?.contentType ??
        null;

      const dataUrl =
        attachment?.data_url ??
        attachment?.dataUrl ??
        attachment?.download_url ??
        attachment?.downloadUrl ??
        attachment?.url ??
        null;

      const thumbUrl =
        attachment?.thumb_url ??
        attachment?.thumbUrl ??
        attachment?.thumbnail_url ??
        attachment?.thumbnailUrl ??
        null;

      const fallbackUrl = thumbUrl || dataUrl;

      if (!fallbackUrl) return null;

      return {
        id: String(attachment?.id ?? fallbackUrl),
        fileType: fileType ? String(fileType) : null,
        dataUrl: dataUrl ? String(dataUrl) : null,
        thumbUrl: thumbUrl ? String(thumbUrl) : null,
        fallbackUrl: fallbackUrl ? String(fallbackUrl) : null,
      };
    })
    .filter(Boolean) as DemoChatAttachment[];
}

function normalizeMessages(data: any): DemoChatMessage[] {
  const rawMessages =
    data?.payload ??
    data?.messages ??
    data?.data ??
    data;

  const messages = Array.isArray(rawMessages) ? rawMessages : [];

  return messages
    .map((message: any) => {
      const messageType = message?.message_type;
      const rawDirection =
        messageType === 0 || messageType === "incoming"
          ? "incoming"
          : messageType === 1 || messageType === "outgoing"
            ? "outgoing"
            : null;

      if (!rawDirection) return null;

      const content = safeText(message?.content || message?.processed_message_content);

      if (!content) return null;

      const attachments = normalizeAttachments(message);

      return {
        id: String(message?.id ?? `${rawDirection}-${message?.created_at ?? Date.now()}`),
        content,
        direction: rawDirection,
        createdAt: message?.created_at ? String(message.created_at) : null,
        attachments,
      };
    })
    .filter(Boolean) as DemoChatMessage[];
}

export async function startDemoConversationAction(): Promise<StartDemoConversationResult> {
  const context = await getCurrentTenantContext();

  if (!context?.user || !context.tenant || !context.membership) {
    throw new Error("No encontramos una sesión válida para iniciar la demo.");
  }

  const { inboxIdentifier } = getChatwootConfig();

  const tenantId = Number(context.tenant.tenant_id);
  const now = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const contactIdentifier = `oramis-demo-tenant-${tenantId}-${now}-${random}`;
  const email = `demo-tenant-${tenantId}-${now}@oramis.ai`;

  const contactData = await chatwootFetch(
    `/public/api/v1/inboxes/${inboxIdentifier}/contacts`,
    {
      method: "POST",
      body: JSON.stringify({
        identifier: contactIdentifier,
        name: "Cliente Demo Oramis",
        email,
        custom_attributes: {
          oramis_demo: true,
          tenant_id: tenantId,
          origen: "oramis_demo_preview",
        },
      }),
    }
  );

  const contactSourceId = parseContactSourceId(contactData);

  const conversationData = await chatwootFetch(
    `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactSourceId}/conversations`,
    {
      method: "POST",
      body: JSON.stringify({
        custom_attributes: {
          oramis_demo: true,
          tenant_id: tenantId,
          origen: "oramis_demo_preview",
        },
      }),
    }
  );

  const conversationId = parseConversationId(conversationData);

  return {
    ok: true,
    contactSourceId,
    contactIdentifier,
    conversationId,
  };
}

export async function sendDemoMessageAction(input: {
  contactSourceId: string;
  conversationId: number;
  message: string;
}): Promise<SendDemoMessageResult> {
  const context = await getCurrentTenantContext();

  if (!context?.user || !context.tenant || !context.membership) {
    throw new Error("No encontramos una sesión válida para enviar el mensaje.");
  }

  const { inboxIdentifier } = getChatwootConfig();

  const contactSourceId = safeText(input.contactSourceId);
  const conversationId = Number(input.conversationId);
  const message = safeText(input.message);

  if (!contactSourceId) {
    throw new Error("Falta contactSourceId.");
  }

  if (!Number.isFinite(conversationId) || conversationId <= 0) {
    throw new Error("conversationId inválido.");
  }

  if (!message) {
    throw new Error("Escribí un mensaje para probar.");
  }

  await chatwootFetch(
    `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactSourceId}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content: message,
        echo_id: `oramis-demo-${Date.now()}`,
      }),
    }
  );

  return { ok: true };
}

function normalizeSupabaseAttachments(row: any): DemoChatAttachment[] {
  const rawPayload = row?.raw_payload || {};
  const rawPayloadNested = rawPayload?.raw_payload || {};

  const rawAttachments =
    rawPayload?.attachments ||
    rawPayloadNested?.attachments ||
    row?.attachments ||
    [];

  const mediaUrl =
    rawPayload?.media_url ||
    row?.media_url ||
    rawPayloadNested?.media_url ||
    null;

  const attachments = Array.isArray(rawAttachments) ? [...rawAttachments] : [];

  if (mediaUrl && attachments.length === 0) {
    attachments.push({
      id: `media-${row?.id || row?.external_message_id || Date.now()}`,
      file_type: rawPayload?.media_kind || "image",
      data_url: mediaUrl,
      thumb_url: mediaUrl,
      content_type: rawPayload?.content_type || null,
    });
  }

  return attachments
    .map((attachment: any) => {
      const fileType =
        attachment?.file_type ??
        attachment?.fileType ??
        attachment?.content_type ??
        attachment?.contentType ??
        rawPayload?.media_kind ??
        null;

      const dataUrl =
        attachment?.data_url ??
        attachment?.dataUrl ??
        attachment?.download_url ??
        attachment?.downloadUrl ??
        attachment?.url ??
        mediaUrl ??
        null;

      const thumbUrl =
        attachment?.thumb_url ??
        attachment?.thumbUrl ??
        attachment?.thumbnail_url ??
        attachment?.thumbnailUrl ??
        dataUrl ??
        null;

      const fallbackUrl = thumbUrl || dataUrl;

      if (!fallbackUrl) return null;

      return {
        id: String(attachment?.id ?? fallbackUrl),
        fileType: fileType ? String(fileType) : null,
        dataUrl: dataUrl ? String(dataUrl) : null,
        thumbUrl: thumbUrl ? String(thumbUrl) : null,
        fallbackUrl: fallbackUrl ? String(fallbackUrl) : null,
      };
    })
    .filter(Boolean) as DemoChatAttachment[];
}

export async function listDemoMessagesAction(input: {
  contactSourceId: string;
  conversationId: number;
}): Promise<ListDemoMessagesResult> {
  const context = await getCurrentTenantContext();

  if (!context?.user || !context.tenant || !context.membership) {
    throw new Error("No encontramos una sesión válida para leer mensajes.");
  }

  const conversationId = Number(input.conversationId);

  if (!Number.isFinite(conversationId) || conversationId <= 0) {
    throw new Error("conversationId inválido.");
  }

  const adminClient = createAdminClient();

  const accountId = Number(context.tenant.account_id);
  const inboxId = Number(context.tenant.inbox_id);

  if (!Number.isFinite(accountId) || accountId <= 0) {
    throw new Error("El tenant no tiene account_id válido para la demo.");
  }

  if (!Number.isFinite(inboxId) || inboxId <= 0) {
    throw new Error("El tenant no tiene inbox_id válido para la demo.");
  }

  const { data, error } = await adminClient
    .from("mensajes")
    .select("id,direccion,message,created_at,external_conversation_id,external_message_id,raw_payload,account_id,inbox_id,tenant_id")
    .eq("tenant_id", context.tenant.tenant_id)
    .eq("account_id", accountId)
    .eq("inbox_id", inboxId)
    .eq("external_conversation_id", String(conversationId))
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("DEMO_MESSAGES_READ_ERROR:", {
      error,
      tenantId: context.tenant.tenant_id,
      conversationId,
    });

    throw new Error("No pudimos leer los mensajes de la demo.");
  }

  const messages: DemoChatMessage[] = (data || [])
    .map((row: any) => {
      const direction =
        row.direccion === "incoming"
          ? "incoming"
          : row.direccion === "outgoing"
            ? "outgoing"
            : null;

      if (!direction) return null;

      const content = safeText(row.message || row.raw_payload?.message || row.raw_payload?.content);

      return {
        id: String(row.external_message_id || row.id),
        content,
        direction,
        createdAt: row.created_at ? String(row.created_at) : null,
        attachments: normalizeSupabaseAttachments(row),
      };
    })
    .filter(Boolean) as DemoChatMessage[];

  return {
    ok: true,
    messages,
  };
}
