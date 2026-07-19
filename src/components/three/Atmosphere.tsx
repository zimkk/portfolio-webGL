"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ride } from "@/lib/ride";
import { SUN_POS } from "@/lib/world";
import { sky, skyAt, createSkyState } from "@/lib/sky";
import { sunMeshRef } from "./shared";

// ============================================================
// The sky: a single dome shader carrying the whole day-cycle —
// gradient, sun scattering, twinkling stars, the Milky Way,
// wind-drifted cirrus that catch fire before the sun crests.
// ============================================================

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
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSunDir;
  uniform float uStars;
  uniform float uMilky;
  uniform float uCloud;
  uniform float uCloudWarm;
  uniform float uTime;

  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float hash31(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
  float noise2(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),
               mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x), f.y);
  }
  float fbm(vec2 p){
    float v=0.0, a=0.5;
    for(int i=0;i<5;i++){ v+=a*noise2(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; }
    return v;
  }

  void main(){
    vec3 dir = normalize(vWorld);
    float h = clamp(dir.y, -1.0, 1.0);
    float up = clamp(h * 0.5 + 0.5, 0.0, 1.0);

    // ---- base gradient: horizon band hazier + lighter --------------------
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.62));
    float horizonBand = pow(1.0 - abs(h), 5.0);
    col += uHorizon * horizonBand * 0.35;

    // ---- sun scattering --------------------------------------------------
    vec3 sunDir = normalize(uSunDir);
    float sd = max(dot(dir, sunDir), 0.0);
    float lowGlow = pow(1.0 - abs(h), 2.2);
    // wide forward scattering, strongest low near the sun azimuth
    col += uGlow * pow(sd, 2.6) * 0.55;
    col += uGlow * lowGlow * pow(sd, 1.3) * 0.5;
    // tight bright aureole
    col += uGlow * pow(sd, 90.0) * 0.9;

    // ---- stars (twinkle) + Milky Way ------------------------------------
    if (uStars > 0.003 && h > 0.02) {
      float starVis = uStars * uStars; // die out fast as dawn takes over
      // point-in-cell stars: tiny round discs, not lit lattice cells
      vec3 sp = dir * 180.0;
      vec3 cell = floor(sp);
      vec3 f = fract(sp) - 0.5;
      float rnd = hash31(cell);
      vec3 off = vec3(hash31(cell + 7.1), hash31(cell + 3.7), hash31(cell + 1.3)) - 0.5;
      float d = length(f - off * 0.5);
      float star = step(0.988, rnd) * smoothstep(0.18, 0.02, d);
      float twinkle = 0.6 + 0.4 * sin(uTime * (1.5 + rnd * 4.0) + rnd * 40.0);
      float starAmt = star * twinkle * smoothstep(0.02, 0.3, h);
      // fainter dense layer
      vec3 sp2 = dir * 420.0;
      vec3 cell2 = floor(sp2);
      vec3 f2 = fract(sp2) - 0.5;
      float faint = step(0.994, hash31(cell2)) * smoothstep(0.16, 0.02, length(f2)) * 0.4;
      col += (starAmt * 1.2 + faint) * vec3(0.75, 0.82, 1.0) * starVis;

      // Milky Way — tilted great-circle band with fbm structure
      vec3 axis = normalize(vec3(0.5, 0.28, -0.8));
      float band = 1.0 - abs(dot(dir, axis));
      float bandMask = smoothstep(0.72, 0.98, band);
      vec2 mwUv = vec2(atan(dir.z, dir.x), dir.y) * 3.0;
      float wisp = fbm(mwUv * 2.2 + 3.1);
      float mw = bandMask * (0.35 + wisp * 0.8) * smoothstep(0.05, 0.4, h);
      col += mw * vec3(0.42, 0.5, 0.72) * 0.32 * uMilky;
      // dark dust lane
      col -= mw * smoothstep(0.5, 0.75, wisp) * vec3(0.18, 0.2, 0.26) * uMilky;
    }

    // ---- cirrus sheet ----------------------------------------------------
    if (uCloud > 0.01 && h > 0.03) {
      // project onto a high plane so clouds foreshorten toward the horizon
      vec2 cuv = dir.xz / max(dir.y, 0.08);
      cuv = cuv * 0.55 + vec2(uTime * 0.006, uTime * 0.0022);
      float cn = fbm(cuv);
      float sheet = smoothstep(0.55, 0.82, cn) * smoothstep(0.03, 0.16, h) * (1.0 - smoothstep(0.5, 0.85, h));
      // cool base, fired edges toward the sun as dawn breaks
      vec3 cloudCool = mix(uZenith * 1.6, uHorizon * 1.25, 0.5);
      vec3 cloudFire = uGlow * (0.8 + pow(sd, 2.0) * 1.6);
      vec3 cloudCol = mix(cloudCool, cloudFire, uCloudWarm * (0.35 + 0.65 * pow(sd, 1.4)));
      col = mix(col, cloudCol, sheet * uCloud * 0.42);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── Sun: crisp disc + limb darkening + corona. Brightness rides the
//    day-cycle (uDisc) so it's absent at night, molten at the crest ──
const SunVert = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SunFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uDisc;   // 0 night → ~1.25 sunrise
  uniform float uWarm;   // color temperature blend

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
  }
  float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+1.7; a*=0.5; } return v; }

  void main(){
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float ang = atan(p.y, p.x);

    float discR = 0.16;
    float edge = discR + (fbm(vec2(ang*3.0, uTime*0.3)) - 0.5) * 0.012;
    float disc = 1.0 - smoothstep(edge, edge + 0.012, r);
    float ld = sqrt(max(0.0, 1.0 - pow(min(r/edge, 1.0), 2.0)));
    float discB = disc * (0.5 + 0.5 * ld);
    // corona + wide glow
    float corona = pow(edge / max(r, 1e-3), 2.2) * 0.32 * (1.0 - smoothstep(edge, 0.9, r));
    float outer = exp(-r * 3.4) * 0.4;
    float total = discB * 2.2 + (corona + outer) * (0.4 + uDisc * 0.6);

    vec3 core = mix(vec3(1.0,0.98,0.94), vec3(1.0,0.88,0.66), uWarm);
    vec3 mid  = mix(vec3(1.0,0.85,0.6), vec3(1.0,0.62,0.36), uWarm);
    vec3 rim  = mix(vec3(1.0,0.66,0.42), vec3(1.0,0.4,0.26), uWarm);
    vec3 col = mix(core, mid, smoothstep(0.0, edge, r));
    col = mix(col, rim, smoothstep(edge, 0.65, r));
    // atmospheric reddening toward the lower limb
    col = mix(col, col * vec3(1.0,0.52,0.38), smoothstep(0.1, -0.7, p.y) * 0.65 * uWarm);

    gl_FragColor = vec4(col, clamp(total, 0.0, 1.7) * uDisc);
  }
`;

export default function Atmosphere() {
  const { scene, gl } = useThree();
  const skyMesh = useRef<THREE.Mesh>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const sunDisc = useRef<THREE.Mesh>(null);
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _moonDir = useMemo(() => new THREE.Vector3(0.35, 0.8, 0.3).normalize(), []);
  const _lightDir = useMemo(() => new THREE.Vector3(), []);
  // raw sample buffer; `sky` (shared) is the smoothed version everyone reads
  const raw = useMemo(() => createSkyState(), []);

  const sunUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uDisc: { value: 0 }, uWarm: { value: 0 } }),
    []
  );

  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color("#050914") },
      uHorizon: { value: new THREE.Color("#0d1730") },
      uGlow: { value: new THREE.Color("#16244d") },
      uSunDir: { value: new THREE.Vector3(0, 0.1, -1) },
      uStars: { value: 1 },
      uMilky: { value: 1 },
      uCloud: { value: 0.25 },
      uCloudWarm: { value: 0 },
      uTime: { value: 0 },
    }),
    []
  );

  useMemo(() => {
    scene.fog = new THREE.FogExp2(0x0b1226, 0.0105);
  }, [scene]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-4.5 * dt); // smooth the grade against scroll jumps

    skyAt(ride.progress, raw);

    // ease the shared state toward the raw sample
    sky.zenith.lerp(raw.zenith, k);
    sky.horizon.lerp(raw.horizon, k);
    sky.glow.lerp(raw.glow, k);
    sky.fog.lerp(raw.fog, k);
    sky.sunColor.lerp(raw.sunColor, k);
    sky.fogDensity += (raw.fogDensity - sky.fogDensity) * k;
    sky.stars += (raw.stars - sky.stars) * k;
    sky.milkyWay += (raw.milkyWay - sky.milkyWay) * k;
    sky.cloud += (raw.cloud - sky.cloud) * k;
    sky.cloudWarm += (raw.cloudWarm - sky.cloudWarm) * k;
    sky.sunIntensity += (raw.sunIntensity - sky.sunIntensity) * k;
    sky.sunDisc += (raw.sunDisc - sky.sunDisc) * k;
    sky.alpenglow += (raw.alpenglow - sky.alpenglow) * k;
    sky.ambient += (raw.ambient - sky.ambient) * k;
    sky.hemi += (raw.hemi - sky.hemi) * k;
    sky.exposure += (raw.exposure - sky.exposure) * k;
    sky.headlight += (raw.headlight - sky.headlight) * k;

    // ---- push into the dome ----
    uniforms.uZenith.value.copy(sky.zenith);
    uniforms.uHorizon.value.copy(sky.horizon);
    uniforms.uGlow.value.copy(sky.glow);
    uniforms.uStars.value = sky.stars;
    uniforms.uMilky.value = sky.milkyWay;
    uniforms.uCloud.value = sky.cloud;
    uniforms.uCloudWarm.value = sky.cloudWarm;
    uniforms.uTime.value = state.clock.elapsedTime;

    const cam = state.camera;
    if (skyMesh.current) skyMesh.current.position.copy(cam.position);
    _dir.copy(SUN_POS).sub(cam.position).normalize();
    uniforms.uSunDir.value.copy(_dir);

    // ---- fog ----
    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(sky.fog);
    fog.density = sky.fogDensity;

    // ---- lights ----
    // at night the key light is the moon, high overhead; it hands off to the
    // real sun direction as dawn arrives so slopes stop being silhouettes
    if (sun.current) {
      const dawnMix = Math.min(1, (1 - sky.stars) * 1.2);
      _lightDir.copy(_moonDir).lerp(_dir, dawnMix).normalize();
      sun.current.position.copy(cam.position).addScaledVector(_lightDir, 120);
      sun.current.target.position.copy(cam.position);
      sun.current.target.updateMatrixWorld();
      sun.current.intensity = sky.sunIntensity;
      sun.current.color.copy(sky.sunColor);
    }
    if (hemi.current) hemi.current.intensity = sky.hemi;
    if (amb.current) amb.current.intensity = sky.ambient;

    // ---- tone-mapping exposure rides the dawn ----
    gl.toneMappingExposure = sky.exposure;

    // ---- sun disc ----
    sunUniforms.uTime.value = state.clock.elapsedTime;
    sunUniforms.uDisc.value = sky.sunDisc;
    sunUniforms.uWarm.value = Math.min(1, sky.sunDisc);
    if (sunDisc.current) sunDisc.current.quaternion.copy(cam.quaternion);
  });

  return (
    <group>
      <mesh ref={skyMesh} frustumCulled={false} scale={700}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={SkyVert}
          fragmentShader={SkyFrag}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* the sun, fixed far down the pass — crisp billboarded disc */}
      <group position={SUN_POS}>
        <mesh
          ref={(m) => {
            sunDisc.current = m;
            sunMeshRef.current = m;
          }}
        >
          <planeGeometry args={[110, 110]} />
          <shaderMaterial
            uniforms={sunUniforms}
            vertexShader={SunVert}
            fragmentShader={SunFrag}
            transparent
            toneMapped={false}
            fog={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <hemisphereLight ref={hemi} args={["#3a4a80", "#0d1018", 0.5]} />
      <directionalLight ref={sun} color="#b9cdfd" intensity={0.55} />
      <ambientLight ref={amb} intensity={0.16} />
    </group>
  );
}
