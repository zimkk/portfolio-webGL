"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Playlist ────────────────────────────────────────────────────────────────
// DEFAULT_TRACK — first song, low volume by default.
const DEFAULT_TRACK_IDX = 0;
const DEFAULT_VOLUME    = 0.10; // 10%

const PLAYLIST = [
  {
    id: "01",
    title: "Mujhse Mohabbat Ka",
    artist: "Classic Bollywood",
    src: "/audio/01_Mujhse_Mohabbat_Ka_SpotiDost.mp3",
    duration: "5:50",
    startTime: 120,
  },
  {
    id: "02",
    title: "Tumsa Koi Pyaara",
    artist: "Classic Bollywood",
    src: "/audio/02_Tumsa_Koi_Pyaara_SpotiDost.mp3",
    duration: "5:54",
    startTime: 0,
  },
  {
    id: "03",
    title: "Pehli Pehli Baar Mohabbat",
    artist: "Sirf Tum",
    src: "/audio/03_Pehli_Pehli_Baar_Mohabbat_Ki_Hai_From_Sirf_Tum_SpotiDost.mp3",
    duration: "7:34",
    startTime: 0,
  },
  {
    id: "04",
    title: "Saaton Janam Main Tere",
    artist: "Classic Bollywood",
    src: "/audio/04_Saaton_Janam_Main_Tere_SpotiDost.mp3",
    duration: "5:55",
    startTime: 0,
  },
  {
    id: "05",
    title: "Tumhein Dekhen Meri Aankhen",
    artist: "Classic Bollywood",
    src: "/audio/05_Tumhein_Dekhen_Meri_Aankhen_SpotiDost.mp3",
    duration: "7:09",
    startTime: 0,
  },
  {
    id: "06",
    title: "Tumhein Apna Banane Ki Kasam",
    artist: "Classic Bollywood",
    src: "/audio/06_Tumhein_Apna_Banane_Ki_Kasam_Khai_Hai_SpotiDost.mp3",
    duration: "6:12",
    startTime: 0,
  },
  {
    id: "07",
    title: "Raah Mein Unse Mulaqat",
    artist: "Classic Bollywood",
    src: "/audio/07_Raah_Mein_Unse_Mulaqat_SpotiDost.mp3",
    duration: "8:53",
    startTime: 0,
  },
  {
    id: "08",
    title: "Tu Jo Hans Hans Ke",
    artist: "Raja Bhaiya",
    src: "/audio/08_Tu_Jo_Hans_Hans_Ke_-_From_Raja_Bhaiya_SpotiDost.mp3",
    duration: "5:07",
    startTime: 0,
  },
  {
    id: "09",
    title: "Kahin Mujhe Pyar Hua",
    artist: "Classic Bollywood",
    src: "/audio/09_Kahin_Mujhe_Pyar_Hua_Toh_Nahin_SpotiDost.mp3",
    duration: "7:50",
    startTime: 0,
  },
  {
    id: "10",
    title: "Dil Kehta Hai",
    artist: "Akele Hum Akele Tum",
    src: "/audio/10_Dil_Kehta_Hai_From_Akele_Hum_Akele_Tum_SpotiDost.mp3",
    duration: "7:26",
    startTime: 0,
  },
  {
    id: "11",
    title: "Chori Chori Dil Tera",
    artist: "Classic Bollywood",
    src: "/audio/11_Chori_Chori_Dil_Tera_SpotiDost.mp3",
    duration: "9:55",
    startTime: 0,
  },
  {
    id: "12",
    title: "Is Tarah Aashiqui Ka",
    artist: "Kumar Sanu",
    src: "/audio/12_Is_Tarah_Aashiqui_Ka_-_Kumar_Sanu_Version_SpotiDost.mp3",
    duration: "8:05",
    startTime: 0,
  },
  {
    id: "13",
    title: "Kitna Haseen Chehra",
    artist: "Dilwale",
    src: "/audio/13_Kitna_Haseen_Chehra_From_Dilwale_SpotiDost.mp3",
    duration: "5:59",
    startTime: 0,
  },
  {
    id: "14",
    title: "Dil Cheer Ke Dekh",
    artist: "Classic Bollywood",
    src: "/audio/14_Dil_Cheer_Ke_Dekh_SpotiDost.mp3",
    duration: "5:37",
    startTime: 0,
  },
  {
    id: "15",
    title: "Pucho Zara Pucho",
    artist: "Classic Bollywood",
    src: "/audio/15_Pucho_Zara_Pucho_SpotiDost.mp3",
    duration: "6:44",
    startTime: 0,
  },
];

// ─── Icons ───────────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
    <polygon points="0,0 10,6 0,12" />
  </svg>
);
const PauseIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
    <rect x="0" y="0" width="3.5" height="12" />
    <rect x="6.5" y="0" width="3.5" height="12" />
  </svg>
);
const PrevIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <polygon points="12,0 3,6 12,12" />
    <rect x="0" y="0" width="2" height="12" />
  </svg>
);
const NextIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <polygon points="0,0 9,6 0,12" />
    <rect x="10" y="0" width="2" height="12" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SoundToggle() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(DEFAULT_TRACK_IDX);
  const [progress, setProgress] = useState(0); // 0-1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const autoplayedRef = useRef(false); // fire only once

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Init audio ──
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = false;
      a.volume = volume;
      a.preload = "metadata";
      audioRef.current = a;
    }
    return audioRef.current;
  }, [volume]);

  // ── Load track ──
  const loadTrack = useCallback(
    (idx: number, autoPlay = true) => {
      const a = getAudio();
      const track = PLAYLIST[idx];
      a.src = track.src;
      a.load();

      // seek to startTime once metadata is ready
      if (track.startTime > 0) {
        const onCanPlay = () => {
          a.currentTime = track.startTime;
          a.removeEventListener("canplay", onCanPlay);
        };
        a.addEventListener("canplay", onCanPlay);
      }

      if (autoPlay) {
        // play after a brief moment (gives canplay time to fire first)
        const tryPlay = () => {
          a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        };
        if (track.startTime > 0) {
          a.addEventListener("canplay", tryPlay, { once: true });
        } else {
          a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
      }
    },
    [getAudio]
  );

  // ── Progress loop ──
  useEffect(() => {
    const tick = () => {
      const a = audioRef.current;
      if (a) {
        setCurrentTime(a.currentTime);
        setDuration(a.duration || 0);
        setProgress(a.duration ? a.currentTime / a.duration : 0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Auto-next ──
  useEffect(() => {
    const a = getAudio();
    const onEnd = () => {
      const next = (trackIdx + 1) % PLAYLIST.length;
      setTrackIdx(next);
      loadTrack(next, true);
    };
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
  }, [trackIdx, loadTrack, getAudio]);

  // ── Sync volume ──
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ── Close on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Autoplay on first user gesture (browsers block autoplay without it) ──
  useEffect(() => {
    const trigger = () => {
      if (autoplayedRef.current) return;
      autoplayedRef.current = true;
      // remove all listeners immediately
      ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
        document.removeEventListener(ev, trigger)
      );
      loadTrack(DEFAULT_TRACK_IDX, true);
    };

    ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
      document.addEventListener(ev, trigger, { once: true, passive: true })
    );
    return () => {
      ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
        document.removeEventListener(ev, trigger)
      );
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Controls ──
  const togglePlay = () => {
    const a = getAudio();
    if (!a.src || a.src === window.location.href) {
      loadTrack(trackIdx, true);
      return;
    }
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const selectTrack = (idx: number) => {
    setTrackIdx(idx);
    loadTrack(idx, true);
  };

  const prevTrack = () => {
    const idx = (trackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    setTrackIdx(idx);
    loadTrack(idx, true);
  };

  const nextTrack = () => {
    const idx = (trackIdx + 1) % PLAYLIST.length;
    setTrackIdx(idx);
    loadTrack(idx, true);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = ratio * a.duration;
  };

  const track = PLAYLIST[trackIdx];

  return (
    <>
      <style>{`
        @keyframes eq {
          0%   { transform: scaleY(0.35); }
          50%  { transform: scaleY(1.2); }
          100% { transform: scaleY(0.6); }
        }
        .playlist-dropdown {
          animation: slideUp 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
          overflow: hidden;
          border-radius: 16px;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .track-row:hover .track-row-bg { opacity: 1; }
        .progress-bar:hover { height: 6px !important; }
        .track-list::-webkit-scrollbar { width: 4px; }
        .track-list::-webkit-scrollbar-track { background: transparent; }
        .track-list::-webkit-scrollbar-thumb { background: rgba(0,255,240,0.2); border-radius: 4px; }
        .track-list::-webkit-scrollbar-thumb:hover { background: rgba(0,255,240,0.4); }
      `}</style>

      <div ref={containerRef} className="pointer-events-auto fixed bottom-5 right-5 z-[120]">

        {/* ── Dropdown ── */}
        {open && (
          <div
            className="playlist-dropdown absolute bottom-[calc(100%+10px)] right-0 w-[300px] rounded-2xl"
            style={{
              background: "rgba(8,8,14,0.92)",
              border: "1px solid rgba(0,255,240,0.15)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,240,0.05)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,240,0.08), rgba(120,80,255,0.08))",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="mono text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(0,255,240,0.5)" }}>
                Now Playing
              </p>
              <p className="mt-0.5 text-[13px] font-semibold truncate" style={{ color: "var(--fg, #fff)" }}>
                {track.title}
              </p>
              <p className="mono text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {track.artist}
              </p>

              {/* Progress bar */}
              <div
                className="progress-bar mt-3 h-[3px] w-full cursor-pointer rounded-full transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.1)" }}
                onClick={seek}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: "linear-gradient(90deg, rgba(0,255,240,0.9), rgba(120,80,255,0.9))",
                    transition: "width 0.3s linear",
                  }}
                />
              </div>
              <div className="mono mt-1 flex justify-between text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevTrack}
                    className="rounded-full p-1.5 transition-all hover:scale-110"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    aria-label="Previous track"
                  >
                    <PrevIcon />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,255,240,0.9), rgba(120,80,255,0.9))",
                      color: "#000",
                    }}
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    onClick={nextTrack}
                    className="rounded-full p-1.5 transition-all hover:scale-110"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    aria-label="Next track"
                  >
                    <NextIcon />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="rgba(255,255,255,0.35)">
                    <path d="M0 4h2l3-3v10L2 8H0V4zm7 1a2 2 0 010 2M8.5 3.5a4 4 0 010 5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" />
                  </svg>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 cursor-pointer appearance-none rounded-full"
                    style={{
                      height: "3px",
                      background: `linear-gradient(90deg, rgba(0,255,240,0.7) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                      outline: "none",
                    }}
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>

            {/* Playlist header */}
            <div
              className="px-4 py-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="mono text-[9px] uppercase tracking-[0.25em]" style={{ color: "rgba(0,255,240,0.4)" }}>
                🎬 Truck Driver — Playlist
              </p>
            </div>

            {/* Track list */}
            <div
              className="track-list max-h-[220px] overflow-y-scroll"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,255,240,0.25) transparent",
              }}
            >
              {PLAYLIST.map((t, i) => (
                <div
                  key={t.id}
                  className="track-row relative cursor-pointer px-4 py-2.5 transition-colors"
                  onClick={() => selectTrack(i)}
                  style={{
                    background: i === trackIdx ? "rgba(0,255,240,0.06)" : "transparent",
                    borderLeft: i === trackIdx ? "2px solid rgba(0,255,240,0.7)" : "2px solid transparent",
                  }}
                >
                  <div className="track-row-bg absolute inset-0 opacity-0 transition-opacity" style={{ background: "rgba(255,255,255,0.03)" }} />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className="mono flex-shrink-0 text-[9px] w-4 text-right"
                        style={{ color: i === trackIdx ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.25)" }}
                      >
                        {i === trackIdx && playing ? (
                          <span className="flex items-end gap-[2px]">
                            {[0, 1, 2].map((b) => (
                              <span
                                key={b}
                                className="block w-[2px] rounded-full"
                                style={{
                                  height: "8px",
                                  background: "rgba(0,255,240,0.9)",
                                  animation: `eq 0.6s ${b * 0.15}s ease-in-out infinite alternate`,
                                  transformOrigin: "bottom",
                                }}
                              />
                            ))}
                          </span>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <div className="overflow-hidden">
                        <p
                          className="truncate text-[12px] font-medium"
                          style={{ color: i === trackIdx ? "#fff" : "rgba(255,255,255,0.65)" }}
                        >
                          {t.title}
                        </p>
                        <p className="mono truncate text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {t.artist}
                        </p>
                      </div>
                    </div>
                    <span className="mono flex-shrink-0 text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {t.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trigger button ── */}
        <button
          onClick={() => setOpen((v) => !v)}
          data-cursor={playing ? "PLAYLIST" : "PLAY"}
          aria-label="Toggle music playlist"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-sm transition-all hover:scale-105"
          style={{
            border: "1px solid rgba(0,255,240,0.2)",
            background: open
              ? "rgba(0,255,240,0.08)"
              : "rgba(10,10,15,0.55)",
            boxShadow: playing ? "0 0 16px rgba(0,255,240,0.15)" : "none",
          }}
        >
          {/* Animated EQ bars */}
          <span className="flex items-end gap-[2px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="block w-[2px] rounded-full"
                style={{
                  height: playing ? `${6 + ((i % 3) + 1) * 3}px` : "4px",
                  background: playing ? "rgba(0,255,240,0.9)" : "rgba(255,255,255,0.3)",
                  animation: playing ? `eq 0.7s ${i * 0.13}s ease-in-out infinite alternate` : "none",
                  transition: "height 0.3s ease, background 0.3s ease",
                  transformOrigin: "bottom",
                }}
              />
            ))}
          </span>
          <span
            className="mono text-[10px] uppercase tracking-widest"
            style={{ color: playing ? "rgba(0,255,240,0.9)" : "rgba(255,255,255,0.4)" }}
          >
            {playing ? track.title.split(" ")[0] : "Music"}
          </span>
          {/* Chevron */}
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            style={{
              color: "rgba(255,255,255,0.3)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="M1 2l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  );
}
