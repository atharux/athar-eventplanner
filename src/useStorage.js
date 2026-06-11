import { useState, useEffect } from 'react';

/**
 * Drop-in replacement for useState that persists to localStorage.
 * Serialises to JSON; silently falls back to in-memory if storage is unavailable.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded or private mode — degrade gracefully
    }
  }, [key, value]);

  return [value, setValue];
}

/** Check and enforce free-tier limits. Returns { allowed, reason }. */
export function checkLimit(plan, resource, currentCount) {
  if (plan === 'pro') return { allowed: true };
  const FREE_LIMITS = {
    events:  3,
    clients: 3,
    guests:  50,
  };
  const limit = FREE_LIMITS[resource];
  if (limit === undefined) return { allowed: true };
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows up to ${limit} ${resource}. Upgrade to Pro for unlimited ${resource}.`,
    };
  }
  return { allowed: true };
}
