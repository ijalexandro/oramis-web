export const metadata = {
  title: "Recuperar contraseña | Oramis",
  description: "Recuperá tu acceso a Oramis.",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
        <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="w-full max-w-[500px]">
          <a href="/" className="mb-8 flex items-center justify-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
              <div className="absolute inset-1 rounded-xl border border-white/40" />
              <span className="text-lg font-black text-white">O</span>
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">Oramis</p>
              <p className="text-xs font-semibold text-slate-500">
                Ventas conversacionales
              </p>
            </div>
          </a>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-emerald-950/5 sm:p-9">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Recuperar contraseña
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              Recuperá tu acceso
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">
              Ingresá tu email y te enviaremos las instrucciones para volver a
              entrar a Oramis.
            </p>

            <form className="mt-8 space-y-4">
              <label className="block">
                <span className="text-sm font-black text-slate-700">Email</span>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-semibold text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <a
                href="/login"
                className="block rounded-full bg-emerald-500 px-6 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
              >
                Enviar instrucciones
              </a>
            </form>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              ¿Ya lo recordaste?{" "}
              <a href="/login" className="font-black text-emerald-600">
                Volver a ingresar
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
