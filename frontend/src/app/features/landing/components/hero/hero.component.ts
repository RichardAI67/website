import { Component } from '@angular/core';
import { CATEGORIES } from '../../data/categories';

interface NodePosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  categories = CATEGORIES;

  hubX = 200;
  hubY = 200;

  // Positionen fuer die 4 Punkte: oben, rechts, unten, links
  positions: NodePosition[] = [
    { x: 200, y: 55 },
    { x: 345, y: 200 },
    { x: 200, y: 345 },
    { x: 55, y: 200 },
  ];
}
