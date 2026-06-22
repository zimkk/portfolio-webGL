"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise, GodRays } from "@react-three/postprocessing";
import { BlendFunction, ChromaticAberrationEffect } from "postprocessing";
import * as THREE from "three";
import { ride, localProgress, smoothstep } from "@/lib/ride";
import { sunMeshRef } from "./shared";

/**
 * Chromatic aberration built directly from the postprocessing effect so we
 * can mutate its offset every frame. (The drei <ChromaticAberration> wrapper
 * JSON.stringifies its props for memoisation — under React 19 the forwarded
 * ref lands in props and closes a circular Object3D loop, which throws.)
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
    const amt = 0.0006 + velEnv * 0.004 + ride.velocity * 0.05;
    effect.offset.set(amt, amt);
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
      {sun ? (
        <GodRays
          sun={sun}
          samples={60}
          density={0.92}
          decay={0.93}
          weight={0.5}
          exposure={0.34}
          clampMax={0.9}
          blur
        />
      ) : (
        <></>
      )}
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.32}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.65}
      />
      <VelocityAberration />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.045} />
    </EffectComposer>
  );
}
