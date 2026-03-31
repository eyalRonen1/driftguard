"use client";

import { useEffect, useState, useRef } from "react";

function AnimatedNumber({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {[
        { value: 35000, suffix: "+", label: "Page checks daily", color: "text-blue-600" },
        { value: 99, suffix: "%", label: "Uptime guaranteed", color: "text-green-600" },
        { value: 2, suffix: "s", label: "Average check time", color: "text-purple-600" },
        { value: 150, suffix: "+", label: "Countries supported", color: "text-orange-600" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <p className={`text-3xl sm:text-4xl font-bold ${stat.color}`}>
            <AnimatedNumber target={stat.value} suffix={stat.suffix} />
          </p>
          <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
