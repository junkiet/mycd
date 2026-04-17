'use client';

import { useEffect, useState } from 'react';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

type LangObject = Record<string, unknown>;

interface CacheEntry {
  ts: number;
  data: LangObject;
}

const memCache = new Map<string, LangObject>();

async function loadLocale(locale: string): Promise<LangObject> {
  if (memCache.has(locale)) return memCache.get(locale)!;

  const storageKey = `goapi_lang_${locale}`;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: CacheEntry = JSON.parse(raw);
        if (Date.now() - parsed.ts < CACHE_TTL) {
          memCache.set(locale, parsed.data);
          return parsed.data;
        }
      }
    } catch {}
  }

  const res = await fetch(`https://app.mycoindeck.com/goapi/lang/${locale}`);
  const data: LangObject = await res.json();
  memCache.set(locale, data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
  }
  return data;
}

function resolvePath(obj: LangObject, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function useGoApiLang(locale: string) {
  const [messages, setMessages] = useState<LangObject | null>(
    memCache.get(locale) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    loadLocale(locale).then((data) => {
      if (!cancelled) setMessages(data);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const t = (path: string, fallback?: string): string => {
    if (!messages) return fallback ?? '';
    return resolvePath(messages, path) ?? fallback ?? path;
  };

  return { t, ready: messages !== null };
}
