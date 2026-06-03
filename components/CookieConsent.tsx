"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_STORAGE_KEY = "oramis_cookie_consent";

type CookieConsentValue = "accepted" | "rejected";

function getGaId() {
  return process.env.NEXT_PUBLIC_GA_ID || "";
}

export function CookieConsent() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [loaded, setLoaded] = useState(false);

  const gaId = getGaId();

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);

    if (saved === "accepted" || saved === "rejected") {
      setConsent(saved);
    }

    setLoaded(true);
  }, []);

  function acceptCookies() {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    setConsent("accepted");
  }

  function rejectCookies() {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "rejected");
    setConsent("rejected");
  }

  const shouldLoadAnalytics = loaded && consent === "accepted" && Boolean(gaId);
  const shouldShowBanner = loaded && consent === null;

  return (
    <>
      {shouldLoadAnalytics ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="oramis-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      ) : null}

      {shouldShowBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="mx-auto max-w-[1080px] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/15 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
            <div>
              <p className="text-sm font-black text-slate-950">
                Usamos cookies para mejorar tu experiencia
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                Utilizamos cookies analíticas para entender cómo se usa Oramis y mejorar el producto.
                Podés aceptar o continuar solo con cookies necesarias.
              </p>
              <a
                href="/cookies"
                className="mt-2 inline-block text-xs font-black text-emerald-700 underline decoration-emerald-300 underline-offset-4"
              >
                Ver política de cookies
              </a>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:min-w-[260px] sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectCookies}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                Solo necesarias
              </button>
              <button
                type="button"
                onClick={acceptCookies}
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
