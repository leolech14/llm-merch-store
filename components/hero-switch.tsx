"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check, Zap, ArrowRight } from "lucide-react";
import { HeroStrikethrough } from "./hero-variants/hero-strikethrough";
import { HeroMoney } from "./hero-variants/hero-money";
import { HeroAIFailure } from "./hero-variants/hero-ai-failure";
import { HeroNavigation } from "./hero-navigation";

/**
 * Hero-Switch System
 *
 * Seamlessly alternates between different hero variants for A/B testing
 *
 * Usage:
 *   <HeroSwitch variant="auto" />
 *
 * Variants:
 *   - "cognitive" (default): Cognitive Wearables messaging
 *   - "wtf": WTF? Que porra é essa? (ChatGPT style)
 *   - "skate": Skateboard culture heavy
 *   - "minimal": Clean, simple, direct
 *   - "joke": Formal ironic ("Mister and Madam")
 *   - "auto": Random A/B test (persists in localStorage)
 *
 * URL Override:
 *   ?hero=cognitive
 *   ?hero=wtf
 *   ?hero=skate
 *   ?hero=minimal
 *   ?hero=joke
 *   ?hero=money (TALK SHIT / MAKE MONEY - aggressive conversion)
 */

type HeroVariant = "cognitive" | "wtf" | "skate" | "minimal" | "joke" | "experiment" | "money" | "ai-failure";

interface HeroSwitchProps {
  variant?: HeroVariant | "auto";
  visitorCount: number;
  saleStatus: {
    isActive: boolean;
    status: 'before' | 'during' | 'after';
    startTime: string;
    endTime: string;
    timeUntilStart?: number;
    timeUntilEnd?: number;
  } | null;
  onCTAClick?: () => void;
}

export function HeroSwitch({
  variant = "auto",
  visitorCount,
  saleStatus,
  onCTAClick
}: HeroSwitchProps) {
  const [activeVariant, setActiveVariant] = useState<HeroVariant>("cognitive");
  const variants: HeroVariant[] = ["ai-failure", "money", "experiment", "skate", "minimal", "joke"];
  const currentIndex = variants.indexOf(activeVariant);

  // Determine variant on mount
  useEffect(() => {
    // 1. Check URL param first
    const params = new URLSearchParams(window.location.search);
    const urlVariant = params.get('hero') as HeroVariant | null;

    if (urlVariant && ["cognitive", "wtf", "skate", "minimal", "joke", "experiment"].includes(urlVariant)) {
      setActiveVariant(urlVariant);
      localStorage.setItem('hero_variant', urlVariant);
      trackHeroView(urlVariant, 'url_param');
      return;
    }

    // 2. Check if variant prop is specific
    if (variant !== "auto") {
      setActiveVariant(variant);
      localStorage.setItem('hero_variant', variant);
      trackHeroView(variant, 'prop');
      return;
    }

    // 3. Check localStorage (returning visitor)
    const stored = localStorage.getItem('hero_variant') as HeroVariant | null;
    if (stored && ["cognitive", "wtf", "skate", "minimal", "joke", "experiment"].includes(stored)) {
      setActiveVariant(stored);
      trackHeroView(stored, 'returning');
      return;
    }

    // 4. Random A/B test for new visitors
    const variants: HeroVariant[] = ["cognitive", "wtf", "skate", "minimal", "joke", "experiment"];
    const random = variants[Math.floor(Math.random() * variants.length)];
    setActiveVariant(random);
    localStorage.setItem('hero_variant', random);
    trackHeroView(random, 'ab_test');
  }, [variant]);

  function trackHeroView(variant: HeroVariant, source: string) {
    try {
      // @ts-ignore
      window?.dataLayer?.push?.({
        event: 'hero_variant_view',
        hero_variant: variant,
        hero_source: source
      });
    } catch {}
  }

  function trackCTA(variant: HeroVariant) {
    try {
      // @ts-ignore
      window?.dataLayer?.push?.({
        event: 'hero_cta_click',
        hero_variant: variant
      });
    } catch {}
    onCTAClick?.();
  }

  // Navigation functions
  function handlePrevious() {
    const newIndex = (currentIndex - 1 + variants.length) % variants.length;
    const newVariant = variants[newIndex];
    setActiveVariant(newVariant);
    localStorage.setItem('hero_variant', newVariant);
    trackHeroView(newVariant, 'navigation');
  }

  function handleNext() {
    const newIndex = (currentIndex + 1) % variants.length;
    const newVariant = variants[newIndex];
    setActiveVariant(newVariant);
    localStorage.setItem('hero_variant', newVariant);
    trackHeroView(newVariant, 'navigation');
  }

  // Render selected variant with navigation
  const heroContent = (() => {
    switch (activeVariant) {
    case "cognitive":
      return <HeroCognitive visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("cognitive")} />;
    case "wtf":
      return <HeroWTF visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("wtf")} />;
    case "skate":
      return <HeroSkate visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("skate")} />;
    case "minimal":
      return <HeroMinimal visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("minimal")} />;
    case "joke":
      return <HeroJoke visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("joke")} />;
    case "money":
      return <HeroMoney visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("money")} />;
    case "ai-failure":
      return <HeroAIFailure visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("ai-failure")} />;
    case "experiment":
      return <HeroStrikethrough visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("experiment")} />;
    default:
      return <HeroCognitive visitorCount={visitorCount} saleStatus={saleStatus} onCTAClick={() => trackCTA("cognitive")} />;
    }
  })();

  return (
    <>
      {heroContent}
      <HeroNavigation
        currentIndex={currentIndex}
        totalVariants={variants.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </>
  );
}

// ============================================
// VARIANT 1: COGNITIVE WEARABLES (Current)
// ============================================

interface HeroProps {
  visitorCount: number;
  saleStatus: {
    isActive: boolean;
    status: 'before' | 'during' | 'after';
    startTime: string;
    endTime: string;
    timeUntilStart?: number;
    timeUntilEnd?: number;
  } | null;
  onCTAClick: () => void;
}

function HeroCognitive({ visitorCount, saleStatus, onCTAClick }: HeroProps) {
  return (
    <motion.section
      id="hero"
      className="w-full px-4 py-20 md:py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          className="text-3xl md:text-5xl font-light flex flex-row items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <span className="text-foreground">Total Visitors:{" "}</span>
          <motion.span
            className="text-foreground px-3 md:px-4 bg-[#E5E5E5] dark:bg-[#505050] py-1 md:py-2 rounded-lg font-normal"
            key={visitorCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {visitorCount}
          </motion.span>
        </motion.div>

        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground bg-muted hover:bg-muted/70 transition-colors">
            <Zap className="h-4 w-4 mr-2 inline" />
            🛹 Skateboard Bar Approved • ONE per design • Halloween Drop
          </div>
          <div className="text-sm text-muted-foreground">
            100% Fabric • NO Electronic Chips Attached • Guaranteed IQ Gains*
          </div>
        </div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          Cognitive Wearables
          <span className="block text-primary mt-2">Make You 1300% Smarter</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          Not streetwear. Not clothing. Educational tees that teach AI/ML concepts at skateboard bars. For those who actually learn instead of just looking smart.
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground/60 italic max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          *Disclaimer: No actual IQ gains guaranteed. But you'll look 1300% smarter while learning transformer architecture. Poser accusations not included.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={onCTAClick}
            className="inline-flex items-center justify-center h-12 px-8 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Shop Collection
          </button>
          <button className="inline-flex items-center justify-center h-12 px-8 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent transition-colors">
            Learn More
          </button>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            100% Cotton
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            0% Electronics
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            1300% Smarter*
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================
// VARIANT 2: WTF LANDING (Conversion-focused)
// ============================================

function HeroWTF({ visitorCount, saleStatus, onCTAClick }: HeroProps) {
  return (
    <motion.section
      id="hero"
      className="w-full px-4 py-20 md:py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Visitor badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          {visitorCount} people checking this out
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-black tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          WTF?
          <span className="block text-primary mt-2">Que porra é essa?</span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl text-foreground max-w-2xl mx-auto font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          Camisetas que <span className="underline decoration-primary decoration-4">ensinam</span> IA/ML
          <br />
          <span className="text-muted-foreground text-xl mt-2 block">
            Tipo um textbook, mas você pode usar no skate bar
          </span>
        </motion.p>

        <motion.div
          className="bg-muted/50 border-2 border-primary/30 rounded-2xl p-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg mb-4">
            <span className="font-bold">100% algodão.</span> Zero chips eletrônicos.
            <br />
            Num futuro onde tudo tem sensor, isso é luxo.
          </p>
          <p className="text-sm text-muted-foreground italic">
            Também: te deixa 1300% mais inteligente. Garantido*
            <br />
            <span className="text-xs">*não garantido</span>
          </p>
        </motion.div>

        <motion.button
          onClick={onCTAClick}
          className="group relative inline-flex h-14 px-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Bora ver essa parada
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="text-xs text-muted-foreground">
          Só 31 peças. 1 de cada design. Acaba quando acabar.
        </p>
      </div>
    </motion.section>
  );
}

// ============================================
// VARIANT 3: SKATE CULTURE (Bowl vibes)
// ============================================

function HeroSkate({ visitorCount, saleStatus, onCTAClick }: HeroProps) {
  return (
    <motion.section
      id="hero"
      className="w-full px-4 py-20 md:py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Skate-style badge */}
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            🛹 BOWL APPROVED
          </span>
          <div className="h-1 flex-1 bg-gradient-to-r from-primary via-transparent to-transparent"></div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-center">
          LEARN
          <span className="block text-white">
            BY WEARING
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-center max-w-2xl mx-auto">
          Diagramas de transformer no peito.
          <br />
          Backpropagation nas costas.
          <br />
          <span className="text-muted-foreground">
            Explica self-attention enquanto droppa no bowl.
          </span>
        </p>

        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="text-3xl font-bold">31</div>
            <div className="text-xs text-muted-foreground uppercase">Designs Únicos</div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="text-3xl font-bold">1</div>
            <div className="text-xs text-muted-foreground uppercase">Por Peça</div>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="text-3xl font-bold">R$149</div>
            <div className="text-xs text-muted-foreground uppercase">Base Price</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.button
            onClick={onCTAClick}
            className="h-16 px-12 rounded-full bg-foreground text-background text-lg font-bold uppercase tracking-wider shadow-2xl hover:shadow-primary/50 transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            DROP IN
          </motion.button>
          <p className="text-sm text-muted-foreground">
            Halloween Edition • Skate Bar Launch • {visitorCount} visitantes
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground/60 italic max-w-lg mx-auto pt-4">
          "100% fabric. Zero chips. Pra quando tudo tiver sensor e você quiser privacidade."
          <br />
          — Future you, 2030
        </div>
      </div>
    </motion.section>
  );
}

// ============================================
// VARIANT 4: MINIMAL (Clean & Direct)
// ============================================

function HeroMinimal({ visitorCount, saleStatus, onCTAClick }: HeroProps) {
  return (
    <motion.section
      id="hero"
      className="w-full px-4 py-32 md:py-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-light tracking-tight">
            Look Smart While Making
            <span className="block font-bold mt-2">Zero Mental Effort</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 font-mono">
            ACTUALLY WORKS!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onCTAClick}
            className="h-14 px-10 rounded-lg bg-foreground text-background font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            View Collection
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <span>R$149 each</span>
          <span>•</span>
          <span>{visitorCount} visitors</span>
          <span>•</span>
          <span>Halloween drop</span>
        </div>

        <p className="text-xs text-muted-foreground/50 italic">
          Skateboard bar approved. 100% fabric. No electronics.
        </p>
      </div>
    </motion.section>
  );
}

// ============================================
// VARIANT 5: JOKE (Formal Ironic)
// ============================================

function HeroJoke({ visitorCount, saleStatus, onCTAClick }: HeroProps) {
  return (
    <motion.section
      id="hero"
      className="w-full px-4 py-20 md:py-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight leading-tight">
            <span className="italic">Hello, Mister</span>
            <span className="block mt-2 text-muted-foreground text-3xl md:text-4xl">
              (and Madam, of course)!
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-foreground max-w-2xl mx-auto font-light">
            Are you looking for the <span className="italic font-serif">finest</span>,
            <br />
            most <span className="italic font-serif">exclusive</span> piece of clothes?
          </p>
        </motion.div>

        <motion.div
          className="bg-muted/50 border-2 border-primary/20 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg text-foreground/90 mb-4">
            <span className="font-semibold">Well, actually...</span> it's just t-shirts with neural network diagrams.
          </p>
          <p className="text-base text-muted-foreground">
            But they're <span className="italic">educational</span>, have zero electronic chips,
            and make you look 1300% smarter at skateboard bars. So yes, quite exclusive indeed.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={onCTAClick}
            className="h-14 px-10 rounded-lg border-2 border-foreground bg-background text-foreground font-semibold text-lg hover:bg-foreground hover:text-background transition-all"
          >
            Proceed to the Collection
          </button>

          <p className="text-sm text-muted-foreground italic">
            31 designs • Only 1 of each • R$149 base price
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
