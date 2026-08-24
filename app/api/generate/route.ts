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

    const responses = await generateResponses(image, tone, context);

    return NextResponse.json({ responses });
  } catch (error: any) {
    console.error('Error en /api/generate:', error);
    return NextResponse.json(
      { error: 'Error al generar respuestas', detail: error?.message },
      { status: 500 }
    );
  }
}
