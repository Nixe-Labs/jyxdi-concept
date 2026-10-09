'use client';
/* Adapted from React Bits <ClickSpark>: instead of wrapping children in a
   page-sized canvas, this is one fixed, viewport-sized overlay that listens
   to every tap and only runs its animation loop while sparks are alive. */
import { useEffect, useRef } from 'react';

type Spark = { x: number; y: number; angle: number; start: number };

export default function ClickSparkLayer({
  sparkColor = '#f4d99c', sparkSize = 11, sparkRadius = 22, sparkCount = 9, duration = 480, extraScale = 1.1
}: { sparkColor?: string; sparkSize?: number; sparkRadius?: number; sparkCount?: number; duration?: number; extraScale?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    let sparks: Spark[] = [], raf = 0;
    const resize = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener('resize', resize);
    const draw = (now: number) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      sparks = sparks.filter(s => {
        const p = (now - s.start) / duration; if (p >= 1) return false;
        const e = p * (2 - p), dist = e * sparkRadius * extraScale, len = sparkSize * (1 - e);
        ctx.strokeStyle = sparkColor; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(s.x + dist * Math.cos(s.angle), s.y + dist * Math.sin(s.angle));
        ctx.lineTo(s.x + (dist + len) * Math.cos(s.angle), s.y + (dist + len) * Math.sin(s.angle));
        ctx.stroke(); return true;
      });
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };
    const onDown = (e: PointerEvent) => {
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) sparks.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / sparkCount, start: now });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    addEventListener('pointerdown', onDown, { passive: true });
    return () => { removeEventListener('resize', resize); removeEventListener('pointerdown', onDown); cancelAnimationFrame(raf); };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[115] h-screen w-screen" />;
}
