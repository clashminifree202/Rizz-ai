'use client';

import { useState, useCallback } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ToneSelector from '@/components/ToneSelector';
import ResponseCard from '@/components/ResponseCard';
import ActionBar from '@/components/ActionBar';
import ContextModal from '@/components/ContextModal';

type Step = 'upload' | 'tone' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState<string>('');

  const handleImageSelect = useCallback((base64: string) => {
    if (!base64) {
      setImageBase64('');
      setStep('upload');
      return;
    }
    setImageBase64(base64);
    setStep('tone');
  }, []);

  const generate = useCallback(
    async (tone?: string, context?: string) => {
      const useTone = tone || selectedTone;
      if (!imageBase64 || !useTone) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageBase64,
            tone: useTone,
            context: context || currentContext || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error al generar respuestas');
        }

        setResponses(data.responses || []);
        setStep('results');
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    },
    [imageBase64, selectedTone, currentContext]
  );

  const handleToneSelect = useCallback(
    (tone: string) => {
      setSelectedTone(tone);
      generate(tone);
    },
    [generate]
  );

  const handleRegenerate = useCallback(() => {
    generate();
  }, [generate]);

  const handleAddContext = useCallback(() => {
    setContextModalOpen(true);
  }, []);

  const handleContextSubmit = useCallback(
    (context: string) => {
      setCurrentContext(context);
      setContextModalOpen(false);
      generate(undefined, context);
    },
    [generate]
  );

  const handleStartOver = useCallback(() => {
    setStep('upload');
    setImageBase64('');
    setSelectedTone(null);
    setResponses([]);
    setError(null);
    setCurrentContext('');
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl sm:text-6xl font-black mb-2">
          <span className="text-gradient">Rizz AI</span>
        </h1>
        <p className="text-white/50 text-sm sm:text-base max-w-xs mx-auto">
          Sube una captura y obtén la respuesta perfecta
        </p>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Step: Upload */}
        {step === 'upload' && (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}

        {/* Step: Tone + Results (always together) */}
        {(step === 'tone' || step === 'results') && (
          <div className="space-y-6 animate-fade-in">
            <ImageUploader
              onImageSelect={handleImageSelect}
              disabled
              showPreview={!!imageBase64}
              imageBase64={imageBase64}
            />

            <ToneSelector
              selected={selectedTone}
              onSelect={handleToneSelect}
              disabled={loading}
            />

            {/* Loading inline */}
            {loading && (
              <div className="flex items-center justify-center gap-3 py-6 animate-fade-in">
                <div className="relative">
                  <div className="w-6 h-6 border-2 border-purple-500/30 rounded-full" />
                  <div className="absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-purple-500 rounded-full animate-spin" />
                </div>
                <span className="text-white/60 text-sm">Generando respuestas...</span>
              </div>
            )}

            {/* Results */}
            {step === 'results' && !loading && responses.length > 0 && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-lg">Tus respuestas</h2>
                  <button
                    onClick={handleStartOver}
                    className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva captura
                  </button>
                </div>

                <div className="space-y-3">
                  {responses.map((response, i) => (
                    <ResponseCard key={i} text={response} index={i} />
                  ))}
                </div>

                <div className="pt-2">
                  <ActionBar
                    onRegenerate={handleRegenerate}
                    onAddContext={handleAddContext}
                    loading={loading}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 pb-4 text-center">
        <p className="text-white/20 text-xs">
          Hecho con 💜 por Rizz AI
        </p>
      </div>

      {/* Context Modal */}
      <ContextModal
        isOpen={contextModalOpen}
        onClose={() => setContextModalOpen(false)}
        onSubmit={handleContextSubmit}
        loading={loading}
      />
    </main>
  );
}
