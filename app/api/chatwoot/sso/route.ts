import crypto from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encryptSsoPayload(payload: Record<string, unknown>) {
  const secret = process.env.CHATWOOT_SSO_SECRET || "";

  if (!secret || secret.length !== 64) {
    throw new Error("Falta configurar CHATWOOT_SSO_SECRET.");
  }

  const key = Buffer.from(secret, "hex");
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${base64url(iv)}.${base64url(encrypted)}.${base64url(tag)}`;
}

export async function GET() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membershipRaw, error: membershipError } = await adminClient
    .from("usuarios_tenants")
    .select(
      [
        "id",
        "tenant_id",
        "email",
        "activo",
        "permisos",
        "chatwoot_user_id",
      ].join(",")
    )
    .eq("user_id", user.id)
    .eq("activo", true)
    .order("tenant_id", { ascending: true })
    .limit(1)
    .maybeSingle();

  const membership = membershipRaw as unknown as {
    id: string;
    tenant_id: number;
    email: string | null;
    activo: boolean;
    permisos: {
      conversations?: boolean;
      metrics?: boolean;
      business?: boolean;
      admin?: boolean;
    } | null;
    chatwoot_user_id: number | null;
  } | null;

  if (membershipError || !membership) {
    redirect("/app/conversations?chatwoot_sso_error=sin_usuario");
  }

  if (membership.permisos?.conversations !== true) {
    redirect("/app/conversations?chatwoot_sso_error=sin_permiso");
  }

  const { data: secretRaw, error: secretError } = await adminClient
    .schema("private")
    .from("chatwoot_login_secrets")
    .select(
      [
        "tenant_id",
        "usuario_tenant_id",
        "chatwoot_account_id",
        "chatwoot_user_id",
        "chatwoot_email",
        "chatwoot_login_secret",
        "activo",
      ].join(",")
    )
    .eq("usuario_tenant_id", membership.id)
    .eq("tenant_id", membership.tenant_id)
    .eq("activo", true)
    .maybeSingle();

  const secret = secretRaw as unknown as {
    tenant_id: number;
    usuario_tenant_id: string;
    chatwoot_account_id: number;
    chatwoot_user_id: number;
    chatwoot_email: string;
    chatwoot_login_secret: string;
    activo: boolean;
  } | null;

  if (secretError || !secret) {
    console.error("Error leyendo secreto SSO Chatwoot:", secretError);
    redirect("/app/conversations?chatwoot_sso_error=sin_secreto");
  }

  if (
    Number(secret.chatwoot_user_id) !== Number(membership.chatwoot_user_id) ||
    String(secret.chatwoot_email).toLowerCase() !== String(membership.email || user.email || "").toLowerCase()
  ) {
    redirect("/app/conversations?chatwoot_sso_error=datos_invalidos");
  }

  const token = encryptSsoPayload({
    sub: user.id,
    usuario_tenant_id: membership.id,
    tenant_id: membership.tenant_id,
    email: secret.chatwoot_email,
    password: secret.chatwoot_login_secret,
    account_id: secret.chatwoot_account_id,
    chatwoot_user_id: secret.chatwoot_user_id,
    exp: Date.now() + 60_000,
    nonce: crypto.randomBytes(16).toString("hex"),
  });

  redirect(`https://chat.oramis.ai/oramis-sso/start?t=${encodeURIComponent(token)}`);
}
