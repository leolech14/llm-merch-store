"use client";

import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="fixed top-4 right-20 md:right-24 z-40">
      <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-foreground/10 p-1">
        <button
          onClick={() => setLang('pt-BR')}
          className={`px-2 py-1 text-xs font-mono transition ${
            lang === 'pt-BR'
              ? 'bg-foreground text-background'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          PT
        </button>
        <button
          onClick={() => setLang('en')}
          className={`px-2 py-1 text-xs font-mono transition ${
            lang === 'en'
              ? 'bg-foreground text-background'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
