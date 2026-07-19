"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { roadX, terrainHeight, Z_START, Z_END } from "@/lib/world";
import { sky } from "@/lib/sky";

// ============================================================
// The road — the story's spine, so it has to read in every light:
//   asphalt ribbon with a faint moonlit sheen
//   painted edge lines down both shoulders
//   dashed centreline
//   amber cat's-eyes that glow hardest in the dark
//   white guard posts marking the drops on the outer edge
// ============================================================

const SAMPLES = 520;
const HALF = 3.1;

/** Build a ribbon that follows the road at a lateral offset. */
function buildRibbon(offset: number, width: number, lift: number): THREE.BufferGeometry {
  const positions = new Float32Array((SAMPLES + 1) * 2 * 3);
  const _t = new THREE.Vector3();
  for (let i = 0; i <= SAMPLES; i++) {
    const f = i / SAMPLES;
    const z = THREE.MathUtils.lerp(Z_START, Z_END, f);
    const zn = THREE.MathUtils.lerp(Z_START, Z_END, Math.min(1, f + 0.002));
    const cx = roadX(z);
    const cy = terrainHeight(cx, z) + lift;
    _t.set(roadX(zn) - cx, 0, zn - z).normalize();
    const lx = -_t.z;
    const lz = _t.x;
    const ox = cx + lx * offset;
    const oz = z + lz * offset;
    const o = i * 6;
    positions[o] = ox + lx * (width / 2);
    positions[o + 1] = cy;
    positions[o + 2] = oz + lz * (width / 2);
    positions[o + 3] = ox - lx * (width / 2);
    positions[o + 4] = cy;
    positions[o + 5] = oz - lz * (width / 2);
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
}

/** Matrices placed along the road with correct heading. */
function alongRoad(
  count: number,
  offset: number,
  lift: number,
  scale: THREE.Vector3,
  f0 = 0.004,
  f1 = 0.996
): THREE.Matrix4[] {
  const m: THREE.Matrix4[] = [];
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const _t = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const f = THREE.MathUtils.lerp(f0, f1, i / (count - 1));
    const z = THREE.MathUtils.lerp(Z_START, Z_END, f);
    const zn = THREE.MathUtils.lerp(Z_START, Z_END, Math.min(1, f + 0.002));
    const cx = roadX(z);
    _t.set(roadX(zn) - cx, 0, zn - z).normalize();
    const lx = -_t.z;
    const lz = _t.x;
    const x = cx + lx * offset;
    const zz = z + lz * offset;
    p.set(x, terrainHeight(offset === 0 ? cx : x, zz) + lift, zz);
    e.set(0, Math.atan2(_t.x, _t.z), 0);
    q.setFromEuler(e);
    m.push(new THREE.Matrix4().compose(p.clone(), q.clone(), scale));
  }
  return m;
}

function setMatrices(inst: THREE.InstancedMesh | null, mats: THREE.Matrix4[]) {
  if (!inst) return;
  mats.forEach((m, i) => inst.setMatrixAt(i, m));
  inst.instanceMatrix.needsUpdate = true;
}

export default function Road() {
  const ribbon = useMemo(() => buildRibbon(0, HALF * 2, 0.07), []);
  const edgeL = useMemo(() => buildRibbon(-(HALF - 0.35), 0.16, 0.1), []);
  const edgeR = useMemo(() => buildRibbon(HALF - 0.35, 0.16, 0.1), []);

  const ribbonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1b1e27",
        roughness: 0.72,
        metalness: 0.08,
        envMapIntensity: 0.7,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    []
  );

  // painted lines: unlit so they read as paint in any light
  const edgeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#5f6b85", toneMapped: false }),
    []
  );

  // dashed centreline
  const dashMats = useMemo(
    () => alongRoad(150, 0, 0.1, new THREE.Vector3(0.15, 1, 1.7)),
    []
  );
  const dashGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const dashMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#78849e", toneMapped: false }),
    []
  );

  // cat's-eyes — amber, additive, brightest at night
  const studMats = useMemo(
    () => alongRoad(140, 0, 0.12, new THREE.Vector3(0.24, 1, 0.24), 0.008, 0.992),
    []
  );
  const studGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const studMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffd9a8",
        toneMapped: false,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // guard posts down the outer shoulder — white markers with a reflector band
  const postMatsL = useMemo(
    () => alongRoad(40, -(HALF + 0.9), 0.45, new THREE.Vector3(0.09, 0.9, 0.09)),
    []
  );
  const postMatsR = useMemo(
    () => alongRoad(40, HALF + 0.9, 0.45, new THREE.Vector3(0.09, 0.9, 0.09)),
    []
  );
  const postGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const postMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#aab4c6", roughness: 0.6 }),
    []
  );
  const reflMatsL = useMemo(
    () => alongRoad(40, -(HALF + 0.9), 0.82, new THREE.Vector3(0.11, 0.1, 0.11)),
    []
  );
  const reflMatsR = useMemo(
    () => alongRoad(40, HALF + 0.9, 0.82, new THREE.Vector3(0.11, 0.1, 0.11)),
    []
  );
  const reflMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ff7e5d",
        toneMapped: false,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const edgeNight = useMemo(() => new THREE.Color("#8a95b0"), []);
  const edgeDay = useMemo(() => new THREE.Color("#55607a"), []);

  useFrame(() => {
    // markings glow against the night, settle into paint by day
    const night = sky.headlight; // 1 night → 0 morning
    studMat.opacity = 0.35 + night * 0.6;
    reflMat.opacity = 0.3 + night * 0.65;
    edgeMat.color.lerpColors(edgeNight, edgeDay, 1 - night);
  });

  return (
    <group>
      <mesh geometry={ribbon} material={ribbonMat} receiveShadow frustumCulled={false} />
      <mesh geometry={edgeL} material={edgeMat} frustumCulled={false} />
      <mesh geometry={edgeR} material={edgeMat} frustumCulled={false} />
      <instancedMesh
        args={[dashGeo, dashMat, dashMats.length]}
        ref={(i) => setMatrices(i, dashMats)}
        frustumCulled={false}
      />
      <instancedMesh
        args={[studGeo, studMat, studMats.length]}
        ref={(i) => setMatrices(i, studMats)}
        frustumCulled={false}
      />
      <instancedMesh
        args={[postGeo, postMat, postMatsL.length]}
        ref={(i) => setMatrices(i, postMatsL)}
        frustumCulled={false}
      />
      <instancedMesh
        args={[postGeo, postMat, postMatsR.length]}
        ref={(i) => setMatrices(i, postMatsR)}
        frustumCulled={false}
      />
      <instancedMesh
        args={[postGeo, reflMat, reflMatsL.length]}
        ref={(i) => setMatrices(i, reflMatsL)}
        frustumCulled={false}
      />
      <instancedMesh
        args={[postGeo, reflMat, reflMatsR.length]}
        ref={(i) => setMatrices(i, reflMatsR)}
        frustumCulled={false}
      />
    </group>
  );
}
