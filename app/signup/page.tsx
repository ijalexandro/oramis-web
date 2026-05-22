import { signUpAction } from "@/app/auth/actions";

export const metadata = {
  title: "Crear cuenta | Oramis",
  description: "Creá tu cuenta en Oramis.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Crear cuenta"
      title="Empezá con Oramis"
      description="Creá tu cuenta para probar una demo con tus productos o avanzar con la contratación del servicio."
    >
      {params.error && <Alert text={params.error} />}

      <form action={signUpAction} className="space-y-4">
        <Field label="Nombre" name="name" type="text" placeholder="Tu nombre" />
        <Field label="Empresa" name="company" type="text" placeholder="Nombre del negocio" />
        <Field label="Email" name="email" type="email" placeholder="tu@email.com" />
        <Field label="Contraseña" name="password" type="password" placeholder="••••••••" />

        <button
          type="submit"
          className="block w-full rounded-full bg-emerald-500 px-6 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
        >
          Crear cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <a href="/login" className="font-black text-emerald-600">
          Ingresar
        </a>
      </p>
    </AuthShell>
  );
}

function Alert({ text }: { text: string }) {
  return (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
      {text}
    </div>
  );
}

function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
        <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="w-full max-w-[560px]">
          <a href="/" className="mb-8 flex items-center justify-center gap-3">
            <Logo />
          </a>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-emerald-950/5 sm:p-9">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              {title}
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">
              {description}
            </p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-semibold text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function Logo() {
  return (
    <>
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
    </>
  );
}
