import { PlanItem, Recurrence } from './plan-item';

// Baut eine .ics-Datei (iCalendar-Format), die man in Google Kalender, Apple
// Kalender oder den Kalender vom Handy importieren kann. Kein Backend noetig,
// dafuer auch kein automatischer Hintergrund-Sync - man muss die Datei nach
// jeder Aenderung neu exportieren und importieren.

function formatDateForIcs(date: string, time?: string): string {
  const compact = date.replace(/-/g, '');
  if (!time) {
    return compact;
  }
  const compactTime = time.replace(':', '') + '00';
  return `${compact}T${compactTime}`;
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\,;]/g, (match) => '\\' + match);
}

function recurrenceRule(recurrence?: Recurrence): string | null {
  switch (recurrence) {
    case 'taeglich':
      return 'RRULE:FREQ=DAILY';
    case 'woechentlich':
      return 'RRULE:FREQ=WEEKLY';
    case 'monatlich':
      return 'RRULE:FREQ=MONTHLY';
    case 'jaehrlich':
      return 'RRULE:FREQ=YEARLY';
    default:
      return null;
  }
}

export function buildIcsFile(items: PlanItem[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RichardAI//Planung//DE', 'CALSCALE:GREGORIAN'];

  for (const item of items) {
    const isAllDay = !item.time;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id}@richardai`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(
      isAllDay
        ? `DTSTART;VALUE=DATE:${formatDateForIcs(item.date)}`
        : `DTSTART:${formatDateForIcs(item.date, item.time)}`,
    );
    lines.push(`SUMMARY:${escapeIcsText(item.title)}`);
    const rrule = recurrenceRule(item.recurrence);
    if (rrule) {
      lines.push(rrule);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsFile(items: PlanItem[]): void {
  const content = buildIcsFile(items);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'richardai-planung.ics';
  link.click();

  URL.revokeObjectURL(url);
}
