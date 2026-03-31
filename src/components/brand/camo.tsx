"use client";

import Image from "next/image";

/**
 * Camo - The PageLifeguard mascot.
 * Uses consistent DALL-E generated images from a single character sheet.
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
  const src = state === "sleep"
    ? "/assets/camo-sleep.png"
    : state === "alert"
    ? "/assets/camo-watch.png"
    : "/assets/camo-happy.png";

  return (
    <Image
      src={src}
      alt="Camo"
      width={size}
      height={size}
      className={`inline-block ${className}`}
    />
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
