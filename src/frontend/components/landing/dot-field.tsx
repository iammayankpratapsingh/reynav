"use client";
// Interactive dotted background: dots repel from the cursor and glow pink nearby; static on touch or reduced motion.
import { useEffect, useRef } from "react";
import styles from "./dot-field.module.css";

const SPACING = 28;
const DOT_RADIUS = 2.2;
const REPEL_RADIUS = 140;
const REPEL_STRENGTH = 26;
const GLOW_RADIUS = 280;
const EASING = 0.14;
const BASE_COLOR = "rgba(17, 22, 36, 0.09)";
const PINK = { r: 212, g: 85, b: 122 };

type Dot = { x: number; y: number; ox: number; oy: number };

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context) return;

    const isInteractive =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const layout = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = [];
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          dots.push({ x, y, ox: 0, oy: 0 });
        }
      }
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      if (pointer) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, GLOW_RADIUS);
        glow.addColorStop(0, "rgba(240, 138, 169, 0.16)");
        glow.addColorStop(1, "rgba(240, 138, 169, 0)");
        context.fillStyle = glow;
        context.fillRect(pointer.x - GLOW_RADIUS, pointer.y - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
      }

      let isMoving = false;
      context.fillStyle = BASE_COLOR;
      context.beginPath();
      const nearDots: { x: number; y: number; closeness: number }[] = [];

      for (const dot of dots) {
        let targetX = 0;
        let targetY = 0;
        let closeness = 0;
        if (pointer) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < REPEL_RADIUS && distance > 0.01) {
            closeness = 1 - distance / REPEL_RADIUS;
            const push = closeness * closeness * REPEL_STRENGTH;
            targetX = (dx / distance) * push;
            targetY = (dy / distance) * push;
          }
        }
        dot.ox += (targetX - dot.ox) * EASING;
        dot.oy += (targetY - dot.oy) * EASING;
        if (Math.abs(targetX - dot.ox) > 0.05 || Math.abs(targetY - dot.oy) > 0.05) isMoving = true;

        const x = dot.x + dot.ox;
        const y = dot.y + dot.oy;
        if (closeness > 0) {
          nearDots.push({ x, y, closeness });
        } else {
          context.moveTo(x + DOT_RADIUS, y);
          context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        }
      }
      context.fill();

      for (const dot of nearDots) {
        const alpha = 0.12 + dot.closeness * 0.6;
        context.fillStyle = `rgba(${PINK.r}, ${PINK.g}, ${PINK.b}, ${alpha})`;
        context.beginPath();
        context.arc(dot.x, dot.y, DOT_RADIUS + dot.closeness * 1.2, 0, Math.PI * 2);
        context.fill();
      }

      return isMoving;
    };

    const tick = () => {
      const isMoving = draw();
      frame = isMoving ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      start();
    };

    const onLeave = () => {
      pointer = null;
      start();
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(host);

    if (isInteractive) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
