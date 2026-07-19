"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cameraPos, lookTarget, roadX, BIKE_POS, SWARM_ANCHOR, SUN_POS } from "@/lib/world";
import { ride, localProgress, smoothstep, lerp } from "@/lib/ride";
import { sky } from "@/lib/sky";

const _pos = new THREE.Vector3();
const _target = new THREE.Vector3();
const _bike = new THREE.Vector3();
const _sunward = new THREE.Vector3();
const _fwd = new THREE.Vector3();

/** envelope that rises over [a,b] and falls over [c,d] of a scene */
function env(lp: number, a: number, b: number, c: number, d: number) {
  return smoothstep(a, b, lp) * (1 - smoothstep(c, d, lp));
}

// ============================================================
// The camera. Base ride along the road + per-chapter set pieces:
//   hero      — high aerial reveal descending onto the road
//   swarm     — lifts off the tarmac to fly alongside the flock
//   velocity  — drops low, banks through the switchbacks
//   summit    — rises at the crest to meet the sunrise
//   horizon   — releases the road and climbs into the morning sky
// ============================================================
export default function Rig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const spot = useRef<THREE.SpotLight>(null);
  const fovRef = useRef(62);
  const rollRef = useRef(0);
  const placed = useRef(false);
  const smoothPos = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cameraPos(reducedMotion ? 0.03 : 0, _pos);
    if (!reducedMotion) {
      // aerial opening frame
      _pos.x += 22;
      _pos.y += 26;
      _pos.z += 10;
    }
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

    // ---- base pose from the analytic path + breathing bob ----
    cameraPos(p, _pos);
    _pos.y += Math.sin(t * 1.1) * 0.06;
    _pos.x += Math.sin(t * 0.6) * 0.04;
    lookTarget(p, _target);

    // ================= set pieces =================

    // HERO — start high above the valley, sweep down onto the road.
    const hero = localProgress(p, "hero");
    if (p < 0.12) {
      const drop = 1 - smoothstep(0.05, 0.95, hero);
      _pos.x += 10 * drop;
      _pos.y += 11 * drop;
      _pos.z += 5 * drop;
      // gaze lifts a touch so the ridgelines and night sky share the frame
      _target.y += 2.5 * drop;
    }

    // SWARM — lift off the road and ride beside the formation.
    const swarm = localProgress(p, "swarm");
    const lift = env(swarm, 0.06, 0.34, 0.72, 0.96);
    if (lift > 0.001) {
      _pos.y += 8.5 * lift;
      _pos.x += 3.5 * lift;
      // gaze eases onto the flock
      _target.lerp(SWARM_ANCHOR, lift * 0.75);
    }

    // VELOCITY — hug the tarmac, bank with the switchbacks.
    const vel = localProgress(p, "velocity");
    const velEnv = env(vel, 0.0, 0.3, 0.7, 1.0);
    if (velEnv > 0.001) {
      _pos.y -= 1.1 * velEnv;
      // road-rush shake, scaled by real scroll speed
      const shake = velEnv * Math.min(v * 30, 1);
      _pos.x += Math.sin(t * 31.0) * 0.05 * shake;
      _pos.y += Math.sin(t * 27.0) * 0.04 * shake;
    }

    // SUMMIT — rise at the crest and take in the sunrise.
    const summit = localProgress(p, "summit");
    const crest = env(summit, 0.15, 0.5, 0.85, 1.0);
    if (crest > 0.001) {
      _pos.y += 5.5 * crest;
      // gaze lifts toward the sun as it breaks
      _sunward.copy(SUN_POS).sub(_pos).normalize().multiplyScalar(60).add(_pos);
      _sunward.y += 6;
      _target.lerp(_sunward, crest * 0.55);
    }

    // RIDER — ease the gaze toward the parked bike at the overlook.
    const rider = localProgress(p, "rider");
    const pan = env(rider, 0.1, 0.5, 0.82, 1.0);
    if (pan > 0.001) {
      _bike.copy(BIKE_POS);
      _bike.y += 1.3;
      _target.lerp(_bike, pan * 0.85);
    }

    // HORIZON — leave the road, climb into the morning with the sun in frame.
    const horizon = localProgress(p, "horizon");
    const ascend = smoothstep(0.08, 0.9, horizon);
    if (ascend > 0.001) {
      _pos.y += 14 * ascend;
      _pos.z += 4 * ascend;
      _sunward.copy(SUN_POS);
      _sunward.y += 30; // gaze rises past the sun into the morning sky
      _target.lerp(_sunward, ascend * 0.6);
    }

    // ================= smoothing + apply =================
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

    // banking — roll into the road's curvature, strongest on the velocity run
    const z = smoothPos.current.z;
    const curve = roadX(z - 4) - 2 * roadX(z) + roadX(z + 4); // 2nd derivative
    const onRoad = 1 - Math.max(lift, Math.max(crest * 0.7, ascend)); // no banking airborne
    const targetRoll = THREE.MathUtils.clamp(curve * (0.05 + velEnv * 0.12), -0.09, 0.09) * onRoad;
    rollRef.current = lerp(rollRef.current, targetRoll, 1 - Math.exp(-5 * dt));
    cam.rotateZ(rollRef.current);

    // FOV — wide on the velocity run, breathes with scroll speed
    const targetFov = 62 + velEnv * 14 + Math.min(v * 60, 8) - crest * 6;
    fovRef.current = lerp(fovRef.current, targetFov, 1 - Math.pow(0.02, dt));
    cam.fov = fovRef.current;
    cam.updateProjectionMatrix();

    // headlight — follows the day-cycle, dies as dawn arrives
    if (spot.current) {
      spot.current.position.copy(cam.position);
      cam.getWorldDirection(_fwd);
      spot.current.target.position.copy(cam.position).addScaledVector(_fwd, 28);
      spot.current.target.updateMatrixWorld();
      spot.current.intensity = 4 + 24 * sky.headlight;
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
