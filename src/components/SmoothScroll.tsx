"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { setProgress, decayVelocity } from "@/lib/ride";

type Props = {
  children: React.ReactNode;
  enabled: boolean; // gate scroll until the preloader finishes
  reducedMotion: boolean;
};

export default function SmoothScroll({ children, enabled, reducedMotion }: Props) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Always start at the top on mount / refresh.
    // 'manual' stops the browser restoring the previous scroll position.
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    const lenis = new Lenis({
      lerp: reducedMotion ? 1 : 0.085,
      smoothWheel: !reducedMotion,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      setProgress(limit > 0 ? scroll / limit : 0);
    };
    lenis.on("scroll", onScroll);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      decayVelocity();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // initialise progress for current scroll position
    setProgress(0);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // gate scrolling during the preloader
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (enabled) lenis.start();
    else lenis.stop();
  }, [enabled]);

  return <>{children}</>;
}
