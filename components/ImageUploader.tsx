'use client';

import { useCallback, useState } from 'react';

interface Props {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen no puede superar 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        const base64 = result.split(',')[1];
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  if (preview) {
    return (
      <div className="relative w-full max-w-md mx-auto animate-fade-in">
        <img
          src={preview}
          alt="Captura de conversación"
          className="w-full rounded-2xl border-2 border-purple-500/30 shadow-lg shadow-purple-500/10"
        />
        {!disabled && (
          <button
            onClick={() => {
              setPreview(null);
              onImageSelect('');
            }}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg transition-all"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        w-full max-w-md mx-auto border-2 border-dashed rounded-2xl p-10
        flex flex-col items-center justify-center gap-4 cursor-pointer
        transition-all duration-300 min-h-[250px]
        ${
          isDragging
            ? 'border-purple-400 bg-purple-500/10 scale-105'
            : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="text-6xl animate-pulse-glow">📸</div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">
          Sube la captura de la conversación
        </p>
        <p className="text-white/50 text-sm mt-1">
          Arrastra y suelta o toca para seleccionar
        </p>
        <p className="text-white/30 text-xs mt-2">PNG, JPG, WEBP • Máx. 10MB</p>
      </div>
    </div>
  );
}
