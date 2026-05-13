'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { useGoApiLang } from '@/hooks/useGoApiLang';

interface ExchangeData {
  platform: string;
  tradingVolume: number;
  pnl: number;
  count: number;
}

interface ExchangeSummary {
  totalTradingVolume: number;
  totalTradingVolumeToday: number;
  totalPnl: number;
  totalPnlToday: number;
  totalExchanges: number;
  totalUsers: number;
  exchanges: ExchangeData[];
}

const EXCHANGE_META: Record<string, { name: string; type: string; logo: string }> = {
  binance: { name: 'Binance', type: 'Spot, Futures', logo: '/exchanges/binance.svg' },
  bybit: { name: 'Bybit', type: 'Unified', logo: '/exchanges/bybit.svg' },
  okx: { name: 'OKX', type: 'Trading', logo: '/exchanges/okx.svg' },
  bitget: { name: 'Bitget', type: 'Spot, Futures', logo: '/exchanges/bitget.svg' },
};

function formatUsd(n: number) {
  return '$' + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function useExchangeSummary() {
  const [data, setData] = useState<ExchangeSummary | null>(null);
  useEffect(() => {
    fetch('/api/exchange-summary')
      .then(r => r.json())
      .then(json => { if (json.code === 200 && json.data) setData(json.data); })
      .catch(() => {});
  }, []);
  return data;
}

function formatCurrency(n: number, digits = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function MiniChart({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const w = 100;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const positive = lastValue >= firstValue;
  const color = positive ? '#22c55e' : '#ef4444';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#chartGrad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

interface PositionPnLDay {
  day: string;
  realized_pnl: number;
  unrealized_pnl: number;
}

interface CoinAllocationSlice {
  label: string;
  value: number;
  percent: number;
}

interface CoinAllocationEntry {
  usd: number;
  coin_allocation: CoinAllocationSlice[];
}

interface WalletCategory {
  name: string;
  label: { en: string; zh: string };
  value: number;
  percent: number;
}

interface WalletAllocationEntry {
  totalEq: string;
  categories: WalletCategory[];
}

const COIN_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];
const WALLET_COLORS: Record<string, string> = {
  unified: '#ef4444',
  trading: '#ef4444',
  funding: '#f59e0b',
  earn: '#3b82f6',
  spot: '#8b5cf6',
  futures: '#06b6d4',
};

function DonutChart({ slices, size = 90, stroke = 14 }: {
  slices: { percent: number; color: string }[];
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#222" strokeWidth={stroke} />
      {slices.map((s, i) => {
        const len = (c * s.percent) / 100;
        const circle = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += len;
        return circle;
      })}
    </svg>
  );
}

export function PortfolioMockup() {
  const locale = useLocale();
  const { t: tg } = useGoApiLang(locale);
  const [trader, setTrader] = useState<TraderData | null>(null);
  const [range, setRange] = useState<string>('all');
  const [pnlData, setPnlData] = useState<PositionPnLDay[]>([]);
  const [coinAllocation, setCoinAllocation] = useState<CoinAllocationEntry[]>([]);
  const [walletAllocation, setWalletAllocation] = useState<WalletAllocationEntry[]>([]);

  useEffect(() => {
    fetch('/api/top-traders?limit=1')
      .then(r => r.json())
      .then(json => {
        if (json.code === 200 && json.data && json.data.length > 0) {
          setTrader(json.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!trader) return;
    fetch(`/api/position-pnl?uid=${trader.id}&pid=${trader.portfolioId}&range=${range}`)
      .then(r => r.json())
      .then(json => {
        if (json.code === 200 && Array.isArray(json.data)) setPnlData(json.data);
      })
      .catch(() => {});
  }, [trader, range]);

  useEffect(() => {
    if (!trader) return;
    fetch(`/api/coin-allocation?uid=${trader.id}&pid=${trader.portfolioId}`)
      .then(r => r.json())
      .then(json => {
        if (json.code === 200 && Array.isArray(json.data)) setCoinAllocation(json.data);
      })
      .catch(() => {});
    fetch(`/api/wallet-allocation?uid=${trader.id}&pid=${trader.portfolioId}`)
      .then(r => r.json())
      .then(json => {
        if (json.code === 200 && Array.isArray(json.data)) setWalletAllocation(json.data);
      })
      .catch(() => {});
  }, [trader]);

  const coinSlices = (() => {
    const entry = coinAllocation[0];
    if (!entry?.coin_allocation) return [] as Array<{ label: string; percent: number; value: number; color: string }>;
    return entry.coin_allocation.map((s, i) => ({
      ...s,
      color: COIN_COLORS[i % COIN_COLORS.length],
    }));
  })();

  const walletCategories = walletAllocation[0]?.categories?.filter(c => c.percent > 0 || c.name === 'unified' || c.name === 'trading') || [];

  if (!trader) {
    return (
      <div className="flex items-center justify-center bg-black p-6 min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#BA7CFF] border-t-transparent" />
      </div>
    );
  }

  const balance = trader.totalUsd ?? 0;
  const todayPnL = trader.todayPnL ?? 0;
  const todayRatio = trader.todayPnLRatio ?? 0;
  const todayPositive = todayPnL >= 0;
  const pnl30d = trader.pnl ?? 0;
  const pnl30dPositive = pnl30d >= 0;
  const totalPnl = trader.totalPnl ?? 0;
  const totalPositive = totalPnl >= 0;
  const startEquity = trader.startEquity ?? 0;
  const winRate = trader.winRate ?? 0;
  const joinDate = trader.portfolioCreatedAt || trader.joinDate || '';
  const roi30d = trader.roi30d ?? 0;

  return (
    <div className="bg-black p-3 sm:p-5">
      {/* Top: Balance + Chart */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-bold text-white">${formatCurrency(balance)}</div>
          <div className="mt-1 text-xs">
            <span className="text-muted-foreground">Daily PnL </span>
            <span className={todayPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {todayPositive ? '+' : '-'}${formatCurrency(Math.abs(todayPnL), 4)} ({todayRatio >= 0 ? '+' : ''}{todayRatio.toFixed(2)}%)
            </span>
          </div>
        </div>
        {trader.chartData && <MiniChart data={trader.chartData} />}
      </div>

      {/* Stats Grid Row 1 */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div>
          <div className="text-sm font-semibold text-white sm:text-lg">{winRate.toFixed(2)}%</div>
          <div className="text-[10px] text-muted-foreground">Overall Win Rate</div>
        </div>
        <div>
          <div className={`text-sm font-semibold sm:text-lg ${pnl30dPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {pnl30dPositive ? '+' : '-'}${formatCurrency(Math.abs(pnl30d))}
          </div>
          <div className="text-[10px] text-muted-foreground">
            30D Income <span className={pnl30dPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}>({roi30d >= 0 ? '+' : ''}{roi30d.toFixed(2)}%)</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold sm:text-lg ${totalPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {totalPositive ? '' : '-'}${formatCurrency(Math.abs(totalPnl))}
          </div>
          <div className="text-[10px] text-muted-foreground">Total Income</div>
        </div>
      </div>

      {/* Stats Grid Row 2 */}
      <div className="mb-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-3 sm:gap-3">
        <div>
          <div className="text-xs font-semibold text-white sm:text-sm">${formatCurrency(startEquity)}</div>
          <div className="text-[10px] text-muted-foreground">Initial Asset</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-white sm:text-sm">—</div>
          <div className="text-[10px] text-muted-foreground">USD Net Transfer</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-white sm:text-sm">{joinDate ? formatDate(joinDate) : '—'}</div>
          <div className="text-[10px] text-muted-foreground">Joined Date</div>
        </div>
      </div>

      {/* Scrollable detail panels — height matches news list */}
      <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1 sm:[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-white/10 sm:hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
      {/* Position PnL Analysis */}
      <div className="rounded-xl border border-border/50 bg-secondary/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Position PnL Analysis</div>
          <a
            href={`https://app.mycoindeck.com/${locale}/explore/${trader.urlname || trader.id}?pid=${trader.portfolioId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-white"
          >
            {tg('home.viewFullAnalysis', 'View full analysis')}
            <ChevronRight className="h-3 w-3" />
          </a>
        </div>
        <div className="mb-3 flex gap-1.5">
          {[
            { label: 'All', value: 'all' },
            { label: '7D', value: '7D' },
            { label: '30D', value: '30D' },
            { label: '90D', value: '90D' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-full px-2.5 py-1 text-[10px] transition-colors ${range === r.value ? 'bg-white text-black' : 'border border-border/60 text-muted-foreground hover:text-white'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {pnlData.length > 1 ? (
          <PositionPnLChart data={pnlData} />
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">—</div>
        )}
      </div>

      {/* Coin Allocation */}
      {coinSlices.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-secondary/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">{tg('portfolio.overviewBody.coinAllocation', 'Coin Allocation')}</div>
          </div>
          <div className="flex items-start gap-4">
            <DonutChart
              size={80}
              stroke={12}
              slices={coinSlices.map(s => ({ percent: s.percent, color: s.color }))}
            />
            <div className="flex-1 space-y-1.5 pt-4">
              {coinSlices.slice(0, 5).map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="text-white">{s.label}</span>
                  <span className="text-muted-foreground">${s.value.toFixed(2)}</span>
                  <span className="ml-auto text-muted-foreground">{s.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wallet Allocation */}
      {walletCategories.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-secondary/50 p-4">
          <div className="mb-3 text-sm font-medium">{tg('portfolio.overviewBody.walletAllocation', 'Wallet Allocation')}</div>
          <div className="flex items-start gap-4">
            <DonutChart
              size={80}
              stroke={12}
              slices={walletCategories.map(c => ({
                percent: c.percent,
                color: WALLET_COLORS[c.name] || '#9ca3af',
              }))}
            />
            <div className="flex-1 space-y-1.5 pt-4">
              {walletCategories.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: WALLET_COLORS[c.name] || '#9ca3af' }}
                  />
                  <span className="text-white">
                    {locale === 'zh' ? c.label.zh : c.label.en}
                  </span>
                  <span className="ml-auto text-muted-foreground">{c.percent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground">
            *{tg('portfolio.overviewBody.assetPieChartNote', 'The asset pie chart does not include liabilities.')}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function PositionPnLChart({ data }: { data: PositionPnLDay[] }) {
  if (!data || data.length < 2) return null;
  const w = 300;
  const h = 110;

  const realizedValues = data.map(d => d.realized_pnl);
  const unrealizedValues = data.map(d => d.unrealized_pnl);
  const allValues = [...realizedValues, ...unrealizedValues, 0];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const toPoints = (values: number[]) =>
    values.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');

  const realizedPoints = toPoints(realizedValues);
  const unrealizedPoints = toPoints(unrealizedValues);
  const zeroY = h - ((0 - min) / range) * h;

  const lastRealized = realizedValues[realizedValues.length - 1];
  const lastUnrealized = unrealizedValues[unrealizedValues.length - 1];

  const shortDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const firstDate = shortDate(data[0].day);
  const lastDate = shortDate(data[data.length - 1].day);
  const midDate = shortDate(data[Math.floor(data.length / 2)].day);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-[#3b82f6]" />
          <span className="text-muted-foreground">Realized</span>
          <span className={lastRealized >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
            ${lastRealized.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-[#f59e0b]" />
          <span className="text-muted-foreground">Unrealized</span>
          <span className={lastUnrealized >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
            ${lastUnrealized.toFixed(2)}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" preserveAspectRatio="none">
        <line x1="0" y1={zeroY} x2={w} y2={zeroY} stroke="#333" strokeWidth="0.5" strokeDasharray="2 2" />
        <polyline points={realizedPoints} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        <polyline points={unrealizedPoints} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>{firstDate}</span>
        <span>{midDate}</span>
        <span>{lastDate}</span>
      </div>
    </div>
  );
}

export function TraderProfileMockup() {
  const t = useTranslations('mockups');
  const summary = useExchangeSummary();

  const exchangeOrder = ['binance', 'bybit', 'okx', 'bitget'];

  return (
    <div className="bg-black p-3 sm:p-6">
      {/* Connected status */}
      <div className="mb-5 flex items-center justify-between">
        <div className="text-sm font-medium">{t('connectedExchanges')}</div>
        <motion.div
          className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/20 px-3 py-1 text-xs text-[#22c55e]"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          {t('allSynced')}
        </motion.div>
      </div>

      {/* Exchange cards */}
      <div className="mb-5 space-y-3">
        {exchangeOrder.map((platform) => {
          const meta = EXCHANGE_META[platform];
          const ex = summary?.exchanges.find(e => e.platform === platform);
          const tv = ex?.tradingVolume ?? 0;
          const pnl = ex?.pnl ?? 0;
          const count = ex?.count ?? 0;

          return (
            <div
              key={platform}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={meta.logo}
                  alt={meta.name}
                  className="h-8 w-8 shrink-0 object-contain"
                />
                <div>
                  <div className="text-sm font-medium">{meta.name}</div>
                  <div className="text-xs text-muted-foreground">{meta.type} · {count} {t('portfolios')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatUsd(tv)}</div>
                <div className={`text-xs ${pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {pnl >= 0 ? '+' : '-'}{formatUsd(pnl)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combined totals */}
      <div className="rounded-xl border border-[#BA7CFF]/30 bg-[#BA7CFF]/10 p-4">
        <div className="mb-2 text-sm font-medium">{t('totalAcrossAll')}</div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{formatUsd(summary?.totalTradingVolume ?? 0)}</span>
          <span className="text-xs font-medium text-muted-foreground">{t('allTime')}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className={`text-sm font-medium ${(summary?.totalPnlToday ?? 0) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {(summary?.totalPnlToday ?? 0) >= 0 ? '+' : '-'}{formatUsd(summary?.totalPnlToday ?? 0)} {t('today')}
          </span>
          <span className="text-xs text-muted-foreground">{summary?.totalUsers ?? 0} {t('traders')}</span>
        </div>
      </div>
    </div>
  );
}

interface HotFeed {
  id: number;
  uid: number;
  content: string;
  image: string;
  likes_count: number;
  comments_count: number;
  reshares_count: number;
  views_count: number;
  created_at: string;
  nickname: string;
  urlname: string;
  avatar: string;
  portfolio_id: number;
  reshare_id?: number;
  original?: {
    nickname: string;
    urlname: string;
    avatar: string;
    content: string;
    portfolio_id: number;
  };
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function useHotFeeds() {
  const [feeds, setFeeds] = useState<HotFeed[]>([]);
  useEffect(() => {
    fetch('/api/hot-feeds?limit=3')
      .then(r => r.json())
      .then(json => { if (json.code === 200 && json.data) setFeeds(json.data); })
      .catch(() => {});
  }, []);
  return feeds;
}

export function AnalyticsMockup() {
  const locale = useLocale();
  const { t: tg } = useGoApiLang(locale);
  const feeds = useHotFeeds();

  return (
    <div className="bg-black p-3 sm:p-6">
      {/* Feed header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium">{tg('home.feeds', 'Social Feed')}</div>
        <a
          href={`https://app.mycoindeck.com/${locale}/feeds`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-white"
        >
          {tg('home.viewAllFeeds', 'View all feeds')}
          <ChevronRight className="h-3 w-3" />
        </a>
      </div>

      {/* Feed posts */}
      <div className="space-y-3">
        {feeds.map((item) => {
          const displayContent = item.content || item.original?.content || '';
          const href = `https://app.mycoindeck.com/${locale}/feeds/${item.id}`;

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id}
              className="block rounded-xl border border-border/50 bg-secondary/50 p-4 transition-colors hover:border-[#BA7CFF]/50"
            >
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={item.avatar}
                  alt={item.nickname}
                  className="h-8 w-8 shrink-0 rounded-full bg-[#333] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">@{item.nickname}</span>
                  {item.reshare_id && item.original && (
                    <span className="ml-1 text-xs text-muted-foreground">reshared @{item.original.nickname}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
              </div>
              {displayContent && (
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{displayContent}</p>
              )}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>❤️ {item.likes_count}</span>
                <span>💬 {item.comments_count}</span>
                <span>🔄 {item.reshares_count}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

interface TraderData {
  id: number;
  nickname: string;
  urlname: string;
  portfolioId: number;
  portfolioLabel?: string;
  followers: number;
  winRate: number;
  totalPnl: number;
  totalUsd?: number;
  roi30d: number | null;
  avatar: string;
  pnl: number;
  todayPnL?: number;
  todayPnLRatio?: number;
  startEquity?: number;
  joinDate?: string;
  portfolioCreatedAt?: string;
  chartData?: number[];
  chartDates?: string[];
}

function useTopTraders() {
  const [data, setData] = useState<TraderData[]>([]);
  useEffect(() => {
    fetch('/api/top-traders?limit=10')
      .then(r => r.json())
      .then(json => { if (json.code === 200 && json.data) setData(json.data); })
      .catch(() => {});
  }, []);
  return data;
}

function formatFollowers(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatPnl(n: number) {
  if (Math.abs(n) >= 1000) return (n >= 0 ? '+' : '-') + '$' + (Math.abs(n) / 1000).toFixed(0) + 'K';
  return (n >= 0 ? '+' : '-') + '$' + Math.abs(n).toFixed(0);
}

function traderUrl(trader: TraderData, locale = 'en') {
  const name = trader.urlname || trader.id;
  return `https://app.mycoindeck.com/${locale}/explore/${name}?pid=${trader.portfolioId}`;
}

export function SocialFeedMockup() {
  const t = useTranslations('mockups');
  const locale = useLocale();
  const { t: tg } = useGoApiLang(locale);
  const traders = useTopTraders();

  return (
    <div className="bg-black p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium">{tg('home.topTraders', t('topTraders'))} <span className="text-xs text-muted-foreground">({t('last30Days')})</span></div>
        <a
          href={`https://app.mycoindeck.com/${locale}/explore`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-white"
        >
          {tg('home.exploreAllTraders', 'Explore all traders')}
          <ChevronRight className="h-3 w-3" />
        </a>
      </div>

      {/* Trader cards */}
      <div className="mb-4 max-h-[400px] space-y-3 overflow-y-auto pr-1 sm:[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-white/10 sm:hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {traders.map((trader, i) => (
          <div
            key={`${trader.id}-${i}`}
            className="rounded-xl border border-border/50 bg-secondary/50 p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <a href={traderUrl(trader, locale)} className="shrink-0">
                <img
                  src={trader.avatar}
                  alt={trader.nickname}
                  className="h-10 w-10 shrink-0 rounded-full bg-[#333] object-cover cursor-pointer hover:ring-2 hover:ring-[#BA7CFF]/50 transition-all"
                />
              </a>
              <a href={traderUrl(trader, locale)} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="text-sm font-medium truncate">@{trader.nickname}</div>
                <div className="text-xs text-muted-foreground">{formatFollowers(trader.followers)} {t('followers')}</div>
              </a>
              <a
                href={traderUrl(trader, locale)}
                className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-black transition-opacity hover:opacity-80"
              >
                {t('follow')}
              </a>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">{t('winRate')} </span>
                <span className="font-medium">{trader.winRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('pnl')} </span>
                <span className={`font-medium ${trader.pnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{formatPnl(trader.pnl)}</span>
              </div>
              {trader.roi30d !== null && (
                <div>
                  <span className="text-muted-foreground">ROI </span>
                  <span className={`font-medium ${trader.roi30d >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{trader.roi30d >= 0 ? '+' : ''}{trader.roi30d.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

interface MarketPulse {
  btc: { price: number; change_24h: number };
  fear_and_greed: { value: string; label: string };
}

interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
}

interface NewsItem {
  id: number;
  source_url: string;
  source_name: string;
  title: string;
  image_url: string;
  published_at: string;
}

function fngTextColor(v: number): string {
  if (v <= 25) return 'text-red-500';
  if (v <= 45) return 'text-orange-500';
  if (v <= 55) return 'text-yellow-500';
  if (v <= 75) return 'text-lime-400';
  return 'text-green-500';
}

function formatCoinPrice(price: number | null) {
  if (price === null) return '--';
  if (price >= 1) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + price.toPrecision(4);
}

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function TrendingCoinsScroller({ coins }: { coins: TrendingCoin[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateArrows();
  }, [coins]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {coins.slice(0, 8).map((coin) => {
          const change = coin.price_change_percentage_24h ?? 0;
          return (
            <div
              key={coin.id}
              className="flex w-[88px] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/50 p-3"
            >
              <img src={coin.image} alt={coin.symbol} className="h-8 w-8 rounded-full bg-[#222] object-cover" />
              <div className="w-full truncate text-center text-xs font-medium text-white">{coin.symbol?.toUpperCase()}</div>
              <div className="text-[10px] text-muted-foreground">{formatCoinPrice(coin.current_price)}</div>
              <div className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      {canLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function MarketMockup() {
  const locale = useLocale();
  const { t: tg } = useGoApiLang(locale);
  const [pulse, setPulse] = useState<MarketPulse | null>(null);
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('/api/market-pulse').then(r => r.json()).then(json => {
      if (json.code === 200 && json.data) setPulse(json.data);
    }).catch(() => {});

    fetch('/api/trending-coins?limit=8').then(r => r.json()).then(json => {
      if (Array.isArray(json)) setCoins(json);
    }).catch(() => {});

    fetch(`/api/crypto-news?limit=10&lang=${locale}`).then(r => r.json()).then(json => {
      if (json.code === 200 && json.data) setNews(json.data);
    }).catch(() => {});
  }, [locale]);

  const fngValue = pulse ? parseInt(pulse.fear_and_greed.value) : 0;
  const fngAngle = Math.PI - (fngValue / 100) * Math.PI;
  const needleX = 60 + 40 * Math.cos(fngAngle);
  const needleY = 60 - 40 * Math.sin(fngAngle);

  return (
    <div className="bg-black p-3 sm:p-6">
      {/* Market Pulse */}
      <div className="mb-4">
        <h3 className="mb-3 text-sm font-medium">{tg('home.marketPulse', 'Market Pulse')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Fear & Greed gauge */}
          <div className="flex flex-col items-center rounded-xl border border-border/50 bg-secondary/50 p-3">
            <div className="mb-2 text-xs text-muted-foreground">{tg('home.fearAndGreed', 'Fear & Greed Index')}</div>
            <div className="relative h-[70px] w-[120px]">
              <svg viewBox="0 0 120 65" className="h-full w-full">
                <defs>
                  <linearGradient id="fngGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ea3943" />
                    <stop offset="25%" stopColor="#ea8c00" />
                    <stop offset="50%" stopColor="#f5d100" />
                    <stop offset="75%" stopColor="#93d900" />
                    <stop offset="100%" stopColor="#16c784" />
                  </linearGradient>
                </defs>
                <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="url(#fngGradient)" strokeWidth="10" strokeLinecap="round" />
                {pulse && (
                  <>
                    <line x1="60" y1="60" x2={needleX} y2={needleY} stroke="#9533ba" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="3" fill="#9533ba" />
                  </>
                )}
              </svg>
              {pulse && (
                <div className="absolute inset-x-0 -bottom-1 flex flex-col items-center">
                  <div className={`text-lg font-medium leading-none ${fngTextColor(fngValue)}`}>{fngValue}</div>
                  <div className={`mt-0.5 text-[9px] ${fngTextColor(fngValue)}`}>{pulse.fear_and_greed.label}</div>
                </div>
              )}
            </div>
          </div>

          {/* BTC Price */}
          <div className="flex flex-col items-center rounded-xl border border-border/50 bg-secondary/50 p-3">
            <div className="mb-2 text-xs text-muted-foreground">{tg('home.btcPrice', 'BTC Price')}</div>
            {pulse ? (
              <>
                <div className="mb-1 flex items-center gap-1">
                  <img src="/coins/btc.png" alt="BTC" className="h-5 w-5 rounded-full" />
                  <span className="text-xs font-medium text-white">BTC</span>
                </div>
                <div className="text-xl font-medium text-white">${Math.round(pulse.btc.price).toLocaleString()}</div>
                <div className={`mt-1 text-xs ${pulse.btc.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pulse.btc.change_24h >= 0 ? '+' : ''}{pulse.btc.change_24h.toFixed(2)}%
                  <span className="ml-0.5 text-muted-foreground">24h</span>
                </div>
              </>
            ) : (
              <div className="py-4 text-xs text-muted-foreground">Loading...</div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Coins */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">{tg('home.trendingCoins', 'Trending Coins')}</h3>
          <a
            href={`https://app.mycoindeck.com/${locale}/home/trending-coins`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-white"
          >
            {tg('home.viewAllTrendingCoins', 'View all trending coins')}
            <ChevronRight className="h-3 w-3" />
          </a>
        </div>
        <TrendingCoinsScroller coins={coins} />
      </div>

      {/* Crypto News */}
      <div className="rounded-xl border border-border/50 bg-secondary/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">{tg('home.cryptoNews', 'Crypto News')}</h3>
          <a
            href={`https://app.mycoindeck.com/${locale}/home/news`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-white"
          >
            {tg('home.viewAllNews', 'View all crypto news')}
            <ChevronRight className="h-3 w-3" />
          </a>
        </div>
        <div className="max-h-[300px] overflow-y-auto divide-y divide-border/30 pr-1 sm:[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-white/10 sm:hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          {news.slice(0, 10).map((item) => (
            <a
              key={item.id}
              href={`https://app.mycoindeck.com/${locale}/home/news/${item.id}-${slugify(item.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 py-3 first:pt-0 transition-opacity hover:opacity-80"
            >
              {item.image_url && (
                <img src={item.image_url} alt="" className="h-12 w-16 shrink-0 rounded-md bg-[#222] object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 line-clamp-2 text-xs font-medium text-white">{item.title}</div>
                <div className="text-[10px] text-muted-foreground">
                  {item.source_name} · {daysAgo(item.published_at)}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
