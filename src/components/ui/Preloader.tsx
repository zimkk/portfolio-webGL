"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  ready: boolean; // scene mounted + first frame painted
  onDone: () => void;
};

export default function Preloader({ ready, onDone }: Props) {
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const valRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      // climb fast to 92, then wait for the real ready signal to finish
      const target = ready ? 100 : 92;
      valRef.current += (target - valRef.current) * 0.06;
      const v = Math.min(100, valRef.current);
      setCount(Math.round(v));
      if (v >= 99.4 && ready && !doneRef.current) {
        doneRef.current = true;
        setCount(100);
        setTimeout(() => {
          setGone(true);
          setTimeout(onDone, 750);
        }, 350);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ready, onDone]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[180] flex flex-col justify-end overflow-hidden"
          style={{ background: "var(--void)" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* volumetric headlight sweep */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-full w-[60vw] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(91,127,255,0.16), transparent 70%)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[-10%] h-[120%] w-[2px] -translate-x-1/2"
            style={{ background: "linear-gradient(var(--cyan), transparent)" }}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />

          <div className="relative z-10 flex items-end justify-between p-6 md:p-10">
            <div>
              <div
                className="mono mb-2 text-[11px] uppercase tracking-[0.4em]"
                style={{ color: "var(--muted)" }}
              >
                Ignition
              </div>
              <div
                className="display text-[18vw] leading-none md:text-[9vw]"
                style={{ color: "var(--text)" }}
              >
                {count.toString().padStart(2, "0")}
              </div>
            </div>
            <div className="mono mb-3 max-w-[42ch] text-right text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--blue)" }}>HASSAN NAZIR</span>
              <br />
              assembling terrain · spinning up agents
            </div>
          </div>

          <div className="relative z-10 h-px w-full" style={{ background: "var(--line)" }}>
            <motion.div
              className="h-full"
              style={{ background: "var(--blue)", width: `${count}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
