# 🚀 Quick Start: Hero WTF no Next.js

## 🎯 **Opção A: Estático (Mais rápido)**

### 1. Crie a página Hero
```bash
# Terminal
touch app/hero/page.tsx
```

```tsx
// app/hero/page.tsx
import HeroWTF from "@/components/hero-wtf-dynamic";

export default function HeroPage() {
  return (
    <HeroWTF
      destinationHref="/shop"
      autoRedirectMs={2400}
      useDynamicAPI={false}  // ← Resposta estática
    />
  );
}
```

### 2. Redirecione a home (opcional)
```tsx
// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/hero');
}
```

### 3. Deploy
```bash
npm run build
vercel --prod
```

**Pronto!** Acesse `/hero` ou `/`.

---

## 🤖 **Opção B: Com LLM Real**

### 1. Configure API Key
```bash
echo "OPENAI_API_KEY=sk-proj-..." >> .env.local
```

### 2. Use o componente dinâmico
```tsx
// app/hero/page.tsx
import HeroWTF from "@/components/hero-wtf-dynamic";

export default function HeroPage() {
  return (
    <HeroWTF
      destinationHref="/shop"
      autoRedirectMs={2400}
      useDynamicAPI={true}  // ← ISSO ATIVA A API
    />
  );
}
```

### 3. Teste
```bash
npm run dev
# Acesse http://localhost:3000/hero
# Clique "Enviar" e veja resposta real do GPT
```

### 4. Deploy
```bash
vercel --prod
# No dashboard: Settings > Environment Variables
# Adicione: OPENAI_API_KEY
```

---

## 📱 **Opção C: Como Landing Principal**

### 1. Substitua a home
```tsx
// app/page.tsx
import HeroWTF from "@/components/hero-wtf-dynamic";

export default function Home() {
  return (
    <HeroWTF
      destinationHref="/shop"
      autoRedirectMs={2400}
      useDynamicAPI={false}
    />
  );
}
```

### 2. Mantenha a loja em `/shop`
```tsx
// app/shop/page.tsx
import LLMClothingWebsite from "./original-store";

export default function ShopPage() {
  return <LLMClothingWebsite />;
}
```

### 3. Deploy
```bash
npm run build && vercel --prod
```

**Resultado**:
- `/` → Hero WTF
- `/shop` → Loja completa

---

## 🎨 **Customização Rápida**

### Mudar texto da resposta:
```tsx
<HeroWTF
  destinationHref="/shop"
  // ... outros props
/>
```

No código de `hero-wtf-dynamic.tsx`, linha 33:
```tsx
const staticAnswer = useMemo(
  () => "SEU TEXTO AQUI - curto, direto, convidativo!",
  []
);
```

### Mudar tempo de redirect:
```tsx
<HeroWTF
  autoRedirectMs={3000}  // 3 segundos
  // ou
  autoRedirectMs={0}     // desabilita auto-redirect
/>
```

### Remover botão "Pular":
```tsx
<HeroWTF
  showSkip={false}
/>
```

---

## 📊 **Ver Analytics**

### Google Tag Manager:
1. Acesse GTM Debug Mode
2. Navegue para a página Hero
3. Veja eventos: `hero_wtf_view`, `hero_wtf_send`, etc.

### Vercel Analytics:
```tsx
// Já incluído no layout.tsx
import { Analytics } from "@vercel/analytics/react";
```

Dashboard: https://vercel.com/seu-projeto/analytics

---

## ⚡ **Performance**

### Bundle size:
- **Estático**: +8KB (component only)
- **Com API**: +8KB + API route (~2KB)

### Otimizações:
- ✅ Componente já usa `"use client"`
- ✅ Lazy load não necessário (é a landing)
- ✅ Tailwind purge automático no build

### Lighthouse Score esperado:
- Performance: 95-100
- Accessibility: 95-100
- Best Practices: 100
- SEO: 90-100

---

## 🐛 **Debug**

### Ver erros da API:
```bash
npm run dev
# DevTools > Console
# Ou terminal mostra erros da API
```

### Testar resposta da API:
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Que porra é essa?"}'
```

Resposta esperada:
```json
{
  "answer": "É um drop de merch nerd...",
  "thinking_time_ms": 234,
  "model": "gpt-4o-mini"
}
```

---

## 🎯 **Fluxo Completo**

```
Usuário escaneia QR
    ↓
Abre / (Hero WTF)
    ↓
Vê "WTF? Que porra é essa?"
    ↓
Clica "Enviar"
    ↓
Vê resposta (estática ou GPT)
    ↓
Auto-redirect em 2.4s
    ↓
Chega em /shop?src=hero_wtf&v=1
    ↓
Vê produtos e compra!
```

---

## ✅ **Checklist Pré-Launch**

- [ ] Hero funcionando em `/` ou `/hero`
- [ ] Redirect levando pra `/shop`
- [ ] UTMs chegando (`?src=hero_wtf`)
- [ ] Mobile responsive (testar iPhone/Android)
- [ ] Botão "Pular" funciona
- [ ] Fallback URL copiável
- [ ] GTM tracking ligado (se usando)
- [ ] Build sem warnings (`npm run build`)
- [ ] Preview link funcionando no Vercel

---

**Pronto pra lançar! 🚀**
