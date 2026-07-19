import * as THREE from "three";
import { clamp } from "./ride";

// ============================================================
// The day-cycle. One keyframed grade for the whole ride:
// deep night → astronomical → nautical → civil dawn →
// sunrise at the summit → soft golden morning.
// Every system (sky, terrain, fog, lights, post) samples this
// so the entire frame always agrees about the time of day.
// ============================================================

export type SkyState = {
  zenith: THREE.Color; // sky top
  horizon: THREE.Color; // sky at the horizon band
  glow: THREE.Color; // scattering glow around the sun azimuth
  fog: THREE.Color;
  fogDensity: number;
  stars: number; // 0..1 star field visibility
  milkyWay: number; // 0..1 galactic band visibility
  cloud: number; // 0..1 cirrus visibility (dawn lights them first)
  cloudWarm: number; // 0..1 how much the clouds catch fire
  sunIntensity: number; // directional light strength
  sunDisc: number; // sun disc brightness 0..1.5
  sunColor: THREE.Color;
  alpenglow: number; // 0..1 pink light on high snow before sunrise
  ambient: number;
  hemi: number;
  exposure: number; // tone-mapping exposure ramp
  headlight: number; // 0..1 rider headlight relevance
};

type Key = {
  p: number;
  zenith: string;
  horizon: string;
  glow: string;
  fog: string;
  fogDensity: number;
  stars: number;
  milkyWay: number;
  cloud: number;
  cloudWarm: number;
  sunIntensity: number;
  sunDisc: number;
  sunColor: string;
  alpenglow: number;
  ambient: number;
  hemi: number;
  exposure: number;
  headlight: number;
};

// Scene bands for reference (weights → progress):
// hero→0.088, departure→0.177, build→0.265, swarm→0.442,
// skills→0.558, velocity→0.681, summit→0.823, rider→0.912, horizon→1
const KEYS: Key[] = [
  {
    // deep night — moonlit blue, heavy stars, Milky Way overhead
    p: 0.0,
    zenith: "#050914",
    horizon: "#0d1730",
    glow: "#16244d",
    fog: "#0b1226",
    fogDensity: 0.0105,
    stars: 1.0,
    milkyWay: 1.0,
    cloud: 0.25,
    cloudWarm: 0.0,
    sunIntensity: 0.85,
    sunDisc: 0.0,
    sunColor: "#b9cdfd",
    alpenglow: 0.0,
    ambient: 0.24,
    hemi: 0.78,
    exposure: 1.06,
    headlight: 1.0,
  },
  {
    // end of hero / departure — still night, horizon hints indigo
    p: 0.14,
    zenith: "#060a17",
    horizon: "#121d3c",
    glow: "#1b2c5e",
    fog: "#0c142b",
    fogDensity: 0.0102,
    stars: 1.0,
    milkyWay: 0.9,
    cloud: 0.3,
    cloudWarm: 0.0,
    sunIntensity: 0.9,
    sunDisc: 0.0,
    sunColor: "#b9cdfd",
    alpenglow: 0.0,
    ambient: 0.25,
    hemi: 0.8,
    exposure: 1.07,
    headlight: 1.0,
  },
  {
    // astronomical dawn — first deep indigo wedge down the pass
    p: 0.3,
    zenith: "#081020",
    horizon: "#1c2b58",
    glow: "#2c3f7d",
    fog: "#101a35",
    fogDensity: 0.0096,
    stars: 0.85,
    milkyWay: 0.55,
    cloud: 0.4,
    cloudWarm: 0.05,
    sunIntensity: 1.0,
    sunDisc: 0.0,
    sunColor: "#c4d4ff",
    alpenglow: 0.06,
    ambient: 0.27,
    hemi: 0.85,
    exposure: 1.08,
    headlight: 0.9,
  },
  {
    // nautical dawn (the swarm) — teal-indigo band, stars thinning
    p: 0.45,
    zenith: "#0b1730",
    horizon: "#2c4a7c",
    glow: "#4a6396",
    fog: "#16233f",
    fogDensity: 0.0088,
    stars: 0.55,
    milkyWay: 0.22,
    cloud: 0.55,
    cloudWarm: 0.16,
    sunIntensity: 1.15,
    sunDisc: 0.05,
    sunColor: "#d8e2ff",
    alpenglow: 0.22,
    ambient: 0.29,
    hemi: 0.95,
    exposure: 1.1,
    headlight: 0.7,
  },
  {
    // civil dawn (skills) — alpenglow fires the snowfields pink
    p: 0.57,
    zenith: "#12203e",
    horizon: "#5a5a8c",
    glow: "#a06a7e",
    fog: "#232c4a",
    fogDensity: 0.008,
    stars: 0.22,
    milkyWay: 0.05,
    cloud: 0.7,
    cloudWarm: 0.45,
    sunIntensity: 1.2,
    sunDisc: 0.14,
    sunColor: "#ffd9b8",
    alpenglow: 0.85,
    ambient: 0.28,
    hemi: 0.85,
    exposure: 1.1,
    headlight: 0.4,
  },
  {
    // pre-sunrise burn (velocity) — horizon molten, valley still blue
    p: 0.68,
    zenith: "#1a2a4c",
    horizon: "#9c5e60",
    glow: "#e08850",
    fog: "#33344e",
    fogDensity: 0.0072,
    stars: 0.06,
    milkyWay: 0.0,
    cloud: 0.8,
    cloudWarm: 0.8,
    sunIntensity: 1.6,
    sunDisc: 0.32,
    sunColor: "#ffc494",
    alpenglow: 1.0,
    ambient: 0.32,
    hemi: 1.0,
    exposure: 1.14,
    headlight: 0.15,
  },
  {
    // SUNRISE — the summit payoff. Disc crests, gold floods the pass
    p: 0.77,
    zenith: "#27355e",
    horizon: "#e2854e",
    glow: "#ffa050",
    fog: "#5c4348",
    fogDensity: 0.0052,
    stars: 0.0,
    milkyWay: 0.0,
    cloud: 0.85,
    cloudWarm: 1.0,
    sunIntensity: 2.9,
    sunDisc: 1.25,
    sunColor: "#ffb27a",
    alpenglow: 0.55,
    ambient: 0.4,
    hemi: 1.25,
    exposure: 1.22,
    headlight: 0.0,
  },
  {
    // golden morning (rider) — soft, warm, calm
    p: 0.9,
    zenith: "#3c5184",
    horizon: "#d29060",
    glow: "#ffb070",
    fog: "#5f4a4c",
    fogDensity: 0.0046,
    stars: 0.0,
    milkyWay: 0.0,
    cloud: 0.8,
    cloudWarm: 0.85,
    sunIntensity: 2.6,
    sunDisc: 1.1,
    sunColor: "#ffc08a",
    alpenglow: 0.35,
    ambient: 0.5,
    hemi: 1.5,
    exposure: 1.26,
    headlight: 0.0,
  },
  {
    // horizon — morning settles, sky opens
    p: 1.0,
    zenith: "#4a6295",
    horizon: "#c99a72",
    glow: "#ffc088",
    fog: "#5c4f52",
    fogDensity: 0.0042,
    stars: 0.0,
    milkyWay: 0.0,
    cloud: 0.75,
    cloudWarm: 0.7,
    sunIntensity: 2.4,
    sunDisc: 1.0,
    sunColor: "#ffcf9e",
    alpenglow: 0.25,
    ambient: 0.52,
    hemi: 1.55,
    exposure: 1.26,
    headlight: 0.0,
  },
];

// Pre-parse key colors once.
const PARSED = KEYS.map((k) => ({
  ...k,
  zenithC: new THREE.Color(k.zenith),
  horizonC: new THREE.Color(k.horizon),
  glowC: new THREE.Color(k.glow),
  fogC: new THREE.Color(k.fog),
  sunColorC: new THREE.Color(k.sunColor),
}));

export function createSkyState(): SkyState {
  return {
    zenith: new THREE.Color(),
    horizon: new THREE.Color(),
    glow: new THREE.Color(),
    fog: new THREE.Color(),
    fogDensity: 0.01,
    stars: 1,
    milkyWay: 1,
    cloud: 0.3,
    cloudWarm: 0,
    sunIntensity: 0.6,
    sunDisc: 0,
    sunColor: new THREE.Color(),
    alpenglow: 0,
    ambient: 0.16,
    hemi: 0.5,
    exposure: 1,
    headlight: 1,
  };
}

function smoother(t: number) {
  // smootherstep — C2 continuous so grades never visibly "kink"
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Sample the day-cycle at ride progress p (0..1) into `out`. */
export function skyAt(p: number, out: SkyState): SkyState {
  const x = clamp(p, 0, 1);
  let i = 0;
  while (i < PARSED.length - 2 && x > PARSED[i + 1].p) i++;
  const a = PARSED[i];
  const b = PARSED[i + 1];
  const t = smoother(clamp((x - a.p) / (b.p - a.p), 0, 1));

  out.zenith.copy(a.zenithC).lerp(b.zenithC, t);
  out.horizon.copy(a.horizonC).lerp(b.horizonC, t);
  out.glow.copy(a.glowC).lerp(b.glowC, t);
  out.fog.copy(a.fogC).lerp(b.fogC, t);
  out.sunColor.copy(a.sunColorC).lerp(b.sunColorC, t);

  out.fogDensity = a.fogDensity + (b.fogDensity - a.fogDensity) * t;
  out.stars = a.stars + (b.stars - a.stars) * t;
  out.milkyWay = a.milkyWay + (b.milkyWay - a.milkyWay) * t;
  out.cloud = a.cloud + (b.cloud - a.cloud) * t;
  out.cloudWarm = a.cloudWarm + (b.cloudWarm - a.cloudWarm) * t;
  out.sunIntensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * t;
  out.sunDisc = a.sunDisc + (b.sunDisc - a.sunDisc) * t;
  out.alpenglow = a.alpenglow + (b.alpenglow - a.alpenglow) * t;
  out.ambient = a.ambient + (b.ambient - a.ambient) * t;
  out.hemi = a.hemi + (b.hemi - a.hemi) * t;
  out.exposure = a.exposure + (b.exposure - a.exposure) * t;
  out.headlight = a.headlight + (b.headlight - a.headlight) * t;
  return out;
}

// One shared, smoothed sample updated by Atmosphere each frame and read
// by every other system (terrain, post, particles, roadside lights).
export const sky = createSkyState();
