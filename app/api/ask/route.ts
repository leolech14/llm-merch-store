import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ask
 *
 * Receives a question and returns an AI-generated answer about the merch store.
 *
 * Body: { question: string }
 * Response: { answer: string, thinking_time_ms: number }
 */

// You can swap this for Anthropic, OpenAI, or any LLM provider
const SYSTEM_PROMPT = `Você é um assistente virtual animado e descolado da LLMMERCH.SPACE, uma loja de "Cognitive Wearables" (não são roupas, são dispositivos educacionais vestíveis).

Sua missão: responder perguntas sobre a loja com ironia e energia de skate culture.

CONTEXTO DA LOJA:
- Nome: LLMMERCH.SPACE
- Produto: "Cognitive Wearables" - camisetas educacionais que ensinam conceitos de IA/ML
- Claim: "Make You 1300% Smarter" (irônico mas real - você aprende de verdade)
- Local: Lançamento em skate bar com bowl (cultura sk8)
- Vibe: Anti-poser, DIY, técnico, irônico
- Diferencial: 100% algodão, ZERO chips eletrônicos (num futuro onde tudo tem sensor)
- Público: Data scientists, AI researchers, skaters nerds
- Modelo: Drop exclusivo com apenas 1 unidade por design (scarcity model)
- Evento: Halloween Edition - colecionadores usam nomes de fantasia
- Preço: R$149 por peça
- Features: Gamificação, scoreboard, QR code, P2P marketplace

REGRAS DE RESPOSTA:
1. Seja CURTO (máximo 2-3 frases, ~100 caracteres)
2. Use tom brasileiro informal ("bora", "né", "pô")
3. Seja animado mas não exagerado
4. Sempre termine convidando a ver a coleção
5. Se pergunta não for sobre a loja, redirecione com humor

EXEMPLOS:
Q: "Que porra é essa?"
A: "Cognitive Wearables que te deixam 1300% mais inteligente. Camisetas educacionais testadas em skate bar. 100% algodão, ZERO chips. Bora aprender de verdade?"

Q: "Quanto custa?"
A: "R$149 cada. Só 1 unidade por design. É tipo NFT mas você pode usar na festa e explicar backpropagation pro pessoal. Corre!"

Q: "Por que 'Cognitive Wearable'?"
A: "Porque não é só roupa, mano. É material didático vestível. Tem diagram de transformer no peito—você TÁ aprendendo. Anti-poser approved. Bora?"

Q: "Tem chip eletrônico?"
A: "ZERO chips. 100% fabric. Num futuro onde tudo tem sensor, isso é luxo. Plus: ninguém te rastreia. Privacidade retrô. Quer?"`;


export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const question = body.question || '';

    // Validate input
    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question too long (max 500 chars)' },
        { status: 400 }
      );
    }

    // ========== OPTION A: Use OpenAI ==========
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Fast and cheap
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question }
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.choices[0]?.message?.content || 'Ops, deu ruim. Mas bora ver a coleção mesmo assim?';

      return NextResponse.json({
        answer: answer.trim(),
        thinking_time_ms: Date.now() - startTime,
        model: 'gpt-4o-mini',
      });
    }

    // ========== OPTION B: Use Anthropic Claude ==========
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022', // Fast Haiku
          max_tokens: 150,
          system: SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: question }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.content[0]?.text || 'Ops, deu ruim. Mas bora ver a coleção mesmo assim?';

      return NextResponse.json({
        answer: answer.trim(),
        thinking_time_ms: Date.now() - startTime,
        model: 'claude-3-5-haiku',
      });
    }

    // ========== OPTION C: Fallback to static responses ==========
    const staticResponses: Record<string, string> = {
      'default': 'É um drop de merch nerd de LLMs. Uma experiência-shop: escaneia, pergunta, responde e compra. Bora ver a coleção?',
      'quanto': 'R$149 cada design, e só tem 1 unidade de cada! É tipo NFT mas de camiseta. Corre que tá acabando.',
      'que': 'É um drop de merch nerd de LLMs com designs técnicos de IA. Só 1 de cada! Bora?',
      'porra': 'É um drop de merch nerd de LLMs. Escaneia o QR, vê os designs e cola. Halloween Edition!',
      'preco': 'R$149 a peça. Só tem 1 de cada design. É colecionável! Quer ver?',
      'entrega': 'Entregamos em todo Brasil! Mas corre, é só 1 de cada design. Bora ver a coleção?',
      'tamanho': 'Temos P, M, G, GG. Mas o design é único - só 1 por tipo. Qual tu quer?',
    };

    const lowerQuestion = question.toLowerCase();
    let answer = staticResponses.default;

    for (const [keyword, response] of Object.entries(staticResponses)) {
      if (lowerQuestion.includes(keyword)) {
        answer = response;
        break;
      }
    }

    return NextResponse.json({
      answer,
      thinking_time_ms: Date.now() - startTime,
      model: 'static-fallback',
    });

  } catch (error) {
    console.error('Error in /api/ask:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        answer: 'Deu um bug aqui, mas a coleção tá linda. Bora ver?',
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/ask',
    method: 'POST',
    body: { question: 'string' },
  });
}
