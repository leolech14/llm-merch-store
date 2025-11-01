"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt-BR' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('pt-BR');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('llmmerch_lang') as Language;
    if (saved && ['pt-BR', 'en'].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('llmmerch_lang', newLang);

    // Track language change
    try {
      // @ts-ignore
      window?.dataLayer?.push?.({
        event: 'language_change',
        language: newLang
      });
    } catch {}
  };

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['pt-BR'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// ===== TRANSLATIONS =====

const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Buttons & CTAs
    'shop_collection': 'Ver Coleção',
    'learn_more': 'Saiba Mais',
    'view_collection': 'Ver Coleção',
    'buy_now': 'Comprar Agora',
    'quick_buy': 'Compra Rápida',
    'sale_not_active': 'Venda Inativa',
    'sold_out': 'ESGOTADO',
    'adding': 'Adicionando...',
    'added': 'Adicionado!',
    'like': 'Curtir',
    'liked': 'Curtiu',
    'whatsapp': 'WhatsApp',
    'send_message': 'Enviar Mensagem',

    // Hero
    'hero_title_line1': 'Camisetas Computer Mathy,',
    'hero_title_line2': 'Te Fazem Parecer 1300% Mais Inteligente',
    'hero_subtitle': 'Não é streetwear. Não é roupa. Colocando visual foda em camisetas para fazer conhecimento valioso viajar pelo mundo físico. Não existe nada mais legal que ser inteligente. Abrace seu gênio foda agora.',
    'hero_disclaimer': '*Aviso: Ganhos de QI não garantidos. Mas você vai parecer 1300% mais inteligente enquanto aprende arquitetura transformer. Acusações de poser não incluídas.',

    // Badges
    'skate_approved': '🛹 Aprovado em Bar de Skate',
    'one_per_design': 'UMA por design',
    'halloween_drop': 'Drop Halloween',
    'fabric': '100% Tecido',
    'no_chips': 'SEM Chips Eletrônicos',
    'no_guarantee': 'Sem Garantia Que Você Vai Entender Qualquer Coisa Ou Até Que',
    'good_idea': 'Isso É Uma Boa Ideia',

    // Features
    'cotton': '100% Algodão',
    'electronics': '0% Eletrônica',
    'smarter': '1300% Mais Inteligente*',

    // PIX
    'pix_power': 'PIX Money Power!',
    'investment_disclaimer': 'Divulgação de Investimento: Categorizado como risco médio-alto. Wall Street chama de bolha. Alguns dizem Ponzi. Pessoas compram pelos designs, não por dinheiro.',

    // Stats
    'live_analytics': 'Analytics da Loja ao Vivo',
    'page_views': 'Visualizações',
    'total_likes': 'Total de Curtidas',
    'added_to_cart': 'No Carrinho',
    'sold_out_count': 'Esgotado',
    'still_available': 'Disponível',
    'total_designs': 'Total de Designs',

    // Visitor Popup
    'welcome': 'Bem-vindo!',
    'visitor_number': 'Você é o visitante número',
    'thanks': 'Obrigado por conferir nosso experimento educacional!',
    'ok': 'Ok.',
    'updating': 'Atualizando...',
    'closing': 'Fechando...',

    // Product Modal
    'explain': 'EXPLICAR',
    'choose_ai': 'Escolha IA para explicar:',
    'claude': 'Claude',
    'chatgpt': 'ChatGPT',
    'explaining': 'explicando...',
    'close_explanation': 'Fechar explicação',
    'tap_to_zoom': 'Toque para zoom',
    'available_sizes': 'Tamanhos Disponíveis',

    // Categories
    'interactive': 'Interativo',
    'neural_networks': 'Redes Neurais',
    'attention_mechanisms': 'Mecanismos de Atenção',
    'architecture': 'Arquitetura',
    'fun_mascots': 'Diversão & Mascotes',
    'statement_pieces': 'Peças Statement',
    'information_theory': 'Teoria da Informação',
    'data_science': 'Ciência de Dados',
    'model_training': 'Treinamento de Modelo',

    // Footer
    'all_products': 'Todos os Produtos',
    'new_arrivals': 'Novidades',
    'limited_edition': 'Edição Limitada',
    'best_sellers': 'Mais Vendidos',
    'contact_us': 'Fale Conosco',
    'shipping_info': 'Info de Envio',
    'returns': 'Devoluções',
    'size_guide': 'Guia de Tamanhos',
    'privacy_policy': 'Política de Privacidade',
    'terms_of_service': 'Termos de Serviço',
    'all_rights_reserved': 'Todos os direitos reservados',
  },

  'en': {
    // Buttons & CTAs
    'shop_collection': 'Shop Collection',
    'learn_more': 'Learn More',
    'view_collection': 'View Collection',
    'buy_now': 'Buy Now',
    'quick_buy': 'Quick Buy',
    'sale_not_active': 'Sale Not Active',
    'sold_out': 'SOLD OUT',
    'adding': 'Adding...',
    'added': 'Added!',
    'like': 'Like',
    'liked': 'Liked',
    'whatsapp': 'WhatsApp',
    'send_message': 'Send Message',

    // Hero
    'hero_title_line1': 'Computer Mathy T-Shirts,',
    'hero_title_line2': 'Make You Look 1300% Smarter',
    'hero_subtitle': 'Not streetwear. Not clothing. Adding visual shit to t-shirts to make valuable knowledge travel around the physical world. There is nothing cooler than being smart. Embrace your bad-ass genius now.',
    'hero_disclaimer': '*Disclaimer: No actual IQ gains guaranteed. But you will look 1300% smarter while learning transformer architecture. Poser accusations not included.',

    // Badges
    'skate_approved': '🛹 Skateboard Bar Approved',
    'one_per_design': 'ONE per design',
    'halloween_drop': 'Halloween Drop',
    'fabric': '100% Fabric',
    'no_chips': 'NO Electronic Chips Attached',
    'no_guarantee': 'No Guaranteed That You Will Actually Understand Anything Or Even That',
    'good_idea': 'This Is A Good Idea',

    // Features
    'cotton': '100% Cotton',
    'electronics': '0% Electronics',
    'smarter': '1300% Smarter*',

    // PIX
    'pix_power': 'PIX Money Power!',
    'investment_disclaimer': 'Investment disclosure: Categorized as moderate-to-high-risk. Wall Street calls it bubble. Some say Ponzi. People buy for designs, not money.',

    // Stats
    'live_analytics': 'Live Store Analytics',
    'page_views': 'Page Views',
    'total_likes': 'Total Likes',
    'added_to_cart': 'Added to Cart',
    'sold_out_count': 'Sold Out',
    'still_available': 'Still Available',
    'total_designs': 'Total Designs',

    // Visitor Popup
    'welcome': 'Welcome!',
    'visitor_number': 'You are visitor number',
    'thanks': 'Thanks for checking out our educational experiment!',
    'ok': 'Ok.',
    'updating': 'Updating...',
    'closing': 'Closing...',

    // Product Modal
    'explain': 'EXPLAIN',
    'choose_ai': 'Choose AI to explain:',
    'claude': 'Claude',
    'chatgpt': 'ChatGPT',
    'explaining': 'explaining...',
    'close_explanation': 'Close explanation',
    'tap_to_zoom': 'Tap to zoom',
    'available_sizes': 'Available Sizes',

    // Categories (keep technical terms)
    'interactive': 'Interactive',
    'neural_networks': 'Neural Networks',
    'attention_mechanisms': 'Attention Mechanisms',
    'architecture': 'Architecture',
    'fun_mascots': 'Fun & Mascots',
    'statement_pieces': 'Statement Pieces',
    'information_theory': 'Information Theory',
    'data_science': 'Data Science',
    'model_training': 'Model Training',

    // Footer
    'all_products': 'All Products',
    'new_arrivals': 'New Arrivals',
    'limited_edition': 'Limited Edition',
    'best_sellers': 'Best Sellers',
    'contact_us': 'Contact Us',
    'shipping_info': 'Shipping Info',
    'returns': 'Returns',
    'size_guide': 'Size Guide',
    'privacy_policy': 'Privacy Policy',
    'terms_of_service': 'Terms of Service',
    'all_rights_reserved': 'All rights reserved',
  }
};
