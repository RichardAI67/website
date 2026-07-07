export type PlanItemType = 'termin' | 'frist' | 'aufgabe' | 'ereignis';
export type Recurrence = 'taeglich' | 'woechentlich' | 'monatlich' | 'jaehrlich';

export interface PlanItem {
  id: string;
  title: string;
  type: PlanItemType;
  date: string; // ISO-Datum, z.B. "2026-07-14"
  time?: string; // "HH:mm", optional
  recurrence?: Recurrence;
  done: boolean;
}

const STORAGE_KEY = 'richardai-planung-items';

// Speichert die Eintraege im Browser, damit sie nach einem Reload noch da sind.
// Kein Backend noetig fuer diese erste Version.
export function loadPlanItems(): PlanItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePlanItems(items: PlanItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Datum als "yyyy-mm-dd" in der lokalen Zeitzone, nicht via toISOString()
// (das rechnet in UTC um und kann je nach Zeitzone einen Tag verspringen).
export function toLocalDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function countdownLabel(item: PlanItem): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseLocalDate(item.date);

  const days = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (days === 0) {
    return 'Heute';
  }
  if (days === 1) {
    return 'Morgen';
  }
  if (days > 1) {
    return `in ${days} Tagen`;
  }
  if (days === -1) {
    return 'Gestern überfällig';
  }
  return `${Math.abs(days)} Tage überfällig`;
}

// Sortiert nach Datum, dann nach Uhrzeit (Eintraege ohne Uhrzeit zuerst),
// dann alphabetisch als letztes Kriterium.
export function compareByDateAndTime(a: PlanItem, b: PlanItem): number {
  const dateCompare = a.date.localeCompare(b.date);
  if (dateCompare !== 0) {
    return dateCompare;
  }
  if (a.time && b.time) {
    return a.time.localeCompare(b.time);
  }
  if (a.time) {
    return 1;
  }
  if (b.time) {
    return -1;
  }
  return a.title.localeCompare(b.title);
}
