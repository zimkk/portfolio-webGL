"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ride, lerp } from "@/lib/ride";
import { Z_START, Z_END, floorY, roadX } from "@/lib/world";

// ─── Fog-plane shader ────────────────────────────────────────────────────────
// Renders a large flat plane as a soft volumetric mist slab.
// uTime drives the slow wisp drift; uOpacity lets the scene animate density.

const fogVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fogFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorld;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3  uColor;

  // cheap 2-octave noise (no texture needed)
  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(hash(i),           hash(i+vec2(1,0)), f.x),
      mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x),
      f.y
    );
  }
  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for(int i=0;i<3;i++){
      v += a * noise(p);
      p  = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // drift the noise slowly in XZ
    vec2 uv = vWorld.xz * 0.006 + vec2(uTime * 0.018, uTime * 0.009);
    float n = fbm(uv);

    // soft radial edge fade so the plane has no hard border
    vec2 centered = vUv * 2.0 - 1.0;
    float edge = 1.0 - smoothstep(0.55, 1.0, length(centered));

    float alpha = n * edge * uOpacity;
    // feather bottom and top of slab
    float yFade = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.65, 1.0, vUv.y));
    alpha *= yFade;

    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
  }
`;

// ─── Layer definition ────────────────────────────────────────────────────────
type Layer = {
  z: number;       // world-space depth
  y: number;       // height of the slab centre
  width: number;
  height: number;  // slab thickness (visual)
  opacity: number;
  color: THREE.Color;
  driftSpeed: number; // Y oscillation speed (subtle bob)
};

function makeLayers(): Layer[] {
  const layers: Layer[] = [];
  const total = Z_END - Z_START;   // negative
  const steps = 9;

  for (let i = 0; i < steps; i++) {
    const t   = i / (steps - 1);
    const z   = Z_START + total * (0.05 + t * 0.92);
    const y   = floorY(z) + 1.5 + Math.sin(i * 2.3) * 1.8;
    const opacity = 0.18 + Math.sin(i * 1.7) * 0.07;

    // colour drifts from cold blue-grey near start → warm dusty mauve toward summit
    const cold = new THREE.Color("#0d1528");
    const warm = new THREE.Color("#2a1a22");
    layers.push({
      z,
      y,
      width: 160 + Math.sin(i * 3.1) * 30,
      height: 6 + Math.cos(i * 2.1) * 2,
      opacity,
      color: cold.clone().lerp(warm, t),
      driftSpeed: 0.18 + i * 0.04,
    });
  }

  // dense low-lying valley floor mist slabs (wide, thin, very opaque)
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const z = Z_START + total * (0.1 + t * 0.7);
    layers.push({
      z,
      y: floorY(z) - 0.4,
      width: 220,
      height: 3.5,
      opacity: 0.28,
      color: new THREE.Color("#0a1020"),
      driftSpeed: 0.1 + i * 0.03,
    });
  }

  return layers;
}

// ─── Single fog plane ────────────────────────────────────────────────────────
function FogSlab({ layer, timeRef }: { layer: Layer; timeRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime:    { value: 0 },
      uOpacity: { value: layer.opacity },
      uColor:   { value: layer.color.clone() },
    }),
    [layer]
  );

  const geo = useMemo(
    () => new THREE.PlaneGeometry(layer.width, layer.height, 1, 1),
    [layer.width, layer.height]
  );

  const baseY = layer.y;

  useFrame(() => {
    if (!matRef.current || !meshRef.current) return;
    matRef.current.uniforms.uTime.value = timeRef.current;

    // gentle vertical bob
    meshRef.current.position.y =
      baseY + Math.sin(timeRef.current * layer.driftSpeed * 0.6 + layer.z) * 0.6;

    // opacity breathes with scroll warmth (ride.progress drives warm phase)
    const warm = Math.max(0, (ride.progress - 0.55) / 0.45);
    const warmScale = 1 - warm * 0.35;        // mist thins as we crest into dawn
    matRef.current.uniforms.uOpacity.value = layer.opacity * warmScale;

    // colour warms subtly
    const cold = new THREE.Color("#0d1528");
    const warm2 = new THREE.Color("#2a1a22");
    matRef.current.uniforms.uColor.value.copy(cold).lerp(warm2, ride.progress * 0.6);
  });

  return (
    <mesh
      ref={meshRef}
      position={[roadX(layer.z), baseY, layer.z]}
      rotation={[-Math.PI * 0.5, 0, 0]}   // flat horizontal slab
      frustumCulled={false}
    >
      <primitive object={geo} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={fogVert}
        fragmentShader={fogFrag}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function FogPlanes() {
  const layers   = useMemo(() => makeLayers(), []);
  const timeRef  = useRef(0);

  useFrame((_, dt) => {
    timeRef.current += dt;
  });

  return (
    <group>
      {layers.map((layer, i) => (
        <FogSlab key={i} layer={layer} timeRef={timeRef} />
      ))}
    </group>
  );
}
