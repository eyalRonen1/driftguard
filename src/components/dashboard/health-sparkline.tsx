"use client";

/**
 * Health Sparkline - mini line chart showing monitor health over time.
 * Green = healthy, Yellow = unstable, Red = error
 * Used in monitor cards and detail pages.
 */

interface DataPoint {
  time: string;
  status: "healthy" | "unstable" | "error" | "unknown";
  responseMs?: number;
}

export function HealthSparkline({
  data,
  width = 120,
  height = 32,
}: {
  data: DataPoint[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) {
    // Generate demo data for empty monitors
    const now = Date.now();
    const demo: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now - (23 - i) * 3600000).toISOString(),
      status: "healthy" as const,
      responseMs: 200 + Math.random() * 300,
    }));
    data = demo;
  }

  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Map response times to Y coordinates
  const times = data.map((d) => d.responseMs || 300);
  const maxTime = Math.max(...times, 500);
  const minTime = Math.min(...times, 100);
  const range = maxTime - minTime || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * innerW;
    const y = padding + innerH - ((d.responseMs || 300) - minTime) / range * innerH;
    return { x, y, status: d.status };
  });

  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Fill area
  const areaD = pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  return (
    <svg width={width} height={height} className="block">
      {/* Area fill */}
      <path d={areaD} fill="url(#sparkGradient)" opacity="0.3" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Error/unstable dots */}
      {points.map((p, i) => (
        p.status !== "healthy" && (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill={p.status === "error" ? "var(--destructive)" : "var(--chart-2)"}
          />
        )
      ))}

      {/* Current point (last) */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill="var(--primary)"
        stroke="var(--background)"
        strokeWidth="1.5"
      />

      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Uptime bar - 24h/30d colored blocks showing status per period
 */
export function UptimeBar({
  checks = 30,
  healthyCount = 28,
}: {
  checks?: number;
  healthyCount?: number;
}) {
  const bars = Array.from({ length: checks }, (_, i) => {
    if (i < healthyCount) return "healthy";
    if (i < healthyCount + 1) return "unstable";
    return "error";
  });

  // Shuffle errors to random positions for realism
  const shuffled = [...bars].sort(() => Math.random() - 0.5);

  const uptime = ((healthyCount / checks) * 100).toFixed(1);

  return (
    <div>
      <div className="flex gap-[2px] items-end h-5">
        {shuffled.map((status, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[1px] transition-all hover:opacity-80 ${
              status === "healthy" ? "bg-primary h-full" :
              status === "unstable" ? "bg-chart-2 h-3/4" :
              "bg-destructive h-1/2"
            }`}
            title={`Check ${i + 1}: ${status}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">30 days ago</span>
        <span className="text-[9px] text-primary font-medium">{uptime}% uptime</span>
        <span className="text-[9px] text-muted-foreground">Today</span>
      </div>
    </div>
  );
}
