"use client";

import { useEffect, useRef, useState } from "react";
import { ride } from "@/lib/ride";

export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const rafRef = useRef(0);

  const start = () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    masterRef.current = master;

    // low engine hum
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 46;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.12;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    osc.connect(lp).connect(oscGain).connect(master);
    osc.start();
    oscRef.current = osc;
    gainRef.current = oscGain;

    // wind — filtered white noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 600;
    bp.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(bp).connect(noiseGain).connect(master);
    noise.start();

    // ease master in
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.8);

    const loop = () => {
      if (oscRef.current && ctxRef.current) {
        const v = ride.velocity;
        oscRef.current.frequency.setTargetAtTime(46 + v * 600, ctxRef.current.currentTime, 0.1);
        noiseGain.gain.setTargetAtTime(0.05 + v * 1.2, ctxRef.current.currentTime, 0.1);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => ctx.close(), 500);
    }
    ctxRef.current = null;
  };

  useEffect(() => () => stop(), []);

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  };

  return (
    <button
      onClick={toggle}
      data-cursor={on ? "MUTE" : "SOUND"}
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Enable ambient sound"}
      className="pointer-events-auto fixed bottom-5 right-5 z-[120] flex items-center gap-2 rounded-full border px-3 py-2 backdrop-blur-sm"
      style={{ borderColor: "var(--line)", background: "rgba(10,10,15,0.5)" }}
    >
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-[2px] rounded-full transition-all"
            style={{
              height: on ? `${6 + ((i % 3) + 1) * 3}px` : "4px",
              background: on ? "var(--cyan)" : "var(--muted)",
              animation: on ? `eq 0.8s ${i * 0.12}s ease-in-out infinite alternate` : "none",
            }}
          />
        ))}
      </span>
      <span className="mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        {on ? "Sound on" : "Sound off"}
      </span>
      <style>{`@keyframes eq{from{transform:scaleY(0.4)}to{transform:scaleY(1.3)}}`}</style>
    </button>
  );
}
