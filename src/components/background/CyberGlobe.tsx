"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFZMIND";

export default function NeonMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const newColumns = Math.floor(canvas.width / fontSize);
      // Preserve existing drop positions, fill new columns
      const newDrops = new Array(newColumns).fill(0);
      for (let i = 0; i < Math.min(columns, newColumns); i++) {
        newDrops[i] = drops[i] || 0;
      }
      // Stagger initial drops randomly
      for (let i = columns; i < newColumns; i++) {
        newDrops[i] = Math.random() * -100;
      }
      columns = newColumns;
      drops = newDrops;
    }

    resize();
    // Randomize initial positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    function draw() {
      if (!ctx || !canvas) return;

      // Fade effect — semi-transparent black overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        if (drops[i] < 0) {
          drops[i] += 0.3;
          continue;
        }

        const charIndex = Math.floor(Math.random() * CHARS.length);
        const char = CHARS[charIndex];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Neon color cycling — cyan, pink, purple
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.35)"; // cyan
        } else if (colorChoice < 0.85) {
          ctx.fillStyle = "rgba(255, 110, 199, 0.3)"; // pink
        } else {
          ctx.fillStyle = "rgba(123, 104, 238, 0.3)"; // purple
        }

        // Brighten the leading character
        if (Math.random() < 0.05) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.8)";
        }

        ctx.fillText(char, x, y);

        // Reset drop to top with random delay once it goes past bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        }

        drops[i] += 0.3;
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.5 }}
    />
  );
}
