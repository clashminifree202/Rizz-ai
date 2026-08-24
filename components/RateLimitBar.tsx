'use client';

import { useEffect, useState } from 'react';
import { getRemainingRequests, getResetTime } from '@/lib/rateLimit';

export default function RateLimitBar() {
  const [remaining, setRemaining] = useState(5);
  const [resetTime, setResetTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setRemaining(getRemainingRequests());
      setResetTime(getResetTime());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const percentage = (remaining / 5) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
        <span>
          {remaining}/5 peticiones disponibles
        </span>
        {resetTime && (
          <span>Se reinicia en {resetTime}</span>
        )}
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 60
              ? 'bg-green-500'
              : percentage > 30
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
