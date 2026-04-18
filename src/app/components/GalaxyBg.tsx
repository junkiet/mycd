'use client';

import { useRef, useEffect } from 'react';

/**
 * Canvas-based galaxy/nebula background.
 * Animated stars with color + halos, shooting stars, drifting nebula clouds, spiral arms.
 */
export function GalaxyBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const isMobile = window.innerWidth < 640;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Star color palette
    const starColors = [
      { r: 220, g: 210, b: 255 }, // cool white
      { r: 200, g: 180, b: 255 }, // lavender
      { r: 255, g: 220, b: 240 }, // warm pink-white
      { r: 180, g: 200, b: 255 }, // cool blue
      { r: 255, g: 240, b: 220 }, // warm yellow-white
      { r: 200, g: 160, b: 255 }, // purple tint
    ];

    // Stars — varied types
    interface Star {
      x: number; y: number; size: number; phase: number; speed: number;
      type: 'normal' | 'bright' | 'pulsing';
      color: { r: number; g: number; b: number };
      pulseSpeed: number;
      // Shine flash state
      shineTime: number;     // when the current shine started (in seconds)
      shineDuration: number; // how long the shine lasts
      shineInterval: number; // seconds between shines
      shineIntensity: number;
    }
    const starCount = isMobile ? 80 : 220;
    const brightCount = isMobile ? 4 : 8;
    const pulsingCount = isMobile ? 8 : 20;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      let type: Star['type'] = 'normal';
      if (i < brightCount) type = 'bright';
      else if (i < brightCount + pulsingCount) type = 'pulsing';

      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: type === 'bright' ? Math.random() * 2 + 1.5
            : type === 'pulsing' ? Math.random() * 1.2 + 0.6
            : Math.random() * 1 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.4 + 0.1,
        type,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        pulseSpeed: Math.random() * 0.8 + 0.3,
        shineTime: -(Math.random() * 10), // stagger initial shines
        shineDuration: Math.random() * 0.6 + 0.3,
        shineInterval: isMobile ? Math.random() * 30 + 20 : Math.random() * 14 + 10,
        shineIntensity: 0,
      });
    }

    // Shooting stars
    interface ShootingStar {
      x: number; y: number; angle: number; speed: number; length: number;
      life: number; maxLife: number; delay: number; active: boolean;
    }
    const shootingStars: ShootingStar[] = [];
    const shootingCount = isMobile ? 1 : 4;
    for (let i = 0; i < shootingCount; i++) {
      shootingStars.push({
        x: 0, y: 0, angle: 0, speed: 0, length: 0,
        life: 0, maxLife: 0, delay: Math.random() * 15 + 5, active: false,
      });
    }
    const resetShootingStar = (ss: ShootingStar) => {
      ss.x = Math.random() * 0.8 + 0.1;
      ss.y = Math.random() * 0.4;
      ss.angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2;
      ss.speed = Math.random() * 0.4 + 0.3;
      ss.length = Math.random() * 80 + 40;
      ss.life = 0;
      ss.maxLife = Math.random() * 0.8 + 0.4;
      ss.delay = Math.random() * 12 + 4;
      ss.active = true;
    };

    // Nebula clouds
    const clouds: { x: number; y: number; rx: number; ry: number; r: number; g: number; b: number; alpha: number; driftX: number; driftY: number; phase: number }[] = [];
    const nebulaColors = [
      { r: 171, g: 81, b: 197 },
      { r: 120, g: 60, b: 220 },
      { r: 151, g: 96, b: 255 },
      { r: 100, g: 50, b: 180 },
      { r: 80, g: 40, b: 160 },
      { r: 140, g: 70, b: 210 },
    ];
    const cloudCount = isMobile ? 4 : 10;
    for (let i = 0; i < cloudCount; i++) {
      const c = nebulaColors[i % nebulaColors.length];
      clouds.push({
        x: Math.random(),
        y: Math.random(),
        rx: Math.random() * 250 + 150,
        ry: Math.random() * 180 + 100,
        ...c,
        alpha: Math.random() * 0.035 + 0.015,
        driftX: (Math.random() - 0.5) * 0.01,
        driftY: (Math.random() - 0.5) * 0.006,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = 0;

    const draw = (time: number) => {
      const w = canvas.width / Math.min(window.devicePixelRatio, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio, 2);
      const t = time * 0.001;
      const dt = lastTime === 0 ? 0.016 : (time - lastTime) * 0.001;
      lastTime = time;

      ctx.clearRect(0, 0, w, h);

      // --- Nebula clouds ---
      clouds.forEach((c) => {
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.2 + c.phase);
        const cloudX = (c.x + Math.sin(t * c.driftX + c.phase) * 0.04) * w;
        const cloudY = (c.y + Math.cos(t * c.driftY + c.phase) * 0.03) * h;
        const maxR = Math.max(c.rx, c.ry);
        const g = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, maxR);
        g.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.alpha * pulse})`);
        g.addColorStop(0.3, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.alpha * pulse * 0.6})`);
        g.addColorStop(0.7, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.alpha * pulse * 0.2})`);
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.save();
        ctx.translate(cloudX, cloudY);
        ctx.scale(c.rx / maxR, c.ry / maxR);
        ctx.translate(-cloudX, -cloudY);
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, maxR, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      });

      // --- Spiral arms ---
      ctx.save();
      ctx.globalAlpha = 0.025;
      const spiralCx = w * 0.5;
      const spiralCy = h * 0.45;
      const spiralRotation = t * 0.02;
      for (let arm = 0; arm < 2; arm++) {
        const armOffset = (arm / 2) * Math.PI * 2;
        ctx.beginPath();
        for (let i = 0; i < 200; i++) {
          const frac = i / 200;
          const angle = spiralRotation + armOffset + frac * Math.PI * 3;
          const radius = frac * Math.min(w, h) * 0.4;
          const x = spiralCx + Math.cos(angle) * radius;
          const y = spiralCy + Math.sin(angle) * radius * 0.5;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(171, 81, 197, 1)';
        ctx.lineWidth = 20;
        ctx.filter = 'blur(15px)';
        ctx.stroke();
      }
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.restore();

      // --- Stars ---
      stars.forEach((s) => {
        const sx = s.x * w;
        const sy = s.y * h;
        const { r, g, b } = s.color;

        // Shine flash — periodic bright flare
        const timeSinceShine = t - s.shineTime;
        if (timeSinceShine > s.shineInterval) {
          s.shineTime = t;
          s.shineDuration = Math.random() * 0.6 + 0.3;
          s.shineInterval = isMobile ? Math.random() * 30 + 20 : Math.random() * 14 + 10;
        }
        const shineProgress = (t - s.shineTime) / s.shineDuration;
        if (shineProgress >= 0 && shineProgress <= 1) {
          // Quick rise, slow fall
          s.shineIntensity = shineProgress < 0.2
            ? shineProgress / 0.2
            : 1 - (shineProgress - 0.2) / 0.8;
        } else {
          s.shineIntensity = 0;
        }

        // Draw shine flare if active
        if (s.shineIntensity > 0.01) {
          const si = s.shineIntensity;
          const flareR = (s.size + 2) * (2 + si * 3);

          // Big soft bloom
          const flare = ctx.createRadialGradient(sx, sy, 0, sx, sy, flareR);
          flare.addColorStop(0, `rgba(255, 255, 255, ${si * 0.25})`);
          flare.addColorStop(0.15, `rgba(${r}, ${g}, ${b}, ${si * 0.15})`);
          flare.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${si * 0.05})`);
          flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(sx, sy, flareR, 0, Math.PI * 2);
          ctx.fillStyle = flare;
          ctx.fill();

          // Sharp cross spikes that grow/shrink
          const spikeLen = (s.size + 1) * (1.5 + si * 3.5);
          ctx.save();
          ctx.globalAlpha = si * 0.3;
          ctx.strokeStyle = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`;
          ctx.lineWidth = 0.8 + si * 0.5;
          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy); ctx.lineTo(sx + spikeLen, sy);
          ctx.moveTo(sx, sy - spikeLen); ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();
          // Shorter diagonal spikes
          const diagLen = spikeLen * 0.5;
          ctx.globalAlpha = si * 0.15;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx - diagLen, sy - diagLen); ctx.lineTo(sx + diagLen, sy + diagLen);
          ctx.moveTo(sx + diagLen, sy - diagLen); ctx.lineTo(sx - diagLen, sy + diagLen);
          ctx.stroke();
          ctx.restore();
        }

        if (s.type === 'bright') {
          const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));

          // Outer halo
          const haloR = s.size * 8;
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
          halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${twinkle * 0.08})`);
          halo.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${twinkle * 0.03})`);
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();

          // Inner bloom
          const bloomR = s.size * 4;
          const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, bloomR);
          bloom.addColorStop(0, `rgba(255, 255, 255, ${twinkle * 0.2})`);
          bloom.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${twinkle * 0.15})`);
          bloom.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${twinkle * 0.04})`);
          bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(sx, sy, bloomR, 0, Math.PI * 2);
          ctx.fillStyle = bloom;
          ctx.fill();

          // 4-point diffraction spikes
          const spikeLen = s.size * 5 * twinkle;
          ctx.save();
          ctx.globalAlpha = twinkle * 0.15;
          ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.lineWidth = 0.8;
          // Vertical + horizontal
          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy); ctx.lineTo(sx + spikeLen, sy);
          ctx.moveTo(sx, sy - spikeLen); ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();
          // Diagonal (fainter, shorter)
          ctx.globalAlpha = twinkle * 0.06;
          ctx.lineWidth = 0.5;
          const diagLen = spikeLen * 0.6;
          ctx.beginPath();
          ctx.moveTo(sx - diagLen, sy - diagLen); ctx.lineTo(sx + diagLen, sy + diagLen);
          ctx.moveTo(sx + diagLen, sy - diagLen); ctx.lineTo(sx - diagLen, sy + diagLen);
          ctx.stroke();
          ctx.restore();

          // Core
          ctx.beginPath();
          ctx.arc(sx, sy, s.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
          ctx.fill();

        } else if (s.type === 'pulsing') {
          // Pulsing stars — smooth sine pulse, visible halo
          const pulse = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.pulseSpeed + s.phase));

          // Halo
          const haloR = s.size * 5 * pulse;
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
          halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pulse * 0.12})`);
          halo.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${pulse * 0.04})`);
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(sx, sy, s.size * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + pulse * 0.4})`;
          ctx.fill();

        } else {
          // Normal stars — simple twinkle
          const twinkle = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
          ctx.beginPath();
          ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${twinkle * 0.4})`;
          ctx.fill();
        }
      });

      // --- Shooting stars ---
      shootingStars.forEach((ss) => {
        if (!ss.active) {
          ss.delay -= dt;
          if (ss.delay <= 0) resetShootingStar(ss);
          return;
        }

        ss.life += dt;
        if (ss.life > ss.maxLife) {
          ss.active = false;
          ss.delay = Math.random() * 12 + 4;
          return;
        }

        const progress = ss.life / ss.maxLife;
        // Fade in then out
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

        const headX = (ss.x + Math.cos(ss.angle) * ss.speed * ss.life) * w;
        const headY = (ss.y + Math.sin(ss.angle) * ss.speed * ss.life) * h;
        const tailX = headX - Math.cos(ss.angle) * ss.length * alpha;
        const tailY = headY - Math.sin(ss.angle) * ss.length * alpha;

        // Trail gradient
        const trail = ctx.createLinearGradient(tailX, tailY, headX, headY);
        trail.addColorStop(0, 'rgba(0, 0, 0, 0)');
        trail.addColorStop(0.6, `rgba(200, 180, 255, ${alpha * 0.15})`);
        trail.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.5})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 4);
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`);
        headGlow.addColorStop(0.5, `rgba(200, 180, 255, ${alpha * 0.2})`);
        headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(headX, headY, 4, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();
      });

      // --- Dust lane ---
      const dustGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.55);
      dustGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      dustGrad.addColorStop(0.3, 'rgba(80, 40, 120, 0.015)');
      dustGrad.addColorStop(0.5, 'rgba(100, 50, 150, 0.02)');
      dustGrad.addColorStop(0.7, 'rgba(80, 40, 120, 0.015)');
      dustGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = dustGrad;
      ctx.fillRect(0, h * 0.35, w, h * 0.2);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
