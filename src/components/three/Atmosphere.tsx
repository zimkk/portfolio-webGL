"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ride, localProgress, smoothstep, lerp } from "@/lib/ride";
import { SUN_POS } from "@/lib/world";
import { sunMeshRef } from "./shared";

const COLD_TOP = new THREE.Color("#04050a");
const COLD_BOT = new THREE.Color("#10172f");
const WARM_TOP = new THREE.Color("#241531");
const WARM_BOT = new THREE.Color("#ff9c64");

const FOG_COLD = new THREE.Color("#0a1124");
const FOG_WARM = new THREE.Color("#5a3340");

const SUN_COOL = new THREE.Color("#dfe7ff");
const SUN_WARM = new THREE.Color("#ffb27a");

const SkyVert = /* glsl */ `
  varying vec3 vWorld;
  void main(){
    vWorld = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const SkyFrag = /* glsl */ `
  precision highp float;
  varying vec3 vWorld;
  uniform vec3 uTop;
  uniform vec3 uBot;
  uniform float uWarm;
  uniform vec3 uSunDir;
  void main(){
    vec3 dir = normalize(vWorld);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    // atmospheric gradient: hazier, lighter toward the horizon
    vec3 col = mix(uBot, uTop, pow(h, 0.55));
    float horizonBand = pow(1.0 - abs(dir.y), 4.0);
    col = mix(col, uBot * 1.15, horizonBand * 0.5);

    float sd = max(dot(dir, normalize(uSunDir)), 0.0);
    // wide warm scattering halo, strongest low on the horizon
    float lowGlow = pow(1.0 - abs(dir.y), 2.0);
    col += uWarm * pow(sd, 3.5) * vec3(1.0, 0.6, 0.38) * 0.65;
    col += uWarm * lowGlow * pow(sd, 1.2) * vec3(1.0, 0.5, 0.34) * 0.3;
    // tight aureole just around the disc (cold-phase too, dimmer)
    col += pow(sd, 320.0) * vec3(1.0, 0.92, 0.82) * (0.5 + uWarm * 0.8);

    // cold-phase stars high in the sky
    float star = step(0.9994, fract(sin(dot(floor(dir.xy*500.0), vec2(12.9898,78.233)))*43758.5453));
    col += (1.0 - uWarm) * star * smoothstep(0.35, 1.0, h) * vec3(0.6, 0.7, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Atmosphere() {
  const { scene } = useThree();
  const sky = useRef<THREE.Mesh>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const sunCore = useRef<THREE.Mesh>(null);
  const sunGlow = useRef<THREE.Mesh>(null);
  const warmRef = useRef(0);
  const _dir = useMemo(() => new THREE.Vector3(), []);

  const uniforms = useMemo(
    () => ({
      uTop: { value: COLD_TOP.clone() },
      uBot: { value: COLD_BOT.clone() },
      uWarm: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0, 0.1, -1) },
    }),
    []
  );

  useMemo(() => {
    scene.fog = new THREE.FogExp2(FOG_COLD.getHex(), 0.0072);
  }, [scene]);

  useFrame((state) => {
    const p = ride.progress;
    const sp = localProgress(p, "summit");
    // warm payoff peaks at the summit, holds a little through the rider scene
    const warm = smoothstep(0.1, 0.55, sp);
    warmRef.current = lerp(warmRef.current, warm, 0.05);
    const w = warmRef.current;

    uniforms.uTop.value.copy(COLD_TOP).lerp(WARM_TOP, w);
    uniforms.uBot.value.copy(COLD_BOT).lerp(WARM_BOT, w);
    uniforms.uWarm.value = w;

    const cam = state.camera;
    if (sky.current) sky.current.position.copy(cam.position); // sky travels with the rider
    _dir.copy(SUN_POS).sub(cam.position).normalize();
    uniforms.uSunDir.value.copy(_dir);

    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(FOG_COLD).lerp(FOG_WARM, w);
    fog.density = lerp(0.0072, 0.0036, w);

    // directional light arrives from the real sun direction
    if (sun.current) {
      sun.current.position.copy(cam.position).addScaledVector(_dir, 120);
      sun.current.target.position.copy(cam.position);
      sun.current.target.updateMatrixWorld();
      sun.current.intensity = 0.95 + w * 1.9;
      sun.current.color.copy(SUN_COOL).lerp(SUN_WARM, w);
    }
    // sun disc + halo brighten as we crest
    if (sunCore.current) {
      const m = sunCore.current.material as THREE.MeshBasicMaterial;
      m.color.copy(SUN_COOL).lerp(SUN_WARM, w);
      m.opacity = 0.6 + w * 0.4;
    }
    if (sunGlow.current) {
      const m = sunGlow.current.material as THREE.MeshBasicMaterial;
      m.color.copy(SUN_WARM);
      m.opacity = 0.12 + w * 0.5;
      const s = 1 + w * 0.6;
      sunGlow.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={sky} frustumCulled={false} scale={700}>
        <sphereGeometry args={[1, 32, 24]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={SkyVert}
          fragmentShader={SkyFrag}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* the sun, fixed far down the pass on the horizon */}
      <group position={SUN_POS}>
        <mesh
          ref={(m) => {
            sunCore.current = m;
            sunMeshRef.current = m;
          }}
        >
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial color={SUN_COOL} transparent opacity={0.6} toneMapped={false} fog={false} />
        </mesh>
        <mesh ref={sunGlow} scale={3}>
          <sphereGeometry args={[28, 32, 32]} />
          <meshBasicMaterial
            color={SUN_WARM}
            transparent
            opacity={0.2}
            toneMapped={false}
            fog={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      <hemisphereLight args={["#3a4a80", "#0d1018", 0.4]} />
      <directionalLight ref={sun} color={SUN_COOL} intensity={0.9} />
      <ambientLight intensity={0.12} />
    </group>
  );
}
