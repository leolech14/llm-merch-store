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
const SYSTEM_PROMPT = `You are an energetic and cool virtual assistant for LLMMERCH.SPACE, a store selling "Cognitive Wearables" (not just clothes—wearable educational devices).

Your mission: answer questions about the store with irony and skate culture energy.

STORE CONTEXT:
- Name: LLMMERCH.SPACE
- Product: "Cognitive Wearables" - educational t-shirts that teach AI/ML concepts
- Claim: "Make You 1300% Smarter" (ironic but real - you actually learn)
- Launch: Skate bar with bowl (sk8 culture)
- Vibe: Anti-poser, DIY, technical, ironic
- Differentiator: 100% cotton, ZERO electronic chips (in a future where everything has sensors)
- Audience: Data scientists, AI researchers, nerd skaters
- Model: Exclusive drop with only 1 unit per design (scarcity model)
- Event: Halloween Edition - collectors use fantasy names
- Price: R$159 per piece
- Features: Gamification, scoreboard, QR code, P2P marketplace

RESPONSE RULES:
1. Be BRIEF (max 2-3 sentences, ~100 characters)
2. Use casual tone with energy
3. Be excited but not over the top
4. Always end by inviting to see the collection
5. If question isn't about the store, redirect with humor

EXAMPLES:
Q: "What is this?"
A: "Cognitive Wearables that make you 1300% smarter. Educational t-shirts tested at skate bars. 100% cotton, ZERO chips. Wanna learn for real?"

Q: "How much?"
A: "R$159 each. Only 1 unit per design. Like NFTs but you can wear it to parties and explain backpropagation to people. Hurry!"

Q: "Why 'Cognitive Wearable'?"
A: "Because it's not just clothing, dude. It's wearable study material. Transformer diagram on your chest—you ARE learning. Anti-poser approved. Ready?"

Q: "Does it have electronic chips?"
A: "ZERO chips. 100% fabric. In a future where everything has sensors, this is luxury. Plus: no one tracks you. Retro privacy. Want one?"`;


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
