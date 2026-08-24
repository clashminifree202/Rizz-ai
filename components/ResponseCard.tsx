'use client';

import { useState } from 'react';

interface Props {
  text: string;
  index: number;
}

export default function ResponseCard({ text, index }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const colors = [
    'from-purple-500/20 to-violet-500/10 border-purple-400/30',
    'from-pink-500/20 to-rose-500/10 border-pink-400/30',
    'from-indigo-500/20 to-blue-500/10 border-indigo-400/30',
  ];

  return (
    <div
      className={`
        relative bg-gradient-to-br ${colors[index % 3]}
        border rounded-2xl p-5 animate-slide-up
        hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300
      `}
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="text-white/30 text-xs font-mono">
            Opción {index + 1}
          </span>
          <p className="text-white text-lg mt-1 leading-relaxed">{text}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`
            flex-shrink-0 p-2.5 rounded-xl transition-all duration-300
            ${
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
            }
          `}
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
