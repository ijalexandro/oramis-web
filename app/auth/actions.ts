"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

async function getOrigin() {
  const headersList = await headers();
  const origin = headersList.get("origin");

  if (origin) return origin;

  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.oramis.ai";
}

function cleanString(value: FormDataEntryValue | null) {
  return String(value || "").trim();
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

  if (error) {
    redirect("/signup?error=No pudimos crear la cuenta. Probá nuevamente.");
  }

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
