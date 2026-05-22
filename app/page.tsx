"use client";

import { useEffect, useMemo, useState } from "react";

const whatsappDemoUrl =
  "https://api.whatsapp.com/send/?phone=5491130416164&text=Hola%21&type=phone_number&app_absent=0";

type HeroChatItem =
  | {
      type: "message";
      from: "customer" | "bot";
      text: string;
    }
  | {
      type: "product";
    }
  | {
      type: "cart";
    };

const heroChatSequence: HeroChatItem[] = [
  {
    type: "message",
    from: "customer",
    text: "Hola, busco una mochila para llevar notebook. Algo lindo y resistente.",
  },
  {
    type: "message",
    from: "bot",
    text: "¡Hola! Te recomiendo esta opción: es impermeable, entra una notebook de 15” y tiene muy buenas terminaciones.",
  },
  {
    type: "product",
  },
  {
    type: "message",
    from: "customer",
    text: "Me gusta. ¿La puedo comprar?",
  },
  {
    type: "cart",
  },
];

const steps = [
  {
    number: "01",
    title: "Pegás tu web",
    description:
      "Ingresás la URL de tu tienda o catálogo online para crear una demo con productos reales.",
  },
  {
    number: "02",
    title: "Revisás productos",
    description:
      "Ves una muestra con nombres, precios, fotos y links antes de probar la conversación.",
  },
  {
    number: "03",
    title: "Probás la venta",
    description:
      "Oramis responde como si estuviera atendiendo a un cliente real por WhatsApp.",
  },
  {
    number: "04",
    title: "Activás Oramis",
    description:
      "Tu equipo empieza a recibir oportunidades comerciales listas para cerrar.",
  },
];

const capabilities = [
  {
    title: "Responde consultas comerciales",
    description:
      "Atiende preguntas frecuentes, disponibilidad, características, condiciones y próximos pasos.",
  },
  {
    title: "Recomienda productos",
    description:
      "Interpreta lo que busca el cliente y sugiere opciones reales según necesidad o preferencia.",
  },
  {
    title: "Muestra fotos y links",
    description:
      "Presenta productos de forma visual, clara y lista para avanzar con la compra.",
  },
  {
    title: "Arma carritos",
    description:
      "Convierte consultas en pedidos potenciales con productos, cantidades y total estimado.",
  },
  {
    title: "Deriva al vendedor",
    description:
      "Cuando hace falta una persona, entrega el contexto para continuar sin empezar de cero.",
  },
  {
    title: "Mide oportunidades",
    description:
      "Registra intenciones, carritos, derivaciones y conversaciones que pueden convertirse en ventas.",
  },
];

type CarouselSlide = {
  label: string;
  previous: { from: "customer" | "bot"; text: string }[];
  customer: string;
  botText?: string;
  footer: string;
  mode: "message" | "product" | "cart" | "handoff";
};

const carouselSlides: CarouselSlide[] = [
  {
    label: "Consulta general",
    previous: [
      { from: "customer", text: "Hola" },
      { from: "bot", text: "¡Hola! Soy Oramis. ¿En qué te puedo ayudar?" },
    ],
    customer: "¿Dónde están ubicados?",
    botText:
      "Estamos en Av. Santa Fe 2450, Palermo. Si querés, también te paso horario y cómo llegar.",
    footer: "También responde consultas generales y de atención al cliente.",
    mode: "message",
  },
  {
    label: "Producto recomendado",
    previous: [
      { from: "customer", text: "Hola, busco un regalo." },
      { from: "bot", text: "Perfecto. ¿Qué tipo de producto te gustaría?" },
    ],
    customer: "Quiero una cafetera compacta negra, fácil de usar.",
    botText:
      "Te recomiendo esta opción: tiene diseño compacto, es fácil de usar y queda muy bien para regalo.",
    footer:
      "Puede recomendar productos concretos y mostrarlos con foto, precio y link.",
    mode: "product",
  },
  {
    label: "Carrito multiproducto",
    previous: [
      { from: "customer", text: "Quiero comprar dos productos." },
      { from: "bot", text: "Perfecto, decime cuáles y te los preparo." },
    ],
    customer: "Quiero el perfume Blue Special y el labial Gold Plus.",
    botText:
      "Perfecto, te armo el carrito:\n\n1 × Perfume Blue Special — $72.000\n1 × Labial Gold Plus — $18.500\n\nTotal estimado: $90.500",
    footer:
      "Puede armar pedidos con más de un producto, cantidades y total estimado.",
    mode: "cart",
  },
  {
    label: "Derivación a vendedor",
    previous: [
      {
        from: "customer",
        text: "Buenísimo, ya elegí lo que quiero.",
      },
      {
        from: "bot",
        text: "Perfecto, sigo con vos para avanzar.",
      },
    ],
    customer: "Dale, quiero avanzar.",
    botText:
      "Listo. Te paso con un vendedor para finalizar la compra. Le dejo el pedido armado para que continúe desde acá.",
    footer: "El equipo comercial recibe la oportunidad con contexto completo.",
    mode: "handoff",
  },
];

export default function Home() {
  const [visibleHeroItems, setVisibleHeroItems] = useState<HeroChatItem[]>([]);
  const [heroTyping, setHeroTyping] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const runLoop = () => {
      if (cancelled) return;

      clearTimers();
      setVisibleHeroItems([]);
      setHeroTyping(false);

      heroChatSequence.forEach((item, index) => {
        const startAt = 1200 + index * 2600;

        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setHeroTyping(item.type !== "message" || item.from === "bot");
          }, Math.max(0, startAt - 550))
        );

        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setHeroTyping(false);
            setVisibleHeroItems((current) => [...current, item]);
          }, startAt)
        );
      });

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          runLoop();
        }, 16000)
      );
    };

    runLoop();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((current) => (current + 1) % carouselSlides.length);
    }, 4800);

    return () => clearInterval(interval);
  }, []);

  const currentSlide = useMemo(() => carouselSlides[slideIndex], [slideIndex]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6fbf8] text-[#07111f]">
      <header className="sticky top-0 z-50 border-b border-emerald-950/5 bg-[#f6fbf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200">
              <div className="absolute inset-1 rounded-xl border border-white/40" />
              <span className="text-lg font-black text-white">O</span>
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-[#07111f]">
                Oramis
              </p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">
                Ventas conversacionales
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 lg:flex">
            <a href="#como-funciona" className="hover:text-emerald-600">
              Cómo funciona
            </a>
            <a href="#que-hace" className="hover:text-emerald-600">
              Qué hace
            </a>
            <a href="#conversaciones" className="hover:text-emerald-600">
              Conversaciones comerciales
            </a>
            <a href="#metricas" className="hover:text-emerald-600">
              Métricas
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="inline-flex rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-[#07111f] sm:px-4 sm:py-2.5"
            >
              Ingresar
            </a>
            <a
              href="/signup"
              className="rounded-full bg-[#07111f] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-emerald-600 sm:px-5 sm:py-2.5"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-[1480px] items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20 xl:gap-16">
        <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-200/35 blur-3xl" />

        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Tu WhatsApp vendiendo con productos reales
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-[#07111f] sm:text-6xl lg:text-7xl">
            Convertí conversaciones en ventas.
          </h1>

          <p className="mt-6 max-w-2xl text-xl font-medium leading-9 text-slate-600">
            Oramis atiende consultas, recomienda productos, muestra fotos, arma
            carritos y deriva oportunidades listas a tu equipo comercial.
          </p>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
            Probalo con productos tomados desde tu propia web y descubrí cómo
            vendería en conversaciones reales con clientes.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/signup"
              className="rounded-full bg-emerald-500 px-8 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              Crear demo con mis productos
            </a>
            <a
              href={whatsappDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-8 py-4 text-center text-base font-black text-[#07111f] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
            >
              Ver Oramis en acción en WhatsApp
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[#07111f]">24/7</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                responde consultas
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[#07111f]">+ventas</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                menos oportunidades perdidas
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[#07111f]">web</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                demo con tus productos reales
              </p>
            </div>
          </div>
        </div>

        <div className="relative pb-10">
          <div className="absolute -left-6 top-20 h-48 w-48 rounded-full bg-emerald-300/50 blur-3xl" />
          <div className="absolute -right-8 bottom-8 h-56 w-56 rounded-full bg-cyan-200/70 blur-3xl" />

          <div className="relative mx-auto max-w-[455px] rounded-[2.8rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-emerald-950/10">
            <div className="overflow-hidden rounded-[2.1rem] border border-slate-200 bg-[#e9f8ef]">
              <div className="flex items-center gap-3 bg-[#075e54] px-4 py-4 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-black">
                  O
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black">Oramis Demo</p>
                  <p className="flex items-center gap-1 text-xs font-medium text-white/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    respondiendo ahora
                  </p>
                </div>
                <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                  WhatsApp
                </div>
              </div>

              <div className="phone-screen flex h-[590px] flex-col justify-end overflow-hidden px-4 py-5">
                <div className="space-y-3">
                  {visibleHeroItems.map((item, index) => {
                    if (item.type === "product") {
                      return <HeroProductBubble key={index} />;
                    }

                    if (item.type === "cart") {
                      return <HeroCartBubble key={index} />;
                    }

                    return (
                      <MessageBubble
                        key={index}
                        from={item.from}
                        text={item.text}
                      />
                    );
                  })}

                  {heroTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-3">
                <div className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400">
                  Escribí un mensaje...
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-5 w-full max-w-[410px] rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs font-bold text-slate-400">Detectó</p>
                <p className="mt-1 text-sm font-black text-[#07111f]">Compra</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Armó</p>
                <p className="mt-1 text-sm font-black text-emerald-600">
                  Carrito
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Deriva</p>
                <p className="mt-1 text-sm font-black text-[#07111f]">
                  Vendedor
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-y border-slate-200 bg-white px-5 py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Cómo funciona
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#07111f] lg:text-5xl">
                Probalo gratis con tus productos.
              </h2>
              <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
                Pegás la URL de tu tienda, vemos una muestra de productos y
                probás cómo Oramis respondería consultas, recomendaría opciones
                y armaría oportunidades de venta con tu propio catálogo.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#07111f] text-sm font-black text-white">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-xl font-black text-[#07111f]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="que-hace" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[2.2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Qué hace Oramis
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              Atiende, recomienda y vende.
            </h2>

            <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[#f6fbf8] p-5">
              <div className="mx-auto w-full max-w-[265px] rounded-[2.3rem] border border-slate-200 bg-white p-3 shadow-xl sm:max-w-[285px]">
                <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[#e9f8ef]">
                  <div className="bg-[#075e54] px-4 py-3 text-white">
                    <p className="text-sm font-black">Oramis</p>
                    <p className="text-xs text-white/75">
                      {currentSlide.label}
                    </p>
                  </div>

                  <div className="mini-phone-screen flex h-[470px] flex-col justify-end overflow-hidden p-3 sm:h-[500px] sm:p-4">
                    <div className="space-y-3">
                      {currentSlide.previous.map((msg, index) => (
                        <MessageBubble
                          key={`${currentSlide.label}-${index}`}
                          from={msg.from}
                          text={msg.text}
                          faded
                          small
                        />
                      ))}

                      <MessageBubble
                        from="customer"
                        text={currentSlide.customer}
                        small
                      />

                      {currentSlide.botText && (
                        <MessageBubble
                          from="bot"
                          text={currentSlide.botText}
                          small
                        />
                      )}

                      {currentSlide.mode === "product" && <MiniProductCard />}

                      {currentSlide.mode === "handoff" && (
                        <div className="flex justify-start">
                          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-5 text-emerald-950">
                            Oportunidad derivada al vendedor ✅
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-sm font-semibold leading-6 text-slate-500">
                {currentSlide.footer}
              </p>

              <div className="mt-5 flex gap-2">
                {carouselSlides.map((slide, index) => (
                  <button
                    key={slide.label}
                    onClick={() => setSlideIndex(index)}
                    className={`h-2.5 flex-1 rounded-full transition ${
                      index === slideIndex ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                    aria-label={`Ver ${slide.label}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="group rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-600 ring-1 ring-emerald-100">
                  ✓
                </div>
                <h3 className="text-lg font-black leading-6 text-[#07111f]">
                  {capability.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="conversaciones"
        className="border-y border-slate-200 bg-[#eef8f2] px-5 py-20 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="rounded-[2.2rem] bg-[#07111f] p-8 text-white shadow-xl shadow-slate-300">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Conversaciones comerciales
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              Centralizá conversaciones, oportunidades y contexto comercial.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-300">
              Todas las conversaciones comerciales quedan ordenadas en un solo
              lugar: consultas, productos vistos, carritos armados, derivaciones
              y contexto para que el vendedor continúe sin empezar de cero.
            </p>
          </div>

          <div
            id="metricas"
            className="rounded-[2.2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
              Métricas comerciales
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">
              Entendé qué conversaciones generan negocio.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              Conocé qué preguntan tus clientes, qué productos generan más
              interés, cuántos carritos se arman, cuántas oportunidades se
              derivan y dónde conviene enfocar al equipo comercial.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
          Activá Oramis
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#07111f] lg:text-5xl">
          Hacé que Oramis venda junto a tu equipo.
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg font-medium leading-8 text-slate-600">
          Podés contratar Oramis, crear una demo con tus productos o verlo en
          acción por WhatsApp.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/signup?intent=contract"
            className="rounded-full bg-[#07111f] px-8 py-4 text-center text-base font-black text-white shadow-xl shadow-slate-300 transition hover:bg-emerald-600"
          >
            Quiero contratar Oramis
          </a>
          <a
            href="/signup"
            className="rounded-full bg-emerald-500 px-8 py-4 text-center text-base font-black text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-600"
          >
            Crear demo con mis productos
          </a>
          <a
            href={whatsappDemoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-8 py-4 text-center text-base font-black text-[#07111f] shadow-sm transition hover:border-emerald-300"
          >
            Ver Oramis en acción en WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}

function MessageBubble({
  from,
  text,
  faded = false,
  small = false,
}: {
  from: "customer" | "bot";
  text: string;
  faded?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`animate-rise flex ${
        from === "customer" ? "justify-end" : "justify-start"
      } ${faded ? "opacity-45" : "opacity-100"}`}
    >
      <div
        className={`whitespace-pre-line rounded-2xl px-4 py-3 font-medium leading-5 shadow-sm ${
          small ? "max-w-[88%] text-[13px]" : "max-w-[84%] text-sm"
        } ${
          from === "customer"
            ? "rounded-tr-sm bg-[#dcf8c6] text-slate-800"
            : "rounded-tl-sm bg-white text-slate-800"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function HeroProductBubble() {
  return (
    <div className="animate-rise flex justify-start">
      <div className="max-w-[88%] overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-md">
        <div className="relative h-40 bg-gradient-to-br from-emerald-950 via-slate-800 to-emerald-300 p-4">
          <div className="absolute right-8 top-7 h-24 w-18 rounded-[2rem] bg-[#111827] shadow-2xl" />
          <div className="absolute bottom-6 right-14 h-20 w-20 rounded-full border-[10px] border-[#111827]" />
          <div className="absolute left-4 bottom-4 rounded-2xl bg-white/95 px-4 py-3 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Recomendado
            </p>
            <p className="mt-1 text-sm font-black text-[#07111f]">
              Mochila Urban Pro
            </p>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <p className="text-sm font-black text-[#07111f]">
            Mochila Urban Pro
          </p>
          <p className="text-sm leading-5 text-slate-600">
            Impermeable · notebook 15” · color negro
          </p>
          <p className="text-lg font-black text-[#07111f]">$89.900</p>
          <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroCartBubble() {
  return (
    <div className="animate-rise flex justify-start">
      <div className="max-w-[86%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm font-medium leading-5 text-slate-800 shadow-sm">
        Listo ✅ Te dejo el carrito armado:
        <br />
        <br />
        1 × Mochila Urban Pro — $89.900
        <br />
        <br />
        ¿Querés que te pase con un vendedor para confirmar envío y forma de
        pago?
      </div>
    </div>
  );
}

function MiniProductCard() {
  return (
    <div className="animate-rise flex justify-start">
      <div className="max-w-[92%] overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-md">
        <div className="relative h-36 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-200 p-3">
          <div className="absolute right-7 top-6 h-20 w-14 rounded-[1.5rem] bg-[#111827] shadow-2xl" />
          <div className="absolute left-3 bottom-3 rounded-2xl bg-white/95 px-3 py-2 shadow-xl">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
              Producto
            </p>
            <p className="mt-1 text-[13px] font-black text-[#07111f]">
              Cafetera Compact Black
            </p>
          </div>
        </div>

        <div className="space-y-1.5 p-3">
          <p className="text-[13px] font-black text-[#07111f]">
            Cafetera Compact Black
          </p>
          <p className="text-[12px] leading-5 text-slate-600">
            Compacta · color negro · ideal para regalo
          </p>
          <p className="text-[15px] font-black text-[#07111f]">$189.900</p>
          <button className="w-full rounded-xl bg-emerald-500 px-3 py-2.5 text-[12px] font-black text-white">
            Ver producto
          </button>
        </div>
      </div>
    </div>
  );
}
