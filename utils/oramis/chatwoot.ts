type ChatwootAgent = {
  id: number;
  account_id: number;
  email: string;
  name: string;
  role: string;
  confirmed?: boolean;
};

type SyncChatwootInput = {
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

async function chatwootFetch(path: string, init: RequestInit = {}) {
  const { baseUrl, token } = getChatwootConfig();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "api_access_token": token,
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
  return agents.find((agent) => agent.email.toLowerCase() === email.toLowerCase()) ?? null;
}

async function createOrFindAgent(accountId: number, email: string, name: string) {
  const existing = await findAgentByEmail(accountId, email);
  if (existing) return existing;

  try {
    const created = await chatwootFetch(`/api/v1/accounts/${accountId}/agents`, {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        role: "agent",
      }),
    });

    return created as ChatwootAgent;
  } catch (error) {
    const afterError = await findAgentByEmail(accountId, email);
    if (afterError) return afterError;
    throw error;
  }
}

async function getTeamMembers(accountId: number, teamId: number): Promise<ChatwootAgent[]> {
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

export async function syncChatwootTenantUser(
  input: SyncChatwootInput
): Promise<SyncChatwootResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email;

  if (!email) {
    throw new Error("El usuario no tiene email.");
  }

  if (!input.accountId) {
    throw new Error("El tenant no tiene account_id de Chatwoot.");
  }

  const acceso = String(input.conversacionesAcceso || "ninguno").toLowerCase();

  if (!input.conversaciones || acceso === "ninguno") {
    if (input.existingChatwootUserId) {
      await setTeamMembership(input.accountId, input.ventasTeamId, input.existingChatwootUserId, false);
      await setTeamMembership(input.accountId, input.soporteTeamId, input.existingChatwootUserId, false);
    }

    return {
      estado: "no_requiere",
      chatwootUserId: input.existingChatwootUserId ?? null,
    };
  }

  const agent = await createOrFindAgent(input.accountId, email, name);
  const agentId = Number(agent.id);

  if (!Number.isFinite(agentId)) {
    throw new Error("Chatwoot no devolvió un ID de agente válido.");
  }

  if (acceso === "supervisor") {
    await setTeamMembership(input.accountId, input.ventasTeamId, agentId, false);
    await setTeamMembership(input.accountId, input.soporteTeamId, agentId, false);

    return {
      estado: "sincronizado",
      chatwootUserId: agentId,
    };
  }

  if (acceso === "operador") {
    if (!input.equipoVentas && !input.equipoSoporte) {
      throw new Error("Un operador debe pertenecer al equipo de ventas, soporte o ambos.");
    }

    await setTeamMembership(input.accountId, input.ventasTeamId, agentId, input.equipoVentas);
    await setTeamMembership(input.accountId, input.soporteTeamId, agentId, input.equipoSoporte);

    return {
      estado: "sincronizado",
      chatwootUserId: agentId,
    };
  }

  throw new Error(`Acceso de conversaciones inválido: ${input.conversacionesAcceso}`);
}
