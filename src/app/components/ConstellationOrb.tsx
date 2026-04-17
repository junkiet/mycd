'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
const POINT_COUNT = IS_MOBILE ? 40 : 100;
const SPHERE_RADIUS = IS_MOBILE ? 4.5 : 5;
const LINE_COLOR = 0x7B3F9E;
const NODE_COLOR = 0xAB51C5;
const SPECIAL_COLOR = 0xAB51C5;
const CONNECTION_DISTANCE = IS_MOBILE ? 2.6 : 2.8;
const ORBIT_RADIUS = IS_MOBILE ? 7 : 8;
const TRADER_LIMIT = IS_MOBILE ? 10 : 50;

const EXCHANGE_DATA = [
  { name: 'Binance', avatar: '/exchanges/binance.svg' },
  { name: 'OKX', avatar: '/exchanges/okx.svg' },
  { name: 'Bybit', avatar: '/exchanges/bybit.svg' },
  { name: 'Bitget', avatar: '/exchanges/bitget.svg' },
];

const AVATAR_FILES = [33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52];

interface UserProfile {
  type: 'user';
  name: string;
  avatar: string;
  winRate: string;
  pnl: string;
  volume: string;
  followers: string;
  portfolioLabel?: string;
  urlname?: string;
  uid?: number;
  portfolioId?: number;
  rank?: number; // 1-3 = top trader (gold glow)
}

interface ExchangeInfo {
  type: 'exchange';
  name: string;
  avatar: string;
}

type TooltipData = UserProfile | ExchangeInfo;

const TOOLTIP_DATA: TooltipData[] = [
  // Top 10 Leaderboard Traders (gold glow + crown)
  { type: 'user', name: '@CryptoWhale', avatar: `/avatars/${AVATAR_FILES[0]}.png`, winRate: '78.5%', pnl: '+$245K', volume: '$12.5M', followers: '12.4K', rank: 1 },
  { type: 'user', name: '@DiamondHands', avatar: `/avatars/${AVATAR_FILES[1]}.png`, winRate: '74.2%', pnl: '+$198K', volume: '$9.8M', followers: '8.2K', rank: 2 },
  { type: 'user', name: '@MoonTrader', avatar: `/avatars/${AVATAR_FILES[2]}.png`, winRate: '71.8%', pnl: '+$187K', volume: '$8.4M', followers: '5.7K', rank: 3 },
  { type: 'user', name: '@BullMarket', avatar: `/avatars/${AVATAR_FILES[3]}.png`, winRate: '69.3%', pnl: '+$145K', volume: '$7.2M', followers: '4.1K', rank: 4 },
  { type: 'user', name: '@TraderPro', avatar: `/avatars/${AVATAR_FILES[4]}.png`, winRate: '68.7%', pnl: '+$134K', volume: '$6.8M', followers: '3.8K', rank: 5 },
  { type: 'user', name: '@CoinMaster', avatar: `/avatars/${AVATAR_FILES[5]}.png`, winRate: '67.4%', pnl: '+$125K', volume: '$6.1M', followers: '3.2K', rank: 6 },
  { type: 'user', name: '@SatoshiFan', avatar: `/avatars/${AVATAR_FILES[7]}.png`, winRate: '65.2%', pnl: '+$109K', volume: '$5.5M', followers: '2.5K', rank: 7 },
  { type: 'user', name: '@DeFiKing', avatar: `/avatars/${AVATAR_FILES[9]}.png`, winRate: '63.5%', pnl: '+$87K', volume: '$4.2M', followers: '1.8K', rank: 8 },
  { type: 'user', name: '@WhaleAlert', avatar: `/avatars/${AVATAR_FILES[11]}.png`, winRate: '61.3%', pnl: '+$65K', volume: '$3.5M', followers: '1.2K', rank: 9 },
  { type: 'user', name: '@LongKing', avatar: `/avatars/${AVATAR_FILES[12]}.png`, winRate: '60.1%', pnl: '+$58K', volume: '$3.1M', followers: '980', rank: 10 },
  // Other profitable traders (green glow)
  { type: 'user', name: '@ScalpQueen', avatar: `/avatars/${AVATAR_FILES[13]}.png`, winRate: '59.4%', pnl: '+$47K', volume: '$2.8M', followers: '870' },
  { type: 'user', name: '@GemHunter', avatar: `/avatars/${AVATAR_FILES[16]}.png`, winRate: '58.1%', pnl: '+$41K', volume: '$2.5M', followers: '760' },
  { type: 'user', name: '@SwingKing', avatar: `/avatars/${AVATAR_FILES[17]}.png`, winRate: '57.3%', pnl: '+$36K', volume: '$2.2M', followers: '690' },
  { type: 'user', name: '@AltSeason', avatar: `/avatars/${AVATAR_FILES[18]}.png`, winRate: '56.8%', pnl: '+$32K', volume: '$1.9M', followers: '580' },
  { type: 'user', name: '@BTCMaxi', avatar: `/avatars/${AVATAR_FILES[19]}.png`, winRate: '55.4%', pnl: '+$28K', volume: '$1.7M', followers: '510' },
  { type: 'user', name: '@NightOwl', avatar: `/avatars/${AVATAR_FILES[0]}.png`, winRate: '54.9%', pnl: '+$25K', volume: '$1.5M', followers: '480' },
  { type: 'user', name: '@SnipeBot', avatar: `/avatars/${AVATAR_FILES[1]}.png`, winRate: '54.2%', pnl: '+$23K', volume: '$1.4M', followers: '440' },
  { type: 'user', name: '@LeverKing', avatar: `/avatars/${AVATAR_FILES[2]}.png`, winRate: '53.6%', pnl: '+$21K', volume: '$1.3M', followers: '410' },
  { type: 'user', name: '@TrendRider', avatar: `/avatars/${AVATAR_FILES[3]}.png`, winRate: '53.1%', pnl: '+$19K', volume: '$1.2M', followers: '380' },
  { type: 'user', name: '@FibMaster', avatar: `/avatars/${AVATAR_FILES[4]}.png`, winRate: '52.5%', pnl: '+$17K', volume: '$1.1M', followers: '350' },
  { type: 'user', name: '@OnChainPro', avatar: `/avatars/${AVATAR_FILES[5]}.png`, winRate: '52.0%', pnl: '+$15K', volume: '$980K', followers: '320' },
  { type: 'user', name: '@DipBuyer', avatar: `/avatars/${AVATAR_FILES[7]}.png`, winRate: '51.4%', pnl: '+$14K', volume: '$920K', followers: '290' },
  { type: 'user', name: '@MomentumX', avatar: `/avatars/${AVATAR_FILES[9]}.png`, winRate: '51.0%', pnl: '+$12K', volume: '$870K', followers: '260' },
  { type: 'user', name: '@GridBot', avatar: `/avatars/${AVATAR_FILES[11]}.png`, winRate: '50.5%', pnl: '+$11K', volume: '$810K', followers: '240' },
  { type: 'user', name: '@ArbiKing', avatar: `/avatars/${AVATAR_FILES[12]}.png`, winRate: '50.1%', pnl: '+$9K', volume: '$750K', followers: '220' },
  { type: 'user', name: '@VolumeHunter', avatar: `/avatars/${AVATAR_FILES[13]}.png`, winRate: '49.8%', pnl: '+$8K', volume: '$700K', followers: '200' },
  { type: 'user', name: '@RsiTrader', avatar: `/avatars/${AVATAR_FILES[16]}.png`, winRate: '49.3%', pnl: '+$7K', volume: '$650K', followers: '185' },
  { type: 'user', name: '@MacdPro', avatar: `/avatars/${AVATAR_FILES[17]}.png`, winRate: '48.9%', pnl: '+$6K', volume: '$600K', followers: '170' },
  { type: 'user', name: '@BollingerX', avatar: `/avatars/${AVATAR_FILES[18]}.png`, winRate: '48.5%', pnl: '+$5K', volume: '$550K', followers: '155' },
  { type: 'user', name: '@IchimokuFan', avatar: `/avatars/${AVATAR_FILES[19]}.png`, winRate: '48.1%', pnl: '+$4K', volume: '$500K', followers: '140' },
  { type: 'user', name: '@EmaKing', avatar: `/avatars/${AVATAR_FILES[0]}.png`, winRate: '47.8%', pnl: '+$3.5K', volume: '$460K', followers: '125' },
  { type: 'user', name: '@OrderFlow', avatar: `/avatars/${AVATAR_FILES[1]}.png`, winRate: '47.4%', pnl: '+$3K', volume: '$420K', followers: '115' },
  { type: 'user', name: '@DeltaTrader', avatar: `/avatars/${AVATAR_FILES[2]}.png`, winRate: '47.0%', pnl: '+$2.5K', volume: '$380K', followers: '105' },
  { type: 'user', name: '@HeatmapGod', avatar: `/avatars/${AVATAR_FILES[3]}.png`, winRate: '46.7%', pnl: '+$2K', volume: '$350K', followers: '95' },
  { type: 'user', name: '@WickCatcher', avatar: `/avatars/${AVATAR_FILES[4]}.png`, winRate: '46.3%', pnl: '+$1.8K', volume: '$320K', followers: '88' },
  { type: 'user', name: '@BreakoutBro', avatar: `/avatars/${AVATAR_FILES[5]}.png`, winRate: '46.0%', pnl: '+$1.5K', volume: '$290K', followers: '80' },
  { type: 'user', name: '@SupportLine', avatar: `/avatars/${AVATAR_FILES[7]}.png`, winRate: '45.7%', pnl: '+$1.2K', volume: '$260K', followers: '72' },
  { type: 'user', name: '@ResistBreak', avatar: `/avatars/${AVATAR_FILES[9]}.png`, winRate: '45.3%', pnl: '+$1K', volume: '$240K', followers: '65' },
  { type: 'user', name: '@FundingRate', avatar: `/avatars/${AVATAR_FILES[11]}.png`, winRate: '45.0%', pnl: '+$800', volume: '$210K', followers: '58' },
  { type: 'user', name: '@OpenInterest', avatar: `/avatars/${AVATAR_FILES[12]}.png`, winRate: '44.7%', pnl: '+$600', volume: '$190K', followers: '52' },
  { type: 'user', name: '@LiqMap', avatar: `/avatars/${AVATAR_FILES[13]}.png`, winRate: '44.3%', pnl: '+$500', volume: '$170K', followers: '48' },
  { type: 'user', name: '@CVDTrader', avatar: `/avatars/${AVATAR_FILES[16]}.png`, winRate: '44.0%', pnl: '+$450', volume: '$155K', followers: '44' },
  { type: 'user', name: '@VWAPKing', avatar: `/avatars/${AVATAR_FILES[17]}.png`, winRate: '43.7%', pnl: '+$400', volume: '$140K', followers: '40' },
  { type: 'user', name: '@TapeReader', avatar: `/avatars/${AVATAR_FILES[18]}.png`, winRate: '43.3%', pnl: '+$350', volume: '$125K', followers: '36' },
  { type: 'user', name: '@FootprintX', avatar: `/avatars/${AVATAR_FILES[19]}.png`, winRate: '43.0%', pnl: '+$300', volume: '$110K', followers: '33' },
  { type: 'user', name: '@CumDelta', avatar: `/avatars/${AVATAR_FILES[0]}.png`, winRate: '42.7%', pnl: '+$280', volume: '$100K', followers: '30' },
  { type: 'user', name: '@POCTrader', avatar: `/avatars/${AVATAR_FILES[1]}.png`, winRate: '42.3%', pnl: '+$250', volume: '$90K', followers: '28' },
  { type: 'user', name: '@VAHunter', avatar: `/avatars/${AVATAR_FILES[2]}.png`, winRate: '42.0%', pnl: '+$220', volume: '$82K', followers: '25' },
  { type: 'user', name: '@TPOCharter', avatar: `/avatars/${AVATAR_FILES[3]}.png`, winRate: '41.7%', pnl: '+$200', volume: '$75K', followers: '23' },
  { type: 'user', name: '@MicroScalp', avatar: `/avatars/${AVATAR_FILES[4]}.png`, winRate: '41.3%', pnl: '+$180', volume: '$68K', followers: '21' },
  { type: 'user', name: '@NanoTrade', avatar: `/avatars/${AVATAR_FILES[5]}.png`, winRate: '41.0%', pnl: '+$160', volume: '$62K', followers: '19' },
  { type: 'user', name: '@PivotPro', avatar: `/avatars/${AVATAR_FILES[7]}.png`, winRate: '40.7%', pnl: '+$140', volume: '$56K', followers: '17' },
  { type: 'user', name: '@GapFiller', avatar: `/avatars/${AVATAR_FILES[9]}.png`, winRate: '40.3%', pnl: '+$120', volume: '$50K', followers: '15' },
  { type: 'user', name: '@RangePlay', avatar: `/avatars/${AVATAR_FILES[11]}.png`, winRate: '40.0%', pnl: '+$100', volume: '$45K', followers: '13' },
  { type: 'user', name: '@SpreadKing', avatar: `/avatars/${AVATAR_FILES[12]}.png`, winRate: '39.7%', pnl: '+$90', volume: '$40K', followers: '12' },
  { type: 'user', name: '@HedgeFund', avatar: `/avatars/${AVATAR_FILES[13]}.png`, winRate: '39.3%', pnl: '+$80', volume: '$36K', followers: '11' },
  { type: 'user', name: '@PairTrade', avatar: `/avatars/${AVATAR_FILES[16]}.png`, winRate: '39.0%', pnl: '+$70', volume: '$32K', followers: '10' },
  { type: 'user', name: '@StatArb', avatar: `/avatars/${AVATAR_FILES[17]}.png`, winRate: '38.7%', pnl: '+$60', volume: '$28K', followers: '9' },
  { type: 'user', name: '@MeanRevert', avatar: `/avatars/${AVATAR_FILES[18]}.png`, winRate: '38.3%', pnl: '+$50', volume: '$25K', followers: '8' },
  // Loss traders (red glow)
  { type: 'user', name: '@CryptoKing', avatar: `/avatars/${AVATAR_FILES[6]}.png`, winRate: '42.1%', pnl: '-$34K', volume: '$5.9M', followers: '2.9K' },
  { type: 'user', name: '@AlphaTrader', avatar: `/avatars/${AVATAR_FILES[8]}.png`, winRate: '38.5%', pnl: '-$52K', volume: '$4.8M', followers: '2.1K' },
  { type: 'user', name: '@ChartMaster', avatar: `/avatars/${AVATAR_FILES[10]}.png`, winRate: '45.2%', pnl: '-$18K', volume: '$3.9M', followers: '1.5K' },
  { type: 'user', name: '@YoloSwap', avatar: `/avatars/${AVATAR_FILES[14]}.png`, winRate: '35.8%', pnl: '-$67K', volume: '$2.4M', followers: '650' },
  { type: 'user', name: '@PaperHands', avatar: `/avatars/${AVATAR_FILES[15]}.png`, winRate: '40.3%', pnl: '-$29K', volume: '$1.9M', followers: '420' },
  { type: 'user', name: '@FomoKing', avatar: `/avatars/${AVATAR_FILES[6]}.png`, winRate: '39.1%', pnl: '-$42K', volume: '$3.2M', followers: '380' },
  { type: 'user', name: '@LiqHunted', avatar: `/avatars/${AVATAR_FILES[8]}.png`, winRate: '37.4%', pnl: '-$61K', volume: '$2.8M', followers: '310' },
  { type: 'user', name: '@RevengeTrader', avatar: `/avatars/${AVATAR_FILES[10]}.png`, winRate: '36.2%', pnl: '-$78K', volume: '$4.1M', followers: '250' },
  { type: 'user', name: '@OverLever', avatar: `/avatars/${AVATAR_FILES[14]}.png`, winRate: '34.8%', pnl: '-$95K', volume: '$3.5M', followers: '190' },
  { type: 'user', name: '@MarginCall', avatar: `/avatars/${AVATAR_FILES[15]}.png`, winRate: '33.5%', pnl: '-$112K', volume: '$2.9M', followers: '150' },
  { type: 'user', name: '@TopSignal', avatar: `/avatars/${AVATAR_FILES[6]}.png`, winRate: '32.1%', pnl: '-$88K', volume: '$2.5M', followers: '130' },
  { type: 'user', name: '@BottomSell', avatar: `/avatars/${AVATAR_FILES[8]}.png`, winRate: '31.4%', pnl: '-$73K', volume: '$2.2M', followers: '110' },
  { type: 'user', name: '@StopLoss404', avatar: `/avatars/${AVATAR_FILES[10]}.png`, winRate: '30.8%', pnl: '-$64K', volume: '$1.8M', followers: '95' },
  { type: 'user', name: '@HopiumMax', avatar: `/avatars/${AVATAR_FILES[14]}.png`, winRate: '29.5%', pnl: '-$56K', volume: '$1.5M', followers: '80' },
  { type: 'user', name: '@CatchKnife', avatar: `/avatars/${AVATAR_FILES[15]}.png`, winRate: '28.2%', pnl: '-$48K', volume: '$1.3M', followers: '68' },
  { type: 'user', name: '@BagHolder', avatar: `/avatars/${AVATAR_FILES[6]}.png`, winRate: '27.6%', pnl: '-$41K', volume: '$1.1M', followers: '55' },
  { type: 'user', name: '@RugPulled', avatar: `/avatars/${AVATAR_FILES[8]}.png`, winRate: '26.3%', pnl: '-$35K', volume: '$950K', followers: '45' },
  { type: 'user', name: '@MaxPain', avatar: `/avatars/${AVATAR_FILES[10]}.png`, winRate: '25.8%', pnl: '-$30K', volume: '$820K', followers: '38' },
  { type: 'user', name: '@Rekt420', avatar: `/avatars/${AVATAR_FILES[14]}.png`, winRate: '24.1%', pnl: '-$25K', volume: '$700K', followers: '30' },
  { type: 'user', name: '@LiqWick', avatar: `/avatars/${AVATAR_FILES[15]}.png`, winRate: '23.5%', pnl: '-$22K', volume: '$600K', followers: '25' },
];

function formatK(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toFixed(0);
}

function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const spread = 0.8 + Math.random() * 0.4;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius * spread,
        y * radius * spread,
        Math.sin(theta) * r * radius * spread,
      ),
    );
  }
  return points;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: TooltipData | null;
}

interface LiveTrader {
  id: number;
  nickname: string;
  urlname: string;
  portfolioId: number;
  portfolioLabel?: string;
  avatar: string;
  winRate: number;
  pnl: number;
  totalPnl: number;
  followers: number;
  roi30d: number | null;
}

export function ConstellationOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, data: null });
  const [liveTraders, setLiveTraders] = useState<UserProfile[] | null>(null);

  // Fetch real traders data sorted by joinDate (newest first)
  useEffect(() => {
    fetch(`/api/top-traders?limit=${TRADER_LIMIT}`)
      .then(r => r.json())
      .then(json => {
        if (json.code === 200 && Array.isArray(json.data)) {
          const traders: UserProfile[] = json.data.map((t: LiveTrader, idx: number) => ({
            type: 'user' as const,
            name: '@' + (t.nickname || t.urlname || `user${t.id}`),
            avatar: t.avatar,
            winRate: (t.winRate ?? 0).toFixed(1) + '%',
            pnl: (t.pnl ?? 0) >= 0 ? '+$' + formatK(t.pnl) : '-$' + formatK(Math.abs(t.pnl)),
            volume: '$' + formatK(t.totalPnl ?? 0),
            followers: formatK(t.followers ?? 0),
            portfolioLabel: t.portfolioLabel,
            urlname: t.urlname,
            uid: t.id,
            portfolioId: t.portfolioId,
            rank: idx < 10 ? idx + 1 : undefined,
          }));
          setLiveTraders(traders);
        } else {
          setLiveTraders(TOOLTIP_DATA.filter(d => d.type === 'user') as UserProfile[]);
        }
      })
      .catch(() => setLiveTraders(TOOLTIP_DATA.filter(d => d.type === 'user') as UserProfile[]));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!liveTraders) return;

    const activeTraders = liveTraders.length > 0 ? liveTraders : (TOOLTIP_DATA.filter(d => d.type === 'user') as UserProfile[]);
    const specialCount = activeTraders.length;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, IS_MOBILE ? 21 : 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.3;
    // Disable manual rotation on mobile so page can scroll through the orb
    if (IS_MOBILE) {
      controls.enableRotate = false;
    }

    // Generate points on a fibonacci sphere
    const points = fibonacciSphere(POINT_COUNT, SPHERE_RADIUS);

    // Pick special nodes
    const specialIndices = new Set<number>();
    while (specialIndices.size < specialCount) {
      specialIndices.add(Math.floor(Math.random() * POINT_COUNT));
    }

    // Map special indices to tooltip data (live traders)
    const specialIndexArray = Array.from(specialIndices);
    const dataMap = new Map<number, TooltipData>();
    specialIndexArray.forEach((idx, i) => {
      dataMap.set(idx, activeTraders[i % activeTraders.length]);
    });

    // Load exchange logo textures at high resolution via Image → Canvas
    const exchangeTextures: Record<string, THREE.Texture> = {};
    const texSize = 256;
    const loadSvgTexture = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = texSize;
          c.height = texSize;
          const ctx2 = c.getContext('2d')!;
          const scale = Math.min(texSize / img.width, texSize / img.height) * 0.8;
          const w = img.width * scale;
          const h = img.height * scale;
          ctx2.drawImage(img, (texSize - w) / 2, (texSize - h) / 2, w, h);
          const tex = new THREE.CanvasTexture(c);
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          exchangeTextures[url] = tex;
          resolve();
        };
        img.src = url;
      });
    };
    // Outer counter-rotating ring for exchanges
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = 0.3; // slight tilt

    // Glowing ring track with gradient opacity
    const ringSegments = 256;
    const ringPositions: number[] = [];
    const ringColors: number[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const angle = (i / ringSegments) * Math.PI * 2;
      ringPositions.push(Math.cos(angle) * ORBIT_RADIUS, 0, Math.sin(angle) * ORBIT_RADIUS);
      // Fade opacity along the ring for a comet-trail look
      const fade = 0.5 + 0.5 * Math.sin(angle * 2);
      ringColors.push(0.67 * fade, 0.32 * fade, 0.77 * fade); // purple RGB
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPositions, 3));
    ringGeo.setAttribute('color', new THREE.Float32BufferAttribute(ringColors, 3));
    const ringMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 });
    orbitGroup.add(new THREE.LineLoop(ringGeo, ringMat));

    // Inner glow ring (wider, softer)
    const glowRingGeo = new THREE.BufferGeometry();
    glowRingGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPositions, 3));
    glowRingGeo.setAttribute('color', new THREE.Float32BufferAttribute(ringColors, 3));
    const glowRingMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.1 });
    const glowRing = new THREE.LineLoop(glowRingGeo, glowRingMat);
    glowRing.scale.set(1.02, 1.02, 1.02);
    orbitGroup.add(glowRing);

    // Exchange sprites on the outer ring
    const orbitBgSprites: THREE.Sprite[] = [];
    const orbitLogoSprites: THREE.Sprite[] = [];

    EXCHANGE_DATA.forEach(() => {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 64;
      bgCanvas.height = 64;
      const ctx = bgCanvas.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
      const bgTex = new THREE.CanvasTexture(bgCanvas);
      const bgMat = new THREE.SpriteMaterial({ map: bgTex, transparent: true, depthTest: false });
      const bgSprite = new THREE.Sprite(bgMat);
      bgSprite.scale.set(1.3, 1.3, 1.3);
      bgSprite.renderOrder = 3;
      orbitGroup.add(bgSprite);
      orbitBgSprites.push(bgSprite);

      const logoMat = new THREE.SpriteMaterial({ transparent: true, opacity: 1.0, depthTest: false });
      const logoSprite = new THREE.Sprite(logoMat);
      logoSprite.scale.set(0.85, 0.85, 0.85);
      logoSprite.renderOrder = 4;
      orbitGroup.add(logoSprite);
      orbitLogoSprites.push(logoSprite);
    });

    Promise.all([
      loadSvgTexture('/exchanges/binance.svg'),
      loadSvgTexture('/exchanges/okx.svg'),
      loadSvgTexture('/exchanges/bybit.svg'),
      loadSvgTexture('/exchanges/bitget.svg'),
    ]).then(() => {
      EXCHANGE_DATA.forEach((ex, ei) => {
        if (exchangeTextures[ex.avatar]) {
          (orbitLogoSprites[ei].material as THREE.SpriteMaterial).map = exchangeTextures[ex.avatar];
          (orbitLogoSprites[ei].material as THREE.SpriteMaterial).needsUpdate = true;
        }
      });
    });

    // Create node meshes
    const nodes: THREE.Mesh[] = [];
    const specialMeshes: THREE.Mesh[] = [];
    const exchangeSprites: THREE.Sprite[] = [];
    const group = new THREE.Group();

    points.forEach((point, i) => {
      const isSpecial = specialIndices.has(i);
      const data = dataMap.get(i);

      // User profile nodes: use avatar sprite with glow + dark bg
      if (isSpecial && data && data.type === 'user') {
        const isTopTrader = data.rank === 1;
        const isProfit = data.pnl.startsWith('+');
        // Gold for top traders, green for profit, red for loss
        const glowR = isTopTrader ? 255 : isProfit ? 34 : 220;
        const glowG = isTopTrader ? 195 : isProfit ? 197 : 20;
        const glowB = isTopTrader ? 0 : isProfit ? 94 : 20;

        // Glow sprite — gold gets full glow effect, red/green get plain ring
        const glowCanvas = document.createElement('canvas');
        const gSz = isTopTrader ? 256 : 128;
        glowCanvas.width = gSz;
        glowCanvas.height = gSz;
        const ctxGlow = glowCanvas.getContext('2d')!;
        const cx = gSz / 2;

        if (isTopTrader) {
          // Gold: full layered glow effect
          const outerGrad = ctxGlow.createRadialGradient(cx, cx, gSz * 0.15, cx, cx, cx);
          outerGrad.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, 0.35)`);
          outerGrad.addColorStop(0.3, `rgba(${glowR}, ${glowG}, ${glowB}, 0.12)`);
          outerGrad.addColorStop(0.6, `rgba(${glowR}, ${glowG}, ${glowB}, 0.03)`);
          outerGrad.addColorStop(1, `rgba(${glowR}, ${glowG}, ${glowB}, 0)`);
          ctxGlow.beginPath();
          ctxGlow.arc(cx, cx, cx, 0, Math.PI * 2);
          ctxGlow.fillStyle = outerGrad;
          ctxGlow.fill();
          ctxGlow.beginPath();
          ctxGlow.arc(cx, cx, gSz * 0.18, 0, Math.PI * 2);
          ctxGlow.strokeStyle = `rgba(${glowR}, ${glowG}, ${glowB}, 0.7)`;
          ctxGlow.lineWidth = 6;
          ctxGlow.stroke();
          const coreGrad = ctxGlow.createRadialGradient(cx, cx, 0, cx, cx, gSz * 0.12);
          coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
          coreGrad.addColorStop(0.5, `rgba(${glowR}, ${glowG}, ${glowB}, 0.1)`);
          coreGrad.addColorStop(1, `rgba(${glowR}, ${glowG}, ${glowB}, 0)`);
          ctxGlow.beginPath();
          ctxGlow.arc(cx, cx, gSz * 0.12, 0, Math.PI * 2);
          ctxGlow.fillStyle = coreGrad;
          ctxGlow.fill();
        } else {
          // Red/Green: simple colored ring, no glow
          ctxGlow.beginPath();
          ctxGlow.arc(cx, cx, gSz * 0.35, 0, Math.PI * 2);
          ctxGlow.strokeStyle = `rgb(${glowR}, ${glowG}, ${glowB})`;
          ctxGlow.lineWidth = 3;
          ctxGlow.stroke();
        }

        const glowTex = new THREE.CanvasTexture(glowCanvas);
        glowTex.minFilter = THREE.LinearFilter;
        glowTex.magFilter = THREE.LinearFilter;
        const glowSpriteMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthTest: false });
        const glowSprite = new THREE.Sprite(glowSpriteMat);
        glowSprite.position.copy(point);
        const rank = data.rank ?? 99;
        const glowSize = rank === 1 ? 1.4 : rank === 2 ? 1.0 : rank === 3 ? 0.8 : 0.5;
        glowSprite.scale.set(glowSize, glowSize, glowSize);
        glowSprite.renderOrder = 0;
        glowSprite.userData = { isGlow: true, isTopTrader: !!isTopTrader, baseGlowScale: glowSize };
        group.add(glowSprite);

        // Dark circular background
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 64;
        bgCanvas.height = 64;
        const ctxBg = bgCanvas.getContext('2d')!;
        ctxBg.beginPath();
        ctxBg.arc(32, 32, 32, 0, Math.PI * 2);
        ctxBg.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctxBg.fill();
        const bgTex = new THREE.CanvasTexture(bgCanvas);
        const bgSpriteMat = new THREE.SpriteMaterial({ map: bgTex, transparent: true, depthTest: false });
        const bgSprite = new THREE.Sprite(bgSpriteMat);
        bgSprite.position.copy(point);
        bgSprite.scale.set(0.35, 0.35, 0.35);
        bgSprite.renderOrder = 1;
        group.add(bgSprite);

        // Avatar sprite (loaded async)
        const avatarMat = new THREE.SpriteMaterial({ transparent: true, opacity: 1.0, depthTest: false });
        const avatarSprite = new THREE.Sprite(avatarMat);
        avatarSprite.position.copy(point);
        avatarSprite.scale.set(0.28, 0.28, 0.28);
        avatarSprite.renderOrder = 2;
        const avatarSize = rank === 1 ? 0.44 : rank === 2 ? 0.30 : rank === 3 ? 0.24 : 0.18;
        const bgSize = rank === 1 ? 0.54 : rank === 2 ? 0.38 : rank === 3 ? 0.30 : 0.24;
        avatarSprite.scale.set(avatarSize, avatarSize, avatarSize);
        bgSprite.scale.set(bgSize, bgSize, bgSize);
        avatarSprite.userData = { index: i, isSpecial: true, targetScale: 1, bgSprite, glowSprite, baseScale: avatarSize, baseBgScale: bgSize, baseGlowScale: glowSize, crownSprite: null as THREE.Sprite | null };
        group.add(avatarSprite);

        // Crown sprite for top traders (VIP)
        if (isTopTrader) {
          const crownCanvas = document.createElement('canvas');
          crownCanvas.width = 64;
          crownCanvas.height = 64;
          const ctxCrown = crownCanvas.getContext('2d')!;
          // Draw crown shape
          ctxCrown.fillStyle = '#FFD700';
          ctxCrown.beginPath();
          ctxCrown.moveTo(8, 48);
          ctxCrown.lineTo(14, 20);
          ctxCrown.lineTo(24, 34);
          ctxCrown.lineTo(32, 12);
          ctxCrown.lineTo(40, 34);
          ctxCrown.lineTo(50, 20);
          ctxCrown.lineTo(56, 48);
          ctxCrown.closePath();
          ctxCrown.fill();
          // Gold outline
          ctxCrown.strokeStyle = '#B8860B';
          ctxCrown.lineWidth = 2;
          ctxCrown.stroke();
          // Jewels
          ctxCrown.fillStyle = '#FF4444';
          ctxCrown.beginPath(); ctxCrown.arc(32, 22, 3, 0, Math.PI * 2); ctxCrown.fill();
          ctxCrown.fillStyle = '#4488FF';
          ctxCrown.beginPath(); ctxCrown.arc(22, 30, 2, 0, Math.PI * 2); ctxCrown.fill();
          ctxCrown.beginPath(); ctxCrown.arc(42, 30, 2, 0, Math.PI * 2); ctxCrown.fill();

          const crownTex = new THREE.CanvasTexture(crownCanvas);
          crownTex.minFilter = THREE.LinearFilter;
          const crownMat = new THREE.SpriteMaterial({ map: crownTex, transparent: true, depthTest: false });
          const crownSprite = new THREE.Sprite(crownMat);
          crownSprite.position.copy(point);
          crownSprite.position.y += avatarSize * 0.7;
          crownSprite.scale.set(0.22, 0.22, 0.22);
          crownSprite.renderOrder = 5;
          crownSprite.userData = { baseOffset: avatarSize * 0.7 };
          group.add(crownSprite);
          avatarSprite.userData.crownSprite = crownSprite;
        }

        // Load avatar image as circular texture
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const c = document.createElement('canvas');
          const sz = 128;
          c.width = sz;
          c.height = sz;
          const ctxA = c.getContext('2d')!;
          ctxA.beginPath();
          ctxA.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2);
          ctxA.clip();
          ctxA.drawImage(img, 0, 0, sz, sz);
          const tex = new THREE.CanvasTexture(c);
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          avatarMat.map = tex;
          avatarMat.needsUpdate = true;
        };
        img.src = data.avatar.startsWith('http')
          ? `/api/avatar?url=${encodeURIComponent(data.avatar)}`
          : data.avatar;

        // Hit mesh for raycasting
        const hitGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.position.copy(point);
        hitMesh.userData = { index: i, isSpecial: true, targetScale: 1 };
        group.add(hitMesh);
        nodes.push(hitMesh);
        specialMeshes.push(hitMesh);
        exchangeSprites.push(avatarSprite);
        return;
      }

      // Regular (non-special) nodes
      const size = 0.04;
      const geo = new THREE.SphereGeometry(size, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: NODE_COLOR,
        transparent: true,
        opacity: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(point);
      mesh.userData = { index: i, isSpecial: false, targetScale: 1 };
      group.add(mesh);
      nodes.push(mesh);
    });

    // Create connections between nearby points
    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const baseColor = new THREE.Color(LINE_COLOR);
    const specialColorObj = new THREE.Color(SPECIAL_COLOR);

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < CONNECTION_DISTANCE) {
          linePositions.push(points[i].x, points[i].y, points[i].z);
          linePositions.push(points[j].x, points[j].y, points[j].z);

          const bothSpecial = specialIndices.has(i) && specialIndices.has(j);
          const oneSpecial = specialIndices.has(i) || specialIndices.has(j);
          const color = bothSpecial
            ? specialColorObj
            : oneSpecial
              ? new THREE.Color().lerpColors(baseColor, specialColorObj, 0.3)
              : baseColor;

          lineColors.push(color.r, color.g, color.b);
          lineColors.push(color.r, color.g, color.b);
        }
      }
    }

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: IS_MOBILE ? 0.85 : 0.65,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Store original colors and line point indices for depth fading
    const originalColors = new Float32Array(lineColors);
    const lineColorAttr = lineGeo.getAttribute('color') as THREE.BufferAttribute;

    // Add a subtle glow sphere
    const glowGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 1.05, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: SPECIAL_COLOR,
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide,
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    scene.add(group);
    scene.add(orbitGroup);

    // Invisible larger hit targets for touch/click on special nodes
    const hitMeshes: THREE.Mesh[] = [];
    specialMeshes.forEach((mesh) => {
      const hitGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(mesh.position);
      hitMesh.userData = mesh.userData;
      group.add(hitMesh);
      hitMeshes.push(hitMesh);
    });

    // Raycaster for hover/touch detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode: THREE.Mesh | null = null;
    let hoveredSprite: THREE.Sprite | null = null;
    const defaultAutoRotateSpeed = 1.2;
    // Map hit mesh index to exchange sprite
    const spriteByIndex = new Map<number, THREE.Sprite>();
    exchangeSprites.forEach((s) => spriteByIndex.set(s.userData.index, s));
    let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearHover = () => {
      if (hoveredNode) {
        hoveredNode.userData.targetScale = 1;
        hoveredNode = null;
      }
      if (hoveredSprite) {
        hoveredSprite.userData.targetScale = 1;
        hoveredSprite = null;
      }
      controls.autoRotateSpeed = defaultAutoRotateSpeed;
      renderer.domElement.style.cursor = 'grab';
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    const handleHit = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitMeshes);

      if (intersects.length > 0) {
        const hitTarget = intersects[0].object as THREE.Mesh;
        const idx = hitTarget.userData.index;
        const matchedNode = specialMeshes.find(m => m.userData.index === idx);
        if (matchedNode && hoveredNode !== matchedNode) {
          if (hoveredNode) hoveredNode.userData.targetScale = 1;
          if (hoveredSprite) hoveredSprite.userData.targetScale = 1;
          hoveredNode = matchedNode;
          hoveredNode.userData.targetScale = 2.5;
          // Scale up exchange sprite on hover
          const sprite = spriteByIndex.get(idx);
          if (sprite) {
            sprite.userData.targetScale = 1.8;
            hoveredSprite = sprite;
          } else {
            hoveredSprite = null;
          }
          controls.autoRotateSpeed = 0.15;
          renderer.domElement.style.cursor = 'pointer';
        }
        const data = dataMap.get(hitTarget.userData.index) || null;
        // Show small tooltip on hover for all nodes
        setTooltip({ visible: true, x: clientX - rect.left, y: clientY - rect.top, data });
        return true;
      }
      return false;
    };

    // Change cursor on hover (no tooltip, just visual feedback)
    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitMeshes);
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    };

    // Click to show sticky popover
    const onClick = (e: MouseEvent) => {
      if (!handleHit(e.clientX, e.clientY)) {
        clearHover();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (handleHit(touch.clientX, touch.clientY)) {
        e.stopPropagation();
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });

    // Animation
    let animId: number;
    let frameCount = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frameCount++;
      controls.update();
      const time = Date.now() * 0.001;
      nodes.forEach((node) => {
        if (node.userData.isSpecial) {
          const pulse = 1 + 0.3 * Math.sin(time * 1.5 + node.userData.index);
          const target = node.userData.targetScale * pulse;
          const current = node.scale.x;
          node.scale.setScalar(current + (target - current) * 0.15);
        }
      });
      // Sync all special sprites and bg
      exchangeSprites.forEach((sprite) => {
        const target = sprite.userData.targetScale || 1;
        const pulse = 1 + 0.1 * Math.sin(time * 1.2 + sprite.userData.index);
        const baseLogoSize = sprite.userData.baseScale || 0.75;
        const baseBgSize = sprite.userData.baseBgScale || 1.2;
        const logoBase = baseLogoSize * target * pulse;
        const currentLogo = sprite.scale.x;
        const logoScale = currentLogo + (logoBase - currentLogo) * 0.12;
        sprite.scale.set(logoScale, logoScale, logoScale);
        if (sprite.userData.bgSprite) {
          const bgBase = baseBgSize * target * pulse;
          const currentBg = sprite.userData.bgSprite.scale.x;
          const bgScale = currentBg + (bgBase - currentBg) * 0.12;
          sprite.userData.bgSprite.scale.set(bgScale, bgScale, bgScale);
        }
        if (sprite.userData.crownSprite) {
          const cs = sprite.userData.crownSprite;
          cs.position.copy(sprite.position);
          cs.position.y += cs.userData.baseOffset * logoScale / (sprite.userData.baseScale || 0.32);
          const crownScale = 0.22 * logoScale / (sprite.userData.baseScale || 0.32);
          cs.scale.set(crownScale, crownScale, crownScale);
        }
        if (sprite.userData.glowSprite) {
          const isGold = sprite.userData.glowSprite.userData.isTopTrader;
          const glowPulse = isGold ? 1 + 0.35 * Math.sin(time * 1.8 + (sprite.userData.index || 0) * 0.7) : 1;
          const baseGlow = sprite.userData.baseGlowScale || 0.85;
          const glowBase = baseGlow * target * glowPulse;
          const currentGlow = sprite.userData.glowSprite.scale.x;
          const gs = currentGlow + (glowBase - currentGlow) * 0.1;
          sprite.userData.glowSprite.scale.set(gs, gs, gs);
        }
      });

      // Animate outer exchange ring (spins opposite to orb)
      const exchangeAngles: number[] = [];
      const camWorldPos = new THREE.Vector3();
      camera.getWorldPosition(camWorldPos);
      EXCHANGE_DATA.forEach((_ex, ei) => {
        const angle = -time * 0.25 + (ei / EXCHANGE_DATA.length) * Math.PI * 2;
        exchangeAngles.push(angle);
        const x = Math.cos(angle) * ORBIT_RADIUS;
        const z = Math.sin(angle) * ORBIT_RADIUS;
        orbitBgSprites[ei].position.set(x, 0, z);
        orbitLogoSprites[ei].position.set(x, 0, z);

        // Scale icons based on camera-facing (front = full size, back = small but visible)
        const worldPos = new THREE.Vector3(x, 0, z);
        orbitGroup.localToWorld(worldPos);
        const toCam = camWorldPos.clone().sub(worldPos).normalize();
        const fromCenter = worldPos.clone().normalize();
        const facing = fromCenter.dot(toCam);
        // facing > 0: in front, facing < 0: behind. Map [-1, 1] → [0.3, 1]
        const sizeFactor = 0.3 + (facing + 1) * 0.35;
        orbitBgSprites[ei].scale.setScalar(1.3 * sizeFactor);
        orbitLogoSprites[ei].scale.setScalar(0.85 * sizeFactor);
        // Reset opacity to full since we're using size now
        (orbitBgSprites[ei].material as THREE.SpriteMaterial).opacity = 1;
        (orbitLogoSprites[ei].material as THREE.SpriteMaterial).opacity = 1;
      });

      // Update ring trail glow — brighten near exchange icons
      const ringColorAttr = ringGeo.getAttribute('color') as THREE.BufferAttribute;
      for (let i = 0; i <= ringSegments; i++) {
        const segAngle = (i / ringSegments) * Math.PI * 2;
        let brightness = 0.06;
        for (const ea of exchangeAngles) {
          // Normalize angle difference
          let diff = segAngle - ((ea % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (diff > Math.PI) diff -= Math.PI * 2;
          if (diff < -Math.PI) diff += Math.PI * 2;
          // Trail behind the icon (positive diff = behind in rotation direction)
          const trail = Math.max(0, diff);
          const trailFade = Math.exp(-trail * 2.5) * 0.9;
          // Also slight glow ahead
          const aheadFade = Math.exp(-Math.abs(diff) * 8) * 0.5;
          brightness = Math.max(brightness, trailFade + aheadFade);
        }
        ringColorAttr.setXYZ(i, 0.67 * brightness, 0.32 * brightness, 0.77 * brightness);
      }
      ringColorAttr.needsUpdate = true;

      // Depth fade: update line vertex colors (throttled on mobile)
      if (!IS_MOBILE || frameCount % 3 === 0) {
        const camDir = camera.position.clone().normalize();
        const posAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
        const tempVec = new THREE.Vector3();
        for (let vi = 0; vi < posAttr.count; vi++) {
          tempVec.set(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
          group.localToWorld(tempVec);
          const facing = tempVec.normalize().dot(camDir);
          const fade = Math.max(0.08, Math.min(1.0, (facing + 0.3) / 1.1));
          const ci = vi * 3;
          lineColorAttr.setXYZ(vi,
            originalColors[ci] * fade,
            originalColors[ci + 1] * fade,
            originalColors[ci + 2] * fade,
          );
        }
        lineColorAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      cancelAnimationFrame(animId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [liveTraders]);


  return (
    <>
    <div
      ref={containerRef}
      className="relative mx-auto mb-24 sm:mb-0 w-full max-w-[380px] aspect-square sm:max-w-none sm:aspect-auto sm:h-[900px] overflow-visible"
      style={{ cursor: 'grab' }}
    >


      {/* Click Popover (sticky) */}
      {tooltip.visible && tooltip.data && (
        tooltip.data.type === 'user' ? (
          <a
            href={`https://app.mycoindeck.com/en/explore/${tooltip.data.urlname || tooltip.data.uid}?pid=${tooltip.data.portfolioId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute z-10 flex w-max items-center gap-2.5 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1a1a]/95 px-3 py-2 backdrop-blur-sm transition-all hover:border-[#AB51C5]/50 hover:bg-[#1a1a1a]"
            style={{
              left: tooltip.x,
              top: tooltip.y - 52,
              transform: 'translateX(-50%)',
            }}
          >
            <>
              <div className="relative shrink-0">
                <img src={tooltip.data.avatar} alt={tooltip.data.name} className="h-7 w-7 rounded-full object-cover" />
                {tooltip.data.rank === 1 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-b from-[#FFD700] to-[#B8860B] text-[8px] font-bold text-black">
                    {tooltip.data.rank}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="flex min-w-0 flex-col items-start">
                  <div className="text-xs font-semibold leading-tight text-white truncate">{tooltip.data.name}</div>
                  {tooltip.data.portfolioLabel && (
                    <div className="text-[10px] leading-tight text-white/50 truncate">{tooltip.data.portfolioLabel}</div>
                  )}
                </div>
                <div className={`text-xs font-semibold ${tooltip.data.pnl.startsWith('+') ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{tooltip.data.pnl}</div>
              </div>
            </>
          </a>
        ) : (
          <div
            className="pointer-events-none absolute z-10 flex w-max items-center gap-2.5 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1a1a]/95 px-3 py-2 backdrop-blur-sm"
            style={{
              left: tooltip.x,
              top: tooltip.y - 52,
              transform: 'translateX(-50%)',
            }}
          >
            <img src={tooltip.data.avatar} alt={tooltip.data.name} className="h-5 w-5 shrink-0 object-contain" />
            <div className="text-xs font-semibold text-white">{tooltip.data.name}</div>
          </div>
        )
      )}

    </div>
    </>
  );
}
