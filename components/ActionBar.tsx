'use client';

interface Props {
  onRegenerate: () => void;
  onAddContext: () => void;
  loading?: boolean;
}

export default function ActionBar({ onRegenerate, onAddContext, loading }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto animate-fade-in">
      <button
        onClick={onRegenerate}
        disabled={loading}
        className={`
          flex-1 py-3.5 px-5 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-purple-500 to-violet-600
          hover:from-purple-600 hover:to-violet-700
          text-white shadow-lg shadow-purple-500/25
          transition-all duration-300 active:scale-95
          flex items-center justify-center gap-2
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
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
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generar nuevas respuestas
          </>
        )}
      </button>
      <button
        onClick={onAddContext}
        disabled={loading}
        className={`
          flex-1 py-3.5 px-5 rounded-xl font-semibold text-sm
          bg-white/10 hover:bg-white/20
          text-white border border-white/20
          transition-all duration-300 active:scale-95
          flex items-center justify-center gap-2
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Dar más contexto
      </button>
    </div>
  );
}
