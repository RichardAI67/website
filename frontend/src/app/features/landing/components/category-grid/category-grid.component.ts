import { Component } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CATEGORIES } from '../../data/categories';
import { RevealDirective } from '../../../../shared/reveal/reveal.directive';

@Component({
  selector: 'app-category-grid',
  imports: [CategoryCardComponent, RevealDirective],
  templateUrl: './category-grid.component.html',
  styleUrl: './category-grid.component.scss',
})
export class CategoryGridComponent {
  categories = CATEGORIES;
}
