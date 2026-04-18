'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from './ScrollReveal';

function Dropdown({ value, options, onChange, align = 'left' }: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#1a1a1a]/80 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:border-[#AB51C5]/40"
      >
        {selected?.label}
        <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full z-20 mb-1.5 min-w-[130px] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]/95 shadow-xl shadow-black/40 backdrop-blur-xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-white/10 ${
                  opt.value === value ? 'text-[#AB51C5]' : 'text-white/70'
                }`}
              >
                {opt.label}
                {opt.value === value && (
                  <svg className="ml-auto h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RankingItem {
  portfolioId: number;
  portfolioLabel: string;
  uid: number;
  urlname: string;
  avatar: string;
  oavatar: string;
  name: string;
  total: number;
  isMe: boolean;
}

export function Leaderboard() {
  const t = useTranslations('leaderboard');
  const [traders, setTraders] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [option, setOption] = useState<'pnl' | 'tv'>('pnl');
  const [type, setType] = useState<'today' | 'monthly' | 'alltime'>('monthly');

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ranking?type=${type}&option=${option}`);
        const json = await res.json();
        if (json.code === 200 && json.data) {
          setTraders(json.data);
        }
      } catch {
        // keep empty
      }
      setLoading(false);
    }
    fetchRanking();
  }, [type, option]);

  const rankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-br from-gray-400 to-gray-500 text-black';
    if (rank === 3) return 'bg-gradient-to-br from-orange-600 to-orange-700 text-white';
    return '';
  };

  return (
    <section id="leaderboard" className="relative py-24">
      <div className="absolute bottom-0 left-1/2 h-px w-full max-w-4xl -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(171,81,197,0.4) 30%, rgba(171,81,197,0.6) 50%, rgba(171,81,197,0.4) 70%, transparent)' }} />
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Filter Tabs */}
        <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
          <Dropdown
            value={type}
            options={[
              { value: 'today', label: t('today') },
              { value: 'monthly', label: t('monthly') },
              { value: 'alltime', label: t('allTime') },
            ]}
            onChange={(v) => setType(v as 'today' | 'monthly' | 'alltime')}
          />
          <Dropdown
            value={option}
            options={[
              { value: 'pnl', label: t('pnl') },
              { value: 'tv', label: t('volume') },
            ]}
            onChange={(v) => setOption(v as 'pnl' | 'tv')}
            align="right"
          />
        </div>

        <ScrollReveal className="-mx-6 overflow-hidden border-y border-border/50 bg-gradient-to-br from-card to-secondary/50 sm:mx-auto sm:max-w-5xl sm:rounded-2xl sm:border">
          {/* Desktop Table Header */}
          <div className="hidden grid-cols-[60px_1fr_160px] gap-4 border-b border-border/50 bg-secondary/50 px-6 py-4 text-sm text-muted-foreground md:grid">
            <div>{t('rank')}</div>
            <div>{t('trader')}</div>
            <div className="text-right">{option === 'pnl' ? t('pnl') : t('volume')}</div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AB51C5] border-t-transparent" />
            </div>
          )}

          {/* Table Body */}
          {!loading && (
            <div className="max-h-[520px] divide-y divide-border/30 overflow-y-auto sm:[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-white/10 sm:hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              {traders.map((trader, i) => {
                const rank = i + 1;
                const isTopThree = rank <= 3;

                const traderUrl = `https://app.mycoindeck.com/en/explore/${trader.urlname || trader.uid}?pid=${trader.portfolioId}`;

                return (
                  <a
                    href={traderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`${trader.portfolioId}`}
                    className={`block cursor-pointer px-3 py-3.5 transition-colors hover:bg-[#AB51C5]/[0.08] sm:px-6 sm:py-4 ${
                      isTopThree ? 'bg-gradient-to-r from-[#AB51C5]/10 to-transparent' : ''
                    }`}
                  >
                    {/* Desktop row */}
                    <div className="hidden grid-cols-[60px_1fr_160px] gap-4 md:grid">
                      <div className="flex items-center">
                        {isTopThree ? (
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${rankBadge(rank)}`}>
                            {rank}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">{rank}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={trader.avatar}
                          alt={trader.name}
                          className="h-10 w-10 shrink-0 rounded-full bg-[#333] object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{trader.name}</div>
                          {trader.portfolioLabel && (
                            <div className="truncate text-xs text-muted-foreground">{trader.portfolioLabel}</div>
                          )}
                        </div>
                      </div>

                      {option === 'pnl' ? (
                        <div className={`flex items-center justify-end font-medium ${trader.total >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          {trader.total >= 0 ? '+' : ''}${Math.abs(trader.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end font-medium text-white">
                          ${trader.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>

                    {/* Mobile card layout */}
                    <div className="flex flex-col gap-2.5 md:hidden">
                      <div className="flex items-center gap-2.5">
                        {isTopThree ? (
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadge(rank)}`}>
                            {rank}
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center text-sm text-muted-foreground">{rank}</div>
                        )}
                        <img
                          src={trader.avatar}
                          alt={trader.name}
                          className="h-9 w-9 shrink-0 rounded-full bg-[#333] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{trader.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{trader.portfolioLabel}</div>
                        </div>
                        {option === 'pnl' ? (
                          <div className={`shrink-0 text-sm font-semibold ${trader.total >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                            {trader.total >= 0 ? '+' : ''}${Math.abs(trader.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        ) : (
                          <div className="shrink-0 text-sm font-semibold text-white">
                            ${trader.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && traders.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              {t('noData')}
            </div>
          )}
        </ScrollReveal>

        <div className="mt-8 text-center">
          <a
            href="https://app.mycoindeck.com/en/home/ranking"
            className="text-[#AB51C5] transition-colors hover:text-[#c76de0] hover:underline"
          >
            {t('viewFull')}
          </a>
        </div>
      </div>
    </section>
  );
}
