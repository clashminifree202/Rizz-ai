'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (context: string) => void;
  loading?: boolean;
}

export default function ContextModal({ isOpen, onClose, onSubmit, loading }: Props) {
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (context.trim()) {
      onSubmit(context.trim());
      setContext('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            <span>💡</span> Dale más contexto
          </h3>
          <p className="text-white/50 text-sm mt-2">
            Cuéntale a la IA más detalles sobre la conversación para obtener mejores respuestas.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-white/70 text-sm">Contexto adicional</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ej: Es la primera vez que hablo con ella, me gustaría quedar bien pero sin ser intenso..."
              className="w-full h-32 bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 resize-none transition-colors"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!context.trim() || loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generando...
                </>
              ) : (
                'Generar con contexto'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
