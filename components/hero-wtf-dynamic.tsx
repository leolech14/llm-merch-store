"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * HeroWTF (Dynamic) - Uses /api/ask for real LLM responses
 *
 * Usage in app/page.tsx:
 *   import HeroWTF from "@/components/hero-wtf-dynamic"
 *   export default function Page() {
 *     return <HeroWTF />
 *   }
 */

export default function HeroWTF({
  destinationHref = "/shop",
  autoRedirectMs = 2400,
  brand = "LLMMERCH.SPACE",
  showSkip = true,
  urlFallback = "https://llmmerch.space",
  useDynamicAPI = false, // Set to true to use /api/ask instead of static response
}: {
  destinationHref?: string;
  autoRedirectMs?: number;
  brand?: string;
  showSkip?: boolean;
  urlFallback?: string;
  useDynamicAPI?: boolean;
}) {
  type Stage = "ask" | "thinking" | "answer" | "error";
  const [stage, setStage] = useState<Stage>("ask");
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Static fallback answer
  const staticAnswer = useMemo(
    () =>
      "É um drop de merch nerd de LLMs. Uma experiência-shop: escaneia, pergunta, responde e compra. Bora ver a coleção?",
    []
  );

  // Auto-redirect once we've shown the answer
  useEffect(() => {
    if (stage !== "answer" || autoRedirectMs <= 0) return;
    const t = setTimeout(() => {
      const u = new URL(destinationHref, window.location.origin);
      u.searchParams.set("src", "hero_wtf");
      u.searchParams.set("v", "1");
      try {
        // @ts-ignore
        window?.dataLayer?.push?.({ event: "hero_wtf_redirect", src: "auto" });
      } catch {}
      window.location.assign(u.toString());
    }, autoRedirectMs);
    return () => clearTimeout(t);
  }, [stage, autoRedirectMs, destinationHref]);

  // Simulate ChatGPT typing
  const typeTimer = useRef<number | null>(null);
  useEffect(() => {
    if (stage !== "answer" || !answer) return;

    let displayAnswer = "";
    let i = 0;
    const targetAnswer = answer;

    typeTimer.current && window.clearInterval(typeTimer.current);
    typeTimer.current = window.setInterval(() => {
      i++;
      displayAnswer = targetAnswer.slice(0, i);
      setAnswer(displayAnswer);
      if (i >= targetAnswer.length && typeTimer.current) {
        window.clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }, 12);

    return () => {
      if (typeTimer.current) window.clearInterval(typeTimer.current);
      typeTimer.current = null;
    };
  }, [stage]);

  async function handleSend() {
    try {
      // @ts-ignore
      window?.dataLayer?.push?.({ event: "hero_wtf_send", dynamic: useDynamicAPI });
    } catch {}

    setStage("thinking");
    setError("");

    if (useDynamicAPI) {
      // Call real API
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: "Que porra é essa?" }),
        });

        if (!response.ok) {
          throw new Error("API error");
        }

        const data = await response.json();

        // Add artificial minimum delay to feel more natural
        await new Promise(resolve => setTimeout(resolve, 800));

        setAnswer(data.answer || staticAnswer);
        setStage("answer");

        try {
          // @ts-ignore
          window?.dataLayer?.push?.({
            event: "hero_wtf_answer_received",
            model: data.model,
            thinking_time_ms: data.thinking_time_ms,
          });
        } catch {}
      } catch (err) {
        console.error("Error calling /api/ask:", err);
        // Fallback to static answer on error
        setTimeout(() => {
          setAnswer(staticAnswer);
          setStage("answer");
        }, 800);
      }
    } else {
      // Static response
      setTimeout(() => {
        setAnswer(staticAnswer);
        setStage("answer");
      }, 800);
    }
  }

  function handleSkip() {
    const u = new URL(destinationHref, window.location.origin);
    u.searchParams.set("src", "skip");
    try {
      // @ts-ignore
      window?.dataLayer?.push?.({ event: "hero_wtf_skip" });
    } catch {}
    window.location.assign(u.toString());
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.97 0.02 247) 0%, oklch(0.92 0.04 255) 60%, oklch(0.92 0.04 210) 100%)",
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 border border-black/5">
          {/* Brand */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs tracking-[0.2em] font-semibold text-black/60">
              {brand}
            </div>
            {showSkip && (
              <button
                onClick={handleSkip}
                className="text-xs underline text-black/50 hover:text-black/70 transition"
                aria-label="Pular introdução e ir direto ao site"
              >
                Pular ↗
              </button>
            )}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
            WTF?<span className="ml-3">Que porra é essa?</span>
          </h1>

          {/* Spacer */}
          <div className="h-6" />

          {/* Fake ChatGPT input bar */}
          <div className="w-full bg-white rounded-xl border border-black/10 shadow-sm flex items-center gap-3 p-3">
            {/* Mic icon */}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-5 h-5 shrink-0"
            >
              <path
                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm-7-3a1 1 0 1 0-2 0 9 9 0 0 0 8 8.94V22H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.06A9 9 0 0 0 19 11a1 1 0 1 0-2 0 7 7 0 1 1-14 0Z"
                fill="currentColor"
              />
            </svg>

            <input
              type="text"
              readOnly
              aria-label="Pergunta"
              className="flex-1 bg-transparent outline-none text-sm sm:text-base text-black/80"
              value={`Perguntaram ao ChatGPT: "Que porra é essa?"`}
            />

            <button
              onClick={handleSend}
              disabled={stage !== "ask"}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md transition"
            >
              Enviar
            </button>
          </div>

          {/* State area */}
          <div className="mt-5 min-h-[96px]">
            {stage === "thinking" && (
              <div className="flex items-center gap-3 text-black/70">
                <TypingDots />
                <span>ChatGPT está pensando…</span>
              </div>
            )}

            {stage === "answer" && (
              <div className="flex items-start gap-3">
                {/* GPT avatar */}
                <div className="w-8 h-8 rounded-full bg-black/90 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  GPT
                </div>
                <div className="flex-1 bg-black/5 border border-black/10 rounded-xl p-3 sm:p-4 text-sm sm:text-base leading-relaxed">
                  <div className="whitespace-pre-wrap">{answer}</div>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <a
                      href={`${destinationHref}?src=hero_wtf_cta`}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold shadow hover:shadow-md transition"
                    >
                      Entrar no site ↗
                    </a>
                    <span className="text-xs text-black/50">
                      (redirecionando automaticamente…)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {stage === "error" && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  !
                </div>
                <div className="flex-1 bg-rose-50 border border-rose-200 rounded-xl p-3 sm:p-4 text-sm sm:text-base leading-relaxed">
                  {error || "Ops, algo deu errado. Mas a coleção tá linda!"}
                  <div className="mt-3">
                    <a
                      href={`${destinationHref}?src=hero_wtf_error`}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold shadow hover:shadow-md transition"
                    >
                      Ver coleção mesmo assim ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fallback tiny footer with copyable URL */}
          <div className="mt-6 text-[11px] text-black/50 flex items-center gap-2 flex-wrap">
            <span>Se a câmera não reconhecer QR em fotos, digite:</span>
            <Copyable text={urlFallback} />
          </div>
        </div>

        {/* Subtle footer */}
        <div className="mt-4 text-center text-xs text-black/50">
          Feito com amor por quem curte LLMs. Halloween Edition.
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      <Dot delay="0ms" />
      <Dot delay="120ms" />
      <Dot delay="240ms" />
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="w-2 h-2 rounded-full bg-black/40 inline-block animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}

function Copyable({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);

      try {
        // @ts-ignore
        window?.dataLayer?.push?.({ event: "hero_wtf_copy_url" });
      } catch {}
    } catch {}
  }
  return (
    <button
      onClick={copy}
      className="underline decoration-dotted underline-offset-2 hover:text-black/70 transition"
      title="Copiar endereço"
    >
      {copied ? "Copiado!" : text}
    </button>
  );
}
