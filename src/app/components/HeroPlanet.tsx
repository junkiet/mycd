'use client';

import { useRef, useEffect } from 'react';

/**
 * Animated space planet with liquid-glow aura.
 * Pure canvas — no heavy libraries.
 */
export function HeroPlanet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

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

    // HSL helper → rgba string
    const hsl = (h: number, s: number, l: number, a: number) => {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; }
      else if (h < 120) { r = x; g = c; }
      else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; }
      else if (h < 300) { r = x; b = c; }
      else { r = c; b = x; }
      return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${a})`;
    };

    // Stars — varied sizes with a few bright "hero" stars
    const stars: { x: number; y: number; size: number; phase: number; speed: number; bright: boolean }[] = [];
    for (let i = 0; i < 160; i++) {
      const isBright = i < 8; // first 8 are hero stars
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: isBright ? Math.random() * 2 + 1.5 : Math.random() * 1.2 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.4 + 0.1,
        bright: isBright,
      });
    }

    // Pre-generate cloud/texture noise offsets for surface detail
    const cloudPoints: { angle: number; dist: number; size: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 40; i++) {
      cloudPoints.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 0.7 + 0.1,
        size: Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.08 + 0.02,
        speed: (Math.random() - 0.5) * 0.03,
      });
    }

    const draw = (time: number) => {
      const w = canvas.width / Math.min(window.devicePixelRatio, 2);
      const h = canvas.height / Math.min(window.devicePixelRatio, 2);
      const t = time * 0.001;

      ctx.clearRect(0, 0, w, h);

      // --- Stars ---
      stars.forEach((s) => {
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        if (s.bright) {
          // Hero stars: bloom glow + core
          const bloomR = s.size * 4;
          const bloom = ctx.createRadialGradient(s.x * w, s.y * h, 0, s.x * w, s.y * h, bloomR);
          bloom.addColorStop(0, `rgba(220, 200, 255, ${twinkle * 0.15})`);
          bloom.addColorStop(0.3, `rgba(180, 160, 240, ${twinkle * 0.06})`);
          bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, bloomR, 0, Math.PI * 2);
          ctx.fillStyle = bloom;
          ctx.fill();
          // Cross spikes
          ctx.strokeStyle = `rgba(220, 210, 255, ${twinkle * 0.12})`;
          ctx.lineWidth = 0.5;
          const len = s.size * 3;
          ctx.beginPath();
          ctx.moveTo(s.x * w - len, s.y * h);
          ctx.lineTo(s.x * w + len, s.y * h);
          ctx.moveTo(s.x * w, s.y * h - len);
          ctx.lineTo(s.x * w, s.y * h + len);
          ctx.stroke();
        }
        // Core dot
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.size * (s.bright ? 0.7 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 195, 255, ${twinkle * (s.bright ? 0.7 : 0.4)})`;
        ctx.fill();
      });

      // Planet center & size
      const cx = w / 2;
      const cy = h * 0.38;
      const isMobile = w < 640;
      const R = Math.min(w, h) * (isMobile ? 0.32 : 0.22);

      const hueBase = Math.sin(t * 0.3) * 10; // gentle ±10° shift, stays purple
      const sway = Math.sin(t * 0.8) * 0.15;

      // ==============================
      // AURA — centered, even glow
      // ==============================
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sway);
      ctx.translate(-cx, -cy);

      // Layer 5: widest bloom
      const bloom5Pulse = 1 + 0.08 * Math.sin(t * 0.3);
      const bloom5R = R * 2.8 * bloom5Pulse;
      const b5 = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, bloom5R);
      b5.addColorStop(0, hsl(hueBase + 280, 0.8, 0.5, 0));
      b5.addColorStop(0.3, hsl(hueBase + 280, 0.7, 0.4, 0.04));
      b5.addColorStop(0.55, hsl(hueBase + 270, 0.6, 0.35, 0.03));
      b5.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, bloom5R, 0, Math.PI * 2);
      ctx.fillStyle = b5;
      ctx.fill();

      // Layer 4: outer glow
      const bloom4Pulse = 1 + 0.1 * Math.sin(t * 0.45 + 1);
      const bloom4R = R * 2.0 * bloom4Pulse;
      const b4 = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, bloom4R);
      b4.addColorStop(0, hsl(hueBase + 280, 0.8, 0.5, 0));
      b4.addColorStop(0.25, hsl(hueBase + 285, 0.85, 0.55, 0.08));
      b4.addColorStop(0.5, hsl(hueBase + 275, 0.75, 0.45, 0.12));
      b4.addColorStop(0.75, hsl(hueBase + 270, 0.6, 0.4, 0.04));
      b4.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, bloom4R, 0, Math.PI * 2);
      ctx.fillStyle = b4;
      ctx.fill();

      // Layer 3: saturated mid glow
      const bloom3Pulse = 1 + 0.12 * Math.sin(t * 0.6 + 2);
      const bloom3R = R * 1.55 * bloom3Pulse;
      const b3 = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, bloom3R);
      b3.addColorStop(0, hsl(hueBase + 280, 0.9, 0.6, 0));
      b3.addColorStop(0.2, hsl(hueBase + 280, 0.9, 0.6, 0.15));
      b3.addColorStop(0.5, hsl(hueBase + 290, 0.85, 0.55, 0.2));
      b3.addColorStop(0.75, hsl(hueBase + 275, 0.7, 0.45, 0.06));
      b3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, bloom3R, 0, Math.PI * 2);
      ctx.fillStyle = b3;
      ctx.fill();

      // Layer 2: inner hot glow
      const bloom2Pulse = 1 + 0.15 * Math.sin(t * 0.8 + 0.5);
      const bloom2R = R * 1.22 * bloom2Pulse;
      const b2 = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, bloom2R);
      b2.addColorStop(0, hsl(hueBase + 285, 0.95, 0.65, 0));
      b2.addColorStop(0.2, hsl(hueBase + 285, 0.95, 0.65, 0.3));
      b2.addColorStop(0.5, hsl(hueBase + 290, 0.9, 0.6, 0.2));
      b2.addColorStop(0.8, hsl(hueBase + 280, 0.8, 0.5, 0.05));
      b2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, bloom2R, 0, Math.PI * 2);
      ctx.fillStyle = b2;
      ctx.fill();

      // Layer 1: hot rim
      const rimPulse = 1 + 0.1 * Math.sin(t * 1.0 + 1.5);
      const rimR = R * 1.06 * rimPulse;
      const b1 = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, rimR);
      b1.addColorStop(0, hsl(hueBase + 290, 1, 0.7, 0.4));
      b1.addColorStop(0.4, hsl(hueBase + 285, 0.95, 0.6, 0.3));
      b1.addColorStop(1, hsl(hueBase + 280, 0.8, 0.5, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, rimR, 0, Math.PI * 2);
      ctx.fillStyle = b1;
      ctx.fill();

      ctx.restore(); // end sway

      // ==============================
      // PLANET BODY
      // ==============================
      const pgBody = ctx.createRadialGradient(
        cx - R * 0.35, cy - R * 0.2, R * 0.05,
        cx, cy, R
      );
      pgBody.addColorStop(0, 'rgba(95, 60, 140, 0.85)');
      pgBody.addColorStop(0.25, 'rgba(60, 30, 90, 0.92)');
      pgBody.addColorStop(0.6, 'rgba(25, 12, 45, 0.97)');
      pgBody.addColorStop(1, 'rgba(5, 2, 15, 1)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = pgBody;
      ctx.fill();

      // Surface cloud/texture detail — irregular patches that slowly drift
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      cloudPoints.forEach((cp) => {
        const a = cp.angle + t * cp.speed;
        const px = cx + Math.cos(a) * cp.dist * R;
        const py = cy + Math.sin(a) * cp.dist * R;
        const patchR = cp.size * R;
        const pg = ctx.createRadialGradient(px, py, 0, px, py, patchR);
        // Only visible on the lit (left) side
        const leftFade = Math.max(0, 1 - (px - cx + R * 0.1) / (R * 0.5));
        const alpha = cp.opacity * leftFade * (0.7 + 0.3 * Math.sin(t * 0.5 + cp.angle));
        pg.addColorStop(0, `rgba(160, 100, 200, ${alpha})`);
        pg.addColorStop(0.5, `rgba(120, 70, 170, ${alpha * 0.4})`);
        pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(px, py, patchR, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      });
      ctx.restore();

      // Surface highlight — lit side
      const hlAngle = t * 0.12;
      const hlX = cx - R * 0.25 + Math.cos(hlAngle) * R * 0.12;
      const hlY = cy + Math.sin(hlAngle) * R * 0.1;
      const pgHl = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, R * 0.5);
      pgHl.addColorStop(0, hsl(hueBase + 280, 0.7, 0.5, 0.12));
      pgHl.addColorStop(0.5, hsl(hueBase + 285, 0.5, 0.4, 0.04));
      pgHl.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = pgHl;
      ctx.fill();

      // Rim light — upper-left edge
      const pgRim = ctx.createRadialGradient(
        cx - R * 0.6, cy - R * 0.4, R * 0.06,
        cx, cy, R
      );
      pgRim.addColorStop(0, hsl(hueBase + 290, 0.9, 0.7, 0.22));
      pgRim.addColorStop(0.25, hsl(hueBase + 285, 0.7, 0.5, 0.08));
      pgRim.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = pgRim;
      ctx.fill();

      // ==============================
      // TERMINATOR — sharp vertical black on right half
      // ==============================
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      const shadowGrad = ctx.createLinearGradient(cx - R * 0.1, cy, cx + R * 0.1, cy);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(cx, cy - R, R, R * 2);
      ctx.restore();

      // ==============================
      // SPINNING CONIC ECLIPSE — same effect as button
      // ==============================
      const spinAngle = t * 0.8; // ~8s per revolution
      const segments = 120;
      const eclipseR = R * 1.03;

      // Glow layer — wide blurred version
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < segments; i++) {
        const frac = i / segments;
        const angle = spinAngle + frac * Math.PI * 2;

        // Conic gradient mapped to segments: bright spots + transparent gaps
        // Matches: transparent 0%, #BA7CFF 10%, #c88fff 20%, transparent 30%, transparent 50%, #9760FF 60%, #BA7CFF 70%, transparent 80%
        let alpha = 0;
        const f = frac;
        if (f < 0.1) alpha = f / 0.1;
        else if (f < 0.2) alpha = 1;
        else if (f < 0.3) alpha = 1 - (f - 0.2) / 0.1;
        else if (f < 0.5) alpha = 0;
        else if (f < 0.6) alpha = (f - 0.5) / 0.1;
        else if (f < 0.7) alpha = 1;
        else if (f < 0.8) alpha = 1 - (f - 0.7) / 0.1;
        else alpha = 0;

        if (alpha < 0.01) continue;

        const px = cx + Math.cos(angle) * eclipseR;
        const py = cy + Math.sin(angle) * eclipseR;

        // Color: purple for first band, blue-purple for second
        const isSecondBand = f >= 0.5 && f < 0.8;
        const r = isSecondBand ? 151 : 171;
        const g = isSecondBand ? 96 : 81;
        const b = isSecondBand ? 255 : 197;

        // Glow — larger, softer
        const glowR = R * 0.18;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
        glow.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
      ctx.restore();

      // Sharp edge — bright thin ring
      ctx.save();
      for (let i = 0; i < segments; i++) {
        const frac = i / segments;
        const angle = spinAngle + frac * Math.PI * 2;

        let alpha = 0;
        const f = frac;
        if (f < 0.1) alpha = f / 0.1;
        else if (f < 0.2) alpha = 1;
        else if (f < 0.3) alpha = 1 - (f - 0.2) / 0.1;
        else if (f < 0.5) alpha = 0;
        else if (f < 0.6) alpha = (f - 0.5) / 0.1;
        else if (f < 0.7) alpha = 1;
        else if (f < 0.8) alpha = 1 - (f - 0.7) / 0.1;
        else alpha = 0;

        if (alpha < 0.01) continue;

        const isSecondBand = f >= 0.5 && f < 0.8;

        // Draw arc segment
        const arcLen = (Math.PI * 2) / segments;
        ctx.beginPath();
        ctx.arc(cx, cy, eclipseR, angle, angle + arcLen * 1.2);
        const bright = isSecondBand
          ? `rgba(151, 96, 255, ${alpha * 0.7})`
          : (f >= 0.15 && f < 0.22)
            ? `rgba(200, 143, 255, ${alpha * 0.8})`
            : `rgba(171, 81, 197, ${alpha * 0.7})`;
        ctx.strokeStyle = bright;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // --- Bottom fade ---
      const fadeGrad = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.75);
      fadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fadeGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.25);

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
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.8 }}
    />
  );
}
