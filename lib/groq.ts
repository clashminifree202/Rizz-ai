import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `Eres "Rizz AI", un experto en conversaciones de ligoteo y coqueteo. Tu función es ayudar a los usuarios a responder mensajes de una conversación romántica/social.

El usuario te enviará una captura de pantalla de una conversación y un tono. Tu tarea es:

1. Analizar la imagen para entender el contexto de la conversación
2. Identificar quién dice qué y el estado de la conversación
3. Generar 3 posibles respuestas que encajen perfectamente con el tono solicitado

Tonos disponibles:
- Coqueto: dulce, halagador, con interés romántico sutil y encantador
- Juguetón: divertido, con twist, humor ligero, pícaro sin pasarse
- Picante: atrevido, coqueto directo, algo provocador, sin ser vulgar

REGLAS IMPORTANTES:
- Responde SIEMPRE en español de España (castellano peninsular). Usa "tú" en vez de "vos" o "usted", y expresiones propias de España (mola, guay, tío/a, padre, chulo, majo/a, flipar, currar, etc.)
- Las respuestas deben ser naturales y fluidas
- Adapta el contexto de la conversación (edad, confianza, situación)
- Nunca generes contenido vulgar o explícito
- Cada respuesta debe ser única y diferente entre sí
- Respuestas cortas y directas (1-3 frases máximo)

Responde ÚNICAMENTE con este formato JSON (sin texto adicional, sin tags de thinking):
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
    coqueto: 'coqueto - dulce, halagador, interés romántico sutil',
    jugueton: 'juguetón - divertido, humor ligero, pícaro',
    picante: 'picante - atrevido, directo, algo provocador',
  };
  return tones[tone] || tone;
}

function extractJson(text: string): string[] {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*"responses"[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed.responses)) {
      return parsed.responses.slice(0, 3);
    }
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

      let userMessage = `Genera 3 respuestas con tono ${getToneDescription(tone)} para esta conversación. NO uses tags de thinking, responde directamente con el JSON.`;
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
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const content = completion.choices[0]?.message?.content || '{}';
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
