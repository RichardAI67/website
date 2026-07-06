import { Component, Input } from '@angular/core';
import { Category } from '../../data/categories';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
})
export class CategoryCardComponent {
  @Input() category!: Category;
}
