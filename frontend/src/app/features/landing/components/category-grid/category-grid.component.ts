import { Component } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CATEGORIES } from '../../data/categories';

@Component({
  selector: 'app-category-grid',
  imports: [CategoryCardComponent],
  templateUrl: './category-grid.component.html',
  styleUrl: './category-grid.component.scss',
})
export class CategoryGridComponent {
  categories = CATEGORIES;
}
