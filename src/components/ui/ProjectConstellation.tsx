"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS, PROJECTS_TAGLINE, type Project } from "@/lib/content";

export default function ProjectConstellation() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="mb-6 text-center">
        <div className="mono mb-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--amber)" }}>
          The Summit · Built things
        </div>
        <h2 className="display text-4xl md:text-6xl" style={{ color: "var(--text)" }}>
          The valley, lit up
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <motion.button
            key={p.id}
            data-cursor="VIEW"
            onClick={() => setActive(p)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border p-4 text-left"
            style={{
              borderColor: p.featured ? "rgba(255,178,122,0.45)" : "var(--line)",
              background: p.featured ? "rgba(40,28,22,0.5)" : "rgba(16,17,25,0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            {p.featured && (
              <span className="mono absolute right-4 top-4 text-[9px] uppercase tracking-widest" style={{ color: "var(--amber)" }}>
                ★ flagship
              </span>
            )}
            <div className="mono mb-2 text-[10px] uppercase tracking-widest" style={{ color: "var(--cyan)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="display mb-1.5 text-xl" style={{ color: "var(--text)" }}>
              {p.name}
            </h3>
            <p className="mb-3 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
              {p.blurb}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="mono rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wide"
                  style={{ borderColor: "var(--line)", color: "var(--muted)" }}
                >
                  {t}
                </span>
              ))}
            </div>
            <span
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
              style={{ background: p.featured ? "var(--amber)" : "var(--blue)" }}
            />
          </motion.button>
        ))}
      </div>

      <p className="mono mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
        {PROJECTS_TAGLINE}{" "}
        <a href="https://github.com/zimkk" target="_blank" rel="noopener noreferrer" data-cursor="OPEN" style={{ color: "var(--blue)" }}>
          github.com/zimkk →
        </a>
      </p>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[160] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            style={{ background: "rgba(5,6,10,0.8)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.name}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-2xl border p-8"
              style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}
            >
              <button
                onClick={() => setActive(null)}
                data-cursor="CLOSE"
                aria-label="Close"
                className="absolute right-5 top-5 mono text-sm"
                style={{ color: "var(--muted)" }}
              >
                ✕
              </button>
              <h3 className="display mb-4 text-3xl" style={{ color: "var(--text)" }}>
                {active.name}
              </h3>
              <p className="mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
                {active.blurb}
              </p>
              <div className="flex flex-wrap gap-2">
                {active.tags.map((t) => (
                  <span
                    key={t}
                    className="mono rounded-full border px-3 py-1 text-[10px] uppercase"
                    style={{ borderColor: "var(--line)", color: "var(--cyan)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              {active.href && (
                <a
                  href={active.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="OPEN"
                  className="mono mt-6 inline-block text-sm"
                  style={{ color: "var(--blue)" }}
                >
                  Open repository →
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
