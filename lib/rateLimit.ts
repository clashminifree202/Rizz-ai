const RATE_LIMIT_KEY = 'rizz_requests';
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

export interface RateLimitEntry {
  timestamp: number;
}

export function getRequests(): RateLimitEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function cleanOldRequests(): RateLimitEntry[] {
  const now = Date.now();
  const requests = getRequests().filter((r) => now - r.timestamp < WINDOW_MS);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(requests));
  return requests;
}

export function canMakeRequest(): boolean {
  return cleanOldRequests().length < MAX_REQUESTS;
}

export function addRequest(): void {
  const requests = cleanOldRequests();
  requests.push({ timestamp: Date.now() });
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(requests));
}

export function getRemainingRequests(): number {
  return Math.max(0, MAX_REQUESTS - cleanOldRequests().length);
}

export function getResetTime(): string | null {
  const requests = cleanOldRequests();
  if (requests.length === 0) return null;
  const oldest = requests[0];
  const resetAt = oldest.timestamp + WINDOW_MS;
  const diff = resetAt - Date.now();
  if (diff <= 0) return null;
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
