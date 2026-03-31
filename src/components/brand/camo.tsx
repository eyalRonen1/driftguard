"use client";

/**
 * Camo - The PageLifeguard mascot.
 * Cute round chameleon with wavy stripes and spiral tail.
 * Based on founder's sketch: friendly, simple, cartoonish.
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
  const bodyColor = state === "alert" ? "#e8924a" : "#5ec47a";
  const stripeColor = state === "alert" ? "#c46a2a" : "#3a9e56";
  const bellyColor = state === "alert" ? "#f0b070" : "#8ee4a4";
  const tailColor = state === "alert" ? "#d47a3a" : "#4ab868";

  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tail - spiral */}
        <path
          d="M55 135 C40 145, 30 165, 45 175 C60 185, 70 170, 65 155 C60 142, 50 138, 42 148 C36 156, 42 165, 50 162"
          stroke={tailColor}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body - round */}
        <ellipse cx="110" cy="115" rx="55" ry="45" fill={bodyColor} />

        {/* Belly */}
        <ellipse cx="105" cy="125" rx="30" ry="22" fill={bellyColor} opacity="0.5" />

        {/* Wavy stripes on body */}
        <path d="M80 95 C90 88, 100 98, 110 92 C120 86, 130 96, 140 90" stroke={stripeColor} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M75 108 C85 101, 95 111, 105 105 C115 99, 125 109, 140 103" stroke={stripeColor} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M78 121 C88 114, 98 124, 108 118 C118 112, 128 122, 145 116" stroke={stripeColor} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5" />

        {/* Head - round, slightly overlapping body */}
        <circle cx="145" cy="88" r="35" fill={bodyColor} />

        {/* Snout bump */}
        <ellipse cx="172" cy="95" rx="14" ry="10" fill={bodyColor} />

        {/* Eye - big and friendly */}
        <circle cx="152" cy="82" r="14" fill="white" />
        <circle cx="152" cy="82" r="13" fill="#fff9ef" stroke="#2d5a3a" strokeWidth="1.5" />
        {state === "sleep" ? (
          <>
            <path d="M144 82 H160" stroke="#2d5a3a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M145 78 C148 80, 152 80, 155 78" stroke="#2d5a3a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx={state === "alert" ? 155 : 150} cy="81" r="6" fill="#2d5a3a" />
            <circle cx={state === "alert" ? 153 : 148} cy="79" r="2" fill="white" />
          </>
        )}

        {/* Smile */}
        <path
          d={state === "alert" ? "M168 100 C172 106, 178 106, 182 100" : "M170 99 C173 103, 177 103, 180 99"}
          stroke="#2d5a3a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Little nostril */}
        <circle cx="180" cy="92" r="1.5" fill="#2d5a3a" opacity="0.5" />

        {/* Front legs */}
        <path d="M90 148 L82 165 L90 162" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M130 148 L125 165 L133 162" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Toes (3 little bumps per foot) */}
        <circle cx="82" cy="166" r="3" fill={bodyColor} />
        <circle cx="88" cy="164" r="3" fill={bodyColor} />
        <circle cx="125" cy="166" r="3" fill={bodyColor} />
        <circle cx="131" cy="164" r="3" fill={bodyColor} />

        {/* Sleep ZZZs */}
        {state === "sleep" && (
          <g className="animate-fade-up">
            <text x="165" y="62" fill="var(--accent-jade, #7CCB8B)" fontSize="12" fontWeight="bold" opacity="0.7">z</text>
            <text x="175" y="48" fill="var(--accent-jade, #7CCB8B)" fontSize="16" fontWeight="bold" opacity="0.5">z</text>
            <text x="185" y="32" fill="var(--accent-jade, #7CCB8B)" fontSize="20" fontWeight="bold" opacity="0.3">z</text>
          </g>
        )}

        {/* Alert ! */}
        {state === "alert" && (
          <g>
            <circle cx="170" cy="55" r="11" fill="#e05858" />
            <text x="166.5" y="60" fill="white" fontSize="15" fontWeight="bold">!</text>
          </g>
        )}

        {/* Head crest - little bumps on top */}
        <circle cx="130" cy="58" r="4" fill={stripeColor} opacity="0.6" />
        <circle cx="140" cy="55" r="5" fill={stripeColor} opacity="0.7" />
        <circle cx="150" cy="56" r="4" fill={stripeColor} opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * Chameleon-inspired decorative elements
 */
export function CamoStripes({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={`w-full ${className}`} fill="none">
      <path d="M0 10 C20 3, 40 17, 60 10 C80 3, 100 17, 120 10 C140 3, 160 17, 180 10 C190 6, 195 8, 200 10" stroke="var(--accent-jade, #7CCB8B)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function CamoEye({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 30 30" width={size} height={size} className={className} fill="none">
      <circle cx="15" cy="15" r="12" fill="#fff9ef" stroke="var(--accent-jade, #7CCB8B)" strokeWidth="2" />
      <circle cx="13" cy="14" r="5" fill="#2d5a3a" />
      <circle cx="11.5" cy="12.5" r="1.5" fill="white" />
    </svg>
  );
}

export function CamoPaw({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none">
      <circle cx="12" cy="16" r="5" fill="var(--accent-jade, #7CCB8B)" opacity="0.3" />
      <circle cx="7" cy="10" r="2.5" fill="var(--accent-jade, #7CCB8B)" opacity="0.3" />
      <circle cx="12" cy="8" r="2.5" fill="var(--accent-jade, #7CCB8B)" opacity="0.3" />
      <circle cx="17" cy="10" r="2.5" fill="var(--accent-jade, #7CCB8B)" opacity="0.3" />
    </svg>
  );
}
