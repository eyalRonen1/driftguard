"use client";

/**
 * Floating leaves animation - subtle, behind content.
 * Creates depth and life without being distracting.
 */
export function FloatingLeaves() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-[0.04]"
          style={{
            left: `${10 + (i * 12) % 90}%`,
            top: `-${20 + (i * 15) % 40}px`,
            animation: `leafFall ${12 + i * 3}s linear ${i * 2}s infinite`,
            fontSize: `${14 + (i % 3) * 6}px`,
          }}
        >
          {["🌿", "🍃", "🌱", "☘️"][i % 4]}
        </div>
      ))}

      <style jsx>{`
        @keyframes leafFall {
          0% {
            transform: translateY(-40px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.04;
          }
          90% {
            opacity: 0.04;
          }
          100% {
            transform: translateY(110vh) rotate(360deg) translateX(80px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
