export interface Category {
  id: string;
  title: string;
  description: string;
  bullets: string[];
}

// Die 4 Kategorien fuer die Startseite
export const CATEGORIES: Category[] = [
  {
    id: 'geld',
    title: 'Geld & Verträge',
    description:
      'Rechnungen, Abos und Kündigungsfristen im Blick – bevor sie dich überraschen.',
    bullets: ['Rechnungen & Abos', 'Kündigungsfristen', 'Vertragsunterlagen'],
  },
  {
    id: 'planung',
    title: 'Planung & Zeit',
    description:
      'Termine, Fristen und wiederkehrende Aufgaben, sauber getaktet statt im Kopf jongliert.',
    bullets: ['Termine & Erinnerungen', 'Fristen im Blick', 'Wiederkehrende Aufgaben'],
  },
  {
    id: 'haushalt',
    title: 'Haushalt & Dokumente',
    description:
      'Von der Versicherungspolice bis zur Bedienungsanleitung – wiedergefunden in Sekunden.',
    bullets: ['Wichtige Dokumente', 'Versicherungen', 'Anleitungen & Belege'],
  },
  {
    id: 'info',
    title: 'Info-Bündler',
    description:
      'Notizen, Links und lose Infos, die sonst nirgends hinpassen, gebündelt an einem Ort.',
    bullets: ['Notizen & Links', 'Ideen & Merkzettel', 'Schnelle Ablage'],
  },
];
