"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Playlist ────────────────────────────────────────────────────────────────
// DEFAULT_TRACK — #3 Pehli Pehli Baar Mohabbat, starts at 1:30 mark at low volume.
const DEFAULT_TRACK_IDX = 2;
const DEFAULT_VOLUME    = 0.09; // 9%

const PLAYLIST = [
  {
    id: "01",
    title: "Mujhse Mohabbat Ka",
    artist: "Classic Bollywood",
    src: "/audio/01_Mujhse_Mohabbat_Ka_SpotiDost.mp3",
    duration: "5:50",
    startTime: 0,
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
    startTime: 90, // jump to 1:30 mark
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
export default function SoundToggle({ autoPlayWhenReady = false }: { autoPlayWhenReady?: boolean }) {
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

  // ── Attempt autoplay immediately on mount (works if browser allows it) ──
  useEffect(() => {
    // Small delay so the audio element is set up first
    const t = setTimeout(() => {
      if (autoplayedRef.current) return;
      const a = getAudio();
      const track = PLAYLIST[DEFAULT_TRACK_IDX];
      a.src = track.src;
      a.volume = DEFAULT_VOLUME;
      a.load();
      const tryPlay = () => {
        a.play()
          .then(() => {
            autoplayedRef.current = true;
            setPlaying(true);
            setTrackIdx(DEFAULT_TRACK_IDX);
          })
          .catch(() => {
            // blocked — fall through to gesture listeners
          });
      };
      if (track.startTime > 0) {
        a.addEventListener("canplay", () => { a.currentTime = track.startTime; }, { once: true });
        a.addEventListener("canplay", tryPlay, { once: true });
      } else {
        a.addEventListener("canplay", tryPlay, { once: true });
      }
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Retry autoplay when preloader finishes (a render = user-visible gesture context) ──
  useEffect(() => {
    if (!autoPlayWhenReady || autoplayedRef.current) return;
    const a = getAudio();
    if (!a.src) return;
    a.play()
      .then(() => {
        autoplayedRef.current = true;
        setPlaying(true);
        setTrackIdx(DEFAULT_TRACK_IDX);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayWhenReady]);

  // ── Autoplay on first user gesture (Browsers block unmuted autoplay without interaction) ──
  useEffect(() => {
    const trigger = () => {
      if (autoplayedRef.current) return;
      const a = getAudio();
      
      const onSuccess = () => {
        autoplayedRef.current = true;
        setPlaying(true);
        setTrackIdx(DEFAULT_TRACK_IDX);
        // Safely remove listeners only after successful play
        ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
          document.removeEventListener(ev, trigger)
        );
      };

      // If no src is set yet, load the default track
      if (!a.src || a.src === window.location.href) {
        const track = PLAYLIST[DEFAULT_TRACK_IDX];
        a.src = track.src;
        a.volume = DEFAULT_VOLUME;
        a.load();
        
        const tryPlay = () => {
          a.play().then(onSuccess).catch(() => {});
        };

        if (track.startTime > 0) {
          a.addEventListener("canplay", () => { a.currentTime = track.startTime; }, { once: true });
          a.addEventListener("canplay", tryPlay, { once: true });
        } else {
          a.addEventListener("canplay", tryPlay, { once: true });
        }
      } else {
        // It was already loaded but blocked, just play it
        a.play().then(onSuccess).catch(() => {});
      }
    };

    ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
      document.addEventListener(ev, trigger, { passive: true })
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
        @keyframes truckBounce {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-2px); }
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

        /* Music-reactive outline on the trigger button */
        .music-btn-playing {
          animation: musicPulse 1.8s ease-in-out infinite;
        }
        @keyframes musicPulse {
          0%   {
            border-color: rgba(0,255,240,0.35);
            box-shadow:
              0 0 0px  0px  rgba(0,255,240,0.0),
              0 0 8px  2px  rgba(0,255,240,0.12),
              inset 0 0 0px rgba(0,255,240,0.0);
          }
          25%  {
            border-color: rgba(0,255,240,0.9);
            box-shadow:
              0 0 0px  3px  rgba(0,255,240,0.18),
              0 0 18px 4px  rgba(0,255,240,0.25),
              inset 0 0 6px rgba(0,255,240,0.08);
          }
          50%  {
            border-color: rgba(120,80,255,0.8);
            box-shadow:
              0 0 0px  5px  rgba(120,80,255,0.1),
              0 0 22px 6px  rgba(0,255,240,0.2),
              inset 0 0 8px rgba(0,255,240,0.06);
          }
          75%  {
            border-color: rgba(0,255,240,0.95);
            box-shadow:
              0 0 0px  3px  rgba(0,255,240,0.2),
              0 0 16px 3px  rgba(0,255,240,0.28),
              inset 0 0 5px rgba(0,255,240,0.1);
          }
          100% {
            border-color: rgba(0,255,240,0.35);
            box-shadow:
              0 0 0px  0px  rgba(0,255,240,0.0),
              0 0 8px  2px  rgba(0,255,240,0.12),
              inset 0 0 0px rgba(0,255,240,0.0);
          }
        }
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
          className={`flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-sm transition-all hover:scale-105${playing ? " music-btn-playing" : ""}`}
          style={{
            border: playing ? "1px solid rgba(0,255,240,0.35)" : "1px solid rgba(0,255,240,0.2)",
            background: open
              ? "rgba(0,255,240,0.08)"
              : "rgba(10,10,15,0.55)",
            boxShadow: playing ? undefined : "none",
          }}
        >
          {/* Pakistani Jingle Truck icon */}
          <svg
            width="44"
            height="28"
            viewBox="0 0 88 52"
            fill="none"
            aria-hidden
            style={{
              filter: playing
                ? "drop-shadow(0 0 4px rgba(0,255,240,0.6))"
                : "none",
              animation: playing ? "truckBounce 1.2s ease-in-out infinite alternate" : "none",
              transition: "filter 0.3s ease",
            }}
          >
            {/* === CARGO BODY === */}
            <rect x="2" y="18" width="52" height="22" rx="1"
              fill={playing ? "rgba(0,200,180,0.15)" : "rgba(255,255,255,0.08)"}
              stroke={playing ? "rgba(0,255,240,0.7)" : "rgba(255,255,255,0.35)"}
              strokeWidth="1.2" />
            {/* Decorative panels on cargo body */}
            <rect x="5"  y="21" width="10" height="16" rx="0.5"
              fill="none" stroke={playing ? "rgba(0,255,240,0.35)" : "rgba(255,255,255,0.15)"} strokeWidth="0.8" />
            <rect x="17" y="21" width="10" height="16" rx="0.5"
              fill="none" stroke={playing ? "rgba(0,255,240,0.35)" : "rgba(255,255,255,0.15)"} strokeWidth="0.8" />
            <rect x="29" y="21" width="10" height="16" rx="0.5"
              fill="none" stroke={playing ? "rgba(0,255,240,0.35)" : "rgba(255,255,255,0.15)"} strokeWidth="0.8" />
            <rect x="41" y="21" width="11" height="16" rx="0.5"
              fill="none" stroke={playing ? "rgba(0,255,240,0.35)" : "rgba(255,255,255,0.15)"} strokeWidth="0.8" />
            {/* Diamond pattern dots in panels */}
            {[10, 22, 34, 46].map((x) => (
              <circle key={x} cx={x} cy="29" r="1.2"
                fill={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.2)"} />
            ))}

            {/* === CAB === */}
            {/* Cab body */}
            <rect x="54" y="20" width="28" height="20" rx="2"
              fill={playing ? "rgba(0,180,160,0.2)" : "rgba(255,255,255,0.1)"}
              stroke={playing ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.4)"}
              strokeWidth="1.3" />
            {/* Cab roof ornate crown / top rack */}
            <rect x="53" y="12" width="30" height="9" rx="1.5"
              fill={playing ? "rgba(0,200,180,0.18)" : "rgba(255,255,255,0.09)"}
              stroke={playing ? "rgba(0,255,240,0.7)" : "rgba(255,255,255,0.3)"}
              strokeWidth="1" />
            {/* Crown top spikes / tassels (the iconic ornate crest) */}
            {[56,60,64,68,72,76,80].map((x) => (
              <line key={x} x1={x} y1="12" x2={x} y2="8"
                stroke={playing ? "rgba(0,255,240,0.6)" : "rgba(255,255,255,0.25)"}
                strokeWidth="1.2" strokeLinecap="round" />
            ))}
            {[56,60,64,68,72,76,80].map((x) => (
              <circle key={x} cx={x} cy="7" r="1.3"
                fill={playing ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.3)"} />
            ))}
            {/* Windshield */}
            <rect x="57" y="22" width="16" height="12" rx="1"
              fill={playing ? "rgba(0,255,240,0.08)" : "rgba(255,255,255,0.06)"}
              stroke={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.25)"}
              strokeWidth="1" />
            {/* Windshield divider */}
            <line x1="65" y1="22" x2="65" y2="34"
              stroke={playing ? "rgba(0,255,240,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="0.8" />
            {/* Door */}
            <rect x="74" y="24" width="6" height="14" rx="0.5"
              fill="none"
              stroke={playing ? "rgba(0,255,240,0.4)" : "rgba(255,255,255,0.2)"}
              strokeWidth="0.8" />
            {/* Door handle */}
            <line x1="75.5" y1="31" x2="78.5" y2="31"
              stroke={playing ? "rgba(0,255,240,0.6)" : "rgba(255,255,255,0.3)"}
              strokeWidth="1" strokeLinecap="round" />
            {/* Headlight */}
            <circle cx="81" cy="30" r="3.5"
              fill={playing ? "rgba(255,240,100,0.25)" : "rgba(255,255,255,0.08)"}
              stroke={playing ? "rgba(255,230,80,0.9)" : "rgba(255,255,255,0.4)"}
              strokeWidth="1.2" />
            <circle cx="81" cy="30" r="1.5"
              fill={playing ? "rgba(255,245,150,0.7)" : "rgba(255,255,255,0.2)"} />
            {/* Headlight beam when playing */}
            {playing && (
              <>
                <line x1="84" y1="28" x2="88" y2="25" stroke="rgba(255,240,100,0.35)" strokeWidth="1" strokeLinecap="round"/>
                <line x1="85" y1="30" x2="88" y2="30" stroke="rgba(255,240,100,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="84" y1="32" x2="88" y2="35" stroke="rgba(255,240,100,0.25)" strokeWidth="1" strokeLinecap="round"/>
              </>
            )}
            {/* Front bumper */}
            <rect x="80" y="36" width="6" height="3" rx="1"
              fill={playing ? "rgba(0,255,240,0.3)" : "rgba(255,255,255,0.2)"}
              stroke={playing ? "rgba(0,255,240,0.6)" : "rgba(255,255,255,0.35)"}
              strokeWidth="0.8" />
            {/* Exhaust pipe */}
            <rect x="52" y="14" width="2.5" height="7" rx="1"
              fill={playing ? "rgba(0,255,240,0.4)" : "rgba(255,255,255,0.2)"}
              stroke={playing ? "rgba(0,255,240,0.6)" : "rgba(255,255,255,0.3)"}
              strokeWidth="0.7" />
            {/* Smoke puffs when playing */}
            {playing && (
              <>
                <circle cx="53" cy="11" r="2" fill="rgba(200,220,220,0.15)" />
                <circle cx="51" cy="8"  r="1.4" fill="rgba(200,220,220,0.1)" />
                <circle cx="54" cy="6"  r="1" fill="rgba(200,220,220,0.07)" />
              </>
            )}

            {/* === CHASSIS & WHEELS === */}
            {/* Chassis bar */}
            <rect x="2" y="39" width="86" height="2.5" rx="1"
              fill={playing ? "rgba(0,200,180,0.3)" : "rgba(255,255,255,0.15)"}
              stroke={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.25)"}
              strokeWidth="0.8" />
            {/* Rear wheel */}
            <circle cx="18" cy="44" r="7"
              fill={playing ? "rgba(0,180,160,0.12)" : "rgba(255,255,255,0.06)"}
              stroke={playing ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.45)"}
              strokeWidth="1.5" />
            <circle cx="18" cy="44" r="3.5"
              fill="none"
              stroke={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.25)"}
              strokeWidth="1" />
            <circle cx="18" cy="44" r="1.2"
              fill={playing ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.4)"} />
            {/* Rear wheel spokes */}
            {[0,60,120,180,240,300].map((deg) => (
              <line key={deg}
                x1={18 + 1.4 * Math.cos(deg * Math.PI/180)}
                y1={44 + 1.4 * Math.sin(deg * Math.PI/180)}
                x2={18 + 3.3 * Math.cos(deg * Math.PI/180)}
                y2={44 + 3.3 * Math.sin(deg * Math.PI/180)}
                stroke={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.25)"}
                strokeWidth="0.9" strokeLinecap="round" />
            ))}
            {/* Front wheel */}
            <circle cx="70" cy="44" r="7"
              fill={playing ? "rgba(0,180,160,0.12)" : "rgba(255,255,255,0.06)"}
              stroke={playing ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.45)"}
              strokeWidth="1.5" />
            <circle cx="70" cy="44" r="3.5"
              fill="none"
              stroke={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.25)"}
              strokeWidth="1" />
            <circle cx="70" cy="44" r="1.2"
              fill={playing ? "rgba(0,255,240,0.8)" : "rgba(255,255,255,0.4)"} />
            {[0,60,120,180,240,300].map((deg) => (
              <line key={deg}
                x1={70 + 1.4 * Math.cos(deg * Math.PI/180)}
                y1={44 + 1.4 * Math.sin(deg * Math.PI/180)}
                x2={70 + 3.3 * Math.cos(deg * Math.PI/180)}
                y2={44 + 3.3 * Math.sin(deg * Math.PI/180)}
                stroke={playing ? "rgba(0,255,240,0.5)" : "rgba(255,255,255,0.25)"}
                strokeWidth="0.9" strokeLinecap="round" />
            ))}
          </svg>
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
