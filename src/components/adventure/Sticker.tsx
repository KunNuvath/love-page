import React from "react";

export type StickerName = "plane" | "star" | "sun" | "camera" | "heart";

const INK = "#1d2742";

/** Hand-drawn style doodle stickers: navy outline + flat fill + paper die-cut edge. */
export default function Sticker({
  name,
  className = "",
  size = 56,
  rotate = 0,
}: {
  name: StickerName;
  className?: string;
  size?: number;
  rotate?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`pointer-events-none select-none ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(0 3px 2px rgba(20,25,45,0.3))",
      }}
    >
      <g
        stroke={INK}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ paintOrder: "stroke" }}
      >
        {name === "plane" && (
          <>
            <path d="M6 30 L58 8 L44 56 L31 40 Z" fill="#fbf6ea" stroke="#fbf6ea" strokeWidth={9} />
            <path d="M6 30 L58 8 L44 56 L31 40 Z" fill="#9cc9ee" />
            <path d="M58 8 L31 40 L28 54 L36 44" fill="#7fb2dd" />
            <path d="M6 30 L31 40" fill="none" />
          </>
        )}
        {name === "star" && (
          <>
            <path
              d="M32 5 L39.5 23 L59 24.5 L44 37 L49 56 L32 45.5 L15 56 L20 37 L5 24.5 L24.5 23 Z"
              fill="#fbf6ea"
              stroke="#fbf6ea"
              strokeWidth={9}
            />
            <path d="M32 5 L39.5 23 L59 24.5 L44 37 L49 56 L32 45.5 L15 56 L20 37 L5 24.5 L24.5 23 Z" fill="#f7d56a" />
            <path d="M25 28 Q27 25 30 25" fill="none" stroke="#fbf6ea" strokeWidth={2.2} />
          </>
        )}
        {name === "sun" && (
          <>
            <circle cx="32" cy="32" r="22" fill="#fbf6ea" stroke="#fbf6ea" strokeWidth={9} />
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const x1 = Math.round((32 + Math.cos(a) * 18) * 10) / 10;
              const y1 = Math.round((32 + Math.sin(a) * 18) * 10) / 10;
              const x2 = Math.round((32 + Math.cos(a) * 27) * 10) / 10;
              const y2 = Math.round((32 + Math.sin(a) * 27) * 10) / 10;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            <circle cx="32" cy="32" r="13" fill="#f7d56a" />
            <path d="M26 34 Q32 39 38 34" fill="none" />
            <circle cx="27.5" cy="29" r="1.2" fill={INK} />
            <circle cx="36.5" cy="29" r="1.2" fill={INK} />
          </>
        )}
        {name === "camera" && (
          <>
            <rect x="6" y="18" width="52" height="36" rx="7" fill="#fbf6ea" stroke="#fbf6ea" strokeWidth={9} />
            <path d="M22 18 L26 11 L38 11 L42 18" fill="#e5533d" />
            <rect x="6" y="18" width="52" height="36" rx="7" fill="#e5533d" />
            <circle cx="32" cy="36" r="12" fill="#fbf6ea" />
            <circle cx="32" cy="36" r="6.5" fill="#9cc9ee" />
            <rect x="46" y="23" width="6" height="4" rx="1" fill="#f7d56a" />
          </>
        )}
        {name === "heart" && (
          <>
            <path
              d="M32 56 C32 56 6 40 6 22 C6 13 13 7 21 7 C26 7 30 10 32 14 C34 10 38 7 43 7 C51 7 58 13 58 22 C58 40 32 56 32 56 Z"
              fill="#fbf6ea"
              stroke="#fbf6ea"
              strokeWidth={9}
            />
            <path
              d="M32 56 C32 56 6 40 6 22 C6 13 13 7 21 7 C26 7 30 10 32 14 C34 10 38 7 43 7 C51 7 58 13 58 22 C58 40 32 56 32 56 Z"
              fill="#e5533d"
            />
            <path d="M16 20 Q17 15 22 14" fill="none" stroke="#fbf6ea" strokeWidth={2.4} />
          </>
        )}
      </g>
    </svg>
  );
}
