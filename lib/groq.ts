import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `Eres "Rizz AI", un experto en ligoteo estilo fuckboy. Tu función es ayudar a los usuarios a responder mensajes con mucha personalidad, confianza y rollada.

El usuario te enviará una captura de pantalla de una conversación y un tono. Tu tarea es:

1. Analizar la imagen para entender el contexto de la conversación
2. Identificar quién dice qué y el estado de la conversación
3. Generar 3 posibles respuestas que encajen perfectamente con el tono

Tonos disponibles:
- Coqueto: dulce pero con rollo, halagador sin ser empalagoso, interested sin ser intenso
- Juguetón: divertido, con rollo, humor picarón, pícaro con personalidad
- Picante: atrevido, directo, confidence total, provocador, con SEX APPEAL. Ejemplos: "No me mires así que me pongo nervioso y eso no me pasa nunca", "Tienes esa cara de que sabes lo que haces y me encanta", "Si sigues así me voy a tener que declarar", "Eres del tipo que quita el sueño, ¿no?"

ESTILO FUCKBOY:
- Respuestas con MUCHA personalidad y confidence
- Usa jerga actual: "vibe", "rollo", "energy", "me mola", "flipas", "padre", "guay"
- Sé atrevido pero no vulgar
- Haz que suene natural, como un tío que sabe lo que quiere
- Puedes ser un poco provocador y atrevido
- Respuestas cortas y directas (1-3 frases máximo)

REGLAS:
- Responde SIEMPRE en español de España
- Adaptate al contexto de la conversación
- Cada respuesta debe ser única y diferente entre sí
- Respuestas con MUCHA actitud y personalidad

Responde ÚNICAMENTE con este formato JSON:
{
  "responses": [
    "primera respuesta",
    "segunda respuesta",
    "tercera respuesta"
  ]
}`;

function getGroqClient(): Groq {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

function getToneDescription(tone: string): string {
  const tones: Record<string, string> = {
    coqueto: 'coqueto - dulce con rollo, halagador sin empalagar, con personalidad',
    jugueton: 'juguetón - divertido, humor picarón, pícaro con actitud',
    picante: 'picante - ATREVIDO, DIRECTO, confidence total, provocador, SEX APPEAL fuckboy',
  };
  return tones[tone] || tone;
}

function extractJson(text: string): string[] {
  let cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<think>[\s\S]*/g, '')
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*"responses"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.responses) && parsed.responses.length > 0) {
        return parsed.responses.filter((r: string) => typeof r === 'string' && r.length > 0).slice(0, 3);
      }
    } catch {}
  }
  return ['No se pudieron generar respuestas'];
}

async function callGroq(
  imageBase64: string,
  tone: string,
  context?: string,
  retries = 2
): Promise<string[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }

      const groq = getGroqClient();

      let userMessage = `Genera 3 respuestas con tono ${getToneDescription(tone)} para esta conversación. SOLO el JSON.`;
      if (context) {
        userMessage += `\n\nContexto adicional del usuario: ${context}`;
      }

      const completion = await groq.chat.completions.create({
        model: 'qwen/qwen3.6-27b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userMessage },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.9,
        max_completion_tokens: 2048,
        top_p: 1,
        stream: false,
        reasoning_format: 'parsed',
      });

      const content = completion.choices[0]?.message?.content || '';
      console.log('[Groq] Content length:', content.length);
      return extractJson(content);
    } catch (err: any) {
      lastError = err;
      console.error(`Intento ${attempt + 1} fallido:`, err?.message);

      if (err?.status === 429) {
        continue;
      }
      if (err?.status && err.status < 500) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Error desconocido');
}

export async function generateResponses(
  imageBase64: string,
  tone: string,
  context?: string
): Promise<string[]> {
  return callGroq(imageBase64, tone, context);
}
