import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a time label like "9:30 AM", "09:00", or "14:15" into minutes since midnight.
 * Falls back to a large value so invalid times naturally sort to the end.
 */
export function parseTimeToMinutes(time: string): number {
  const trimmed = time.trim();
  if (!trimmed) return Number.MAX_SAFE_INTEGER;

  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(trimmed);
  if (!match) return Number.MAX_SAFE_INTEGER;

  const [, hourStr, minuteStr, ampmRaw] = match;
  let hours = Number.parseInt(hourStr, 10);
  const minutes = Number.parseInt(minuteStr, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.MAX_SAFE_INTEGER;
  }

  if (ampmRaw) {
    const ampm = ampmRaw.toUpperCase();
    if (ampm === "AM") {
      if (hours === 12) hours = 0;
    } else if (ampm === "PM") {
      if (hours !== 12) hours += 12;
    }
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return Number.MAX_SAFE_INTEGER;
  }

  return hours * 60 + minutes;
}