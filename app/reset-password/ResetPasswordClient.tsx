"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Mode = "request" | "update" | "done";

export default function ResetPasswordClient() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const type = hash.get("type");

    async function setSessionFromHash() {
      if (!accessToken || !refreshToken) return;

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setError("El enlace no es válido o ya venció. Pedí un nuevo email.");
        setMode("request");
        return;
      }

      window.history.replaceState({}, document.title, "/reset-password");
      setMode("update");
    }

    if (accessToken && refreshToken && (type === "recovery" || type === "invite" || !type)) {
      setSessionFromHash();
    }
  }, [supabase]);

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Si el email existe, te enviamos las instrucciones para recuperar el acceso.");
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password.length < 8) {
      setLoading(false);
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== passwordRepeat) {
      setLoading(false);
      setError("Las contraseñas no coinciden.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.auth.signOut();
    setMode("done");
    setMessage("Contraseña creada correctamente. Ya podés ingresar a Oramis.");
  }

  return (
    <main className="min-h-screen bg-[#f6fbf8] px-5 py-12 text-[#07111f]">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[620px] flex-col justify-center">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
            <div className="absolute inset-1 rounded-xl border border-white/40" />
            <span className="text-xl font-black text-white">O</span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-[-0.04em]">Oramis</p>
            <p className="text-sm font-bold text-slate-500">Ventas conversacionales</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          {mode === "request" && (
            <>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">
                Recuperar contraseña
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                Recuperá tu acceso
              </h1>
              <p className="mt-5 text-base font-semibold leading-7 text-slate-600">
                Ingresá tu email y te enviaremos las instrucciones para volver a entrar a Oramis.
              </p>

              <form onSubmit={requestReset} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-black text-slate-700">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-emerald-500 px-6 py-4 text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {loading ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>
            </>
          )}

          {mode === "update" && (
            <>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">
                Crear contraseña
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                Creá tu nueva contraseña
              </h1>
              <p className="mt-5 text-base font-semibold leading-7 text-slate-600">
                Definí una contraseña para entrar a Oramis.
              </p>

              <form onSubmit={updatePassword} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-black text-slate-700">Nueva contraseña</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Repetir contraseña</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordRepeat}
                    onChange={(e) => setPasswordRepeat(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-emerald-500 px-6 py-4 text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {loading ? "Guardando..." : "Crear contraseña"}
                </button>
              </form>
            </>
          )}

          {mode === "done" && (
            <>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">
                Listo
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                Ya podés ingresar
              </h1>
              <p className="mt-5 text-base font-semibold leading-7 text-slate-600">
                Tu contraseña fue creada correctamente.
              </p>
              <a
                href="/login"
                className="mt-8 block rounded-full bg-emerald-500 px-6 py-4 text-center text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
              >
                Ir a ingresar
              </a>
            </>
          )}

          {message && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-800">
              {error}
            </div>
          )}

          {mode !== "done" && (
            <p className="mt-8 text-center text-sm font-bold text-slate-500">
              ¿Ya lo recordaste?{" "}
              <a href="/login" className="font-black text-emerald-600">
                Volver a ingresar
              </a>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
