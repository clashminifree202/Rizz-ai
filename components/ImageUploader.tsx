'use client';

import { useCallback, useEffect, useState } from 'react';

interface Props {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
  showPreview?: boolean;
  imageBase64?: string;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.5);
        resolve(compressed.split(',')[1]);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ onImageSelect, disabled, showPreview, imageBase64 }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (imageBase64 && !preview) {
      setPreview(`data:image/jpeg;base64,${imageBase64}`);
    }
  }, [imageBase64]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 15 * 1024 * 1024) {
        alert('La imagen no puede superar 15MB');
        return;
      }

      setCompressing(true);
      try {
        const base64 = await compressImage(file);
        setPreview(`data:image/jpeg;base64,${base64}`);
        onImageSelect(base64);
      } catch {
        alert('Error al procesar la imagen');
      } finally {
        setCompressing(false);
      }
    },
    [onImageSelect]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            break;
          }
        }
      }
    },
    [disabled, handleFile]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

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
    if (disabled || compressing) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  if (showPreview && preview) {
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
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg transition-all z-10"
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
        ${disabled || compressing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {compressing ? (
        <>
          <div className="relative">
            <div className="w-12 h-12 border-3 border-purple-500/30 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-transparent border-t-purple-500 rounded-full animate-spin" />
          </div>
          <p className="text-white/60 text-sm">Comprimiendo imagen...</p>
        </>
      ) : (
        <>
          <div className="text-6xl animate-pulse-glow">📸</div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">
              Sube la captura de la conversación
            </p>
            <p className="text-white/50 text-sm mt-1">
              Arrastra, toca o pega con Ctrl+V
            </p>
            <p className="text-white/30 text-xs mt-2">PNG, JPG, WEBP • Máx. 15MB</p>
          </div>
        </>
      )}
    </div>
  );
}
