"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#*";

type Props = {
  text: string;
  className?: string;
  /** ms per character reveal step */
  speed?: number;
  start?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
};

/**
 * Scramble/decode reveal — characters resolve left-to-right out of noise.
 * Honours prefers-reduced-motion (renders final text immediately).
 */
export default function Decode({
  text,
  className,
  speed = 28,
  start = true,
  as = "span",
}: Props) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  const raf = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(text);
      return;
    }
    startedRef.current = true;
    frame.current = 0;
    let last = 0;

    const tick = (t: number) => {
      if (t - last >= speed) {
        last = t;
        const revealed = Math.floor(frame.current);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            out += " ";
          } else if (i < revealed) {
            out += text[i];
          } else {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        setDisplay(out);
        frame.current += 1;
      }
      if (frame.current <= text.length) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [start, text, speed]);

  const Tag = as;
  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
