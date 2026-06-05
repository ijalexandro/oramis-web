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
};

export default function WhatsAppEmbeddedSignupTest({
  appId,
  configurationId,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loginResponse, setLoginResponse] = useState<FacebookLoginResponse | null>(null);
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
      setError("El SDK de Meta todavía no está listo. Esperá unos segundos y probá de nuevo.");
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
          setError("Meta no devolvió code. El usuario pudo haber cancelado o faltó autorización.");
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
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Prueba Meta Embedded Signup
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#07111f]">
              Conectar WhatsApp desde Oramis
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Esta pantalla solo prueba el flujo de Meta. Todavía no guarda credenciales,
              no crea bandejas en Chatwoot y no modifica Supabase.
            </p>
          </div>

          <button
            type="button"
            onClick={launchEmbeddedSignup}
            disabled={!sdkReady || !isConfigured}
            className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {sdkReady ? "Probar Embedded Signup" : "Cargando Meta SDK..."}
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-900">App ID</p>
            <p className="mt-1 break-all">{appId || "No configurado"}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-black text-slate-900">Configuration ID</p>
            <p className="mt-1 break-all">{configurationId || "No configurado"}</p>
          </div>
        </div>

        {(!isConfigured || error) && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-900">
            {!isConfigured ? "Falta configurar App ID o Configuration ID." : error}
          </div>
        )}
      </div>

      {lastFinishEvent?.data && (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h2 className="text-xl font-black tracking-[-0.03em] text-emerald-950">
            Meta devolvió datos de WhatsApp
          </h2>

          <div className="mt-4 grid gap-3 text-sm font-semibold text-emerald-950 lg:grid-cols-3">
            <ResultField label="WABA ID" value={lastFinishEvent.data.waba_id} />
            <ResultField label="Phone Number ID" value={lastFinishEvent.data.phone_number_id} />
            <ResultField label="Business ID" value={lastFinishEvent.data.business_id} />
          </div>
        </div>
      )}

      <DebugBlock title="Respuesta de FB.login" data={loginResponse} />
      <DebugBlock title="Eventos WA_EMBEDDED_SIGNUP" data={sessionEvents} />
      <DebugBlock title="Eventos raw recibidos desde Meta" data={rawEvents} />
    </div>
  );
}

function ResultField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4">
      <p className="font-black">{label}</p>
      <p className="mt-1 break-all">{value || "No recibido"}</p>
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
