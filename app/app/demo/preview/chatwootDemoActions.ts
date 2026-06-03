"use server";

import { getCurrentTenantContext } from "@/utils/oramis/currentTenant";

type DemoChatMessage = {
  id: string;
  content: string;
  direction: "incoming" | "outgoing";
  createdAt: string | null;
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

      return {
        id: String(message?.id ?? `${rawDirection}-${message?.created_at ?? Date.now()}`),
        content,
        direction: rawDirection,
        createdAt: message?.created_at ? String(message.created_at) : null,
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

export async function listDemoMessagesAction(input: {
  contactSourceId: string;
  conversationId: number;
}): Promise<ListDemoMessagesResult> {
  const context = await getCurrentTenantContext();

  if (!context?.user || !context.tenant || !context.membership) {
    throw new Error("No encontramos una sesión válida para leer mensajes.");
  }

  const { inboxIdentifier } = getChatwootConfig();

  const contactSourceId = safeText(input.contactSourceId);
  const conversationId = Number(input.conversationId);

  if (!contactSourceId) {
    throw new Error("Falta contactSourceId.");
  }

  if (!Number.isFinite(conversationId) || conversationId <= 0) {
    throw new Error("conversationId inválido.");
  }

  const data = await chatwootFetch(
    `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactSourceId}/conversations/${conversationId}/messages`,
    {
      method: "GET",
    }
  );

  return {
    ok: true,
    messages: normalizeMessages(data),
  };
}
