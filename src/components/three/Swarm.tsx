"use client";

import { useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { DRONES } from "@/lib/content";
import { smoothstep } from "@/lib/ride";
import { groundPoint } from "@/lib/world";

type Props = {
  onHover: (index: number | null, screen: { x: number; y: number }) => void;
};

// The swarm lives at a fixed point over the pass. It always exists — as the
// rider climbs toward it the formation brightens and the delegation links
// resolve; once past, it recedes behind. No spawning.
const ANCHOR = groundPoint(0.34, -2).add(new THREE.Vector3(0, 13, 0));

const _v = new THREE.Vector3();
const _seek = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _attract = new THREE.Vector3();

type Agent = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  home: THREE.Vector3;
  phase: number;
  lead: boolean;
};

export default function Swarm({ onHover }: Props) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const ringRefs = useRef<(THREE.Group | null)[]>([]);
  const linksRef = useRef<THREE.LineSegments>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const pointer = useRef(new THREE.Vector2());

  const agents = useMemo<Agent[]>(() => {
    return DRONES.map((d, i) => {
      const angle = (i / DRONES.length) * Math.PI * 2;
      const r = d.lead ? 0 : 4.4 + (i % 3) * 1.7;
      const home = new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle * 1.7) * 1.8 + (d.lead ? 0.5 : 0),
        Math.sin(angle) * r
      );
      return {
        pos: home.clone(),
        vel: new THREE.Vector3(),
        home,
        phase: Math.random() * Math.PI * 2,
        lead: !!d.lead,
      };
    });
  }, []);

  // shared geometry / materials
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(1, 0.045, 10, 40), []);
  const glowGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);

  const subCoreMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#9fb4ff", emissive: "#5b7fff", emissiveIntensity: 1.2, metalness: 0.6, roughness: 0.25, toneMapped: false }),
    []
  );
  const leadCoreMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d6f4ff", emissive: "#7fe9ff", emissiveIntensity: 1.6, metalness: 0.7, roughness: 0.2, toneMapped: false }),
    []
  );
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#7fe9ff", transparent: true, opacity: 0.85, toneMapped: false }),
    []
  );
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#5b7fff", transparent: true, opacity: 0.18, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }),
    []
  );

  const linkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const segs = DRONES.length - 1;
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segs * 2 * 3), 3));
    return g;
  }, []);
  const linkMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#7fe9ff", transparent: true, opacity: 0.12, toneMapped: false }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const cam = state.camera;

    // proximity: 0 far away, 1 right alongside the swarm
    const dist = cam.position.distanceTo(ANCHOR);
    const near = smoothstep(130, 22, dist);

    pointer.current.set(state.pointer.x, state.pointer.y);
    cam.getWorldDirection(_v);
    _right.copy(_v).cross(cam.up).normalize();
    _up.copy(cam.up);

    const lead = agents.find((a) => a.lead)!;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      a.phase += dt * (a.lead ? 0.6 : 1.1);

      if (a.lead) {
        _seek.set(
          Math.sin(a.phase * 0.5) * 0.9,
          Math.sin(a.phase) * 0.7,
          Math.cos(a.phase * 0.4) * 0.9
        );
        a.vel.lerp(_seek.sub(a.pos), 0.04);
      } else {
        _seek.copy(a.home);
        _seek.x += Math.sin(a.phase) * 1.3;
        _seek.y += Math.cos(a.phase * 0.8) * 1.1;
        _seek.z += Math.sin(a.phase * 0.6) * 1.3;
        _seek.sub(a.pos).multiplyScalar(0.03);
        // cursor draws the flock when you're alongside them
        _attract
          .copy(_right)
          .multiplyScalar(pointer.current.x * 7)
          .addScaledVector(_up, pointer.current.y * 5)
          .sub(a.pos)
          .multiplyScalar(0.01 * near);
        a.vel.add(_seek).add(_attract);
      }
      a.vel.clampLength(0, a.lead ? 5 : 9);
      a.pos.addScaledVector(a.vel, dt);

      const g = groupRefs.current[i];
      if (g) {
        g.position.copy(a.pos);
        g.rotation.y += dt * 0.4;
      }
      const ring = ringRefs.current[i];
      if (ring) {
        ring.rotation.z += dt * (a.lead ? 0.8 : 1.4);
        ring.rotation.x += dt * 0.5;
      }
    }

    // emissive + links brighten with proximity (awaken, not spawn)
    subCoreMat.emissiveIntensity = 0.5 + near * 1.6;
    leadCoreMat.emissiveIntensity = 0.7 + near * 1.8;
    ringMat.opacity = 0.35 + near * 0.6;
    glowMat.opacity = 0.05 + near * 0.16;

    const links = linksRef.current;
    if (links) {
      const pos = linkGeo.attributes.position as THREE.BufferAttribute;
      let k = 0;
      for (let i = 0; i < agents.length; i++) {
        if (agents[i].lead) continue;
        pos.setXYZ(k++, lead.pos.x, lead.pos.y, lead.pos.z);
        pos.setXYZ(k++, agents[i].pos.x, agents[i].pos.y, agents[i].pos.z);
      }
      pos.needsUpdate = true;
      linkMat.opacity = 0.06 + near * 0.5;
    }
    if (lightRef.current) lightRef.current.intensity = near * 5;
  });

  const enter = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(i, { x: e.clientX, y: e.clientY });
  };
  const leave = () => onHover(null, { x: 0, y: 0 });

  return (
    <group position={ANCHOR}>
      {agents.map((a, i) => {
        const coreS = a.lead ? 0.6 : 0.34;
        const ringS = a.lead ? 1.05 : 0.62;
        return (
          <group key={i} ref={(el) => { groupRefs.current[i] = el; }}>
            <mesh
              geometry={coreGeo}
              material={a.lead ? leadCoreMat : subCoreMat}
              scale={coreS}
              onPointerOver={enter(i)}
              onPointerMove={enter(i)}
              onPointerOut={leave}
            />
            <group ref={(el) => { ringRefs.current[i] = el; }}>
              <mesh geometry={ringGeo} material={ringMat} scale={ringS} />
              {a.lead && (
                <mesh geometry={ringGeo} material={ringMat} scale={ringS * 0.78} rotation={[Math.PI / 2, 0, 0]} />
              )}
            </group>
            <mesh geometry={glowGeo} material={glowMat} scale={coreS * 2.3} />
          </group>
        );
      })}
      <lineSegments ref={linksRef} geometry={linkGeo} material={linkMat} />
      <pointLight ref={lightRef} color="#6b8aff" intensity={0} distance={26} decay={2} />
    </group>
  );
}
