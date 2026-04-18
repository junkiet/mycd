'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
const POINT_COUNT = IS_MOBILE ? 70 : 100;
const SPHERE_RADIUS = IS_MOBILE ? 4.5 : 5;
const LINE_COLOR = 0x7B3F9E;
const NODE_COLOR = 0xAB51C5;
const SPECIAL_COLOR = 0xAB51C5;
const CONNECTION_DISTANCE = IS_MOBILE ? 3.0 : 2.8;
const ORBIT_RADIUS = IS_MOBILE ? 7 : 8;
const TRADER_LIMIT = IS_MOBILE ? 10 : 50;

const EXCHANGE_DATA = [
  { name: 'Binance', avatar: '/exchanges/binance.svg' },
  { name: 'OKX', avatar: '/exchanges/okx.svg' },
  { name: 'Bybit', avatar: '/exchanges/bybit.svg' },
  { name: 'Bitget', avatar: '/exchanges/bitget.svg' },
];

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
          setLiveTraders([]);
        }
      })
      .catch(() => setLiveTraders([]));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!liveTraders) return;

    const activeTraders = liveTraders;
    const specialCount = activeTraders.length;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, IS_MOBILE ? 14 : 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
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
    // On mobile: strip OrbitControls' pointer listeners so touch goes straight to the browser.
    // We then add our own handler that only rotates on horizontal drags — vertical drags fall
    // through to the browser so the page can scroll. Auto-rotate still advances via
    // controls.update() each frame, and tap-to-show-tooltip is handled separately below.
    if (IS_MOBILE) {
      controls.dispose();
    }
    // 'pan-y' lets the browser natively handle vertical scrolling while we keep horizontal drags.
    renderer.domElement.style.touchAction = IS_MOBILE ? 'pan-y' : 'none';

    // Mobile-only: horizontal swipe rotates the orb.
    let touchLastX = 0;
    let touchLastY = 0;
    let touchMode: 'none' | 'rotate' | 'scroll' = 'none';
    const ROTATE_FACTOR = 0.006;
    const rotateAxis = new THREE.Vector3(0, 1, 0);
    const onTouchMoveRotate = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - touchLastX;
      const dy = y - touchLastY;
      if (touchMode === 'none') {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX < 6 && absY < 6) return;
        touchMode = absX > absY ? 'rotate' : 'scroll';
      }
      if (touchMode === 'rotate') {
        camera.position.applyAxisAngle(rotateAxis, -dx * ROTATE_FACTOR);
        camera.lookAt(controls.target);
        touchLastX = x;
        touchLastY = y;
        e.preventDefault();
      }
    };
    const onTouchStartRotate = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchLastX = e.touches[0].clientX;
      touchLastY = e.touches[0].clientY;
      touchMode = 'none';
    };
    const onTouchEndRotate = () => {
      touchMode = 'none';
    };
    if (IS_MOBILE) {
      renderer.domElement.addEventListener('touchstart', onTouchStartRotate, { passive: true });
      renderer.domElement.addEventListener('touchmove', onTouchMoveRotate, { passive: false });
      renderer.domElement.addEventListener('touchend', onTouchEndRotate);
      renderer.domElement.addEventListener('touchcancel', onTouchEndRotate);
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
      if (IS_MOBILE) {
        renderer.domElement.removeEventListener('touchstart', onTouchStartRotate);
        renderer.domElement.removeEventListener('touchmove', onTouchMoveRotate);
        renderer.domElement.removeEventListener('touchend', onTouchEndRotate);
        renderer.domElement.removeEventListener('touchcancel', onTouchEndRotate);
      }
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
      className="relative mx-auto h-[70vh] w-full max-w-none overflow-visible sm:mb-0 sm:h-[900px]"
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
                {tooltip.data.rank !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-bold ${
                      tooltip.data.rank === 1
                        ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B] text-black'
                        : tooltip.data.rank === 2
                          ? 'bg-gradient-to-b from-gray-300 to-gray-500 text-black'
                          : tooltip.data.rank === 3
                            ? 'bg-gradient-to-b from-orange-500 to-orange-700 text-white'
                            : 'bg-[#AB51C5] text-white'
                    }`}
                  >
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
