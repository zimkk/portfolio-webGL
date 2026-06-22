"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    document.body.classList.add("has-custom-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setHidden(false);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      }
      const el = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      if (el) {
        setActive(true);
        setLabel(el.dataset.cursor || "");
      } else {
        setActive(false);
        setLabel("");
      }
    };
    const onLeave = () => setHidden(true);

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150]" style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.3s" }}>
      <div
        ref={ringRef}
        className="absolute top-0 left-0 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border transition-[width,height,background-color] duration-200"
        style={{
          borderColor: "var(--blue)",
          width: active ? 56 : 40,
          height: active ? 56 : 40,
          marginLeft: active ? -28 : -20,
          marginTop: active ? -28 : -20,
          backgroundColor: active ? "rgba(91,127,255,0.12)" : "transparent",
        }}
      >
        {label && (
          <span className="mono text-[9px] uppercase tracking-widest" style={{ color: "var(--cyan)" }}>
            {label}
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        className="absolute top-0 left-0 -ml-[2px] -mt-[2px] h-1 w-1 rounded-full"
        style={{ backgroundColor: "var(--cyan)", opacity: active ? 0 : 1 }}
      />
    </div>
  );
}
