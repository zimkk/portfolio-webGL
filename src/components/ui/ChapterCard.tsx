"use client";

import { motion } from "framer-motion";
import type { Chapter } from "@/lib/content";

/**
 * Left-anchored chapter card. Rendered inside a fixed scene layer that mounts
 * when its band becomes active, so the entrance animation replays on entry.
 */
export default function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <>
      {/* legibility scrim — darkens the world behind the left-anchored copy */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-3/5"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,6,10,0.8) 0%, rgba(5,6,10,0.5) 42%, transparent 100%)",
        }}
      />
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-[44ch] px-6 md:px-16"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="display text-4xl" style={{ color: "var(--blue)" }}>
            {chapter.index}
          </span>
          <span className="h-px w-10" style={{ background: "var(--line)" }} />
          <span className="mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
            {chapter.kicker}
          </span>
        </div>

        <h2 className="display mb-5 text-4xl md:text-6xl" style={{ color: "var(--text)" }}>
          {chapter.title}
        </h2>

        <p className="legible text-base leading-relaxed md:text-lg" style={{ color: "var(--text)" }}>
          {chapter.body}
        </p>

        {chapter.callout && (
          <div
            className="mt-6 rounded-lg border p-4 backdrop-blur-sm"
            style={{ borderColor: "var(--line)", background: "rgba(16,17,25,0.5)" }}
          >
            <div className="mono mb-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--cyan)" }}>
              {chapter.callout.label}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {chapter.callout.text}
            </p>
          </div>
        )}

        {chapter.id === "swarm" && (
          <p className="mono mt-5 text-[11px] tracking-widest" style={{ color: "var(--blue)" }}>
            ↳ hover the swarm — meet the agents
          </p>
        )}
      </motion.article>
    </>
  );
}
