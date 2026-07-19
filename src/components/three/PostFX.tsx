"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Vignette, Noise } from "@react-three/postprocessing";
import {
  BlendFunction,
  ChromaticAberrationEffect,
  BloomEffect,
  GodRaysEffect,
  KernelSize,
} from "postprocessing";
import * as THREE from "three";
import { ride, localProgress, smoothstep } from "@/lib/ride";
import { sky } from "@/lib/sky";
import { sunMeshRef } from "./shared";

/**
 * NOTE: every animated effect here is constructed imperatively and rendered
 * via <primitive>. The drei wrappers JSON.stringify their props to memoise —
 * under React 19 a forwarded ref lands in props and closes a circular
 * Object3D loop, which throws. Static wrappers (Vignette, Noise) are fine.
 */

function VelocityAberration() {
  const effect = useMemo(
    () =>
      new ChromaticAberrationEffect({
        blendFunction: BlendFunction.NORMAL,
        offset: new THREE.Vector2(0.0006, 0.0006),
        radialModulation: false,
        modulationOffset: 0,
      }),
    []
  );

  useFrame(() => {
    const p = ride.progress;
    const vel = localProgress(p, "velocity");
    const velEnv = smoothstep(0, 0.25, vel) * (1 - smoothstep(0.75, 1, vel));
    // spikes on the velocity beat + with raw scroll speed
    const amt = 0.0005 + velEnv * 0.0018 + ride.velocity * 0.025;
    effect.offset.set(amt, amt);
  });

  return <primitive object={effect} dispose={null} />;
}

// bloom swells as the sun crests
function DawnBloom() {
  const effect = useMemo(
    () =>
      new BloomEffect({
        intensity: 0.5,
        luminanceThreshold: 0.3,
        luminanceSmoothing: 0.6,
        mipmapBlur: true,
        radius: 0.7,
      }),
    []
  );

  useFrame(() => {
    effect.intensity = 0.4 + Math.min(1, sky.sunDisc) * 0.55;
  });

  return <primitive object={effect} dispose={null} />;
}

// volumetric shafts from the sun disc, weight riding the day-cycle
function DawnRays({ sun }: { sun: THREE.Mesh }) {
  const camera = useThree((s) => s.camera);
  const effect = useMemo(
    () =>
      new GodRaysEffect(camera, sun, {
        samples: 60,
        density: 0.94,
        decay: 0.93,
        weight: 0.3,
        exposure: 0.24,
        clampMax: 0.95,
        blur: true,
        kernelSize: KernelSize.SMALL,
      }),
    [camera, sun]
  );

  useFrame(() => {
    const dawn = Math.min(1, sky.sunDisc);
    const m = effect.godRaysMaterial as unknown as { weight: number; exposure: number };
    m.weight = 0.2 + dawn * 0.5;
    m.exposure = 0.18 + dawn * 0.3;
  });

  return <primitive object={effect} dispose={null} />;
}

export default function PostFX() {
  // GodRays needs the sun mesh at construction; wait until Atmosphere has
  // attached it (next tick after mount), then enable the volumetric shafts.
  const [sun, setSun] = useState<THREE.Mesh | null>(null);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      if (sunMeshRef.current) setSun(sunMeshRef.current);
      else raf = requestAnimationFrame(check);
    };
    check();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <EffectComposer multisampling={0}>
      {sun ? <DawnRays sun={sun} /> : <></>}
      <DawnBloom />
      <VelocityAberration />
      <Vignette eskil={false} offset={0.22} darkness={0.78} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.04} />
    </EffectComposer>
  );
}
