"use client";

import { useEffect } from "react";
import { useRide, SCENES } from "@/lib/ride";

const LABELS: Record<string, string> = {
  hero: "The Ridge",
  departure: "Departure",
  build: "The Build",
  swarm: "The Swarm",
  skills: "Instruments",
  velocity: "Velocity",
  summit: "The Summit",
  rider: "The Rider",
  horizon: "Horizon",
};

const MAX_ALT = 5000; // metres at the summit

export default function HUD() {
  const { progress, scene } = useRide();
  const alt = Math.round(progress * MAX_ALT);
  const idx = SCENES.findIndex((s) => s.id === scene);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const current = SCENES.findIndex((s) => s.id === scene);
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const next = SCENES[Math.min(current + 1, SCENES.length - 1)];
        if (next) goto(next.start);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prev = SCENES[Math.max(current - 1, 0)];
        if (prev) goto(prev.start);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const goto = (start: number) => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    // aim just inside the band so the right scene reads
    window.scrollTo({ top: (start + 0.01) * max, behavior: "smooth" });
  };

  return (
    <aside
      className="pointer-events-none fixed right-4 top-1/2 z-[120] hidden -translate-y-1/2 select-none md:block"
      aria-label="Ride progress"
    >
      <div className="flex items-center gap-3">
        {/* tick rail */}
        <ol className="pointer-events-auto flex flex-col items-end gap-2">
          {SCENES.map((s, i) => {
            const on = i === idx;
            return (
              <li key={s.id}>
                <button
                  data-cursor="GO"
                  onClick={() => goto(s.start)}
                  className="group flex items-center gap-2"
                  aria-current={on ? "true" : undefined}
                  aria-label={`Go to ${LABELS[s.id]}`}
                >
                  <span
                    className="mono text-[10px] tracking-widest transition-opacity"
                    style={{
                      color: on ? "var(--cyan)" : "var(--muted)",
                      opacity: on ? 1 : 0,
                    }}
                  >
                    {LABELS[s.id]}
                  </span>
                  <span
                    className="block h-px transition-all"
                    style={{
                      width: on ? 28 : 14,
                      backgroundColor: on ? "var(--cyan)" : "var(--muted)",
                      opacity: on ? 1 : 0.4,
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* altitude readout */}
      <div className="mt-5 text-right">
        <div className="mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
          Altitude
        </div>
        <div className="mono text-lg" style={{ color: "var(--text)" }}>
          {alt.toLocaleString()}
          <span className="text-[11px]" style={{ color: "var(--muted)" }}> m</span>
        </div>
        <div className="mono text-[10px] tracking-widest" style={{ color: "var(--blue)" }}>
          {progress >= 0.995 ? "SUMMIT" : `0m → SUMMIT`}
        </div>
      </div>
    </aside>
  );
}
