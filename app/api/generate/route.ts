import { NextRequest, NextResponse } from 'next/server';
import { generateResponses } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, tone, context } = body;

    if (!image || !tone) {
      return NextResponse.json(
        { error: 'Falta imagen o tono' },
        { status: 400 }
      );
    }

    const validTones = ['coqueto', 'jugueton', 'picante'];
    if (!validTones.includes(tone)) {
      return NextResponse.json(
        { error: 'Tono no válido' },
        { status: 400 }
      );
    }

    if (typeof image !== 'string' || image.length < 100) {
      return NextResponse.json(
        { error: 'Imagen no válida' },
        { status: 400 }
      );
    }

    const responses = await generateResponses(image, tone, context);

    return NextResponse.json({ responses });
  } catch (error: any) {
    console.error('Error en /api/generate:', error?.message || error);

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Espera un momento e intenta de nuevo.' },
        { status: 429 }
      );
    }

    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error al generar respuestas. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
