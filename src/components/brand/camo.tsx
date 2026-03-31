"use client";

/**
 * Camo - The PageLifeguard mascot.
 * One SVG, three states, consistent everywhere.
 */
export function Camo({
  state = "idle",
  size = 80,
  className = "",
}: {
  state?: "idle" | "alert" | "sleep";
  size?: number;
  className?: string;
}) {
  return (
    <div data-state={state} className={`camo inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Branch */}
        <path d="M30 155H170" stroke="var(--camo-branch, #76573a)" strokeWidth="8" strokeLinecap="round" />

        {/* Body */}
        <ellipse cx="100" cy="130" rx="52" ry="30" fill="var(--camo-body, #46a86b)" />

        {/* Spots */}
        <circle cx="78" cy="125" r="6" fill="var(--camo-stripe, #1f6a46)" opacity="0.6" />
        <circle cx="118" cy="120" r="5" fill="var(--camo-stripe, #1f6a46)" opacity="0.5" />
        <circle cx="95" cy="135" r="4" fill="var(--camo-stripe, #1f6a46)" opacity="0.4" />

        {/* Tail */}
        <path d="M52 140C40 148 36 165 48 172C60 178 68 165 62 152" stroke="var(--camo-tail, #d8ad4a)" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* Head */}
        <ellipse cx="108" cy="95" rx="34" ry="30" fill="var(--camo-head, #57b877)" />

        {/* Head stripe */}
        <path d="M84 88C94 82 118 82 128 88" stroke="var(--camo-stripe, #1f6a46)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />

        {/* Left eye */}
        <ellipse cx="94" cy="90" rx="11" ry="12" fill="var(--camo-eye, #fff9ef)" />
        <circle cx={state === "sleep" ? 94 : 91} cy="90" r="5" fill="#1a1a1a" />
        {state !== "sleep" && <circle cx="89" cy="88" r="2" fill="white" />}
        {state === "sleep" && (
          <path d="M86 90H102" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Right eye */}
        <ellipse cx="122" cy="88" rx="11" ry="12" fill="var(--camo-eye, #fff9ef)" />
        <circle cx={state === "sleep" ? 122 : state === "alert" ? 126 : 119} cy="88" r="5" fill="#1a1a1a" />
        {state !== "sleep" && <circle cx="117" cy="86" r="2" fill="white" />}
        {state === "sleep" && (
          <path d="M114 88H130" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Mouth */}
        <path
          d={state === "alert" ? "M100 106C104 110 110 110 114 106" : "M102 104C105 108 109 108 112 104"}
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Sleep ZZZs */}
        {state === "sleep" && (
          <>
            <text x="138" y="72" fill="var(--text-sage, #D5E1CC)" fontSize="14" fontWeight="bold" opacity="0.6">z</text>
            <text x="148" y="58" fill="var(--text-sage, #D5E1CC)" fontSize="18" fontWeight="bold" opacity="0.4">z</text>
            <text x="160" y="42" fill="var(--text-sage, #D5E1CC)" fontSize="22" fontWeight="bold" opacity="0.2">z</text>
          </>
        )}

        {/* Alert exclamation */}
        {state === "alert" && (
          <>
            <circle cx="140" cy="60" r="12" fill="var(--accent-ember, #C8743F)" opacity="0.9" />
            <text x="136" y="66" fill="white" fontSize="16" fontWeight="bold">!</text>
          </>
        )}

        {/* Front legs */}
        <ellipse cx="82" cy="150" rx="8" ry="5" fill="var(--camo-body, #46a86b)" />
        <ellipse cx="118" cy="150" rx="8" ry="5" fill="var(--camo-body, #46a86b)" />
      </svg>
    </div>
  );
}
