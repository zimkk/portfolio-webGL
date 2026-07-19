import * as THREE from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import { clamp, smoothstep } from "./ride";

// ============================================================
// One shared ground model. The terrain mesh, the camera path and
// every roadside prop sample these functions, so the rider always
// travels along the valley floor with mountains rising on each side.
// ============================================================

export const Z_START = 10;
export const Z_END = -460;
export const EYE = 2.7; // camera height above the road
export const ROAD_HALF = 6.5; // flat road half-width

const perlin = new ImprovedNoise();

function fbm(x: number, z: number, octaves = 5): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * perlin.noise(x * freq, z * freq, 0);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm; // ~[-1,1]
}

// ridged noise → sharp alpine crests
function ridged(x: number, z: number, octaves = 5): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(perlin.noise(x * freq, z * freq, 5.2));
    sum += amp * n * n;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum; // ~[0,1]
}

/** Horizontal sway of the road — gentle switchbacks up the pass. */
export function roadX(z: number): number {
  return Math.sin(z * 0.014) * 9 + Math.sin(z * 0.0052) * 7;
}

/** Valley-floor altitude — climbs steadily from start to summit. */
export function floorY(z: number): number {
  const t = clamp((Z_START - z) / (Z_START - Z_END), 0, 1);
  return t * 52 + Math.sin(z * 0.011) * 1.4;
}

/** Full terrain height at a world (x,z). */
export function terrainHeight(x: number, z: number): number {
  const base = floorY(z);
  const rx = roadX(z);
  const d = Math.abs(x - rx);

  // road corridor: flat (slightly dished) near the centre, walls beyond
  const wall = smoothstep(ROAD_HALF, ROAD_HALF + 30, d); // 0 on road → 1 far
  const crest = ridged(x * 0.02, z * 0.02); // big alpine forms
  const detail = fbm(x * 0.06, z * 0.06, 4) * 1.6; // surface roughness

  const mountains = wall * (7 + crest * 58);
  const dish = Math.max(0, 1 - d / ROAD_HALF) * 0.8; // subtle road camber
  return base + mountains + detail - dish;
}

// ---- camera path derived from the same model -------------------

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

function zAt(t: number): number {
  // tiny ease in/out at the very ends; constant speed through the middle
  const e = smoothstep(0, 0.06, t) * (1 - 0.5 * smoothstep(0.94, 1, t));
  const tt = THREE.MathUtils.lerp(t, e, 0.15);
  return THREE.MathUtils.lerp(Z_START, Z_END, tt);
}

export function cameraPos(t: number, out: THREE.Vector3 = _pos): THREE.Vector3 {
  const z = zAt(clamp(t, 0, 1));
  return out.set(roadX(z), floorY(z) + EYE, z);
}

export function lookTarget(t: number, out: THREE.Vector3 = _look): THREE.Vector3 {
  const z = zAt(clamp(t + 0.02, 0, 1));
  // look a touch above the road so the peaks and sky fill the frame
  return out.set(roadX(z), floorY(z) + EYE + 2.2, z);
}

/** A point sitting on the ground near the road at progress t, offset
 *  sideways by `side` units. Used to place roadside props reliably. */
export function groundPoint(
  t: number,
  side = 0,
  out: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 {
  const z = zAt(clamp(t, 0, 1));
  const x = roadX(z) + side;
  return out.set(x, terrainHeight(x, z), z);
}

// Sun sits far down the pass, low on the horizon — the rider climbs
// toward it and crests into the dawn at the summit.
export const SUN_POS = new THREE.Vector3(roadX(Z_END), floorY(Z_END) + 26, Z_END - 140);

// Parked bike at the rider overlook — on the road shoulder, slightly ahead
// of mid-rider so the camera frames it as it climbs past.
export const BIKE_POS = groundPoint(0.875, 5, new THREE.Vector3());

// The swarm formation hovers over the pass at the swarm chapter — shared by
// the flock itself and the camera set piece that lifts off the road to meet it.
export const SWARM_ANCHOR = groundPoint(0.34, -17, new THREE.Vector3()).add(
  new THREE.Vector3(0, 15, 0)
);
