import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isUnderThreeMonths = (timelineRaw: any) => {
  const t = String(timelineRaw || '').trim().toLowerCase();
  if (!t) return false;

  if (t.includes('immed') || t.includes('urgent') || t.includes('asap')) return true;

  // Explicit string matches
  if (['1', '2', '3'].includes(t)) return true;

  // Weeks
  if (t.includes('week') || t.includes('weak')) {
    const weekMatch = t.match(/(\d+)\s*w(?:ee|ea)k/);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[1], 10);
      return weeks <= 12;
    }
    return true; // "within a week"
  }

  // Months
  const monthMatch = t.match(/(\d+)\s*month/);
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10);
    return months <= 3;
  }

  // Years
  if (t.includes('year')) {
    return false;
  }

  // Specific common text formats
  if (t.includes('3-6') || t.includes('6+')) return false;

  return false;
};

export const showToast = (message: string) => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: message }));
};
