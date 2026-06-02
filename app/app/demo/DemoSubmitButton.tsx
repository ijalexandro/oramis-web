"use client";

import { useFormStatus } from "react-dom";

export function DemoSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-full bg-emerald-500 px-7 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          <span>Preparando tu demo...</span>
        </span>
      ) : (
        "Crear demo gratis"
      )}
    </button>
  );
}
