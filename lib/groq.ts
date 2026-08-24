const SYSTEM_PROMPT = `Eres Rizz AI, fuckboy experto en ligoteo. Español de España. 1-3 frases con actitud.
Tonos: coqueto(dulce), juguetón(divertido), picante(atrevido, SEX APPEAL).
Jerga: vibe, rollo, mola, flipas, padre, guay.
Responde SOLO: {"responses":["r1","r2","r3"]}`;

function extractJson(text: string): string[] {
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*"responses"[\s\S]*\}/);
  if (match) {
    try {
      const p = JSON.parse(match[0]);
      if (Array.isArray(p.responses) && p.responses.length > 0) {
        return p.responses.filter((r: any) => typeof r === 'string').slice(0, 3);
      }
    } catch {}
  }
  return ['No se pudieron generar respuestas'];
}

function getTone(tone: string): string {
  const t: Record<string, string> = {
    coqueto: 'coqueto - dulce con rollo',
    jugueton: 'juguetón - divertido, humor picarón',
    picante: 'picante - ATREVIDO, confidence, SEX APPEAL',
  };
  return t[tone] || tone;
}

export async function generateResponses(
  imageBase64: string,
  tone: string,
  context?: string
): Promise<string[]> {
  let userMsg = `Tono ${getTone(tone)}. SOLO JSON.`;
  if (context) userMsg += ` Contexto: ${context}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userMsg },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0.9,
      max_completion_tokens: 300,
      stream: false,
      reasoning_effort: 'none',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[Groq]', res.status, JSON.stringify(data));
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content || '';
  return extractJson(content);
}
