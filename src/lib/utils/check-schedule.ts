export function getNextCheckTime(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "15min": return new Date(now.getTime() + 15 * 60 * 1000);
    case "hourly": return new Date(now.getTime() + 60 * 60 * 1000);
    case "every_6h": return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case "daily": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
