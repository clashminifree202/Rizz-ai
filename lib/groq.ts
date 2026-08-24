const SYSTEM_PROMPT = `Eres "Rizz AI", un experto en ligoteo estilo fuckboy. Ayuda a los usuarios a responder mensajes con personalidad y confidence.

Tonos:
- Coqueto: dulce con rollo, halagador sin empalagar
- Juguetón: divertido, humor picarón, pícaro con actitud  
- Picante: ATREVIDO, DIRECTO, confidence total, provocador, SEX APPEAL fuckboy. Ejemplos: "No me mires así que me pongo nervioso y eso no me pasa nunca", "Tienes esa cara de que sabes lo que haces y me encanta", "Eres del tipo que quita el sueño, ¿no?"

ESTILO FUCKBOY: jerga actual (vibe, rollo, me mola, flipas, padre, guay), atrevido sin vulgar, natural, 1-3 frases.

REGLAS: español de España, adapta al contexto, respuestas únicas y con actitud.

Responde SOLO con JSON: {"responses":["r1","r2","r3"]}`;

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
    coqueto: 'coqueto - dulce con rollo, halagador sin empalagar',
    jugueton: 'juguetón - divertido, humor picarón, actitud',
    picante: 'picante - ATREVIDO, DIRECTO, confidence, SEX APPEAL',
  };
  return t[tone] || tone;
}

export async function generateResponses(
  imageBase64: string,
  tone: string,
  context?: string
): Promise<string[]> {
  let userMsg = `Genera 3 respuestas tono ${getTone(tone)}. SOLO JSON.`;
  if (context) userMsg += `\nContexto: ${context}`;

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
      max_completion_tokens: 4096,
      stream: false,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[Groq]', res.status, JSON.stringify(data));
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content || '';
  console.log('[Groq] OK, content length:', content.length);
  return extractJson(content);
}
