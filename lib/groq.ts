import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
- Responde SIEMPRE en español
- Las respuestas deben ser naturales y fluidas
- Adapta el contexto de la conversación (edad, confianza, situación)
- Nunca generes contenido vulgar o explícito
- Cada respuesta debe ser única y diferente entre sí
- Respuestas cortas y directas (1-3 frases máximo)

Responde ÚNICAMENTE con este formato JSON (sin texto adicional):
{
  "responses": [
    "primera respuesta",
    "segunda respuesta",
    "tercera respuesta"
  ]
}`;

export async function generateResponses(
  imageBase64: string,
  tone: string,
  context?: string
): Promise<string[]> {
  const toneDescriptions: Record<string, string> = {
    coqueto: 'coqueto - dulce, halagador, interés romántico sutil',
    jugueton: 'juguetón - divertido, humor ligero, pícaro',
    picante: 'picante - atrevido, directo, algo provocador',
  };

  let userMessage = `Genera 3 respuestas con tono ${toneDescriptions[tone] || tone} para esta conversación.`;

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
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.responses)
      ? parsed.responses.slice(0, 3)
      : ['No se pudieron generar respuestas'];
  } catch {
    return ['Error al procesar la respuesta'];
  }
}
