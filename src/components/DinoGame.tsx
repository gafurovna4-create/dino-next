"use client";

import { useEffect, useRef } from "react";
import { DinoEngine } from "../game/engine";
import { WIDTH, HEIGHT } from "../game/constants";

type Props = {
  onGameOver?: (score: number) => void;
};

export default function DinoGame({ onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbackRef = useRef(onGameOver);

  useEffect(() => {
    callbackRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const engine = new DinoEngine();

    try {
      engine.highScore = Number(localStorage.getItem("dino-hi") ?? 0);
    } catch {}

    let last = performance.now();
    let raf = 0;
    let reported = false;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;

      engine.update(dt);
      engine.draw(ctx);

      if (engine.gameOver && !reported) {
        reported = true;
        try {
          localStorage.setItem("dino-hi", String(engine.highScore));
        } catch {}
        callbackRef.current?.(Math.floor(engine.score));
      }
      raf = requestAnimationFrame(loop);
    };

    const action = () => {
      if (engine.gameOver) {
        engine.reset();
        reported = false;
      }
      engine.jump();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", action);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", action);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="max-w-full bg-white"
    />
  );
}