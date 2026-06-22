"use client";

import { useSyncExternalStore } from "react";

// ============================================================
// Scene definitions. `weight` = relative scroll distance.
// The DOM renders each section at height (weight * 100vh) so the
// document scroll maps linearly onto these normalized bands.
// ============================================================
export type SceneId =
  | "hero"
  | "departure"
  | "build"
  | "swarm"
  | "skills"
  | "velocity"
  | "summit"
  | "rider"
  | "horizon";

export type SceneDef = {
  id: SceneId;
  weight: number;
  start: number; // normalized [0,1]
  end: number;
};

const RAW: { id: SceneId; weight: number }[] = [
  { id: "hero", weight: 1.0 },
  { id: "departure", weight: 1.0 },
  { id: "build", weight: 1.0 },
  { id: "swarm", weight: 2.0 }, // ⭐ centerpiece — most scroll distance
  { id: "skills", weight: 1.3 }, // the instrument panel — toolkit + impact
  { id: "velocity", weight: 1.4 },
  { id: "summit", weight: 1.6 }, // ⭐ payoff
  { id: "rider", weight: 1.0 },
  { id: "horizon", weight: 1.0 },
];

const TOTAL = RAW.reduce((s, x) => s + x.weight, 0);

export const SCENES: SceneDef[] = (() => {
  let acc = 0;
  return RAW.map((s) => {
    const start = acc / TOTAL;
    acc += s.weight;
    const end = acc / TOTAL;
    return { ...s, start, end };
  });
})();

export const TOTAL_WEIGHT = TOTAL;

export function sceneById(id: SceneId): SceneDef {
  return SCENES.find((s) => s.id === id)!;
}

/** Local progress within a scene's band, clamped 0..1. */
export function localProgress(globalP: number, id: SceneId): number {
  const s = sceneById(id);
  if (s.end === s.start) return 0;
  return clamp((globalP - s.start) / (s.end - s.start), 0, 1);
}

// The camera path + terrain live in `world.ts` (one shared ground model).

// ============================================================
// Shared ride state. Updated imperatively each frame (scroll +
// Lenis), read directly in useFrame (no React churn) and exposed
// to the DOM via useSyncExternalStore.
// ============================================================
export type RideState = {
  progress: number; // 0..1
  velocity: number; // smoothed |delta progress| per frame, 0..1-ish
  scene: SceneId;
  started: boolean; // preloader done
};

const state: RideState = {
  progress: 0,
  velocity: 0,
  scene: "hero",
  started: false,
};

// Mutable refs read in the render loop (avoid object churn).
export const ride = {
  get progress() {
    return state.progress;
  },
  get velocity() {
    return state.velocity;
  },
  get scene() {
    return state.scene;
  },
  get started() {
    return state.started;
  },
};

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

let snapshot: RideState = { ...state };
function refreshSnapshot() {
  snapshot = { ...state };
}

export function setProgress(p: number) {
  const next = clamp(p, 0, 1);
  const raw = Math.abs(next - state.progress);
  // smooth the velocity a little so shaders don't jitter
  state.velocity = state.velocity * 0.8 + raw * 0.2;
  state.progress = next;
  const scene = sceneAt(next);
  const sceneChanged = scene !== state.scene;
  state.scene = scene;
  refreshSnapshot();
  // Only re-render DOM subscribers on scene change or meaningful move.
  if (sceneChanged || raw > 0.0005) emit();
}

export function decayVelocity() {
  if (state.velocity > 0.00001) {
    state.velocity *= 0.92;
    refreshSnapshot();
  }
}

export function setStarted(v: boolean) {
  if (state.started === v) return;
  state.started = v;
  refreshSnapshot();
  emit();
}

export function sceneAt(p: number): SceneId {
  for (const s of SCENES) {
    if (p < s.end) return s.id;
  }
  return SCENES[SCENES.length - 1].id;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return snapshot;
}

export function useRide(): RideState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ============================================================
// math helpers
// ============================================================
export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
export function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
export function mapRange(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  return outMin + ((x - inMin) / (inMax - inMin)) * (outMax - outMin);
}
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
