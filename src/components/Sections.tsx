"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  IDENTITY,
  CHAPTERS,
  RIDER,
  EDUCATION,
  CERTIFICATIONS,
  IMPACT,
  SKILLS,
  VELOCITY_MARKERS,
  VELOCITY_CLOSER,
  CONTACT,
} from "@/lib/content";
import {
  SCENES,
  TOTAL_WEIGHT,
  useRide,
  localProgress,
  smoothstep,
  type SceneId,
} from "@/lib/ride";
import Decode from "./ui/Decode";
import Reveal from "./ui/Reveal";
import ChapterCard from "./ui/ChapterCard";
import ProjectConstellation from "./ui/ProjectConstellation";
import MagneticButton from "./ui/MagneticButton";
import CountUp from "./ui/CountUp";

const FIRST = SCENES[0].id;
const LAST = SCENES[SCENES.length - 1].id;

/**
 * A scene rendered as a fixed, full-screen layer whose opacity is driven by
 * the same ride `progress` the 3D world uses. Because nothing is positioned
 * by scroll-height fractions, the 3D and the DOM stay perfectly in sync and
 * every scene is always viewport-centred. Children mount only while the band
 * is active, so entrance animations replay each time the scene is entered.
 */
function SceneLayer({
  id,
  label,
  className,
  children,
}: {
  id: SceneId;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { progress } = useRide();
  const lp = localProgress(progress, id);
  const fadeIn = id === FIRST ? 1 : smoothstep(0, 0.12, lp);
  const fadeOut = id === LAST ? 1 : 1 - smoothstep(0.88, 1, lp);
  const opacity = fadeIn * fadeOut;
  const mounted = opacity > 0.004;
  const active = opacity > 0.5;

  return (
    <section
      aria-label={label}
      aria-hidden={!active}
      className={`fixed inset-0 z-10 flex ${className ?? ""}`}
      style={{
        opacity,
        pointerEvents: active ? "auto" : "none",
        visibility: mounted ? "visible" : "hidden",
      }}
    >
      {mounted && children}
    </section>
  );
}

export default function Sections({ started }: { started: boolean }) {
  return (
    <main id="content">
      {/* scroll distance — the fixed scene layers read progress from this */}
      <div aria-hidden style={{ height: `${TOTAL_WEIGHT * 100}vh` }} />

      <SceneLayer id="hero" label="Hassan Nazir" className="flex-col justify-center px-6 md:px-16">
        <HeroContent started={started} />
      </SceneLayer>

      <SceneLayer id="departure" label="The Foundations" className="items-center">
        <ChapterCard chapter={CHAPTERS[0]} />
      </SceneLayer>

      <SceneLayer id="build" label="Gridcore" className="items-center">
        <ChapterCard chapter={CHAPTERS[1]} />
      </SceneLayer>

      <SceneLayer id="swarm" label="The Swarm" className="items-center">
        <ChapterCard chapter={CHAPTERS[2]} />
      </SceneLayer>

      <SceneLayer id="skills" label="The instruments" className="items-center justify-center px-6 md:pr-28">
        <SkillsContent />
      </SceneLayer>

      <SceneLayer id="velocity" label="Range" className="items-center justify-center px-6">
        <VelocityContent />
      </SceneLayer>

      <SceneLayer id="summit" label="Built things" className="items-center px-6 md:pr-24">
        <ProjectConstellation />
      </SceneLayer>

      <SceneLayer id="rider" label="The human" className="items-center px-6 md:px-16">
        <RiderContent />
      </SceneLayer>

      <SceneLayer id="horizon" label="Contact" className="flex-col items-center justify-center px-6 text-center">
        <HorizonContent />
      </SceneLayer>
    </main>
  );
}

/* ---------------- Hero ---------------- */
function HeroContent({ started }: { started: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,6,10,0.7) 0%, rgba(5,6,10,0.35) 50%, transparent 85%)",
        }}
      />
      <div className="relative mono mb-4 text-[11px] uppercase tracking-[0.4em]" style={{ color: "var(--blue)" }}>
        Multi-Agent AI · Karakoram
      </div>
      <Decode
        as="h1"
        start={started}
        text="HASSAN NAZIR"
        speed={36}
        className="relative display text-[15vw] leading-[0.86] md:text-[12vw]"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 1 : 0 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="relative legible mt-6 max-w-[34ch] text-lg md:text-2xl"
        style={{ color: "var(--text)" }}
      >
        {IDENTITY.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="relative mt-7 flex flex-wrap gap-2"
      >
        {IDENTITY.chips.map((c) => (
          <span
            key={c}
            className="mono rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            {c}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 1 : 0 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="mono absolute z-10 bottom-10 left-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] md:left-16"
        style={{ color: "var(--muted)" }}
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ color: "var(--cyan)" }}
        >
          ⌄
        </motion.span>
        Scroll to ride
      </motion.div>
    </>
  );
}

/* ---------------- Skills / rider instrument console ---------------- */
function HudCorners() {
  const base = "pointer-events-none absolute h-2.5 w-2.5";
  return (
    <span className="pointer-events-none absolute inset-0" style={{ color: "var(--cyan)" }} aria-hidden>
      <span className={`${base} left-0 top-0 border-l border-t`} style={{ borderColor: "currentColor", opacity: 0.55 }} />
      <span className={`${base} right-0 top-0 border-r border-t`} style={{ borderColor: "currentColor", opacity: 0.55 }} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} style={{ borderColor: "currentColor", opacity: 0.55 }} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} style={{ borderColor: "currentColor", opacity: 0.55 }} />
    </span>
  );
}

const PANEL: React.CSSProperties = {
  borderColor: "var(--line)",
  background: "rgba(11,13,20,0.55)",
  backdropFilter: "blur(7px)",
};

// segmented LED gauge that fills the row width and lights up to the level
function SegMeter({ level, delay }: { level: number; delay: number }) {
  const N = 20;
  const filled = Math.round((level / 100) * N);
  return (
    <div className="flex items-center gap-[2px]" aria-hidden>
      {Array.from({ length: N }).map((_, i) => {
        const on = i < filled;
        return (
          <motion.span
            key={i}
            className="h-2.5 flex-1 rounded-[1px]"
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: on ? 1 : 0.13, scaleY: 1 }}
            transition={{ delay: delay + i * 0.02, duration: 0.28 }}
            style={{
              background: on ? "var(--cyan)" : "var(--muted)",
              boxShadow: on ? "0 0 6px rgba(127,233,255,0.6)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function SkillsContent() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 95% at 50% 50%, rgba(5,6,10,0.78), rgba(5,6,10,0.45) 60%, transparent)" }}
      />
      <div className="relative mx-auto w-full max-w-6xl">
        {/* console header */}
        <motion.div
          className="mb-7 flex items-end justify-between"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="mono mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--cyan)" }}>
              <motion.span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              Rider console · loadout
            </div>
            <h2 className="display text-4xl md:text-6xl" style={{ color: "var(--text)" }}>
              What rides in the pack
            </h2>
          </div>
          <div className="mono hidden text-right text-[9px] uppercase leading-relaxed tracking-widest sm:block" style={{ color: "var(--muted)" }}>
            sys · nominal
            <br />
            all systems go
          </div>
        </motion.div>

        {/* impact gauges */}
        <div className="mb-6 grid grid-cols-3 gap-2.5 md:grid-cols-6">
          {IMPACT.map((s, i) => (
            <motion.div
              key={s.label}
              className="relative rounded-md border px-3 py-3 text-center"
              style={PANEL}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
            >
              <HudCorners />
              <div className="mono mb-1 text-[8px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {s.label}
              </div>
              <div style={{ color: "var(--cyan)" }}>
                <CountUp value={s.value} className="display block text-2xl md:text-[28px]" />
              </div>
              <div className="mt-2 flex justify-center gap-[2px]" aria-hidden>
                {Array.from({ length: 9 }).map((_, k) => (
                  <span
                    key={k}
                    className="h-[3px] w-[3px] rounded-full"
                    style={{ background: k < 6 ? "var(--blue)" : "var(--line)", opacity: k < 6 ? 0.8 : 1 }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* skill systems */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {SKILLS.map((g, gi) => (
            <motion.div
              key={g.group}
              className="relative rounded-md border p-4"
              style={PANEL}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + gi * 0.1, duration: 0.55 }}
            >
              <HudCorners />
              <div className="mb-3 flex items-center gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--blue)" }}>
                  {g.group}
                </span>
                <span className="mono ml-auto text-[8px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  online
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {g.items.map((sk, i) => (
                  <div key={sk.name}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-[12px]" style={{ color: "var(--text)" }}>
                        {sk.name}
                      </span>
                      <span className="mono text-[10px]" style={{ color: "var(--cyan)" }}>
                        {sk.level}
                      </span>
                    </div>
                    <SegMeter level={sk.level} delay={0.35 + gi * 0.1 + i * 0.05} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- Velocity ---------------- */
function VelocityContent() {
  const { progress } = useRide();
  const lp = localProgress(progress, "velocity");
  const slots = VELOCITY_MARKERS.length + 1;
  const active = Math.min(VELOCITY_MARKERS.length, Math.floor(lp * slots));

  return (
    <>
      {VELOCITY_MARKERS.map((m, i) => (
        <motion.div
          key={m.org}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          initial={false}
          animate={{
            opacity: active === i ? 1 : 0,
            x: active === i ? 0 : active > i ? -120 : 120,
            filter: active === i ? "blur(0px)" : "blur(8px)",
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mono mb-3 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--cyan)" }}>
            {m.role}
          </div>
          <div className="display text-[10vw] leading-none md:text-[7vw]" style={{ color: "var(--text)" }}>
            {m.org}
          </div>
          <div className="mono mt-4 text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            {m.detail}
          </div>
        </motion.div>
      ))}

      <motion.div
        className="absolute inset-0 flex items-center justify-center px-6 text-center"
        initial={false}
        animate={{ opacity: active >= VELOCITY_MARKERS.length ? 1 : 0, scale: active >= VELOCITY_MARKERS.length ? 1 : 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <div className="display text-4xl md:text-6xl" style={{ color: "var(--text)" }}>
          “{VELOCITY_CLOSER}”
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-px"
            style={{
              top: `${(i / 14) * 100}%`,
              width: "40%",
              background: "linear-gradient(90deg, transparent, var(--blue), transparent)",
              opacity: 0.3,
            }}
            animate={{ x: ["-50%", "150%"] }}
            transition={{ duration: 0.6 + (i % 4) * 0.2, repeat: Infinity, ease: "linear", delay: i * 0.05 }}
          />
        ))}
      </div>
    </>
  );
}

/* ---------------- Rider ---------------- */
function RiderContent() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-3/5"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,6,10,0.82) 0%, rgba(5,6,10,0.5) 42%, transparent 100%)",
        }}
      />
      <div className="relative mr-auto max-w-[44ch] text-left">
        <Reveal>
          <div className="mono mb-3 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--amber)" }}>
            {RIDER.index} · {RIDER.kicker}
          </div>
          <h2 className="display mb-4 text-4xl md:text-6xl" style={{ color: "var(--text)" }}>
            {RIDER.title}
          </h2>
        </Reveal>
        {RIDER.body.map((para, i) => (
          <Reveal key={i} delay={0.1 + i * 0.1}>
            <p className="legible mb-3 text-sm leading-relaxed md:text-base" style={{ color: "var(--text)" }}>
              {para}
            </p>
          </Reveal>
        ))}

        <Reveal delay={0.3}>
          <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <div className="mono mb-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              Education
            </div>
            <p className="legible text-sm" style={{ color: "var(--text)" }}>
              {EDUCATION.degree} · {EDUCATION.school}{" "}
              <span style={{ color: "var(--muted)" }}>({EDUCATION.period})</span>
            </p>
            <div className="mono mb-1 mt-4 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
              Certifications
            </div>
            <ul className="flex flex-col gap-1">
              {CERTIFICATIONS.map((c) => (
                <li key={c.name} className="legible text-sm" style={{ color: "var(--text)" }}>
                  {c.name}{" "}
                  <span className="mono text-[11px]" style={{ color: "var(--muted)" }}>
                    · {c.issuer}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </>
  );
}

/* ---------------- Horizon / Contact ---------------- */
function HorizonContent() {
  return (
    <>
      <Reveal>
        <div className="mono mb-6 text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>
          The road continues
        </div>
        <MagneticButton
          href={`mailto:${CONTACT.email}`}
          cursor="MAIL"
          strength={0.5}
          className="display text-[12vw] leading-none md:text-[8vw]"
        >
          <span style={{ color: "var(--text)" }}>{CONTACT.headline}</span>
        </MagneticButton>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {CONTACT.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="OPEN"
              className="mono text-[12px] tracking-wide transition-colors hover:text-[var(--cyan)]"
              style={{ color: "var(--muted)" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </Reveal>

      <footer className="absolute bottom-6 flex flex-col items-center gap-1.5">
        <div className="mono flex items-center gap-2 text-[10px] tracking-widest" style={{ color: "var(--muted)" }}>
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--rose)" }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          © {new Date().getFullYear()} Hassan Nazir · Islamabad, PK
        </div>
        <div className="mono text-[9px] tracking-wide" style={{ color: "rgba(138,144,166,0.6)" }}>
          “Honda Shadow RS 2010” by{" "}
          <a
            href="https://sketchfab.com/Alex.Ka."
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="OPEN"
            className="underline-offset-2 hover:text-[var(--cyan)] hover:underline"
          >
            Alex.Ka.
          </a>{" "}
          · CC-BY-NC-ND 4.0
        </div>
      </footer>
    </>
  );
}
