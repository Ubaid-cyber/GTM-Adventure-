/**
 * 🏔️ GTM ADVENTURES - MISSION CONTROL DATE STANDARDIZATION
 * Next.js 15+ Hydration-Safe Formatter
 */

export function formatDateTime(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  
  // Use a fixed locale 'en-GB' (24-hour, consistent) as to avoid server/client drift
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC' // 🌍 Forced UTC for mission data consistency
  });
}

export function formatDateOnly(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatTimeOnly(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });
}
