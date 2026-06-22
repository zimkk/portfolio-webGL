"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Animates the numeric part of a value like "99.9%", "10K+", "40%" while
 * preserving its prefix/suffix. Honours prefers-reduced-motion.
 */
export default function CountUp({
  value,
  className,
  duration = 1.4,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(value);

  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : NaN;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? 1 : 0;

  useEffect(() => {
    if (!inView || isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const n = target * eased;
      setDisplay(n.toFixed(decimals) + suffix);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, suffix, decimals, duration, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
