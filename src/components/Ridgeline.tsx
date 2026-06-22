"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDeviceProfile } from "@/lib/device";
import { setStarted } from "@/lib/ride";
import SmoothScroll from "./SmoothScroll";
import Sections from "./Sections";
import Preloader from "./ui/Preloader";
import Cursor from "./ui/Cursor";
import HUD from "./ui/HUD";
import SoundToggle from "./ui/SoundToggle";
import DroneTooltip from "./ui/DroneTooltip";

// 3D is client-only and lazy so the DOM content paints first.
const Experience = dynamic(() => import("./three/Experience"), { ssr: false });

type Hover = { index: number | null; x: number; y: number };

export default function Ridgeline() {
  const profile = useDeviceProfile();
  const [ready, setReady] = useState(false);
  const [started, setStartedState] = useState(false);
  const [hover, setHover] = useState<Hover>({ index: null, x: 0, y: 0 });

  const onDroneHover = useCallback(
    (index: number | null, s: { x: number; y: number }) =>
      setHover({ index, x: s.x, y: s.y }),
    []
  );

  const onDone = useCallback(() => {
    setStartedState(true);
    setStarted(true);
  }, []);

  // safety net: if WebGL never reports ready, finish the preloader anyway
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <Preloader ready={ready} onDone={onDone} />
      <Cursor />

      {/* fixed 3D world behind the scroll content */}
      <div className="fixed inset-0 z-0" aria-hidden>
        <Experience
          profile={profile}
          onDroneHover={onDroneHover}
          onReady={() => setReady(true)}
        />
      </div>

      <DroneTooltip hover={hover} />
      <HUD />
      <SoundToggle autoPlayWhenReady={started} />

      <SmoothScroll enabled={started} reducedMotion={profile.reducedMotion}>
        <Sections started={started} />
      </SmoothScroll>
    </>
  );
}
