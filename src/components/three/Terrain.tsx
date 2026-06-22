"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { terrainHeight, floorY, roadX, ROAD_HALF } from "@/lib/world";
import { Z_START, Z_END } from "@/lib/world";

type Props = {
  segments: number;
};

const WIDTH = 380;
const DEPTH = 520;
const CENTER_Z = (Z_START + Z_END) / 2;

// Realistic alpine terrain: a displaced mesh with proper normals and
// elevation/slope vertex colours (rock → snow). Generated once on the
// CPU, so it lights correctly and never churns the render loop.
export default function Terrain({ segments }: Props) {
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

    // vertex colours from elevation-above-valley + slope
    const colors = new Float32Array(count * 3);
    const normal = g.attributes.normal as THREE.BufferAttribute;

    const rockLow = new THREE.Color("#21252f");
    const rockHigh = new THREE.Color("#3c4454");
    const snow = new THREE.Color("#c8d3e6");
    const road = new THREE.Color("#101218");
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const rel = y - floorY(z); // height above the valley floor
      const ny = normal.getY(i); // 1 = flat, 0 = vertical
      const d = Math.abs(x - roadX(z));

      // rock gradient by elevation
      const rockMix = THREE.MathUtils.smoothstep(rel, 4, 40);
      tmp.copy(rockLow).lerp(rockHigh, rockMix);

      // snow accumulates high up and on flatter faces
      const snowAmt =
        THREE.MathUtils.smoothstep(rel, 26, 50) *
        THREE.MathUtils.smoothstep(ny, 0.55, 0.85);
      tmp.lerp(snow, snowAmt);

      // dark road surface down the corridor
      const roadAmt = 1 - THREE.MathUtils.smoothstep(d, ROAD_HALF - 1.5, ROAD_HALF + 2);
      tmp.lerp(road, roadAmt * 0.9);

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [segments]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        metalness: 0.0,
        flatShading: false,
      }),
    []
  );

  return <mesh geometry={geometry} material={material} receiveShadow frustumCulled={false} />;
}
