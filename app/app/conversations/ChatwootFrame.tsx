"use client";

import { useState } from "react";

export default function ChatwootFrame({ chatwootUrl }: { chatwootUrl: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="mx-auto max-w-[1600px] px-3 py-3 lg:px-5">
      <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-xl shadow-emerald-950/5">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex min-h-[720px] items-center justify-center bg-[#f6fbf8]">
            <div className="rounded-[2rem] border border-emerald-100 bg-white px-8 py-7 text-center shadow-xl shadow-emerald-950/5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
                <span className="text-lg font-black text-white">O</span>
              </div>
              <p className="mt-5 text-lg font-black text-[#07111f]">
                Cargando conversaciones
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Preparando la bandeja comercial de Oramis...
              </p>
            </div>
          </div>
        )}

        <iframe
          src={chatwootUrl}
          onLoad={() => setLoaded(true)}
          className="h-[calc(100vh-88px)] min-h-[720px] w-full border-0 bg-white"
          title="Conversaciones comerciales Oramis"
        />
      </div>
    </section>
  );
}
