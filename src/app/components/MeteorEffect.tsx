'use client';

import { useRef, useEffect } from 'react';

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
  angle: number;
  color: [number, number, number];
  life: number;
  maxLife: number;
}

interface MeteorEffectProps {
  meteorCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

function createMeteor(width: number, height: number): Meteor {
  // Meteors come from upper-right area, travel to lower-left
  const angle = Math.PI * (0.65 + Math.random() * 0.2); // ~120-145 degrees
  const maxLife = 60 + Math.random() * 80;
  const colorRand = Math.random();
  const color: [number, number, number] = colorRand < 0.4
    ? [200, 160, 255] // purple
    : colorRand < 0.7
      ? [170, 200, 255] // blue-ish
      : [255, 255, 255]; // white

  return {
    x: Math.random() * width * 1.2,
    y: -10 - Math.random() * height * 0.3,
    length: 120 + Math.random() * 180,
    speed: 5 + Math.random() * 8,
    opacity: 0.5 + Math.random() * 0.5,
    thickness: 1.2 + Math.random() * 1.8,
    angle,
    color,
    life: 0,
    maxLife,
  };
}

export function MeteorEffect({
  meteorCount = 8,
  className = '',
  style,
}: MeteorEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const animationRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    resize();

    const isMobile = window.innerWidth < 768;
    const activeCount = isMobile ? Math.max(1, Math.ceil(meteorCount / 2)) : meteorCount;
    const spawnMin = isMobile ? 400 : 150;
    const spawnRand = isMobile ? 900 : 600;

    // Spawn meteors at random intervals
    const spawnMeteor = () => {
      if (meteorsRef.current.length < activeCount) {
        meteorsRef.current.push(createMeteor(canvas.width, canvas.height));
      }
      timerRef.current = window.setTimeout(spawnMeteor, spawnMin + Math.random() * spawnRand);
    };
    spawnMeteor();

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      meteorsRef.current = meteorsRef.current.filter((m) => {
        m.life++;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        // Fade in at start, fade out at end
        const fadeIn = Math.min(m.life / 8, 1);
        const fadeOut = Math.max(1 - (m.life - m.maxLife * 0.6) / (m.maxLife * 0.4), 0);
        const alpha = m.opacity * fadeIn * fadeOut;

        if (alpha <= 0 || m.x < -200 || m.y > height + 200) return false;

        const [r, g, b] = m.color;
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // Meteor trail gradient
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright head glow
        const headGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 3);
        headGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        headGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
        headGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = headGrad;
        ctx.fill();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timerRef.current);
    };
  }, [meteorCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={style}
    />
  );
}
