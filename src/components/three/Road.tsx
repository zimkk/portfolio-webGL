"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { roadX, terrainHeight, Z_START, Z_END } from "@/lib/world";

// A winding road ribbon laid on the valley floor up the whole pass, with
// reflective centre studs. Static geometry — the journey/trip made literal.
const SAMPLES = 520;
const HALF = 3.1;

export default function Road() {
  const ribbon = useMemo(() => {
    const positions = new Float32Array((SAMPLES + 1) * 2 * 3);
    const _t = new THREE.Vector3();
    for (let i = 0; i <= SAMPLES; i++) {
      const f = i / SAMPLES;
      const z = THREE.MathUtils.lerp(Z_START, Z_END, f);
      const zn = THREE.MathUtils.lerp(Z_START, Z_END, Math.min(1, f + 0.002));
      const cx = roadX(z);
      const cy = terrainHeight(cx, z) + 0.07;
      // tangent in XZ, lateral = perpendicular
      _t.set(roadX(zn) - cx, 0, zn - z).normalize();
      const lx = -_t.z;
      const lz = _t.x;
      const o = i * 6;
      positions[o] = cx + lx * HALF;
      positions[o + 1] = cy;
      positions[o + 2] = z + lz * HALF;
      positions[o + 3] = cx - lx * HALF;
      positions[o + 4] = cy;
      positions[o + 5] = z - lz * HALF;
    }
    const indices: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const a = i * 2;
      indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  const ribbonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#15171d",
        roughness: 0.82,
        metalness: 0.05,
        envMapIntensity: 0.4,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    []
  );

  // reflective centre studs (cat's-eyes) every few metres
  const studs = useMemo(() => {
    const count = 90;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const s = new THREE.Vector3(0.22, 0.22, 0.22);
    const p = new THREE.Vector3();
    const data: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const f = i / count;
      const z = THREE.MathUtils.lerp(Z_START, Z_END, f);
      const cx = roadX(z);
      p.set(cx, terrainHeight(cx, z) + 0.1, z);
      data.push(m.clone().compose(p, q, s));
    }
    return data;
  }, []);

  const studGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const studMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffd9a8", toneMapped: false, transparent: true, opacity: 0.7 }),
    []
  );

  return (
    <group>
      <mesh geometry={ribbon} material={ribbonMat} receiveShadow frustumCulled={false} />
      <instancedMesh
        args={[studGeo, studMat, studs.length]}
        ref={(inst) => {
          if (!inst) return;
          studs.forEach((mat, i) => inst.setMatrixAt(i, mat));
          inst.instanceMatrix.needsUpdate = true;
        }}
      />
    </group>
  );
}
