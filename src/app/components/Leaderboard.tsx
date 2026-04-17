'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';

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
          <motion.h2
            className="mb-4 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Filter Tabs */}
        <motion.div
          className="mx-auto mb-6 flex max-w-5xl items-center justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>

        <motion.div
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-secondary/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Desktop Table Header */}
          <div className="hidden grid-cols-[60px_1fr_140px_140px] gap-4 border-b border-border/50 bg-secondary/50 px-6 py-4 text-sm text-muted-foreground md:grid">
            <div>{t('rank')}</div>
            <div>{t('trader')}</div>
            <div className="text-right">{t('portfolio')}</div>
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
            <div className="divide-y divide-border/30">
              {traders.map((trader, i) => {
                const rank = i + 1;
                const isTopThree = rank <= 3;

                const traderUrl = `https://app.mycoindeck.com/en/explore/${trader.urlname || trader.uid}?pid=${trader.portfolioId}`;

                return (
                  <motion.a
                    href={traderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`${trader.portfolioId}`}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.45, delay: 0.1 + i * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(171, 81, 197, 0.08)' }}
                    className={`block cursor-pointer px-4 py-4 transition-colors sm:px-6 ${
                      isTopThree ? 'bg-gradient-to-r from-[#AB51C5]/10 to-transparent' : ''
                    }`}
                  >
                    {/* Desktop row */}
                    <div className="hidden grid-cols-[60px_1fr_140px_140px] gap-4 md:grid">
                      <div className="flex items-center">
                        {isTopThree ? (
                          <motion.div
                            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${rankBadge(rank)}`}
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.2 + i * 0.05 }}
                          >
                            {rank}
                          </motion.div>
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
                        <div>
                          <div className="font-medium">{trader.name}</div>
                          {isTopThree && (
                            <div className="flex items-center text-xs text-[#AB51C5]">
                              <TrendingUp className="mr-1 h-3 w-3" />
                              {t('topPerformer')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end text-sm text-muted-foreground">
                        {trader.portfolioLabel}
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
                          <motion.div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadge(rank)}`}
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.2 + i * 0.05 }}
                          >
                            {rank}
                          </motion.div>
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
                  </motion.a>
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
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <a
            href="https://app.mycoindeck.com/en/home/ranking"
            className="text-[#AB51C5] transition-colors hover:text-[#c76de0] hover:underline"
          >
            {t('viewFull')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
