"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Atmosphere from "./Atmosphere";
import Terrain from "./Terrain";
import Road from "./Road";
import Swarm from "./Swarm";
import Roadside from "./Roadside";
import Rig from "./Rig";
import PostFX from "./PostFX";
import type { DeviceProfile } from "@/lib/device";

// Image-based lighting baked from in-scene light shapes (no external HDR):
// a cool high-altitude sky dome + a warm dawn key, so metals and snow get
// realistic reflections and soft fill.
function SkyIBL() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={0.7} color="#33457a" scale={[80, 80, 1]} position={[0, 60, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Lightformer form="rect" intensity={1.0} color="#5a6f9e" scale={[60, 40, 1]} position={[0, 10, -60]} rotation={[0, 0, 0]} />
      <Lightformer form="circle" intensity={3.2} color="#ffb27a" scale={[22, 22, 1]} position={[6, 5, -70]} />
      <Lightformer form="rect" intensity={0.3} color="#1a2238" scale={[80, 80, 1]} position={[0, -30, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </Environment>
  );
}

type Props = {
  profile: DeviceProfile;
  onDroneHover: (index: number | null, screen: { x: number; y: number }) => void;
  onReady?: () => void;
};

export default function Experience({ profile, onDroneHover, onReady }: Props) {
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={profile.dpr}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ fov: 62, near: 0.1, far: 1600, position: [0, 5, 10] }}
      frameloop={profile.reducedMotion ? "demand" : "always"}
      onCreated={() => onReady?.()}
    >
      <color attach="background" args={["#05060a"]} />
      <Suspense fallback={null}>
        <SkyIBL />
        <Atmosphere />
        <Terrain segments={profile.terrainSegments} />
        <Road />
        <Roadside />
        {!profile.reducedMotion && <Swarm onHover={onDroneHover} />}
        <Rig reducedMotion={profile.reducedMotion} />
      </Suspense>
      {profile.postFX && <PostFX />}
    </Canvas>
  );
}
