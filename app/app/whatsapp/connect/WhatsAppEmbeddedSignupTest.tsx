"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: Record<string, unknown>
      ) => void;
    };
    fbAsyncInit?: () => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type FacebookLoginResponse = {
  authResponse?: {
    code?: string;
    accessToken?: string;
    userID?: string;
    expiresIn?: number;
    signedRequest?: string;
  };
  status?: string;
};

type EmbeddedSignupEvent = {
  type?: string;
  event?: string;
  data?: {
    waba_id?: string;
    phone_number_id?: string;
    business_id?: string;
    current_step?: string;
    error_message?: string;
  };
};

type Props = {
  appId: string;
  configurationId: string;
  debugMode?: boolean;
};

export default function WhatsAppEmbeddedSignupTest({
  appId,
  configurationId,
  debugMode = false,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loginResponse, setLoginResponse] =
    useState<FacebookLoginResponse | null>(null);
  const [sessionEvents, setSessionEvents] = useState<EmbeddedSignupEvent[]>([]);
  const [rawEvents, setRawEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = useMemo(() => {
    return Boolean(appId && configurationId);
  }, [appId, configurationId]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    window.fbAsyncInit = function fbAsyncInit() {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v23.0",
      });

      setSdkReady(true);
    };

    const existingScript = document.getElementById("facebook-jssdk");

    if (existingScript) {
      window.fbAsyncInit?.();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/es_LA/sdk.js";

    document.body.appendChild(script);
  }, [appId, configurationId, isConfigured]);

  useEffect(() => {
    const sessionInfoListener = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      const raw =
        typeof event.data === "string" ? event.data : JSON.stringify(event.data);

      setRawEvents((previous) => [raw, ...previous].slice(0, 10));

      try {
        const parsed = JSON.parse(raw) as EmbeddedSignupEvent;

        if (parsed.type === "WA_EMBEDDED_SIGNUP") {
          setSessionEvents((previous) => [parsed, ...previous].slice(0, 10));
        }
      } catch {
        // Meta puede enviar algunos mensajes no JSON. Los dejamos en rawEvents.
      }
    };

    window.addEventListener("message", sessionInfoListener);

    return () => {
      window.removeEventListener("message", sessionInfoListener);
    };
  }, []);

  const launchEmbeddedSignup = useCallback(() => {
    setError(null);
    setLoginResponse(null);
    setSessionEvents([]);
    setRawEvents([]);

    if (!window.FB) {
      setError(
        "La conexión con Meta todavía se está preparando. Esperá unos segundos y probá nuevamente."
      );
      return;
    }

    window.fbq?.("trackCustom", "WhatsAppOnboardingStart", {
      appId,
      feature: "whatsapp_embedded_signup",
    });

    window.FB.login(
      (response) => {
        setLoginResponse(response);

        if (!response.authResponse?.code) {
          setError(
            "No se completó la autorización con Meta. Podés volver a intentarlo cuando quieras."
          );
        }
      },
      {
        config_id: configurationId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: 2,
        },
      }
    );
  }, [appId, configurationId]);

  const lastFinishEvent = sessionEvents.find((event) => {
    return event.event === "FINISH" || event.event === "FINISH_ONLY_WABA";
  });

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 lg:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              WhatsApp Business
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] text-[#07111f] lg:text-4xl">
              Conectar WhatsApp a Oramis
            </h1>

            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">
              Conectá tu número de WhatsApp Business para gestionar mensajes de
              clientes desde Oramis.
            </p>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Al continuar, Meta te pedirá seleccionar tu cuenta comercial, tu
              cuenta de WhatsApp Business y el número de teléfono que querés
              conectar.
            </p>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Oramis usará esta conexión únicamente para enviar y recibir
              mensajes en nombre de tu negocio, centralizar conversaciones,
              automatizar respuestas y derivar consultas a agentes humanos.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={launchEmbeddedSignup}
                disabled={!sdkReady || !isConfigured}
                className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {sdkReady ? "Conectar WhatsApp" : "Preparando conexión..."}
              </button>

              <a
                href="/app/admin"
                className="rounded-full border border-slate-200 bg-white px-7 py-3 text-center text-sm font-black text-[#07111f] shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                Volver a Administración
              </a>
            </div>

            {(!isConfigured || error) && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-900">
                {!isConfigured
                  ? "Falta configurar la conexión de Meta."
                  : error}
              </div>
            )}

            {lastFinishEvent?.data && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold leading-6 text-emerald-900">
                Meta autorizó la conexión de WhatsApp. Oramis ya puede preparar
                la bandeja del negocio para enviar y recibir mensajes.
              </div>
            )}
          </div>

          <div className="border-t border-emerald-100 bg-emerald-50/70 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-emerald-900">
                Con esta integración vas a poder:
              </p>

              <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600">
                <FeatureItem text="Recibir y responder mensajes de clientes." />
                <FeatureItem text="Automatizar respuestas comerciales y de soporte." />
                <FeatureItem text="Centralizar conversaciones en tu equipo." />
                <FeatureItem text="Derivar consultas a agentes humanos cuando sea necesario." />
              </div>
            </div>
          </div>
        </div>
      </div>

      {debugMode && (
        <>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
              Debug técnico
            </p>

            <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600 lg:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black text-slate-900">App ID</p>
                <p className="mt-1 break-all">{appId || "No configurado"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-black text-slate-900">Configuration ID</p>
                <p className="mt-1 break-all">
                  {configurationId || "No configurado"}
                </p>
              </div>
            </div>
          </div>

          <DebugBlock title="Respuesta de FB.login" data={loginResponse} />
          <DebugBlock title="Eventos WA_EMBEDDED_SIGNUP" data={sessionEvents} />
          <DebugBlock title="Eventos raw recibidos desde Meta" data={rawEvents} />
        </>
      )}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
        ✓
      </span>
      <span>{text}</span>
    </div>
  );
}

function DebugBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <details className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer text-sm font-black text-slate-800">
        {title}
      </summary>
      <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs font-semibold leading-5 text-slate-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}
