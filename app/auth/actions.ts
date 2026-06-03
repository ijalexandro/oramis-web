"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function getOrigin() {
  const headersList = await headers();
  const origin = headersList.get("origin");

  if (origin) return origin;

  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.oramis.ai";
}

function cleanString(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

async function findAuthUserByEmail(adminClient: ReturnType<typeof createAdminClient>, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new Error(`No se pudo buscar el usuario Auth: ${error.message}`);
    }

    const users = data.users || [];
    const found = users.find((user) => user.email?.toLowerCase() === normalizedEmail);

    if (found) {
      return found;
    }

    if (users.length < 100) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function signInAction(formData: FormData) {
  const email = cleanString(formData.get("email"));
  const password = cleanString(formData.get("password"));
  const next = cleanString(formData.get("next")) || "/app";

  if (!email || !password) {
    redirect("/login?error=Completá email y contraseña");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=No pudimos iniciar sesión. Revisá los datos e intentá nuevamente.");
  }

  redirect(next.startsWith("/app") ? next : "/app");
}

export async function signUpAction(formData: FormData) {
  const name = cleanString(formData.get("name"));
  const company = cleanString(formData.get("company"));
  const email = cleanString(formData.get("email"));
  const password = cleanString(formData.get("password"));

  if (!name || !company || !email || !password) {
    redirect("/signup?error=Completá todos los campos");
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/app`,
      data: {
        name,
        company,
      },
    },
  });

  console.error("SIGNUP_DEBUG signUp result:", {
    hasError: Boolean(error),
    errorMessage: error?.message ?? null,
    errorName: error?.name ?? null,
    errorStatus: "status" in (error || {}) ? (error as { status?: number }).status : null,
    hasUser: Boolean(data.user),
    userId: data.user?.id ?? null,
    userEmail: data.user?.email ?? null,
    hasSession: Boolean(data.session),
    email,
  });

  if (error) {
    redirect("/signup?error=No pudimos crear la cuenta. Probá nuevamente.");
  }

  const adminClient = createAdminClient();
  const signedUpUser = data.user ?? (await findAuthUserByEmail(adminClient, email));

  if (!signedUpUser?.id) {
    console.error("SIGNUP_DEBUG usuario auth no encontrado después de signUp:", {
      email,
      hasUser: Boolean(data.user),
    });
    redirect("/signup?error=No pudimos preparar tu cuenta. Probá nuevamente.");
  }

  console.error("SIGNUP_DEBUG auth resuelto:", {
    user_id: signedUpUser.id,
    email,
    company,
  });

  const { data: tenant, error: tenantError } = await adminClient
    .from("_0_tenants")
    .insert({
      nombre_empresa: company,
      estado: "pendiente_onboarding",
      email_contacto: email,
      url_webhook: "https://n8n.oramis.ai/webhook/motor-ventas-chatwoot-fb-3-1-9c8f4b7a2d6e",
      url_chatwoot: "chat.oramis.ai",
      account_id: 4,
      inbox_id: 3,
      chatwoot_team_id_ventas: 5,
      chatwoot_team_id_soporte: 6,
      mensaje_identificador: "DEMO_ORAMIS_ONBOARDING",
      info_empresa:
        "Esta es una demo interactiva de Oramis generada automáticamente a partir de una muestra de productos del sitio web del comercio. No representa una operación comercial real todavía.",
      info_general:
        "Estás funcionando en modo demo. El objetivo es mostrar cómo Oramis podría responder consultas comerciales usando productos reales detectados desde la web del comercio. En esta demo no hay WhatsApp real conectado, no hay vendedor humano atendiendo y no se toman pedidos reales. Si el cliente quiere avanzar comercialmente, invitalo a contratar Oramis.",
      info_contestar_producto:
        "Para esta demo usá únicamente los productos cargados en la tabla del tenant. La demo puede contener solo una muestra parcial del catálogo, por ejemplo hasta 50 productos. Si el cliente pregunta por un producto que no está en la muestra, no inventes disponibilidad, precio ni variantes. Explicá brevemente que esta demo trabaja con una muestra parcial de productos y sugerí probar con otro producto de los cargados o revisar/editar el catálogo de la demo en https://www.oramis.ai/app/demo/preview.",
      metadata: {
        origen: "signup",
        auth_user_id: signedUpUser.id,
        demo_chatwoot: {
          account_id: 4,
          inbox_id: 3,
          team_id_ventas: 5,
          team_id_soporte: 6,
          tipo: "onboarding_demo",
        },
      },
    })
    .select("tenant_id")
    .single();

  if (tenantError || !tenant?.tenant_id) {
    console.error("SIGNUP_DEBUG error creando tenant de onboarding:", {
      tenantError,
      tenant,
      email,
      company,
    });
    redirect("/signup?error=La cuenta se creó, pero no pudimos preparar el onboarding. Contactanos para activarla.");
  }

  console.error("SIGNUP_DEBUG tenant creado:", tenant);

  const { error: membershipError } = await adminClient
    .from("usuarios_tenants")
    .insert({
      tenant_id: tenant.tenant_id,
      user_id: signedUpUser.id,
      email,
      rol: "owner",
      nombre: name,
      activo: true,
      permisos: {
        admin: true,
        metrics: false,
        business: false,
        conversations: false,
      },
      conversaciones_acceso: "ninguno",
      equipo_ventas: false,
      equipo_soporte: false,
      chatwoot_sync_estado: "no_requiere",
      auth_invitation_estado: "registrado",
    });

  if (membershipError) {
    console.error("SIGNUP_DEBUG error creando usuario_tenant de onboarding:", {
      membershipError,
      tenant,
      user_id: signedUpUser.id,
      email,
    });
    redirect("/signup?error=La cuenta se creó, pero no pudimos asociarla al negocio. Contactanos para activarla.");
  }

  console.error("SIGNUP_DEBUG usuario_tenant creado:", {
    tenant_id: tenant.tenant_id,
    user_id: signedUpUser.id,
    email,
  });

  if (data.session) {
    redirect("/app");
  }

  redirect("/login?message=Cuenta creada. Revisá tu email para confirmar el acceso.");
}

export async function resetPasswordAction(formData: FormData) {
  const email = cleanString(formData.get("email"));

  if (!email) {
    redirect("/reset-password?error=Ingresá tu email");
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    redirect("/reset-password?error=No pudimos enviar las instrucciones. Intentá nuevamente.");
  }

  redirect("/reset-password?message=Te enviamos las instrucciones para recuperar tu contraseña.");
}
