"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Plan, PrefillData } from "./page";
import { saveContractAttemptAction, validateDiscountCodeAction } from "./actions";

type RangeOption = {
  value: string;
  label: string;
  estimated: number | null;
  custom?: boolean;
};

type DiscountApplied = {
  codigo: string;
  descripcion: string | null;
  tipo_descuento: string;
  valor_descuento: number;
  duracion_meses: number | null;
  precio_base_usd: number;
  precio_promocional_usd: number;
  ahorro_mensual_usd: number;
  partner_nombre: string | null;
};

type RecommendedPlan = {
  plan: Plan | null;
  esCustom: boolean;
  motivoCustom: string | null;
};

const conversationOptions: RangeOption[] = [
  { value: "hasta_2000", label: "Hasta 2.000", estimated: 2000 },
  { value: "2000_5000", label: "Entre 2.000 y 5.000", estimated: 5000 },
  { value: "5000_10000", label: "Entre 5.000 y 10.000", estimated: 10000 },
  { value: "10000_20000", label: "Entre 10.000 y 20.000", estimated: 20000 },
  { value: "mas_20000", label: "Más de 20.000", estimated: null, custom: true },
];

const productOptions: RangeOption[] = [
  { value: "hasta_500", label: "Hasta 500", estimated: 500 },
  { value: "500_2000", label: "Entre 500 y 2.000", estimated: 2000 },
  { value: "2000_10000", label: "Entre 2.000 y 10.000", estimated: 10000 },
  { value: "10000_30000", label: "Entre 10.000 y 30.000", estimated: 30000 },
  { value: "mas_30000", label: "Más de 30.000", estimated: null, custom: true },
];

const listOptions: RangeOption[] = [
  { value: "1", label: "1 lista / precio único", estimated: 1 },
  { value: "2_3", label: "2 a 3", estimated: 3 },
  { value: "4_10", label: "4 a 10", estimated: 10 },
  { value: "mas_10", label: "Más de 10", estimated: null, custom: true },
];

const userOptions: RangeOption[] = [
  { value: "hasta_10", label: "Hasta 10", estimated: 10 },
  { value: "11_20", label: "Entre 11 y 20", estimated: 20 },
  { value: "21_40", label: "Entre 21 y 40", estimated: 40 },
  { value: "41_80", label: "Entre 41 y 80", estimated: 80 },
  { value: "mas_80", label: "Más de 80", estimated: null, custom: true },
];

function formatUsd(value: number | null | undefined) {
  if (value === null || value === undefined) return "A medida";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOption(options: RangeOption[], value: string) {
  return options.find((option) => option.value === value) || options[0];
}

function firstCustomPlan(planes: Plan[]) {
  return planes.find((plan) => plan.es_custom) || null;
}

function calculateRecommendedPlan(input: {
  planes: Plan[];
  conversaciones: RangeOption;
  productos: RangeOption;
  listas: RangeOption;
  usuarios: RangeOption;
}): RecommendedPlan {
  const { planes, conversaciones, productos, listas, usuarios } = input;
  const customPlan = firstCustomPlan(planes);

  if (conversaciones.custom) {
    return {
      plan: customPlan,
      esCustom: true,
      motivoCustom: "Tu operación supera las 20.000 conversaciones mensuales.",
    };
  }

  if (productos.custom) {
    return {
      plan: customPlan,
      esCustom: true,
      motivoCustom: "Tu catálogo supera los 30.000 productos.",
    };
  }

  if (listas.custom) {
    return {
      plan: customPlan,
      esCustom: true,
      motivoCustom: "Tu catálogo maneja más de 10 listas de precio, zonas o sucursales.",
    };
  }

  if (usuarios.custom) {
    return {
      plan: customPlan,
      esCustom: true,
      motivoCustom: "Tu equipo supera los 80 usuarios.",
    };
  }

  const conversacionesEstimadas = conversaciones.estimated || 0;
  const productosEstimados = productos.estimated || 0;
  const listasEstimadas = listas.estimated || 1;
  const usuariosEstimados = usuarios.estimated || 0;
  const productosEfectivos = productosEstimados * listasEstimadas;

  const standardPlans = planes
    .filter((plan) => !plan.es_custom)
    .sort((a, b) => a.orden - b.orden);

  const matchedPlan =
    standardPlans.find((plan) => {
      return (
        conversacionesEstimadas <= Number(plan.conversaciones_max || 0) &&
        usuariosEstimados <= Number(plan.usuarios_max || 0) &&
        productosEfectivos <= Number(plan.productos_efectivos_max || 0) &&
        listasEstimadas <= Number(plan.listas_precio_max || 0)
      );
    }) || null;

  if (!matchedPlan) {
    return {
      plan: customPlan,
      esCustom: true,
      motivoCustom: "Tu operación requiere una configuración a medida.",
    };
  }

  return {
    plan: matchedPlan,
    esCustom: false,
    motivoCustom: null,
  };
}

export function ContratarClient({
  prefill,
  planes,
}: {
  prefill: PrefillData;
  planes: Plan[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLElement | null>(null);

  const [nombre, setNombre] = useState(prefill.nombre);
  const [apellido, setApellido] = useState(prefill.apellido);
  const [email, setEmail] = useState(prefill.email);
  const [telefono, setTelefono] = useState(prefill.telefono);
  const [empresa, setEmpresa] = useState(prefill.empresa);
  const [sitioWeb, setSitioWeb] = useState(prefill.sitio_web);

  const [conversacionesRango, setConversacionesRango] = useState("hasta_2000");
  const [productosRango, setProductosRango] = useState("hasta_500");
  const [precioUnico, setPrecioUnico] = useState(true);
  const [listasRango, setListasRango] = useState("1");
  const [usuariosRango, setUsuariosRango] = useState("hasta_10");

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<DiscountApplied | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastAttemptId, setLastAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (step === 1) return;

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [step]);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const selectedConversaciones = getOption(conversationOptions, conversacionesRango);
  const selectedProductos = getOption(productOptions, productosRango);
  const selectedListas = precioUnico ? listOptions[0] : getOption(listOptions, listasRango);
  const selectedUsuarios = getOption(userOptions, usuariosRango);

  const productosEfectivos =
    selectedProductos.estimated && selectedListas.estimated
      ? selectedProductos.estimated * selectedListas.estimated
      : null;

  const recommended = useMemo(
    () =>
      calculateRecommendedPlan({
        planes,
        conversaciones: selectedConversaciones,
        productos: selectedProductos,
        listas: selectedListas,
        usuarios: selectedUsuarios,
      }),
    [
      planes,
      selectedConversaciones,
      selectedProductos,
      selectedListas,
      selectedUsuarios,
    ]
  );

  const plan = recommended.plan;
  const isCustom = recommended.esCustom || Boolean(plan?.es_custom);
  const basePrice = plan?.precio_mensual_usd || null;

  function canGoStep2() {
    return Boolean(nombre.trim() && email.trim() && empresa.trim());
  }

  function resetDiscount() {
    setDiscountApplied(null);
    setDiscountError(null);
  }

  function handleApplyDiscount() {
    setDiscountError(null);
    setDiscountApplied(null);

    startTransition(async () => {
      const result = await validateDiscountCodeAction({
        code: discountCode,
        email,
        planCodigo: plan?.codigo || null,
        precioBaseUsd: basePrice,
      });

      if (!result.ok) {
        setDiscountError(result.error || "No pudimos validar el código.");
        return;
      }

      setDiscountApplied(result);
    });
  }

  function buildAttemptPayload(estado: string) {
    return {
      tenant_id: prefill.tenant_id,
      user_id: prefill.user_id,

      nombre,
      apellido,
      email,
      telefono,
      empresa,
      sitio_web: sitioWeb,

      conversaciones_rango: selectedConversaciones.label,
      conversaciones_estimadas: selectedConversaciones.estimated,

      productos_rango: selectedProductos.label,
      productos_estimados: selectedProductos.estimated,

      precio_unico_catalogo: precioUnico,
      listas_precio_rango: selectedListas.label,
      listas_precio_estimadas: selectedListas.estimated || 1,

      usuarios_rango: selectedUsuarios.label,
      usuarios_estimados: selectedUsuarios.estimated,

      productos_efectivos_estimados: productosEfectivos,

      plan_codigo: plan?.codigo || null,
      plan_nombre: plan?.nombre || null,
      precio_mensual_usd: basePrice,
      moneda: plan?.moneda || "USD",

      es_custom: isCustom,
      motivo_custom: recommended.motivoCustom,

      codigo_descuento: discountApplied?.codigo || null,
      descuento_snapshot: discountApplied
        ? {
            ...discountApplied,
            aplicado_en_pantalla: true,
          }
        : {},

      estado,
      metadata: {
        origen: "contratar",
        version: "v1",
      },
    };
  }

  function saveAttempt(estado: string, successMessage: string) {
    setSaveError(null);
    setSaveMessage(null);

    startTransition(async () => {
      const result = await saveContractAttemptAction(buildAttemptPayload(estado));

      if (!result.ok) {
        setSaveError(result.error || "No pudimos guardar la solicitud.");
        return;
      }

      setLastAttemptId(result.id || null);
      setSaveMessage(successMessage);
    });
  }

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-[#07111f]">
      <header className="border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
              <div className="absolute inset-1 rounded-xl border border-white/40" />
              <span className="text-lg font-black text-white">O</span>
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">Oramis</p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">
                Contratación
              </p>
            </div>
          </a>

          <a
            href="/app"
            className="rounded-full bg-[#07111f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600"
          >
            Ir a mi cuenta
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-5 py-8 lg:grid-cols-[0.92fr_1.08fr]">
        <aside
          onClick={scrollToForm}
          className="cursor-pointer rounded-[2.4rem] bg-[#07111f] p-8 text-white shadow-xl shadow-slate-300 lg:cursor-default"
        >
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Contratá Oramis
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] lg:text-5xl">
            Activá un vendedor IA para tu negocio.
          </h1>
          <p className="mt-5 text-base font-semibold leading-7 text-slate-300">
            Te ayudamos a elegir una configuración preparada para vender, atender consultas
            y ordenar oportunidades comerciales desde el primer día.
          </p>

          <p className="mt-6 text-sm font-black text-emerald-300 lg:hidden">
            Tocá para completar los datos ↓
          </p>

          <div className="mt-8 hidden gap-3 lg:grid">
            <StepPill active={step === 1} number="1" text="Datos" />
            <StepPill active={step === 2} number="2" text="Operación" />
            <StepPill active={step === 3} number="3" text="Plan recomendado" />
          </div>
        </aside>

        <section
          ref={formRef}
          className="rounded-[2.4rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {step === 1 ? (
            <div>
              <SectionHeader
                eyebrow="Paso 1"
                title="Datos del negocio"
                text="Usamos estos datos para preparar la contratación y contactarte si hace falta."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <TextField label="Nombre" value={nombre} onChange={setNombre} required />
                <TextField label="Apellido" value={apellido} onChange={setApellido} />
                <TextField label="Email" value={email} onChange={setEmail} required />
                <TextField label="Teléfono" value={telefono} onChange={setTelefono} />
                <TextField label="Empresa" value={empresa} onChange={setEmpresa} required />
                <TextField label="Sitio web" value={sitioWeb} onChange={setSitioWeb} />
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  disabled={!canGoStep2()}
                  onClick={() => {
                    setStep(2);
                    window.setTimeout(scrollToForm, 80);
                  }}
                  className="rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <SectionHeader
                eyebrow="Paso 2"
                title="Tu operación comercial"
                text="Contanos cómo funciona tu negocio para recomendarte la configuración adecuada."
              />

              <div className="mt-6 grid gap-6">
                <OptionGroup
                  label="¿Cuántas conversaciones comerciales recibís por mes?"
                  value={conversacionesRango}
                  options={conversationOptions}
                  onChange={(value) => {
                    setConversacionesRango(value);
                    resetDiscount();
                  }}
                />

                <OptionGroup
                  label="¿Cuántos productos tiene tu catálogo aproximadamente?"
                  value={productosRango}
                  options={productOptions}
                  onChange={(value) => {
                    setProductosRango(value);
                    resetDiscount();
                  }}
                />

                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm font-black text-slate-900">
                    ¿Tu catálogo maneja un único precio para todos?
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPrecioUnico(true);
                        setListasRango("1");
                        resetDiscount();
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                        precioUnico
                          ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
                      }`}
                    >
                      Sí, precio único
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrecioUnico(false);
                        setListasRango("2_3");
                        resetDiscount();
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                        !precioUnico
                          ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
                      }`}
                    >
                      No, precios por zona/lista
                    </button>
                  </div>

                  {!precioUnico ? (
                    <div className="mt-5">
                      <OptionGroup
                        label="¿Cuántas zonas, sucursales o listas de precio tiene tu catálogo?"
                        value={listasRango}
                        options={listOptions.filter((option) => option.value !== "1")}
                        onChange={(value) => {
                          setListasRango(value);
                          resetDiscount();
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <OptionGroup
                  label="¿Cuántas personas van a usar Oramis?"
                  value={usuariosRango}
                  options={userOptions}
                  onChange={(value) => {
                    setUsuariosRango(value);
                    resetDiscount();
                  }}
                />

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  {!showDiscountInput ? (
                    <button
                      type="button"
                      onClick={() => setShowDiscountInput(true)}
                      className="text-sm font-black text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-emerald-700"
                    >
                      Tengo un código de descuento
                    </button>
                  ) : (
                    <>
                      <p className="text-sm font-black text-slate-900">
                        Código de descuento
                      </p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input
                          value={discountCode}
                          onChange={(event) => {
                            setDiscountCode(event.target.value.toUpperCase());
                            setDiscountApplied(null);
                            setDiscountError(null);
                          }}
                          placeholder="Ej: 123sie$OA"
                          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          disabled={isPending || !discountCode.trim() || isCustom}
                          onClick={handleApplyDiscount}
                          className="rounded-2xl bg-[#07111f] px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Aplicar
                        </button>
                      </div>

                      {discountApplied ? (
                        <p className="mt-3 text-sm font-bold text-emerald-700">
                          Código {discountApplied.codigo} aplicado: {discountApplied.valor_descuento}% de descuento
                          {discountApplied.duracion_meses
                            ? ` durante ${discountApplied.duracion_meses} meses`
                            : ""}.
                        </p>
                      ) : null}

                      {discountError ? (
                        <p className="mt-3 text-sm font-bold text-red-600">{discountError}</p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-7 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveAttempt("calculado", "Cotización guardada.");
                    setStep(3);
                    window.setTimeout(scrollToForm, 80);
                  }}
                  className="rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  Ver plan recomendado
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <SectionHeader
                eyebrow="Paso 3"
                title={isCustom ? "Armamos una propuesta para tu operación" : `Plan recomendado: ${plan?.nombre}`}
                text={
                  isCustom
                    ? "Por el tamaño o la complejidad de tu operación, te vamos a contactar para preparar una propuesta personalizada."
                    : "Este es el plan recomendado para empezar a operar con Oramis."
                }
              />

              <div className="mt-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
                      {isCustom ? "Custom" : plan?.nombre}
                    </p>
                    <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-slate-950">
                      {isCustom
                        ? "A medida"
                        : discountApplied
                          ? `${formatUsd(discountApplied.precio_promocional_usd)} / mes`
                          : `${formatUsd(basePrice)} / mes`}
                    </h2>

                    {!isCustom && discountApplied ? (
                      <p className="mt-2 text-sm font-bold text-emerald-800">
                        Luego {formatUsd(basePrice)} / mes. Descuento válido por{" "}
                        {discountApplied.duracion_meses || 0} meses.
                      </p>
                    ) : null}


                  </div>

                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Productos del catálogo
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-950">
                      {selectedProductos.label}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <LimitItem label="Conversaciones" value={plan?.conversaciones_max ? `Hasta ${plan.conversaciones_max.toLocaleString("es-AR")}` : "A medida"} />
                  <LimitItem label="Mensajes incluidos" value={plan?.mensajes_max ? `Hasta ${plan.mensajes_max.toLocaleString("es-AR")}` : "A medida"} />
                  <LimitItem label="Usuarios" value={plan?.usuarios_max ? `Hasta ${plan.usuarios_max}` : "A medida"} />
                  <LimitItem
                    label="Listas de precio"
                    value={
                      plan?.listas_precio_max
                        ? plan.listas_precio_max === 1
                          ? "1"
                          : `Hasta ${plan.listas_precio_max}`
                        : "A medida"
                    }
                  />
                </div>
              </div>

              {plan?.incluye_json?.length ? (
                <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-black tracking-[-0.03em]">Qué incluye</h3>
                  <div className="mt-4 grid gap-3">
                    {plan.incluye_json.map((item) => (
                      <div key={item} className="flex gap-3 text-sm font-bold text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {saveError ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-700">
                  {saveError}
                </div>
              ) : null}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    window.setTimeout(scrollToForm, 80);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  Volver
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {!isCustom ? (
                    <button
                      type="button"
                      onClick={() =>
                        saveAttempt(
                          "pendiente_contacto",
                          "Listo. Registramos tu solicitud y vamos a contactarte."
                        )
                      }
                      className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      Necesito ayuda
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      saveAttempt(
                        isCustom ? "custom_solicitado" : "pendiente_pago",
                        isCustom
                          ? "Listo. Registramos tu solicitud para preparar una propuesta."
                          : "Cotización guardada. El pago se conectará en el próximo paso."
                      )
                    }
                    className="rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
                  >
                    {isCustom ? "Quiero que me contacten" : "Pagar ahora"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function StepPill({
  active,
  number,
  text,
}: {
  active: boolean;
  number: string;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        active ? "bg-white text-[#07111f]" : "bg-white/10 text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
          active ? "bg-emerald-500 text-white" : "bg-white/10 text-white"
        }`}
      >
        {number}
      </span>
      <span className="text-sm font-black">{text}</span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950">
        {title}
      </h2>
      <p className="mt-3 text-base font-semibold leading-7 text-slate-500">{text}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: RangeOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-black text-slate-900">{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
              value === option.value
                ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LimitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-slate-900">{value}</p>
    </div>
  );
}
