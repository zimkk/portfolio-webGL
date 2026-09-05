import Link from "next/link";

interface WittyPayload {
  id: string;
  title: string;
  subtitle?: string;
  logs: string[];
  footnote: string;
  emoji: string;
  tags: string[];
}

async function getJoke(): Promise<WittyPayload | null> {
  try {
    const res = await fetch("https://witty-404.zimkk.workers.dev/json", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function NotFound() {
  const joke = await getJoke();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--void, #05060a)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        fontFamily:
          "ui-monospace, SFMono-Regular, 'Courier New', monospace",
      }}
    >
      {/* Status line */}
      <p
        style={{
          color: "var(--blue, #5b7fff)",
          fontSize: "0.7rem",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
          opacity: 0.75,
        }}
      >
        {joke?.emoji ?? "💥"}&nbsp;&nbsp;HTTP 404 · NOT FOUND
        {joke?.tags?.length
          ? "  ·  " + joke.tags.join(" · ").toUpperCase()
          : ""}
      </p>

      {/* Big 404 */}
      <div
        style={{
          fontSize: "clamp(5rem, 18vw, 9rem)",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          background:
            "linear-gradient(135deg, var(--cyan, #7fe9ff) 0%, var(--blue, #5b7fff) 60%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "2rem",
        }}
      >
        404
      </div>

      {/* Joke title */}
      {joke && (
        <p
          style={{
            color: "var(--text, #edeff5)",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            fontWeight: 600,
            textAlign: "center",
            maxWidth: "52ch",
            whiteSpace: "pre-line",
            lineHeight: 1.55,
            marginBottom: "1.5rem",
          }}
        >
          {joke.title}
        </p>
      )}

      {/* Terminal log block */}
      {joke?.logs?.length && (
        <div
          style={{
            width: "100%",
            maxWidth: "640px",
            background: "rgba(91,127,255,0.04)",
            border: "1px solid rgba(91,127,255,0.18)",
            borderRadius: "8px",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "0.85rem",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          {joke.logs.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.775rem",
                color:
                  line.includes("ERROR") ||
                  line.includes("Unhandled") ||
                  line.includes("FAIL")
                    ? "var(--rose, #ff7e9d)"
                    : line.includes("PASS") || line.includes("GREEN") || line.includes("🟢")
                    ? "var(--cyan, #7fe9ff)"
                    : "var(--muted, #9aa0b8)",
                lineHeight: 1.7,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Footnote */}
      {joke?.footnote && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "var(--muted, #9aa0b8)",
            opacity: 0.6,
            textAlign: "center",
            maxWidth: "52ch",
            marginBottom: "2.5rem",
          }}
        >
          {joke.footnote}
        </p>
      )}

      {!joke && (
        <p
          style={{
            color: "var(--muted, #9aa0b8)",
            fontSize: "0.9rem",
            marginBottom: "2.5rem",
          }}
        >
          This page does not exist.
        </p>
      )}

      {/* Home link */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.65rem 1.5rem",
          border: "1px solid rgba(91,127,255,0.4)",
          borderRadius: "6px",
          color: "var(--blue, #5b7fff)",
          fontSize: "0.8rem",
          letterSpacing: "0.15em",
          textDecoration: "none",
          textTransform: "uppercase",
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        ← Back to the ride
      </Link>

      {/* Subtle id watermark */}
      {joke?.id && (
        <p
          style={{
            position: "fixed",
            bottom: "1.25rem",
            right: "1.5rem",
            fontSize: "0.62rem",
            color: "rgba(91,127,255,0.25)",
            letterSpacing: "0.2em",
            pointerEvents: "none",
          }}
        >
          {joke.id}
        </p>
      )}
    </main>
  );
}
