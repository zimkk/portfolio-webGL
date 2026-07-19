"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ride, localProgress, smoothstep } from "@/lib/ride";
import { groundPoint, terrainHeight, ROAD_HALF } from "@/lib/world";
import { sky } from "@/lib/sky";

// ============================================================
// Small signs of life along the pass:
//   ValleyLights — far village lights that live in the night phase
//   PennantLines — strings of bright pennants over the road
//   SpeedStreaks — air rushing past on the velocity run
//   DawnMotes    — backlit dust hanging in the sunrise
// ============================================================
export default function WorldLife() {
  return (
    <group>
      <ValleyLights />
      <PennantLines />
      <SpeedStreaks />
      <DawnMotes />
    </group>
  );
}

/* ---------------- soft round sprite for point particles ---------------- */
let glowTex: THREE.CanvasTexture | null = null;
function getGlowTexture(): THREE.CanvasTexture {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

/* ---------------- distant village lights ---------------- */
function ValleyLights() {
  const matRef = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const rng = mulberry(1234);
    const pts: number[] = [];
    // clusters scattered on the valley slopes, well away from the road
    const clusters = [
      { t: 0.08, side: -46 },
      { t: 0.16, side: 60 },
      { t: 0.27, side: -70 },
      { t: 0.38, side: 52 },
      { t: 0.5, side: -58 },
      { t: 0.62, side: 74 },
    ];
    const c = new THREE.Vector3();
    for (const cl of clusters) {
      groundPoint(cl.t, cl.side, c);
      const n = 6 + Math.floor(rng() * 6);
      for (let i = 0; i < n; i++) {
        const x = c.x + (rng() - 0.5) * 22;
        const z = c.z + (rng() - 0.5) * 22;
        const y = terrainHeight(x, z) + 0.6 + rng() * 1.2;
        pts.push(x, y, z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    // windows glow at night, die out as the morning arrives
    const flicker = 0.9 + Math.sin(state.clock.elapsedTime * 7.3) * 0.06;
    matRef.current.opacity = (0.15 + sky.stars * 0.85) * flicker * 0.9;
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        map={getGlowTexture()}
        color="#ffbe78"
        size={0.9}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------- pennant strings over the road ---------------- */
const PENNANT_COLORS = ["#ff5d5d", "#ffc857", "#4dd599", "#5b9dff", "#ff8ac2", "#a78bfa"];

function PennantLines() {
  const flagsRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  const { sites, count, base } = useMemo(() => {
    const sites = [0.135, 0.47, 0.79].map((t) => {
      const c = groundPoint(t, 0, new THREE.Vector3());
      return { center: c, t };
    });
    const perLine = 14;
    const span = (ROAD_HALF + 2) * 2;
    const base: { p: THREE.Vector3; site: number; f: number }[] = [];
    for (let s = 0; s < sites.length; s++) {
      const c = sites[s].center;
      for (let i = 0; i < perLine; i++) {
        const f = i / (perLine - 1);
        const x = c.x - span / 2 + f * span;
        // catenary sag between two 5m poles
        const sag = Math.sin(f * Math.PI) * -1.1;
        const y = c.y + 5 + sag;
        base.push({ p: new THREE.Vector3(x, y, c.z), site: s, f });
      }
    }
    return { sites, count: base.length, base };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    timeRef.current += dt;
    const inst = flagsRef.current;
    if (!inst) return;
    const t = timeRef.current;
    for (let i = 0; i < count; i++) {
      const b = base[i];
      dummy.position.copy(b.p);
      // wind flutter — phase runs down the line
      dummy.rotation.set(
        Math.sin(t * 3.1 + b.f * 9.0 + b.site) * 0.35,
        Math.sin(t * 2.3 + b.f * 7.0) * 0.5,
        Math.sin(t * 4.1 + b.f * 11.0) * 0.25
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  const paint = (inst: THREE.InstancedMesh | null) => {
    flagsRef.current = inst;
    if (!inst) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(PENNANT_COLORS[i % PENNANT_COLORS.length]);
      inst.setColorAt(i, c);
    }
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  };

  return (
    <group>
      <instancedMesh ref={paint} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[0.55, 0.4]} />
        <meshStandardMaterial side={THREE.DoubleSide} roughness={0.8} />
      </instancedMesh>
      {/* poles */}
      {sites.map((s, i) => (
        <group key={i}>
          <Pole x={s.center.x - (ROAD_HALF + 2)} z={s.center.z} />
          <Pole x={s.center.x + (ROAD_HALF + 2)} z={s.center.z} />
        </group>
      ))}
    </group>
  );
}

function Pole({ x, z }: { x: number; z: number }) {
  const y = useMemo(() => terrainHeight(x, z), [x, z]);
  return (
    <mesh position={[x, y + 2.5, z]}>
      <cylinderGeometry args={[0.06, 0.1, 5.4, 6]} />
      <meshStandardMaterial color="#2a2f3d" roughness={0.7} metalness={0.3} />
    </mesh>
  );
}

/* ---------------- velocity speed streaks ---------------- */
const STREAKS = 90;

function SpeedStreaks() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  // camera-local cylindrical offsets: {radius, angle, along-axis depth}
  const seeds = useMemo(() => {
    const rng = mulberry(77);
    return Array.from({ length: STREAKS }, () => ({
      r: 2.5 + rng() * 9,
      a: rng() * Math.PI * 2,
      z: -rng() * 42,
      len: 1.2 + rng() * 2.6,
    }));
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(STREAKS * 2 * 3), 3));
    return g;
  }, []);

  const _right = useMemo(() => new THREE.Vector3(), []);
  const _up = useMemo(() => new THREE.Vector3(), []);
  const _fwd = useMemo(() => new THREE.Vector3(), []);
  const _a = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const vel = localProgress(ride.progress, "velocity");
    const velEnv = smoothstep(0, 0.25, vel) * (1 - smoothstep(0.75, 1, vel));
    const strength = velEnv * Math.min(0.25 + ride.velocity * 40, 1);

    if (matRef.current) matRef.current.opacity = strength * 0.5;
    if (strength < 0.01 || !lineRef.current) {
      if (lineRef.current) lineRef.current.visible = strength >= 0.01;
      return;
    }
    lineRef.current.visible = true;

    const cam = state.camera;
    cam.getWorldDirection(_fwd);
    _right.copy(_fwd).cross(cam.up).normalize();
    _up.copy(_right).cross(_fwd).normalize();

    const speed = 30 + ride.velocity * 900;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < STREAKS; i++) {
      const s = seeds[i];
      s.z += speed * dt; // streaks fly toward the camera
      if (s.z > 4) s.z -= 46;
      const ox = Math.cos(s.a) * s.r;
      const oy = Math.sin(s.a) * s.r * 0.6;
      _a.copy(cam.position)
        .addScaledVector(_right, ox)
        .addScaledVector(_up, oy)
        .addScaledVector(_fwd, -s.z);
      pos.setXYZ(i * 2, _a.x, _a.y, _a.z);
      _a.addScaledVector(_fwd, -s.len * (0.6 + strength));
      pos.setXYZ(i * 2 + 1, _a.x, _a.y, _a.z);
    }
    pos.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        ref={matRef}
        color="#9fc0ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* ---------------- backlit dawn dust ---------------- */
const MOTES = 160;

function DawnMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const seeds = useMemo(() => {
    const rng = mulberry(31);
    return Array.from({ length: MOTES }, () => ({
      x: (rng() - 0.5) * 30,
      y: (rng() - 0.5) * 14,
      z: -rng() * 40,
      ph: rng() * Math.PI * 2,
      sp: 0.2 + rng() * 0.5,
    }));
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MOTES * 3), 3));
    return g;
  }, []);

  const _fwd = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const p = ride.progress;
    const glow = Math.max(0, sky.sunDisc - 0.15);
    const summit = localProgress(p, "summit");
    const riderP = localProgress(p, "rider");
    const zone = Math.max(
      smoothstep(0.05, 0.3, summit) * (1 - smoothstep(0.9, 1, summit)),
      smoothstep(0, 0.3, riderP) * (1 - smoothstep(0.8, 1, riderP))
    );
    const amt = glow * zone;
    if (matRef.current) matRef.current.opacity = amt * 0.3;
    if (!pointsRef.current) return;
    pointsRef.current.visible = amt > 0.01;
    if (amt <= 0.01) return;

    const cam = state.camera;
    cam.getWorldDirection(_fwd);
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < MOTES; i++) {
      const s = seeds[i];
      pos.setXYZ(
        i,
        cam.position.x + s.x + Math.sin(t * s.sp + s.ph) * 1.6 + _fwd.x * -s.z,
        cam.position.y + s.y + Math.sin(t * s.sp * 0.7 + s.ph * 2.0) * 1.0 + _fwd.y * -s.z,
        cam.position.z + Math.cos(t * s.sp * 0.5 + s.ph) * 1.2 + _fwd.z * -s.z
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        map={getGlowTexture()}
        color="#ffd9a8"
        size={0.11}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------- tiny deterministic rng ---------------- */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
