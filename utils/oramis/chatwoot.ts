import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

type ChatwootAgent = {
  id: number;
  account_id: number;
  email: string;
  name: string;
  role: string;
  confirmed?: boolean;
};

type SyncChatwootInput = {
  tenantId: number;
  usuarioTenantId: string;
  accountId: number;
  ventasTeamId: number | null;
  soporteTeamId: number | null;
  email: string;
  name: string;
  conversaciones: boolean;
  conversacionesAcceso: string | null;
  equipoVentas: boolean;
  equipoSoporte: boolean;
  existingChatwootUserId?: number | null;
};

type SyncChatwootResult = {
  estado: "sincronizado" | "no_requiere";
  chatwootUserId: number | null;
};

function getChatwootConfig() {
  const baseUrl = (process.env.CHATWOOT_URL || "").replace(/\/+$/, "");
  const token = process.env.CHATWOOT_API_ACCESS_TOKEN || "";

  if (!baseUrl) {
    throw new Error("Falta configurar CHATWOOT_URL.");
  }

  if (!token) {
    throw new Error("Falta configurar CHATWOOT_API_ACCESS_TOKEN.");
  }

  return { baseUrl, token };
}

function getProvisionConfig() {
  const url = process.env.CHATWOOT_PROVISION_URL || "";
  const secret = process.env.CHATWOOT_PROVISION_SECRET || "";

  if (!url) {
    throw new Error("Falta configurar CHATWOOT_PROVISION_URL.");
  }

  if (!secret) {
    throw new Error("Falta configurar CHATWOOT_PROVISION_SECRET.");
  }

  return { url, secret };
}

async function chatwootFetch(path: string, init: RequestInit = {}) {
  const { baseUrl, token } = getChatwootConfig();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      api_access_token: token,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;

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

async function listAgents(accountId: number): Promise<ChatwootAgent[]> {
  const data = await chatwootFetch(`/api/v1/accounts/${accountId}/agents`);
  return Array.isArray(data) ? (data as ChatwootAgent[]) : [];
}

async function findAgentByEmail(accountId: number, email: string) {
  const agents = await listAgents(accountId);
  return (
    agents.find((agent) => agent.email.toLowerCase() === email.toLowerCase()) ??
    null
  );
}

async function getTeamMembers(
  accountId: number,
  teamId: number
): Promise<ChatwootAgent[]> {
  const data = await chatwootFetch(
    `/api/v1/accounts/${accountId}/teams/${teamId}/team_members`
  );

  return Array.isArray(data) ? (data as ChatwootAgent[]) : [];
}

async function setTeamMembership(
  accountId: number,
  teamId: number | null,
  userId: number,
  shouldBeMember: boolean
) {
  if (!teamId) return;

  const currentMembers = await getTeamMembers(accountId, teamId);
  const currentIds = currentMembers
    .map((member) => Number(member.id))
    .filter((id) => Number.isFinite(id));

  let nextIds = currentIds;

  if (shouldBeMember) {
    nextIds = Array.from(new Set([...currentIds, userId]));
  } else {
    nextIds = currentIds.filter((id) => id !== userId);
  }

  await chatwootFetch(`/api/v1/accounts/${accountId}/teams/${teamId}/team_members`, {
    method: "PATCH",
    body: JSON.stringify({
      user_ids: nextIds,
    }),
  });
}

function generateTechnicalPassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|/.,<>:;?~";
  const all = upper + lower + digits + special;

  const chars = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];

  for (let i = 0; i < 60; i += 1) {
    chars.push(all[crypto.randomInt(all.length)]);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

async function provisionChatwootUser(input: {
  accountId: number;
  chatwootUserId: number | null;
  email: string;
  name: string;
  password: string;
}): Promise<{ user_id: number }> {
  const { url, secret } = getProvisionConfig();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-oramis-provision-secret": secret,
    },
    body: JSON.stringify({
      account_id: input.accountId,
      chatwoot_user_id: input.chatwootUserId ?? 0,
      email: input.email,
      name: input.name,
      password: input.password,
    }),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      `Provision Chatwoot ${response.status}: ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`
    );
  }

  const result = data as { user_id?: number };

  if (!result?.user_id || !Number.isFinite(Number(result.user_id))) {
    throw new Error("Provision Chatwoot no devolvió user_id válido.");
  }

  return { user_id: Number(result.user_id) };
}

async function saveSsoSecret(input: {
  tenantId: number;
  usuarioTenantId: string;
  accountId: number;
  chatwootUserId: number;
  email: string;
  password: string;
}) {
  const adminClient = createAdminClient();

  const { error } = await adminClient.rpc("upsert_chatwoot_sso_secret", {
    p_tenant_id: input.tenantId,
    p_usuario_tenant_id: input.usuarioTenantId,
    p_chatwoot_account_id: input.accountId,
    p_chatwoot_user_id: input.chatwootUserId,
    p_chatwoot_email: input.email,
    p_chatwoot_login_secret: input.password,
  });

  if (error) {
    throw new Error(`No se pudo guardar el secreto SSO de Chatwoot: ${error.message}`);
  }
}

async function deactivateSsoSecret(input: {
  tenantId: number;
  usuarioTenantId: string;
}) {
  const adminClient = createAdminClient();

  const { error } = await adminClient.rpc("deactivate_chatwoot_sso_secret", {
    p_usuario_tenant_id: input.usuarioTenantId,
    p_tenant_id: input.tenantId,
  });

  if (error) {
    throw new Error(`No se pudo desactivar el secreto SSO de Chatwoot: ${error.message}`);
  }
}

export async function syncChatwootTenantUser(
  input: SyncChatwootInput
): Promise<SyncChatwootResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email;

  if (!input.usuarioTenantId) {
    throw new Error("Falta usuarioTenantId para sincronizar Chatwoot.");
  }

  if (!input.tenantId) {
    throw new Error("Falta tenantId para sincronizar Chatwoot.");
  }

  if (!email) {
    throw new Error("El usuario no tiene email.");
  }

  if (!input.accountId) {
    throw new Error("El tenant no tiene account_id de Chatwoot.");
  }

  const acceso = String(input.conversacionesAcceso || "ninguno").toLowerCase();

  if (!input.conversaciones || acceso === "ninguno") {
    if (input.existingChatwootUserId) {
      await setTeamMembership(
        input.accountId,
        input.ventasTeamId,
        input.existingChatwootUserId,
        false
      );
      await setTeamMembership(
        input.accountId,
        input.soporteTeamId,
        input.existingChatwootUserId,
        false
      );
    }

    await deactivateSsoSecret({
      tenantId: input.tenantId,
      usuarioTenantId: input.usuarioTenantId,
    });

    return {
      estado: "no_requiere",
      chatwootUserId: input.existingChatwootUserId ?? null,
    };
  }

  const existingAgent = await findAgentByEmail(input.accountId, email);
  const existingAgentId = existingAgent?.id ? Number(existingAgent.id) : null;

  const password = generateTechnicalPassword();

  const provisionResult = await provisionChatwootUser({
    accountId: input.accountId,
    chatwootUserId: existingAgentId,
    email,
    name,
    password,
  });

  const agentId = Number(provisionResult.user_id);

  if (!Number.isFinite(agentId)) {
    throw new Error("Provision Chatwoot no devolvió un ID de agente válido.");
  }

  if (acceso === "supervisor") {
    await setTeamMembership(input.accountId, input.ventasTeamId, agentId, false);
    await setTeamMembership(input.accountId, input.soporteTeamId, agentId, false);
  } else if (acceso === "operador") {
    if (!input.equipoVentas && !input.equipoSoporte) {
      throw new Error("Un operador debe pertenecer al equipo de ventas, soporte o ambos.");
    }

    await setTeamMembership(input.accountId, input.ventasTeamId, agentId, input.equipoVentas);
    await setTeamMembership(input.accountId, input.soporteTeamId, agentId, input.equipoSoporte);
  } else {
    throw new Error(`Acceso de conversaciones inválido: ${input.conversacionesAcceso}`);
  }

  await saveSsoSecret({
    tenantId: input.tenantId,
    usuarioTenantId: input.usuarioTenantId,
    accountId: input.accountId,
    chatwootUserId: agentId,
    email,
    password,
  });

  return {
    estado: "sincronizado",
    chatwootUserId: agentId,
  };
}
