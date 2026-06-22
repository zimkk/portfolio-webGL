"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DRONES } from "@/lib/content";

type Props = {
  hover: { index: number | null; x: number; y: number };
};

export default function DroneTooltip({ hover }: Props) {
  const drone = hover.index != null ? DRONES[hover.index] : null;
  return (
    <AnimatePresence>
      {drone && (
        <motion.div
          key={drone.name}
          className="pointer-events-none fixed z-[130] -translate-y-1/2"
          style={{ left: hover.x + 18, top: hover.y }}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="rounded-md border px-3 py-2 backdrop-blur-sm"
            style={{ borderColor: "var(--line)", background: "rgba(10,10,15,0.7)" }}
          >
            <div className="display text-sm" style={{ color: drone.lead ? "var(--cyan)" : "var(--text)" }}>
              {drone.name}
            </div>
            <div className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              {drone.role}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
