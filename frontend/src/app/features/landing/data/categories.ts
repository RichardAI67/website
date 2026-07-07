export interface Category {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  color: string;
  route?: string;
}

// Die 4 Kategorien fuer die Startseite
// color = gleicher Hex-Wert wie --accent-* in styles.scss (Three.js kann kein CSS var() lesen)
// route = eigene Unterseite, falls es die schon gibt
export const CATEGORIES: Category[] = [
  {
    id: 'geld',
    title: 'Geld & Verträge',
    description:
      'Rechnungen, Abos und Kündigungsfristen im Blick – bevor sie dich überraschen.',
    bullets: ['Rechnungen & Abos', 'Kündigungsfristen', 'Vertragsunterlagen'],
    color: '#e2a33d',
  },
  {
    id: 'planung',
    title: 'Planung & Zeit',
    description:
      'Termine, Fristen und wiederkehrende Aufgaben, sauber getaktet statt im Kopf jongliert.',
    bullets: ['Termine & Erinnerungen', 'Fristen im Blick', 'Wiederkehrende Aufgaben'],
    color: '#3e7cb1',
    route: '/planung',
  },
  {
    id: 'haushalt',
    title: 'Haushalt & Dokumente',
    description:
      'Von der Versicherungspolice bis zur Bedienungsanleitung – wiedergefunden in Sekunden.',
    bullets: ['Wichtige Dokumente', 'Versicherungen', 'Anleitungen & Belege'],
    color: '#c1613d',
  },
  {
    id: 'info',
    title: 'Info-Bündler',
    description:
      'Notizen, Links und lose Infos, die sonst nirgends hinpassen, gebündelt an einem Ort.',
    bullets: ['Notizen & Links', 'Ideen & Merkzettel', 'Schnelle Ablage'],
    color: '#6c5ce0',
  },
];
