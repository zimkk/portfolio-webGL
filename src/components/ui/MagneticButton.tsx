"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  cursor?: string;
  strength?: number;
};

export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  cursor = "GO",
  strength = 0.4,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      data-cursor={cursor}
      className={className}
      style={{ display: "inline-block", transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </motion.a>
  );
}
