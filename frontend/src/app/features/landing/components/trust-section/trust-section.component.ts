import { Component } from '@angular/core';

interface TrustPoint {
  id: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-trust-section',
  templateUrl: './trust-section.component.html',
  styleUrl: './trust-section.component.scss',
})
export class TrustSectionComponent {
  points: TrustPoint[] = [
    {
      id: 'zentral',
      title: 'Zentral statt verstreut',
      description: 'Alles läuft an einem Ort zusammen — keine App-Sammlung mehr nötig.',
    },
    {
      id: 'ruhig',
      title: 'Ruhig statt hektisch',
      description: 'Erinnerungen genau dann, wenn sie wichtig werden — nicht früher, nicht später.',
    },
    {
      id: 'sicher',
      title: 'Sicher verwahrt',
      description: 'Deine Unterlagen bleiben geschützt und sind nur für dich einsehbar.',
    },
  ];
}
