import { Component } from '@angular/core';
import { CATEGORIES } from '../../data/categories';
import { HeroSceneComponent } from '../hero-scene/hero-scene.component';

@Component({
  selector: 'app-hero',
  imports: [HeroSceneComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  categories = CATEGORIES;
}
