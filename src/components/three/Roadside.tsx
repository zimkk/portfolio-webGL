"use client";

import { Suspense, useMemo } from "react";
import { Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { groundPoint, BIKE_POS } from "@/lib/world";

const BIKE_URL = "/models/honda_shadow_rs_2010/scene.gltf";
const BIKE_LENGTH = 3.6; // target world length for the model

// Roadside props that simply exist in the world at fixed positions. The rider
// approaches and passes them as the camera climbs — nothing spawns. Fog and
// distance handle visibility.
export default function Roadside() {
  return (
    <group>
      <LatticeTowers />
      <GridcoreMarker />
      {/* loads its own model without blocking the rest of the world */}
      <Suspense fallback={null}>
        <ParkedBike />
      </Suspense>
    </group>
  );
}

/* ---------------- lattice / comms towers ---------------- */
function LatticeTowers() {
  const mastMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#181b25", metalness: 0.7, roughness: 0.45 }),
    []
  );
  const strutMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#23283a", metalness: 0.6, roughness: 0.5 }),
    []
  );
  const beaconMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#6b8aff", toneMapped: false }),
    []
  );

  const towers = useMemo(() => {
    const arr: { p: THREE.Vector3; h: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const t = 0.205 + (i / 9) * 0.085;
      const side = (i % 2 === 0 ? 1 : -1) * 8;
      arr.push({ p: groundPoint(t, side, new THREE.Vector3()), h: 8 + (i % 3) * 3 });
    }
    return arr;
  }, []);

  return (
    <group>
      {towers.map((t, i) => {
        const rings = Math.max(3, Math.round(t.h / 2.5));
        return (
          <group key={i} position={[t.p.x, t.p.y, t.p.z]}>
            {/* central mast */}
            <mesh position={[0, t.h / 2, 0]} material={mastMat}>
              <cylinderGeometry args={[0.12, 0.32, t.h, 6]} />
            </mesh>
            {/* horizontal truss rings up the height */}
            {Array.from({ length: rings }).map((_, r) => {
              const y = ((r + 1) / (rings + 1)) * t.h;
              const rad = THREE.MathUtils.lerp(0.42, 0.16, y / t.h);
              return (
                <mesh key={r} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={strutMat}>
                  <torusGeometry args={[rad, 0.03, 6, 12]} />
                </mesh>
              );
            })}
            {/* beacon */}
            <mesh position={[0, t.h + 0.25, 0]} material={beaconMat}>
              <sphereGeometry args={[0.2, 10, 10]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ---------------- gridcore.co marker ---------------- */
function GridcoreMarker() {
  const pos = useMemo(() => groundPoint(0.255, 8, new THREE.Vector3()), []);
  return (
    <group position={[pos.x, pos.y + 3.4, pos.z]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[6, 1.8]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.3} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Text fontSize={0.8} color="#7fe9ff" anchorX="center" anchorY="middle" material-toneMapped={false}>
        gridcore.co
      </Text>
      <mesh position={[0, -2.6, 0]}>
        <boxGeometry args={[0.16, 4.2, 0.16]} />
        <meshStandardMaterial color="#2a2f40" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ---------------- parked motorcycle (Honda Shadow RS, CC-BY-NC-ND) ----------------
   The model is only placed / scaled / rotated — not modified — and credited in the
   footer, per its licence. */
function ParkedBike() {
  const { scene } = useGLTF(BIKE_URL);

  const { model, scaleF, offset, yaw } = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.frustumCulled = false;
      // clone materials (clone(true) shares them with the cache) and lift the
      // near-black paint so it reads against the dark dawn
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const cloned = mats.map((src) => {
        const mat = (src as THREE.MeshStandardMaterial).clone();
        if ("envMapIntensity" in mat) mat.envMapIntensity = 1.4;
        if (mat.color) mat.color.multiplyScalar(1.2);
        mat.needsUpdate = true;
        return mat;
      });
      m.material = cloned.length === 1 ? cloned[0] : cloned;
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    const lengthAlongX = size.x >= size.z;
    const s = BIKE_LENGTH / Math.max(size.x, size.z);
    const y = (lengthAlongX ? Math.PI / 2 : 0) - 0.5;
    return {
      model: c,
      scaleF: s,
      offset: [-ctr.x, -box.min.y, -ctr.z] as [number, number, number],
      yaw: y,
    };
  }, [scene]);

  return (
    <group position={[BIKE_POS.x, BIKE_POS.y + 0.02, BIKE_POS.z]} rotation={[0, yaw, 0]}>
      <group scale={scaleF}>
        <primitive object={model} position={offset} />
      </group>
      {/* warm key from the camera-facing side so the dark bike reads */}
      <pointLight position={[-2.5, 2.2, 1.5]} color="#ffd0a0" intensity={5} distance={12} decay={2} />
      {/* cool rim from behind for a dawn edge */}
      <pointLight position={[2, 1.8, -2]} color="#9fc0ff" intensity={5} distance={10} decay={2} />
      {/* tail-light glow */}
      <pointLight position={[0, 0.9, -1.4]} color="#ff7e9d" intensity={1.6} distance={4} decay={2} />
    </group>
  );
}

useGLTF.preload(BIKE_URL);
