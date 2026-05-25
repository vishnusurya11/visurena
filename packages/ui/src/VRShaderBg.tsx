"use client";
import React, { useRef, useEffect, CSSProperties } from "react";

interface VRShaderBgProps {
  colors?: string[];
  style?: CSSProperties;
  density?: number;
  speed?: number;
  interactive?: boolean;
  className?: string;
}

export function VRShaderBg({ colors = [], style = {}, density = 1, speed = 1, interactive = true, className = "" }: VRShaderBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ mouse: { x: 0.5, y: 0.5, active: false }, pulses: [] as { x: number; y: number; t: number }[] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const count = Math.max(3, Math.min(10, Math.round(6 * density)));
    const orbs = Array.from({ length: count }).map((_, i) => ({
      x:  0.15 + (i * 0.12) % 0.7,
      y:  0.2 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.0006 * speed,
      vy: (Math.random() - 0.5) * 0.0006 * speed,
      r:  0.32 + Math.random() * 0.28,
      color: colors[i % Math.max(1, colors.length)] || "#888",
      phase: Math.random() * Math.PI * 2,
    }));

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = (e.clientX - r.left) / r.width;
      stateRef.current.mouse.y = (e.clientY - r.top) / r.height;
      stateRef.current.mouse.active = true;
    };
    const onLeave = () => { stateRef.current.mouse.active = false; };
    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      stateRef.current.pulses.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, t: 0 });
    };
    if (interactive) {
      canvas.addEventListener("mousemove", onMove);
      canvas.addEventListener("mouseleave", onLeave);
      canvas.addEventListener("click", onClick);
    }

    const start = performance.now();
    const draw = (now: number) => {
      if (!running) return;
      const w = canvas.width, h = canvas.height;
      const t = (now - start) / 1000;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#080807";
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      stateRef.current.pulses = stateRef.current.pulses.filter(p => p.t < 1.4);
      stateRef.current.pulses.forEach(p => {
        p.t += 0.018;
        const r = p.t * Math.min(w, h) * 0.8;
        const cx = p.x * w, cy = p.y * h;
        const alpha = Math.max(0, 1 - p.t / 1.4);
        const g = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
        g.addColorStop(0, `rgba(255,235,200,${0.18 * alpha})`);
        g.addColorStop(1, "rgba(255,235,200,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      orbs.forEach((o) => {
        if (interactive && stateRef.current.mouse.active && !reduceMotion) {
          const dx = stateRef.current.mouse.x - o.x;
          const dy = stateRef.current.mouse.y - o.y;
          o.vx += dx * 0.000015 * speed;
          o.vy += dy * 0.000015 * speed;
        }
        if (!reduceMotion) {
          o.x += o.vx + Math.sin(t * 0.4 + o.phase) * 0.00012 * speed;
          o.y += o.vy + Math.cos(t * 0.5 + o.phase) * 0.00012 * speed;
          o.vx *= 0.992;
          o.vy *= 0.992;
        }
        if (o.x < 0.08) o.vx = Math.abs(o.vx);
        if (o.x > 0.92) o.vx = -Math.abs(o.vx);
        if (o.y < 0.08) o.vy = Math.abs(o.vy);
        if (o.y > 0.92) o.vy = -Math.abs(o.vy);

        const cx = o.x * w, cy = o.y * h, radius = o.r * Math.min(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, o.color + "55");
        g.addColorStop(0.35, o.color + "25");
        g.addColorStop(1, o.color + "00");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      ctx.globalCompositeOperation = "source-over";
      const vg = ctx.createRadialGradient(w/2, h/2, Math.min(w,h) * 0.3, w/2, h/2, Math.max(w,h) * 0.8);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) {
        canvas.removeEventListener("mousemove", onMove);
        canvas.removeEventListener("mouseleave", onLeave);
        canvas.removeEventListener("click", onClick);
      }
    };
  }, [colors.join("|"), density, speed, interactive]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block", ...style }} />;
}
