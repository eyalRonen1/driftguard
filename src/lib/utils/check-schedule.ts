/**
 * Calculate the next check time based on frequency and optional preferences.
 * preferredHour: 0-23 UTC (null = anytime)
 * preferredDay: 0=Sun, 1=Mon...6=Sat (null = any day, only used for weekly)
 */
export function getNextCheckTime(
  frequency: string,
  preferredHour?: number | null,
  preferredDay?: number | null,
): Date {
  const now = new Date();

  switch (frequency) {
    case "15min":
      return new Date(now.getTime() + 15 * 60 * 1000);

    case "hourly":
      return new Date(now.getTime() + 60 * 60 * 1000);

    case "every_6h": {
      if (preferredHour != null) {
        // Align to 4 fixed slots: preferredHour, +6h, +12h, +18h
        const base = preferredHour % 6;
        const slots = [base, base + 6, base + 12, base + 18];
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();
        // Find next slot
        for (const slot of slots) {
          if (slot > currentHour || (slot === currentHour && currentMinute < 5)) {
            const next = new Date(now);
            next.setUTCHours(slot, 0, 0, 0);
            return next;
          }
        }
        // All slots passed today, go to first slot tomorrow
        const next = new Date(now);
        next.setUTCDate(next.getUTCDate() + 1);
        next.setUTCHours(slots[0], 0, 0, 0);
        return next;
      }
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    }

    case "daily": {
      if (preferredHour != null) {
        const next = new Date(now);
        next.setUTCHours(preferredHour, 0, 0, 0);
        // If that time already passed today, schedule for tomorrow
        if (next <= now) {
          next.setUTCDate(next.getUTCDate() + 1);
        }
        return next;
      }
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    case "weekly": {
      const targetDay = preferredDay ?? now.getUTCDay();
      const targetHour = preferredHour ?? now.getUTCHours();
      const next = new Date(now);
      next.setUTCHours(targetHour, 0, 0, 0);

      // Calculate days until next target day
      let daysUntil = targetDay - now.getUTCDay();
      if (daysUntil < 0) daysUntil += 7;
      if (daysUntil === 0 && next <= now) daysUntil = 7;

      next.setUTCDate(next.getUTCDate() + daysUntil);
      return next;
    }

    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
