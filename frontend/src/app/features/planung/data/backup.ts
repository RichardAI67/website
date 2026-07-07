import { PlanItem } from './plan-item';

interface BackupFile {
  version: 1;
  exportedAt: string;
  items: PlanItem[];
}

// Sichert alle Eintraege als Datei, weil localStorage sonst die einzige
// Kopie ist - Browser-Daten loeschen oder Geraetewechsel wuerde sonst alles
// unwiderruflich verlieren.
export function downloadBackup(items: PlanItem[]): void {
  const backup: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };

  const content = JSON.stringify(backup, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `richardai-planung-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function parseBackupFile(content: string): PlanItem[] {
  const data = JSON.parse(content);
  const items = Array.isArray(data) ? data : data.items;

  if (!Array.isArray(items)) {
    throw new Error('Ungültige Sicherungsdatei');
  }

  for (const item of items) {
    if (typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.date !== 'string') {
      throw new Error('Ungültige Sicherungsdatei');
    }
  }

  return items as PlanItem[];
}
