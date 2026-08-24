'use client';

interface Props {
  selected: string | null;
  onSelect: (tone: string) => void;
  disabled?: boolean;
}

const tones = [
  {
    id: 'coqueto',
    label: 'Coqueto',
    emoji: '💜',
    color: 'from-purple-500 to-violet-600',
    border: 'border-purple-400',
    desc: 'Dulce y halagador',
  },
  {
    id: 'jugueton',
    label: 'Juguetón',
    emoji: '💚',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400',
    desc: 'Divertido y pícaro',
  },
  {
    id: 'picante',
    label: 'Picante',
    emoji: '❤️',
    color: 'from-rose-500 to-red-600',
    border: 'border-rose-400',
    desc: 'Atrevido y directo',
  },
];

export default function ToneSelector({ selected, onSelect, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto animate-slide-up">
      <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">
        Elige el tono de tu respuesta
      </h3>
      <div className="flex gap-3 w-full">
        {tones.map((tone) => (
          <button
            key={tone.id}
            onClick={() => !disabled && onSelect(tone.id)}
            disabled={disabled}
            className={`
              flex-1 py-4 px-3 rounded-xl border-2 transition-all duration-300
              flex flex-col items-center gap-2
              ${
                selected === tone.id
                  ? `bg-gradient-to-b ${tone.color} ${tone.border} shadow-lg scale-105`
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            `}
          >
            <span className="text-3xl">{tone.emoji}</span>
            <span className="text-white font-bold text-sm">{tone.label}</span>
            <span className="text-white/50 text-xs hidden sm:block">{tone.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
