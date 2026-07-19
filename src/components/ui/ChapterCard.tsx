"use client";

import { motion } from "framer-motion";
import type { Chapter } from "@/lib/content";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Left-anchored chapter card. Rendered inside a fixed scene layer that mounts
 * when its band becomes active, so the entrance animation replays on entry.
 * Editorial treatment: a huge ghost numeral behind the copy, a masked
 * slide-up title, and a kicker rule that draws itself in.
 */
export default function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <>
      {/* legibility scrim — darkens the world behind the left-anchored copy */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-3/5"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,6,10,0.78) 0%, rgba(5,6,10,0.45) 42%, transparent 100%)",
        }}
      />

      {/* ghost chapter numeral — reads like a mile marker painted on the night */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, ease: EASE }}
        className="display pointer-events-none absolute left-2 top-1/2 -translate-y-[58%] select-none text-[42vh] leading-none md:left-8"
        style={{
          color: "transparent",
          WebkitTextStroke: "1px rgba(138,144,166,0.14)",
        }}
      >
        {chapter.index}
      </motion.span>

      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-[44ch] px-6 md:px-16"
      >
        <div className="mb-5 flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="display text-4xl"
            style={{ color: "var(--blue)" }}
          >
            {chapter.index}
          </motion.span>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="h-px w-10 origin-left"
            style={{ background: "var(--line)" }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mono text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--muted)" }}
          >
            {chapter.kicker}
          </motion.span>
        </div>

        {/* masked slide-up title */}
        <div className="mb-5 overflow-hidden">
          <motion.h2
            initial={{ y: "112%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="display text-4xl md:text-6xl"
            style={{ color: "var(--text)" }}
          >
            {chapter.title}
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: EASE }}
          className="legible text-base leading-relaxed md:text-lg"
          style={{ color: "var(--text)" }}
        >
          {chapter.body}
        </motion.p>

        {chapter.callout && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="mt-6 rounded-lg border p-4 backdrop-blur-sm"
            style={{ borderColor: "var(--line)", background: "rgba(16,17,25,0.5)" }}
          >
            <div className="mono mb-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--cyan)" }}>
              {chapter.callout.label}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {chapter.callout.text}
            </p>
          </motion.div>
        )}

        {chapter.id === "swarm" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mono mt-5 text-[11px] tracking-widest"
            style={{ color: "var(--blue)" }}
          >
            ↳ hover the swarm — meet the agents
          </motion.p>
        )}
      </motion.article>
    </>
  );
}
