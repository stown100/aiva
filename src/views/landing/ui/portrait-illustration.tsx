interface PortraitIllustrationProps {
  variant: "original" | "styled";
}

/**
 * Abstract portrait used in the hero before/after demo until real showcase
 * images are generated. Both variants share the same geometry so the reveal
 * animation reads as a transformation of the same person.
 */
export function PortraitIllustration({ variant }: PortraitIllustrationProps) {
  const isStyled = variant === "styled";

  const bg = isStyled ? "url(#bg-styled)" : "#e7e5e4";
  const hair = isStyled ? "url(#hair-styled)" : "#57534e";
  const skin = isStyled ? "#ffd9c0" : "#d6bfa8";
  const shirt = isStyled ? "url(#shirt-styled)" : "#a8a29e";

  return (
    <svg viewBox="0 0 300 375" className="size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="bg-styled" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="hair-styled" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="shirt-styled" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      <rect width="300" height="375" fill={bg} />

      {isStyled ? (
        <g fill="#ffffff" opacity="0.85">
          <path d="M52 62l4.5 11 11 4.5-11 4.5-4.5 11-4.5-11-11-4.5 11-4.5z" />
          <path d="M245 100l3.5 8.5 8.5 3.5-8.5 3.5-3.5 8.5-3.5-8.5-8.5-3.5 8.5-3.5z" opacity="0.7" />
          <circle cx="230" cy="52" r="3" opacity="0.8" />
          <circle cx="70" cy="140" r="2.5" opacity="0.6" />
          <circle cx="262" cy="180" r="2" opacity="0.5" />
        </g>
      ) : (
        <rect width="300" height="375" fill="#00000008" />
      )}

      {/* shoulders */}
      <path d="M150 240c-62 0-104 34-112 135h224c-8-101-50-135-112-135z" fill={shirt} />
      {/* neck */}
      <rect x="132" y="200" width="36" height="52" rx="16" fill={skin} />
      {/* head */}
      <ellipse cx="150" cy="150" rx="58" ry="66" fill={skin} />
      {/* hair */}
      <path
        d="M150 74c-42 0-66 30-64 72 1 20 6 26 10 30 -2-34 8-48 22-52 10-3 44-3 56 2 16 7 22 22 20 50 4-4 9-10 10-30 2-42-22-72-54-72z"
        fill={hair}
      />
      {isStyled && (
        <path d="M108 118c10-18 26-26 42-26" stroke="#f0abfc" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
      )}
      {/* eyes */}
      <circle cx="128" cy="152" r={isStyled ? 7 : 5} fill={isStyled ? "#312e81" : "#44403c"} />
      <circle cx="172" cy="152" r={isStyled ? 7 : 5} fill={isStyled ? "#312e81" : "#44403c"} />
      {isStyled && (
        <>
          <circle cx="130.5" cy="149.5" r="2.2" fill="#ffffff" />
          <circle cx="174.5" cy="149.5" r="2.2" fill="#ffffff" />
        </>
      )}
      {/* smile */}
      <path
        d={isStyled ? "M132 182c8 10 28 10 36 0" : "M136 184c6 6 22 6 28 0"}
        stroke={isStyled ? "#9d174d" : "#78716c"}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* blush */}
      {isStyled && (
        <>
          <ellipse cx="116" cy="170" rx="9" ry="5" fill="#fb7185" opacity="0.45" />
          <ellipse cx="184" cy="170" rx="9" ry="5" fill="#fb7185" opacity="0.45" />
        </>
      )}
    </svg>
  );
}
