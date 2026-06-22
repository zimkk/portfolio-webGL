"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low";

export type DeviceProfile = {
  reducedMotion: boolean;
  tier: Tier;
  dpr: [number, number];
  droneCount: number;
  terrainSegments: number;
  postFX: boolean;
};

function detectTier(): Tier {
  if (typeof navigator === "undefined") return "high";
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches;
  const small =
    typeof window !== "undefined" && window.innerWidth < 768;
  if ((mem !== undefined && mem <= 4) || cores <= 4 || (coarse && small)) {
    return "low";
  }
  return "high";
}

const HIGH: DeviceProfile = {
  reducedMotion: false,
  tier: "high",
  dpr: [1, 2],
  droneCount: 8,
  terrainSegments: 200,
  postFX: true,
};

const LOW: DeviceProfile = {
  reducedMotion: false,
  tier: "low",
  dpr: [1, 1.4],
  droneCount: 8,
  terrainSegments: 110,
  postFX: false,
};

/**
 * Resolves the rendering profile on the client. Starts at HIGH for SSR
 * parity, then downgrades after mount based on the real device.
 */
export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(HIGH);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = (): DeviceProfile => {
      const reduced = mq.matches;
      const tier = detectTier();
      const base = tier === "low" ? LOW : HIGH;
      return { ...base, reducedMotion: reduced };
    };
    setProfile(compute());
    const onChange = () => setProfile(compute());
    mq.addEventListener("change", onChange);
    window.addEventListener("resize", onChange, { passive: true });
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return profile;
}
