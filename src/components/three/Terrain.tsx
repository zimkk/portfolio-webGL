"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import { terrainHeight, floorY, roadX, ROAD_HALF, SUN_POS, Z_START, Z_END } from "@/lib/world";
import { sky } from "@/lib/sky";

type Props = {
  segments: number;
};

const WIDTH = 380;
const DEPTH = 520;
const CENTER_Z = (Z_START + Z_END) / 2;

// ============================================================
// Alpine terrain. CPU-displaced mesh with elevation/slope vertex
// colours, plus a shader pass that adds what vertex colours can't:
// alpenglow on the high snowfields before sunrise, and sun-glints
// sparkling off the snow once the light arrives.
// ============================================================
export default function Terrain({ segments }: Props) {
  const shaderExtras = useRef<{
    uAlpen: { value: number };
    uAlpenColor: { value: THREE.Color };
    uSunDir: { value: THREE.Vector3 };
    uSparkle: { value: number };
  }>({
    uAlpen: { value: 0 },
    uAlpenColor: { value: new THREE.Color("#ff9d8a") },
    uSunDir: { value: new THREE.Vector3(0, 0.2, -1) },
    uSparkle: { value: 0 },
  });

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(WIDTH, DEPTH, segments, segments);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, CENTER_Z);

    const pos = g.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, terrainHeight(x, z));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();

    // vertex colours from elevation-above-valley + slope — kept bright
    // enough that the moonlit night phase still reads as mountains
    const colors = new Float32Array(count * 3);
    const snowAttr = new Float32Array(count);
    const normal = g.attributes.normal as THREE.BufferAttribute;

    const rockLow = new THREE.Color("#2a303f");
    const rockHigh = new THREE.Color("#4b5570");
    const scree = new THREE.Color("#3a3f4e");
    const snow = new THREE.Color("#dce6f7");
    const road = new THREE.Color("#12141b");
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const rel = y - floorY(z); // height above the valley floor
      const ny = normal.getY(i); // 1 = flat, 0 = vertical
      const d = Math.abs(x - roadX(z));

      // rock gradient by elevation, banded strata for texture
      const rockMix = THREE.MathUtils.smoothstep(rel, 4, 40);
      tmp.copy(rockLow).lerp(rockHigh, rockMix);
      const strata = 0.5 + 0.5 * Math.sin(y * 0.9 + Math.sin(x * 0.13) * 2.0);
      tmp.lerp(scree, strata * 0.25);

      // snow accumulates high up and on flatter faces
      const snowAmt =
        THREE.MathUtils.smoothstep(rel, 22, 44) *
        THREE.MathUtils.smoothstep(ny, 0.5, 0.82);
      tmp.lerp(snow, snowAmt);
      snowAttr[i] = snowAmt;

      // dark road surface down the corridor
      const roadAmt = 1 - THREE.MathUtils.smoothstep(d, ROAD_HALF - 1.5, ROAD_HALF + 2);
      tmp.lerp(road, roadAmt * 0.9);

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSnow", new THREE.BufferAttribute(snowAttr, 1));
    return g;
  }, [segments]);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.0,
      flatShading: false,
    });
    const extras = shaderExtras.current;
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uAlpen = extras.uAlpen;
      shader.uniforms.uAlpenColor = extras.uAlpenColor;
      shader.uniforms.uSunDir = extras.uSunDir;
      shader.uniforms.uSparkle = extras.uSparkle;

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           attribute float aSnow;
           varying float vSnow;
           varying vec3 vWPos;
           varying vec3 vWNormal;`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vSnow = aSnow;
           vWPos = (modelMatrix * vec4(position, 1.0)).xyz;
           vWNormal = normalize(mat3(modelMatrix) * normal);`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uAlpen;
           uniform vec3 uAlpenColor;
           uniform vec3 uSunDir;
           uniform float uSparkle;
           varying float vSnow;
           varying vec3 vWPos;
           varying vec3 vWNormal;
           float h21t(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }`
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
           {
             vec3 sunD = normalize(uSunDir);
             float face = max(dot(normalize(vWNormal), sunD), 0.0);
             // alpenglow — the high snow catches rose light before the valley
             totalEmissiveRadiance += uAlpenColor * uAlpen * vSnow * pow(face, 1.4) * 0.55;
             // snow glints — static lattice, shimmer comes from camera motion
             float g1 = step(0.9965, h21t(floor(vWPos.xz * 6.0)));
             totalEmissiveRadiance += vec3(1.0, 0.95, 0.85) * g1 * vSnow * face * uSparkle * 0.9;
           }`
        );
    };
    return m;
  }, []);

  useFrame((state) => {
    const e = shaderExtras.current;
    e.uAlpen.value = sky.alpenglow;
    e.uSparkle.value = Math.max(0, sky.sunDisc - 0.1) * 0.9;
    e.uSunDir.value.copy(SUN_POS).sub(state.camera.position).normalize();
  });

  return (
    <group>
      <mesh geometry={geometry} material={material} receiveShadow frustumCulled={false} />
      <RidgeSilhouettes />
    </group>
  );
}

// ============================================================
// Distant ridgelines — flat silhouette strips beyond the real
// terrain that give the pass a deep, layered horizon. Their
// colour tracks the day-cycle: near = darker, far = sky-hazed.
// ============================================================
function RidgeSilhouettes() {
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);

  const layers = useMemo(() => {
    const perlin = new ImprovedNoise();
    const defs = [
      { z: Z_END - 120, amp: 70, base: 40, seed: 11.3, haze: 0.45 },
      { z: Z_END - 220, amp: 95, base: 55, seed: 47.8, haze: 0.7 },
      { z: Z_END - 330, amp: 120, base: 70, seed: 83.1, haze: 0.88 },
    ];
    return defs.map((d) => {
      const N = 180;
      const w = 1600;
      const positions = new Float32Array((N + 1) * 2 * 3);
      for (let i = 0; i <= N; i++) {
        const f = i / N;
        const x = (f - 0.5) * w;
        // ridged profile
        let h = 0;
        let amp = 1;
        let freq = 0.0025;
        for (let o = 0; o < 4; o++) {
          const n = 1 - Math.abs(perlin.noise(x * freq, d.seed, 0));
          h += n * n * amp;
          amp *= 0.5;
          freq *= 2.1;
        }
        const y = floorY(d.z) + d.base + h * d.amp - 40;
        const o6 = i * 6;
        positions[o6] = x;
        positions[o6 + 1] = y;
        positions[o6 + 2] = 0;
        positions[o6 + 3] = x;
        positions[o6 + 4] = -80;
        positions[o6 + 5] = 0;
      }
      const indices: number[] = [];
      for (let i = 0; i < N; i++) {
        const a = i * 2;
        indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      g.setIndex(indices);
      return { geometry: g, z: d.z, haze: d.haze };
    });
  }, []);

  useFrame(() => {
    for (let i = 0; i < layers.length; i++) {
      const m = mats.current[i];
      if (!m) continue;
      // silhouette colour sits between the fog and the horizon sky
      m.color.copy(sky.fog).lerp(sky.horizon, layers[i].haze * 0.85);
    }
  });

  return (
    <group>
      {layers.map((l, i) => (
        <mesh key={i} geometry={l.geometry} position={[0, 0, l.z]} frustumCulled={false}>
          <meshBasicMaterial
            ref={(m) => {
              if (m) mats.current[i] = m;
            }}
            color="#0d1730"
            fog={false}
            depthWrite={true}
          />
        </mesh>
      ))}
    </group>
  );
}
