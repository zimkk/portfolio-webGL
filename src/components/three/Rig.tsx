"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cameraPos, lookTarget, BIKE_POS } from "@/lib/world";
import { ride, localProgress, smoothstep, lerp } from "@/lib/ride";

const _pos = new THREE.Vector3();
const _target = new THREE.Vector3();
const _bike = new THREE.Vector3();

export default function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const spot = useRef<THREE.SpotLight>(null);
  const fovRef = useRef(62);
  const placed = useRef(false);
  // smoothed camera state for buttery, momentum-carrying motion
  const smoothPos = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cameraPos(reducedMotion ? 0.03 : 0, _pos);
    cam.position.copy(_pos);
    smoothPos.current.copy(_pos);
    cam.lookAt(lookTarget(reducedMotion ? 0.03 : 0, _target));
    smoothTarget.current.copy(_target);
    placed.current = false;
    cam.fov = 62;
    cam.updateProjectionMatrix();
  }, [camera, reducedMotion]);

  useFrame((state, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (reducedMotion) {
      if (!placed.current) {
        cameraPos(0.03, _pos);
        cam.position.copy(_pos);
        cam.lookAt(lookTarget(0.03, _target));
        placed.current = true;
      }
      return;
    }

    const p = ride.progress;
    const v = ride.velocity;

    // desired pose from the analytic path + a gentle breathing bob
    cameraPos(p, _pos);
    _pos.y += Math.sin(t * 1.1) * 0.06;
    _pos.x += Math.sin(t * 0.6) * 0.04;

    lookTarget(p, _target);

    // RIDER scene: ease the gaze toward the parked bike at the overlook
    const rider = localProgress(p, "rider");
    const pan = smoothstep(0.1, 0.5, rider) * (1 - smoothstep(0.82, 1, rider));
    if (pan > 0.001) {
      _bike.copy(BIKE_POS);
      _bike.y += 1.3;
      _target.lerp(_bike, pan * 0.85);
    }

    // critically-damped follow — frame-rate independent, momentum-carrying
    if (!placed.current) {
      smoothPos.current.copy(_pos);
      smoothTarget.current.copy(_target);
      placed.current = true;
    }
    const kPos = 1 - Math.exp(-9 * dt);
    const kTar = 1 - Math.exp(-7 * dt);
    smoothPos.current.lerp(_pos, kPos);
    smoothTarget.current.lerp(_target, kTar);
    cam.position.copy(smoothPos.current);
    cam.lookAt(smoothTarget.current);

    // gentle, smooth FOV — small velocity breathing, bigger on velocity beat
    const vel = localProgress(p, "velocity");
    const velEnv = smoothstep(0, 0.3, vel) * (1 - smoothstep(0.7, 1, vel));
    const targetFov = 62 + velEnv * 12 + Math.min(v * 60, 8);
    fovRef.current = lerp(fovRef.current, targetFov, 1 - Math.pow(0.02, dt));
    cam.fov = fovRef.current;
    cam.updateProjectionMatrix();

    // headlight: a soft beam down the road, strongest in the cold dark
    if (spot.current) {
      spot.current.position.copy(cam.position);
      cam.getWorldDirection(_target);
      spot.current.target.position.copy(cam.position).addScaledVector(_target, 28);
      spot.current.target.updateMatrixWorld();
      spot.current.intensity = 26 * (1 - smoothstep(0.6, 0.82, p)) + 4;
    }
  });

  return (
    <spotLight
      ref={spot}
      color="#cfe0ff"
      intensity={26}
      distance={90}
      angle={0.55}
      penumbra={0.8}
      decay={1.5}
    />
  );
}
