# Rizz AI 💜

**Tu asistente de ligoteo con inteligencia artificial**

Rizz AI es una aplicación web móvil que te ayuda aResponder mensajes de conversaciones románticas/sociales. Sube una captura de pantalla de la conversación, elige el tono de tu respuesta y la IA generará 3 opciones perfectas para ti.

## Funcionalidades

- **📸 Subir captura**: Sube una imagen de la conversación (drag & drop o galería)
- **🎭 Elegir tono**: Coqueto, Juguetón o Picante
- **✨ 3 respuestas**: La IA genera 3 opciones diferentes
- **📋 Copiar**: Un toque para copiar cualquier respuesta al portapapeles
- **🔄 Regenerar**: Genera nuevas respuestas con el mismo tono
- **💡 Dar contexto**: Añade información extra para respuestas personalizadas
- **⏱️ Límite justo**: 5 peticiones por hora (se reinicia solo)

## Cómo funciona

1. Subes una captura de tu conversación
2. La IA (Groq + Qwen 3.6 27B) analiza la imagen y entiende el contexto
3. Eliges el tono: coqueto 💜, juguetón 💚 o picante ❤️
4. Recibes 3 respuestas listas para copiar y pegar
5. Puedes regenerar o dar más contexto para mejores resultados

## Tecnologías

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **IA**: Groq API con modelo `qwen/qwen3.6-27b` (vision + OCR)
- **Hosting**: Vercel (plan gratuito)

## Setup

### 1. Clonar el repositorio

```bash
git clone https://github.com/clashminifree202/Rizz-ai.git
cd Rizz-ai
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar API Key de Groq

1. Crea una cuenta gratuita en [console.groq.com](https://console.groq.com)
2. Ve a **API Keys** y crea una nueva key
3. Copia el archivo `.env.local` y pega tu key:

```
GROQ_API_KEY=gsk_tu_api_key_aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará en `http://localhost:3000`

### 5. Deploy a Vercel

```bash
npm i -g vercel
vercel
```

O conecta el repositorio a Vercel desde la web para deploys automáticos.

## Estructura del proyecto

```
Rizz-ai/
├── app/
│   ├── layout.tsx          # Layout principal + meta tags
│   ├── page.tsx            # Página principal (flujo completo)
│   ├── globals.css         # Estilos + animaciones
│   └── api/generate/
│       └── route.ts        # API → Groq
├── components/
│   ├── ImageUploader.tsx   # Dropzone de imágenes
│   ├── ToneSelector.tsx    # Selector coqueto/juguetón/picante
│   ├── ResponseCard.tsx    # Card de respuesta con copiar
│   ├── ActionBar.tsx       # Botones regenerar/contexto
│   ├── ContextModal.tsx    # Modal de contexto
│   └── RateLimitBar.tsx    # Barra de límite
├── lib/
│   ├── groq.ts             # Cliente Groq
│   └── rateLimit.ts        # Control de peticiones
├── public/
│   └── manifest.json       # PWA manifest
├── .env.local              # API key (no subir a git)
└── package.json
```

## Limites

- **5 peticiones por hora** por navegador (guardado en localStorage)
- **10MB** máximo por imagen
- La IA analiza la imagen para entender la conversación (OCR + vision)
- No se almacenan datos del usuario

## Licencia

MIT - Usa libremente

---

Hecho con 💜
