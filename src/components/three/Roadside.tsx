"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { groundPoint, BIKE_POS } from "@/lib/world";

// Roadside props that simply exist in the world at fixed positions. The rider
// approaches and passes them as the camera climbs — nothing spawns. Fog and
// distance handle visibility.
export default function Roadside() {
  return (
    <group>
      <LatticeTowers />
      <GridcoreMarker />
      <ParkedBike />
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

/* ---------------- parked motorcycle ---------------- */
function ParkedBike() {
  const pos = BIKE_POS;

  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0c0e15", metalness: 0.55, roughness: 0.45 }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b3142", metalness: 0.85, roughness: 0.3 }), []);
  const rubber = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0a0b10", metalness: 0.2, roughness: 0.8 }), []);

  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, -0.42, 0]} scale={1.3}>
      {/* wheels */}
      {[-1.25, 1.25].map((z) => (
        <group key={z} position={[0, 0.56, z]}>
          <mesh rotation={[0, Math.PI / 2, 0]} material={rubber}>
            <torusGeometry args={[0.56, 0.14, 14, 32]} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} material={metal}>
            <torusGeometry args={[0.34, 0.04, 10, 28]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={metal}>
            <cylinderGeometry args={[0.07, 0.07, 0.3, 10]} />
          </mesh>
        </group>
      ))}

      {/* front fender */}
      <mesh position={[0, 1.0, 1.25]} rotation={[0, Math.PI / 2, 0]} material={body}>
        <torusGeometry args={[0.62, 0.06, 8, 16, Math.PI * 0.7]} />
      </mesh>
      {/* rear fender / cowl */}
      <mesh position={[0, 1.05, -1.25]} rotation={[0, Math.PI / 2, Math.PI]} material={body}>
        <torusGeometry args={[0.6, 0.07, 8, 16, Math.PI * 0.6]} />
      </mesh>

      {/* main frame spar + downtube */}
      <mesh position={[0, 0.82, 0]} material={metal}>
        <boxGeometry args={[0.12, 0.12, 2.2]} />
      </mesh>
      <mesh position={[0, 0.7, 0.7]} rotation={[0.5, 0, 0]} material={metal}>
        <boxGeometry args={[0.1, 0.1, 1.0]} />
      </mesh>

      {/* fuel tank */}
      <mesh position={[0, 1.08, 0.35]} scale={[0.42, 0.4, 0.95]} material={body}>
        <sphereGeometry args={[1, 20, 16]} />
      </mesh>
      {/* seat */}
      <mesh position={[0, 1.02, -0.55]} rotation={[-0.06, 0, 0]} material={body}>
        <boxGeometry args={[0.4, 0.22, 1.1]} />
      </mesh>
      {/* tail cowl */}
      <mesh position={[0, 1.12, -1.05]} material={body}>
        <boxGeometry args={[0.3, 0.2, 0.5]} />
      </mesh>

      {/* front forks */}
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.92, 1.12]} rotation={[0.42, 0, 0]} material={metal}>
          <cylinderGeometry args={[0.045, 0.045, 1.0, 8]} />
        </mesh>
      ))}
      {/* handlebars */}
      <mesh position={[0, 1.34, 1.0]} rotation={[0, Math.PI / 2, 0]} material={metal}>
        <cylinderGeometry args={[0.03, 0.03, 0.66, 8]} />
      </mesh>
      {/* headlight */}
      <mesh position={[0, 1.22, 1.28]} material={metal}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
      <mesh position={[0, 1.22, 1.4]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#cfe0ff" toneMapped={false} />
      </mesh>

      {/* exhaust */}
      <mesh position={[0.22, 0.55, -0.3]} rotation={[Math.PI / 2 + 0.1, 0, 0]} material={metal}>
        <cylinderGeometry args={[0.08, 0.09, 1.6, 12]} />
      </mesh>

      {/* engine block */}
      <mesh position={[0, 0.62, 0.05]} material={metal}>
        <boxGeometry args={[0.34, 0.4, 0.5]} />
      </mesh>

      {/* tail-light */}
      <pointLight position={[0, 1.05, -1.35]} color="#ff7e9d" intensity={2.4} distance={5} decay={2} />
      <mesh position={[0, 1.05, -1.32]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial color="#ff7e9d" toneMapped={false} />
      </mesh>
    </group>
  );
}
